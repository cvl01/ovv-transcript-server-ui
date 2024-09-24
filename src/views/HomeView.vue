<template>
  <div class="container mx-auto p-4 grid grid-cols-2 gap-4">
    <!-- Audio Files List (Left Block) -->
    <div class="bg-white shadow-md rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-4">Audio Files</h2>
      <ul>
        <li v-for="file in audioFiles" :key="file.id" class="mb-2">
          <router-link :to="'/detail/' + file.id" class="block bg-blue-100 p-2 rounded-md hover:bg-blue-200">
            <h4>
              #{{ file.id }} {{ file.filename }}
            </h4>
            <small>{{ file.processing_options }}</small>
          </router-link>
        </li>
      </ul>
    </div>

    <!-- Upload Block (Right Block) -->
    <div class="bg-white shadow-md rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-4">Upload Audio File</h2>
      <p class="mb-2 text-gray-600">Upload audio (MP3) or JSON files related to transcripts.</p>

      <!-- File Input -->
      <input type="file" accept="audio/*, application/json" @change="onFileSelected" class="mb-4 border p-2 w-full" />

      <!-- Whisper Model Dropdown -->
      <label class="block mb-2">
        Whisper Model:
        <select v-model="whisperModelName" class="border p-2 w-full">
          <option v-for="model in whisperModels" :key="model" :value="model">
            {{ model }}
          </option>
        </select>
      </label>

      <!-- LLM Model Dropdown -->
      <label class="block mb-2">
        LLM Model:
        <select v-model="llmModelName" class="border p-2 w-full">
          <option v-for="model in llmModels" :key="model" :value="model">
            {{ model }}
          </option>
        </select>
      </label>


      <label class="block mb-2">
        <input type="checkbox" v-model="doVoiceExtraction" /> Perform Voice Extraction
      </label>

      <label class="block mb-2">
        <input type="checkbox" v-model="doCorrection" /> Perform Correction (Default: Yes)
      </label>

      <label class="block mb-2">
        <input type="checkbox" v-model="doQuestionAnswering" /> Perform Question Answering (Default: Yes)
      </label>

      <!-- Upload Button -->
      <button @click="uploadFile" class="bg-blue-500 text-white px-4 py-2 rounded-md">Upload</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';

export default defineComponent({
  setup() {
    const audioFiles = ref<any[]>([]);
    const whisperModels = ref<string[]>([]); // To store the models fetched from API
    const llmModels = ref<string[]>([]); // To store the models fetched from API
    const selectedFile = ref<File | null>(null);
    const whisperModelName = ref<string>(''); // Will default to the first model in the list once fetched
    const llmModelName = ref<string>(''); // Will default to the first model in the list once fetched
    const doVoiceExtraction = ref<boolean>(false);
    const doCorrection = ref<boolean>(true);
    const doQuestionAnswering = ref<boolean>(true);

    // Fetch available audio files
    const fetchAudioFiles = async () => {
      const response = await axios.get('/audio-files/');
      audioFiles.value = response.data;
    };

    // Fetch available whisper models from the API
    const fetchWhisperModels = async () => {
      const response = await axios.get('/whisper-models/');
      whisperModels.value = response.data;
      if (whisperModels.value.length > 0) {
        whisperModelName.value = whisperModels.value[0]; // Set default model
      }
    };

    // Fetch available llm models from the API
    const fetchLLMModels = async () => {
      const response = await axios.get('/llm-models/');
      llmModels.value = response.data;
      if (llmModels.value.length > 0) {
        llmModelName.value = llmModels.value[0]; // Set default model
      }
    };

    const onFileSelected = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files) {
        selectedFile.value = input.files[0];
      }
    };

    const uploadFile = async () => {
      if (selectedFile.value) {
        const formData = new FormData();
        formData.append('file', selectedFile.value);

        // Adding the query parameters
        const params = {
          whisper_model_name: whisperModelName.value,
          llm_model_name: llmModelName.value,
          do_voice_extraction: doVoiceExtraction.value,
          do_correction: doCorrection.value,
          do_question_answering: doQuestionAnswering.value,
        };

        await axios.post('/upload-audio', formData, { params });
        fetchAudioFiles();
      }
    };

    // Fetch audio files and whisper models when component is mounted
    onMounted(() => {
      fetchAudioFiles();
      fetchWhisperModels();
      fetchLLMModels();
    });

    return {
      audioFiles,
      whisperModels,
      llmModels,
      selectedFile,
      whisperModelName,
      llmModelName,
      doVoiceExtraction,
      doCorrection,
      doQuestionAnswering,
      onFileSelected,
      uploadFile,
    };
  },
});
</script>
