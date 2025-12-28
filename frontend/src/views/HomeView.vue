<script setup lang="ts">
  import AuthForm from '@/components/ui/AuthForm.vue';
  import { authService } from '@/services/auth'
  import { useRouter } from 'vue-router'
  import { ref } from 'vue'

  const router = useRouter()
  const errorMessage = ref('')

  const onLoginSubmit = async (data: { email: string, password: string }) => {
    try {
      errorMessage.value = ''
      await authService.login(data)
      router.push('/products')
    } catch (error: any) {
      errorMessage.value = error.message
    }
  }
</script>

<template>
  <div>
    <AuthForm
      title="Login"
      submitButtonText="Entrar"
      secondaryActionText="Criar conta"
      secondaryActionLink="/register"
      @submit="onLoginSubmit"
      :error-message="errorMessage"
    />
  </div>
</template>
