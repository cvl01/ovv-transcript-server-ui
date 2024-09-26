<template>
  <div class="container mx-auto p-4 grid grid-cols-2 gap-4">
    <div>
      <!-- Audio Files List (Left Block) -->
      <div class="bg-white shadow-md rounded-lg p-4 border border-solid border-blue-200">
        <h2 class="text-xl font-semibold mb-4">Audio Files</h2>
        <ul>
          <li v-for="file in data.audioFiles" :key="file.id" class="mb-2">
            <div class="flex justify-between items-center bg-blue-100 p-2 rounded-md hover:bg-blue-200">
              <!-- File link inside the router link -->
              <router-link :to="'/detail/' + file.id" class="flex-1">
                <h4>#{{ file.id }} {{ file.filename }}</h4>
                <small>{{ file.processing_options }}</small>
              </router-link>
              <!-- Delete Button positioned on the right -->
              <button @click="deleteAudioFile(file.id)" class="bg-red-500 text-white px-2 py-1 rounded-md ml-4">
                Delete
              </button>
            </div>
          </li>
        </ul>
      </div>

      <!-- Projects List (Left Block) -->
      <div class="bg-white shadow-md rounded-lg p-4 mt-12 border-green-200 border border-solid">
        <h2 class="text-xl font-semibold mb-4">Projects</h2>
        <ul>
          <li v-for="project in data.projects" :key="project.id" class="mb-2">
            <router-link :to="'/project/' + project.id" class="block bg-green-100 p-2 rounded-md hover:bg-green-200">
              <h4>#{{ project.id }} {{ project.name }}</h4>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
    <div>
      <!-- Upload Block -->
      <div class="bg-white shadow-md rounded-lg p-4 border border-solid border-blue-200">
        <h2 class="text-xl font-semibold mb-4">Upload Audio File</h2>
        <p class="mb-2 text-gray-600">Upload audio (MP3) or JSON files related to transcripts.</p>

        <!-- File Input -->
        <input type="file" accept="audio/*, application/json" @change="onFileSelected" class="mb-4 border p-2 w-full" />

        <!-- Whisper Model Dropdown -->
        <label class="block mb-2">
          Whisper Model:
          <select v-model="uploadForm.whisperModelName" class="border p-2 w-full">
            <option v-for="model in data.whisperModels" :key="model" :value="model">
              {{ model }}
            </option>
          </select>
        </label>

        <!-- LLM Model Dropdown -->
        <label class="block mb-2">
          LLM Model:
          <select v-model="uploadForm.llmModelName" class="border p-2 w-full">
            <option v-for="model in data.llmModels" :key="model" :value="model">
              {{ model }}
            </option>
          </select>
        </label>

        <!-- Project Dropdown -->
        <label class="block mb-2">
          Project:
          <select v-model="uploadForm.selectedProjectId" class="border p-2 w-full">
            <option value="">Select a project</option>
            <option v-for="project in data.projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </label>

        <label class="block mb-2">
          <input type="checkbox" v-model="uploadForm.doVoiceExtraction" /> Perform Voice Extraction
        </label>

        <label class="block mb-2">
          <input type="checkbox" v-model="uploadForm.doCorrection" /> Perform Correction (Default: Yes)
        </label>

        <label class="block mb-2">
          <input type="checkbox" v-model="uploadForm.doQuestionAnswering" /> Perform Question Answering (Default: Yes)
        </label>

        <!-- Upload Button -->
        <button @click="uploadFile" class="bg-blue-500 text-white px-4 py-2 rounded-md">Upload</button>
      </div>

      <!-- Create Project Form -->
      <div class="mt-8 bg-white shadow-md rounded-lg p-4 order-solid border border-green-200 ">
        <h2 class="text-xl font-semibold mb-4">Create Project</h2>
        <label class="block mb-2">
          Project Name:
          <input v-model="projectForm.name" class="border p-2 w-full" placeholder="Enter project name" />
        </label>
        <label class="block mb-2">
          Project Description:
          <textarea v-model="projectForm.description" class="border p-2 w-full"
            placeholder="Enter project description"></textarea>
        </label>

        <!-- Create Project Button -->
        <button @click="createProject" class="bg-green-500 text-white px-4 py-2 rounded-md mt-2">Create Project</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';

