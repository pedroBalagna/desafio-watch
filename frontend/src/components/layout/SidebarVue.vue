<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isCollapsed = ref(false);

const emit = defineEmits<{
  toggle: [collapsed: boolean];
}>();

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
  emit("toggle", isCollapsed.value);
};

const menuItems = [
  {
    title: "Dashboard",
    icon: "mdi-view-dashboard",
    path: "/dashboard",
  },
  {
    title: "Produtos",
    icon: "mdi-package-variant-closed",
    path: "/products",
  },
  {
    title: "Categorias",
    icon: "mdi-tag-multiple",
    path: "/categories",
  },
  {
    title: "Fornecedores",
    icon: "mdi-truck-delivery",
    path: "/suppliers",
  },
  {
    title: "Armazéns",
    icon: "mdi-warehouse",
    path: "/warehouses",
  },
  {
    title: "Movimentações",
    icon: "mdi-swap-horizontal-bold",
    path: "/stock",
  },
  {
    title: "Usuários",
    icon: "mdi-account-group",
    path: "/users",
  },
];

const isActive = (path: string) => {
  return route.path === path;
};

const sidebarWidth = computed(() => (isCollapsed.value ? "72px" : "260px"));
</script>

<template>
  <div class="sidebar" :style="{ width: sidebarWidth }">
    <div class="sidebar-header">
      <v-btn
        :icon="isCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left'"
        variant="text"
        size="small"
        color="white"
        @click="toggleSidebar"
        class="collapse-btn"
      />
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <v-icon :icon="item.icon" size="24" />
        <span v-if="!isCollapsed" class="nav-text">{{ item.title }}</span>
        <v-tooltip v-if="isCollapsed" :text="item.title" location="end">
          <template v-slot:activator="{ props }">
            <span v-bind="props" class="tooltip-trigger"></span>
          </template>
        </v-tooltip>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="nav-item version" v-if="!isCollapsed">
        <v-icon icon="mdi-information-outline" size="20" />
        <span class="nav-text">v1.0.0</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.sidebar-header {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.collapse-btn {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.collapse-btn:hover {
  opacity: 1;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem 0.75rem;
  gap: 0.375rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  font-weight: 500;
  font-size: 0.9rem;
}

.nav-item:hover {
  background: rgba(255, 80, 26, 0.15);
  color: rgba(255, 255, 255, 0.9);
}

.nav-item.active {
  background: linear-gradient(135deg, #ff501a 0%, #ff7a1a 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 80, 26, 0.4);
}

.nav-item.active .v-icon {
  color: white;
}

.tooltip-trigger {
  position: absolute;
  inset: 0;
}

.nav-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-footer {
  padding: 1rem 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.version {
  opacity: 0.5;
  font-size: 0.8rem;
  cursor: default;
}

.version:hover {
  background: transparent;
  opacity: 0.5;
}

/* Scrollbar customizada */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
