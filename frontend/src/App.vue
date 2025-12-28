<script setup lang="ts">

// import { RouterLink, RouterView } from 'vue-router';
import Header from "./components/layout/HeaderVue.vue"
import Footer from './components/layout/FooterVue.vue';


</script>

<template>
  <div class="w-full min-h-screen h-auto flex flex-col justify-between bg-gradient-orange">
    <Header/>
    <RouterView />
    <Footer/>
  </div>
</template>

<style scoped>

</style>
