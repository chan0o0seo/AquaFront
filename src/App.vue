<script setup lang="ts">
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<template>
  <div class="min-h-screen bg-white">
    <AppNavbar />
    <router-view />
    <AppFooter />
  </div>
</template>
