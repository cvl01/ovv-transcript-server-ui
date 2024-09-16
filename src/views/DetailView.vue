<template>
    <div class="container mx-auto p-4 grid grid-cols-2 gap-12">
        <!-- Transcripts (Left Column) -->
        <div class="space-y-4">
            <h2 class="text-xl font-semibold">Transcripts</h2>

            <button @click="reprocessAudioFile" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Reprocess Audio
            </button>

            {{ audioFile?.processing_options }}

            <div class="bg-white shadow-md border rounded-lg p-4 ">
                <h3 class="text-lg font-medium">Summary</h3>
                <div class="max-h-96 overflow-scroll space-y-4" v-html="audioFile?.short_summary"></div>
            </div>

            <!-- Transcript Diff Component -->
            <transcript-diff class="bg-white shadow-md border rounded-lg p-4" v-if="audioFile && audioFile.transcript_parsed && audioFile.transcript_corrected"
                :parsedTranscript="audioFile.transcript_parsed" :correctedTranscript="audioFile.transcript_corrected" />
            <div class="bg-white shadow-md border rounded-lg p-4 ">
                <h3 class="text-lg font-medium">Parsed Transcript</h3>
                <div class="max-h-96 overflow-scroll space-y-4" v-html="audioFile?.transcript_parsed"></div>
            </div>
            <div class="bg-white shadow-md border rounded-lg p-4 ">
                <h3 class="text-lg font-medium">Corrected Transcript</h3>
                <div class="max-h-96 overflow-scroll space-y-4" v-html="audioFile?.transcript_corrected"></div>
            </div>
        </div>

        <!-- Questions & Answers (Right Column) -->
        <div class="space-y-4">
            <h2 class="text-xl font-semibold mb-4">Insights</h2>
            <div v-for="qa in audioFile?.questions_answers" :key="qa.id" class="">
                <div class="bg-white shadow-md border rounded-lg p-8 h-auto">
                    <h3 class="text-lg font-medium">{{ qa.heading }}</h3>
                    <div class="bg-white mt-2 rounded-md relative">
                        <strong>{{ qa.question }}</strong>


                        <span v-if="!showMore[qa.id]" @click="toggleShowMore(qa.id)">
                           <span v-html="truncateText(qa.answer)"></span>
                            <span v-if="qa.answer.length > maxLength" class="overlay"></span>
                            <a v-if="qa.answer.length > maxLength"
                                class="text-blue-500 cursor-pointer" style="z-index: 4;position: relative;">
                                Show More
                            </a>
                        </span>
                        <span v-else>
                            <div @click="toggleShowMore(qa.id)" class="space-y-4" v-html="qa.answer">
                            </div>
                            <a @click="toggleShowMore(qa.id)" class="text-blue-500 cursor-pointer">
                                Show Less
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import TranscriptDiff from '../components/TranscriptDiff.vue';
import { Marked } from '@ts-stack/markdown'
import { OllamaMarkdownRenderer } from '../helpers/OllamaMarkdownRenderer';


Marked.setOptions({ renderer: new OllamaMarkdownRenderer() })


export default defineComponent({
    components: {
        TranscriptDiff,
    },
    setup() {
        const route = useRoute();
        const audioFile = ref<any>(null);
        const showMore = ref<{ [key: number]: boolean }>({}); // Track expanded answers
        const maxLength = 200; // Max length for truncation

        const reprocessAudioFile = async () => {
            try {
                const response = await axios.patch(`/audio-files/${route.params.id}/reprocess`);
                alert('Reprocessing has been triggered');
            } catch (error) {
                console.error('Error reprocessing the file:', error);
                alert('Failed to trigger reprocessing');
            }
        };

        const fetchAudioFileDetail = async () => {
            const response = await axios.get(`/audio-files/${route.params.id}`);
            audioFile.value = response.data;
            console.log(audioFile)
            audioFile.value.questions_answers.map(x => {
                x.answer = Marked.parse(x.answer)
                return x
            })

            const parseIfPresent = (text: string | null) => text ? Marked.parse(text) : null;

            audioFile.value.short_summary = parseIfPresent(audioFile.value.short_summary);
            audioFile.value.transcript_parsed = parseIfPresent(audioFile.value.transcript_parsed);
            audioFile.value.transcript_corrected = parseIfPresent(audioFile.value.transcript_corrected);
        };

        // Toggle to show more or less content and collapse others
        const toggleShowMore = (id: number) => {
            for (const key in showMore.value) {
                if (Number(key) !== id) {
                    showMore.value[key] = false; // Collapse all others
                }
            }
            showMore.value[id] = !showMore.value[id]; // Toggle the current one
        };

        // Truncate the text if it's longer than the max length
        const truncateText = (text: string) => {
            if (text.length > maxLength) {
                return text.slice(0, maxLength) + '...';
            }
            return text;
        };

        onMounted(fetchAudioFileDetail);

        return { audioFile, toggleShowMore, showMore, truncateText, maxLength, reprocessAudioFile };
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
    height: 4em;
    width: 100%;
    background: linear-gradient(to top, white, rgba(255, 255, 255, 0));
}
</style>