// Define interfaces
interface AudioFileSummary {
  id: number;
  filename: string;
  processing_options: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
}

interface UploadForm {
  whisperModelName: string;
  llmModelName: string;
  selectedProjectId: string;
  doVoiceExtraction: boolean;
  doCorrection: boolean;
  doQuestionAnswering: boolean;
}

interface ProjectForm {
  name: string;
  description: string;
}

export default defineComponent({
  setup() {
    // Group related data into objects
    const data = ref({
      audioFiles: [] as AudioFileSummary[],
      projects: [] as Project[],
      whisperModels: [] as string[],
      llmModels: [] as string[],
    });

    // Upload form state
    const uploadForm = ref<UploadForm>({
      whisperModelName: '',
      llmModelName: '',
      selectedProjectId: '',
      doVoiceExtraction: false,
      doCorrection: true,
      doQuestionAnswering: true,
    });

    // Project creation form state
    const projectForm = ref<ProjectForm>({
      name: '',
      description: '',
    });

    const selectedFile = ref<File | null>(null);

    // Fetch available audio files
    const fetchAudioFiles = async () => {
      const response = await axios.get('/audio-files/');
      data.value.audioFiles = response.data;
    };

    // Fetch available projects from the API
    const fetchProjects = async () => {
      const response = await axios.get('/projects/');
      data.value.projects = response.data;
    };

    // Fetch available whisper models from the API
    const fetchWhisperModels = async () => {
      const response = await axios.get('/whisper-models/');
      data.value.whisperModels = response.data;
      if (data.value.whisperModels.length > 0) {
        uploadForm.value.whisperModelName = data.value.whisperModels[0];
      }
    };

    // Fetch available LLM models from the API
    const fetchLLMModels = async () => {
      const response = await axios.get('/llm-models/');
      data.value.llmModels = response.data;
      if (data.value.llmModels.length > 0) {
        uploadForm.value.llmModelName = data.value.llmModels[0];
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
          whisper_model_name: uploadForm.value.whisperModelName,
          llm_model_name: uploadForm.value.llmModelName,
          project_id: uploadForm.value.selectedProjectId,
          do_voice_extraction: uploadForm.value.doVoiceExtraction,
          do_correction: uploadForm.value.doCorrection,
          do_question_answering: uploadForm.value.doQuestionAnswering,
        };

        await axios.post('/upload-audio', formData, { params });
        fetchAudioFiles();
      }
    };

    // Method to delete audio file
    const deleteAudioFile = async (audioFileId: number) => {
      try {
        // Send DELETE request to the backend
        await axios.delete(`/audio-files/${audioFileId}`);

        // Update the list of audio files after successful deletion
        data.value.audioFiles = data.value.audioFiles.filter(file => file.id !== audioFileId);
      } catch (error) {
        console.error('Error deleting audio file:', error);
      }
    };

    const createProject = async () => {
      if (projectForm.value.name.trim() && projectForm.value.description.trim()) {
        await axios.post('/projects/', {
          name: projectForm.value.name,
          description: projectForm.value.description,
        });
        projectForm.value.name = ''; // Clear form
        projectForm.value.description = '';
        fetchProjects();
      }
    };

    onMounted(() => {
      fetchAudioFiles();
      fetchProjects();
      fetchWhisperModels();
      fetchLLMModels();
    });

    return {
      data,
      uploadForm,
      projectForm,
      selectedFile,
      onFileSelected,
      uploadFile,
      createProject,
      deleteAudioFile,
    };
  },
});
</script>
