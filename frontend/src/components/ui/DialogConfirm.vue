<template>
  <v-dialog v-model="dialogOpen" width="400">
    <v-card>
      <v-card-title class="text-h5">
        {{ title }}
      </v-card-title>

      <v-card-text class="pt-4">
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        {{ message }}

        <div v-if="type === 'add-people'" class="mt-4">
          <v-text-field
            v-model="email"
            label="Email"
            variant="outlined"
            density="comfortable"
            type="email"
            :rules="[v => !!v || 'Email é obrigatório']"
            required
          ></v-text-field>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="handleClose"
        >
          Cancelar
        </v-btn>
        <v-btn
          :color="type === 'delete' ? 'error' : '#ff501a'"
          variant="elevated"
          @click="handleConfirm"
          :disabled="type === 'add-people' && !email"
        >
          {{ confirmButtonText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  isOpen: boolean
  title: string
  message: string
  type: 'delete' | 'add-people'
  confirmButtonText?: string
  error?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:isOpen', 'confirm'])

const dialogOpen = ref(props.isOpen)
const email = ref('')

watch(() => props.isOpen, (newValue) => {
  dialogOpen.value = newValue
  if (!newValue) {
    email.value = ''
  }
})

watch(dialogOpen, (newValue) => {
  emit('update:isOpen', newValue)
})

const handleConfirm = () => {
  if (props.type === 'add-people') {
    if (!email.value.trim()) return
    emit('confirm', { email: email.value })
  } else {
    emit('confirm')
  }
  handleClose()
}

const handleClose = () => {
  dialogOpen.value = false
}
</script>