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

            <button @click="combineInsightsProject" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                combineInsights Project
            </button>
        </div>

        <!-- Questions & Answers (Right Column) -->
        <div class="space-y-4">
            <h2 class="text-xl font-semibold mb-4">Questions & Answers</h2>

            <button @click="toggleShowAll" class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
                Toggle all
            </button>

            <div v-for="qa in project.questions_answers" :key="qa.id" class="bg-white shadow-md border rounded-lg p-8 h-auto" :id="'question-box-' + qa.id">
                <h3 class="">{{ qa.heading }}</h3>
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

Marked.setOptions({ renderer: new OllamaMarkdownRenderer() });

export default defineComponent({
    setup() {
        const route = useRoute();
        const project = ref<Project | undefined>();
        const showMore = ref<{ [key: number]: boolean }>({}); // Track expanded answers
        const maxLength = 200; // Max length for truncation

        const combineInsightsProject = async () => {
            try {
                const response = await axios.get(`/projects/${route.params.id}/combine-insights`);
                alert(response.data.message);
            } catch (error) {
                console.error('Error combineInsightsing the project:', error);
                alert('Failed to trigger combineInsightsing');
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

        onMounted(fetchProjectDetail);

        return { project, toggleShowMore, toggleShowAll, showMore, truncateText, maxLength, combineInsightsProject, parseIfPresent };
    },
});
</script>

<style scoped>
.truncate-text {
    position: relative;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
}

.overlay {
    position: absolute;
    bottom: 0;
    right: 0;
    height: 6em;
    width: 100%;
    background: linear-gradient(to top, white, rgba(255, 255, 255, 0.3));
}
</style>
