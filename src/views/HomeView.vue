<template>
  <div class="container mx-auto p-4 grid grid-cols-2 gap-4">
    <!-- Audio Files List (Left Block) -->
    <div class="bg-white shadow-md rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-4">Audio Files</h2>
      <ul>
        <li v-for="file in audioFiles" :key="file.id" class="mb-2">
          <router-link :to="'/detail/' + file.id" class="block bg-blue-100 p-2 rounded-md hover:bg-blue-200">
            #{{file.id}} {{ file.filename }}
          </router-link>
        </li>
      </ul>
    </div>

    <!-- Upload Block (Right Block) -->
    <div class="bg-white shadow-md rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-4">Upload Audio File</h2>
      <p class="mb-2 text-gray-600">Upload audio (MP3) or JSON files related to transcripts.</p>
      <input type="file" accept="audio/*, application/json" @change="onFileSelected" class="mb-4 border p-2 w-full" />
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
    const selectedFile = ref<File | null>(null);

    const fetchAudioFiles = async () => {
      const response = await axios.get('/audio-files/');
      audioFiles.value = response.data;
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
        await axios.post('/upload-audio', formData);
        fetchAudioFiles();
      }
    };

    onMounted(fetchAudioFiles);

    return { audioFiles, onFileSelected, uploadFile };
  },
});
</script>