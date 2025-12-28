<script setup lang="ts">
  import AuthForm from '@/components/ui/AuthForm.vue';
  import { authService } from '@/services/auth'
  import { useRouter } from 'vue-router'
  import { ref } from 'vue'

  const router = useRouter()
  const errorMessage = ref('')

  const onRegisterSubmit = async (data: { name?: string; email: string; password: string }) => {
    try {
      errorMessage.value = ''
      await authService.register({
        name: data.name ?? '', // Define uma string vazia caso seja undefined
        email: data.email,
        password: data.password
      })
      router.push('/')
    } catch (error: any) {
      errorMessage.value = error.message
    }
  }
</script>

<template>
  <div>
    <AuthForm
    title="Criar Conta"
    :isRegistration="true"
    :showForgotPassword="false"
    submitButtonText="Registrar"
    secondaryActionText="Já tem uma conta? Entre aqui"
    secondaryActionLink="/"
    @submit="onRegisterSubmit"
    :error-message="errorMessage"
  />
  </div>
</template>
