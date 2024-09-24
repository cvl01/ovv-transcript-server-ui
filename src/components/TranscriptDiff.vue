<template>
    <div class="transcript-diff">
        <h3 class="text-lg font-medium">Transcript Diff</h3>
        <div v-html="diffHtml" contenteditable="true" class="space-y-4"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import * as Diff from 'diff';
import { Marked } from '@ts-stack/markdown';

export default defineComponent({
    name: 'TranscriptDiff',
    props: {
        parsedTranscript: {
            type: String,
            required: true,
        },
        correctedTranscript: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const diffHtml = computed(() => {

            if(!props.parsedTranscript || !props.correctedTranscript) return ''

            const diff = Diff.diffWords(props.parsedTranscript, props.correctedTranscript, { ignoreCase: true });
            return Marked.parse(diff
                .map((part) => {
                    const color = part.added ? 'text-green-500' : part.removed ? 'text-red-500' : '';
                    return `<span class="${color}">${part.value}</span>`;
                })
                .join(''));
        });

        return {
            diffHtml,
        };
    },
});
</script>

<style scoped>
.transcript-diff span {
    font-weight: bold;
}
</style>