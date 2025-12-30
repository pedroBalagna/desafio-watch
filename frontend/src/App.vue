<script setup lang="ts">
import { computed, ref, provide } from 'vue';
import { useRoute } from 'vue-router';
import Header from "./components/layout/HeaderVue.vue"
import Footer from './components/layout/FooterVue.vue';
import Sidebar from './components/layout/SidebarVue.vue';

const route = useRoute();
const isSidebarCollapsed = ref(false);

// Páginas que não devem mostrar a sidebar (login/register)
const showSidebar = computed(() => {
  const publicRoutes = ['/', '/register'];
  return !publicRoutes.includes(route.path);
});

// Fornecer estado da sidebar para componentes filhos
provide('sidebarCollapsed', isSidebarCollapsed);
</script>

<template>
  <div class="app-container">
    <!-- Layout com Sidebar (páginas autenticadas) -->
    <template v-if="showSidebar">
      <Sidebar @toggle="(collapsed) => isSidebarCollapsed = collapsed" />
      <div class="main-content" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
        <Header />
        <div class="page-content">
          <RouterView />
        </div>
      </div>
    </template>

    <!-- Layout sem Sidebar (login/register) -->
    <template v-else>
      <div class="w-full min-h-screen h-auto flex flex-col justify-between bg-gradient-orange">
        <Header />
        <RouterView />
        <Footer />
      </div>
    </template>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: hidden;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-collapsed {
  margin-left: 72px;
}

.page-content {
  flex: 1;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  overflow-y: auto;
}
</style>
