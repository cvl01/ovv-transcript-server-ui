<template>
  <div>
    <!-- Navigation (Optional) -->
    <nav class="bg-gray-800 p-4 text-white">
      <router-link to="/" class="mr-4">Home</router-link>
    </nav>

    <!-- This is where the routed components will be rendered -->
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
});
</script>

<style>
/* You can define global styles here if needed */
</style>
