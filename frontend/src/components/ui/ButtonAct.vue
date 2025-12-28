<template>
  <div class="pa-8 text-center">
    <v-btn
      class="ma-auto"
      size="x-large"
      :text="buttonText"
      @click="sheet = !sheet"
    ></v-btn>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'

interface Props {
  buttonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: 'Click me'
})

const sheet = shallowRef(false)
</script>
