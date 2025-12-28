<script lang="ts">
  import IconLogo from '../icons/IconLogo.vue';
  import Menu from '../ui/Menu.vue';

  export default {
    components: {
      IconLogo,
      Menu,
    }
  }

</script>
<template>
    <div class="bg-primary-watch w-full flex justify-between items-center px-9">
        <router-link to="/products">
            <IconLogo class="w-[68px] h-[68px]"/>
        </router-link>
        <Menu/>
    </div>
</template>
