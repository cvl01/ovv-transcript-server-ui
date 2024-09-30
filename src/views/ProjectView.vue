<template>
    <div class="container mx-auto p-4 grid grid-cols-2 gap-12" v-if="project">
        <!-- Project Details (Left Column) -->
        <div class="space-y-4">
            <h2 class="text-xl font-semibold">{{ project.name }}</h2>
            <div v-if="project.description" class="text-gray-700" v-html="parseIfPresent(project.description)"></div>

            <h3 class="text-lg font-medium">Linked Audio Files</h3>
            <ul class="space-y-2">
                <li v-for="file in project.audio_files" :key="file.id">
                    <router-link :to="'/detail/' + file.id" class="block bg-blue-100 p-2 rounded-md hover:bg-blue-200">
                        {{ file.filename }}
                    </router-link>
                </li>
            </ul>

            <!-- Combine Insights Form -->
            <div class="space-y-4 bg-white shadow-md rounded-lg p-4 mt-12 border-green-200 border border-solid">
                <h3 class="text-lg font-medium">Combine Project Insights</h3>
                <form @submit.prevent="combineInsights">
                    <div class="mb-4">
                        <label for="llm_model_name" class="block text-gray-700 font-medium">LLM Model Name</label>
                        <select id="llm_model_name" v-model="formData.llmModelName" class="w-full p-2 border border-gray-300 rounded-md">
                            <option value="">Selecteer een optie</option>
                            <option v-for="model in llmModels" :key="model" :value="model">{{ model }}</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label for="reprocess" class="block text-gray-700 font-medium">Reprocess</label>
                        <input id="reprocess" v-model="formData.reprocess" type="checkbox" class="mr-2 leading-tight" />
                        <span class="text-gray-700">Reprocess Insights</span>
                    </div>
                    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Combine Insights
                    </button>
                </form>
            </div>
        </div>

        <!-- Questions & Answers (Right Column) -->
        <div class="space-y-4">
            <h2 class="text-xl font-semibold mb-4">Questions & Answers</h2>

            <button @click="toggleShowAll" class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
                Toggle all
            </button>

            <div v-for="qa in project.questions_answers" :key="qa.id" class="bg-white shadow-md border rounded-lg p-8 h-auto" :id="'question-box-' + qa.id">
                <h3>{{ qa.heading }}</h3>
                <span class="italic"> #{{ qa.question_id }} {{ qa.question }}</span>
                <hr class="mb-4 ">

                <div v-if="!showMore[qa.id]" @click="toggleShowMore(qa.id)" class="relative">
                    <span v-html="truncateText(qa.answer)"></span>
                    <span v-if="qa.answer.length > maxLength" class="overlay"></span>
                    <a v-if="qa.answer.length > maxLength" class="text-blue-500 cursor-pointer" style="z-index: 4;position: relative;">
                        Show More
                    </a>
                </div>
                <span v-else>
                    <div @click="toggleShowMore(qa.id)" class="space-y-4" v-html="qa.answer"></div>
                    <a @click="toggleShowMore(qa.id)" class="text-blue-500 cursor-pointer">
                        Show Less
                    </a>
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { Marked } from '@ts-stack/markdown';
import { OllamaMarkdownRenderer } from '../helpers/OllamaMarkdownRenderer';
import { Project, QuestionAnswer } from '../types';
import { fetchLLMModels } from '../helpers/llmHelpers';

Marked.setOptions({ renderer: new OllamaMarkdownRenderer() });

export default defineComponent({
    setup() {
        const route = useRoute();
        const project = ref<Project | undefined>();
        const showMore = ref<{ [key: number]: boolean }>({}); // Track expanded answers
        const maxLength = 200; // Max length for truncation

        // Group form data into one structure
        const formData = ref({
            llmModelName: '', // Default value for LLM Model
            reprocess: false, // Default value for reprocess
        });

        const llmModels = ref<string[]>([]); // Store LLM models

        const fetchLLMData = async () => {
            const models = await fetchLLMModels();
            llmModels.value = models;
        };

        const combineInsights = async () => {
            try {
                const response = await axios.get(`/projects/${route.params.id}/combine-insights`, {
                    params: {
                        llm_model_name: formData.value.llmModelName,
                        reprocess: formData.value.reprocess,
                    },
                });
                alert(response.data.message);
            } catch (error) {
                console.error('Error combining insights:', error);
                alert('Failed to combine insights');
            }
        };

        const parseIfPresent = (text: string | null | undefined) => text ? Marked.parse(text) : null;

        const fetchProjectDetail = async () => {
            const response = await axios.get(`/projects/${route.params.id}`);
            project.value = response.data as Project;
            project.value.questions_answers?.forEach((qa: QuestionAnswer) => {
                qa.answer = Marked.parse(qa.answer);
            });
        };

        const toggleShowAll = () => {
            project.value?.questions_answers?.forEach(qa => {
                showMore.value[qa.id] = !showMore.value[qa.id]; // Toggle all
            });
        };

        const toggleShowMore = (id: number) => {
            for (const key in showMore.value) {
                if (Number(key) !== id) {
                    showMore.value[key] = false; // Collapse all others
                }
            }
            showMore.value[id] = !showMore.value[id]; // Toggle the current one
            if (showMore.value[id]) {
                setTimeout(() => {
                    const element = document.getElementById(`question-box-${id}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 300);
            }
        };

        const truncateText = (text: string) => {
            if (text.length > maxLength) {
                return text.slice(0, maxLength) + '...';
            }
            return text;
        };

        onMounted(() => {
            fetchProjectDetail();
            fetchLLMData();
        });

        return { project, toggleShowMore, toggleShowAll, showMore, truncateText, maxLength, combineInsights, parseIfPresent, formData, llmModels };
    },
});
</script>
