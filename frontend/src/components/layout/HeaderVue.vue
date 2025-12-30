<script lang="ts">
import IconLogo from "../icons/IconLogo.vue";
import AppMenu from "../ui/AppMenu.vue";

export default {
  components: {
    IconLogo,
    AppMenu,
  },
};
</script>
<template>
  <div class="bg-primary-watch w-full flex justify-between items-center px-9">
    <router-link to="/dashboard">
      <IconLogo class="w-[68px] h-[68px]" />
    </router-link>
    <AppMenu />
  </div>
</template>
