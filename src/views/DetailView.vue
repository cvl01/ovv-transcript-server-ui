<template>
    <div class="container mx-auto p-4 grid grid-cols-2 gap-12" v-if="audioFile">
        <!-- Transcripts (Left Column) -->
        <div class="space-y-4">
            <h2 class="text-xl font-semibold">Transcripts</h2>
            <div>{{ audioFile?.filename }}</div>

            <button @click="reprocessAudioFile" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Reprocess Audio
            </button>
            <button @click="continueProcessing" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Continue processing
            </button>

            <pre class="bg-slate-100 text-sm">
                {{ audioFile?.processing_options }}
            </pre>



            <div class="bg-white shadow-md border rounded-lg p-4 ">
                <h3 class="text-lg font-medium">Summary</h3>
                <div class="max-h-96 overflow-scroll space-y-4" v-html="parseIfPresent(audioFile?.short_summary)">
                </div>
            </div>

            <!-- Transcript Diff Component -->
            <transcript-diff class="bg-white shadow-md border rounded-lg p-4"
                v-if="audioFile && audioFile.transcript_parsed && audioFile.transcript_corrected"
                :parsedTranscript="audioFile.transcript_parsed" :correctedTranscript="audioFile.transcript_corrected" />
            <div class="bg-white shadow-md border rounded-lg p-4 ">
                <h3 class="text-lg font-medium">Parsed Transcript</h3>
                <div class="max-h-96 overflow-scroll space-y-4" v-html="parseIfPresent(audioFile?.transcript_parsed)">
                </div>
            </div>
            <div class="bg-white shadow-md border rounded-lg p-4 ">
                <h3 class="text-lg font-medium">Corrected Transcript</h3>
                <div class="max-h-96 overflow-scroll space-y-4"
                    v-html="parseIfPresent(audioFile?.transcript_corrected)"></div>
            </div>
        </div>

        <!-- Questions & Answers (Right Column) -->
        <div class="space-y-4">
            <h2 class="text-xl font-semibold mb-4">Insights</h2>

            <button @click="toggleShowAll" class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
                Toggle all
            </button>

            <div v-for="qa in audioFile?.questions_answers" :key="qa.id"
                class="bg-white shadow-md border rounded-lg p-8 h-auto ovv-question-box" :id="'question-box-' + qa.id">
                <h3 class="">{{ qa.heading }}</h3>
                <span class="italic"> #{{ qa.question_id }} {{ qa.question }}</span>
                <hr class="mb-4 ">

                <div v-if="!showMore[qa.id]" @click="toggleShowMore(qa.id)" class="relative">
                    <span v-html="truncateText(qa.answer)"></span>
                    <span v-if="qa.answer.length > maxLength" class="overlay"></span>
                    <a v-if="qa.answer.length > maxLength" class="text-blue-500 cursor-pointer"
                        style="z-index: 4;position: relative;">
                        Show More
                    </a>
                </div>
                <span v-else>
                    <div class="space-y-4" v-html="qa.answer">
                    </div>
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
import TranscriptDiff from '../components/TranscriptDiff.vue';
import { AudioFile } from '../types';
import { parseIfPresent } from '../helpers/markdownRender';



export default defineComponent({
    components: {
        TranscriptDiff,
    },
    setup() {
        const route = useRoute();
        const audioFile = ref<AudioFile | undefined>();
        const showMore = ref<{ [key: number]: boolean }>({}); // Track expanded answers
        const maxLength = 200; // Max length for truncation

        const reprocessAudioFile = async () => {
            try {
                const response = await axios.patch(`/audio-files/${route.params.id}/reprocess`);
                alert(response.data.message);
            } catch (error) {
                console.error('Error reprocessing the file:', error);
                alert('Failed to trigger reprocessing');
            }
        };
        const continueProcessing = async () => {
            try {
                const response = await axios.patch(`/audio-files/${route.params.id}/continue`);
                alert(response.data.message);
            } catch (error) {
                console.error('Error continue processing the file:', error);
                alert('Failed to trigger continue processing');
            }
        };

        const fetchAudioFileDetail = async () => {
            const response = await axios.get(`/audio-files/${route.params.id}`);
            audioFile.value = response.data as AudioFile;
            console.log(audioFile)
            audioFile.value.questions_answers?.map(x => {
                x.answer = parseIfPresent(x.answer) ?? ''
                return x
            })



        };

        const toggleShowAll = () => {
            audioFile.value?.questions_answers?.forEach(q => {
                showMore.value[q.id] = !showMore.value[q.id]; // Toggle all
            });
        };


        // Toggle to show more or less content and collapse others
        const toggleShowMore = (id: number) => {
            for (const key in showMore.value) {
                if (Number(key) !== id) {
                    showMore.value[key] = false; // Collapse all others
                }
            }
            showMore.value[id] = !showMore.value[id]; // Toggle the current one
            // Scroll the element into view if expanding
            if (showMore.value[id]) {
                setTimeout(() => {
                    const element = document.getElementById(`question-box-${id}`);

                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 300); // 300ms delay, adjust as needed based on your animation duration
            }
        };

        // Truncate the text if it's longer than the max length
        const truncateText = (text: string) => {
            if (text.length > maxLength) {
                return text.slice(0, maxLength) + '...';
            }
            return text;
        };

        onMounted(fetchAudioFileDetail);

        return { audioFile, toggleShowMore, toggleShowAll, showMore, truncateText, maxLength, reprocessAudioFile, continueProcessing, parseIfPresent };
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