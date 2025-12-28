<template>
  <div class="my-6">
    <IconLogo
      v-if="showLogo"
      class="mx-auto my-6"
      :width="logoWidth"
    />

    <v-card
      class="mx-auto pa-8 pb-2"
      elevation="8"
      max-width="448"
      rounded="lg"
    >
      <v-card-text class="text-center">
        <h1 class="font-bold text-3xl">
          {{ title }}
        </h1>
      </v-card-text>
      <div class="text-subtitle-1 text-medium-emphasis">Conta</div>

      <v-text-field
        v-if="isRegistration"
        v-model="name"
        density="compact"
        placeholder="Nome completo"
        prepend-inner-icon="mdi-account-outline"
        variant="outlined"
        required
        :rules="[v => !!v || 'Nome é obrigatório']"
      ></v-text-field>

      <v-text-field
        v-model="email"
        density="compact"
        placeholder="Endereço de email"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
      ></v-text-field>

      <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
        Senha

        <a
          v-if="showForgotPassword"
          :href="forgotPasswordLink"
          class="text-caption text-decoration-none text-blue"
          rel="noopener noreferrer"
          target="_blank"
        >
          Esqueceu sua senha?</a>
      </div>

      <v-text-field
        v-model="password"
        :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visible ? 'text' : 'password'"
        density="compact"
        placeholder="Senha"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        @click:append-inner="visible = !visible"
        :error-messages="passwordError"
      ></v-text-field>

      <v-text-field
        v-if="isRegistration"
        v-model="confirmPassword"
        :append-inner-icon="visibleConfirm ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visibleConfirm ? 'text' : 'password'"
        density="compact"
        placeholder="Confirme sua senha"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        @click:append-inner="visibleConfirm = !visibleConfirm"
        :error-messages="confirmPasswordError"
      ></v-text-field>

      <v-alert
        v-if="errorMessage"
        type="error"
        class="mb-4"
        density="compact"
      >
        {{ errorMessage }}
      </v-alert>

      <v-btn
        block
        style="background-color: #ff501a; color: white;"
        @click="handleSubmit"
        :disabled="isRegistration && !isPasswordValid"
      >
        {{ submitButtonText }}
      </v-btn>

      <v-card-text class="text-center mt-4">
        <a
          @click.prevent="handleSecondaryAction"
          class="text-caption text-decoration-none text-[#ff501a] cursor-pointer"
        >
          {{ secondaryActionText }}
        </a>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import IconLogo from '../icons/IconLogo.vue'
import { useRouter } from 'vue-router'

interface Props {
  showLogo?: boolean
  logoWidth?: number
  title?: string
  showForgotPassword?: boolean
  forgotPasswordLink?: string
  submitButtonText?: string
  secondaryActionText?: string
  secondaryActionLink?: string
  isRegistration?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  showLogo: true,
  logoWidth: 228,
  title: 'Login',
  showForgotPassword: false,
  forgotPasswordLink: '#',
  submitButtonText: 'Log In',
  secondaryActionText: 'Sign up now',
  secondaryActionLink: '#',
  isRegistration: false,
  errorMessage: ''
})

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
}

const emit = defineEmits<{
  (e: 'submit', data: LoginData | RegisterData): void
}>()

const router = useRouter()

const visible = ref(false)
const visibleConfirm = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const passwordError = computed(() => {
  if (!props.isRegistration) return ''
  if (password.value && password.value.length < 6) {
    return 'A senha deve ter pelo menos 6 caracteres'
  }
  return ''
})

const confirmPasswordError = computed(() => {
  if (!props.isRegistration) return ''
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    return 'As senhas não coincidem'
  }
  return ''
})

const isPasswordValid = computed(() => {
  return password.value.length >= 6 &&
         password.value === confirmPassword.value
})

const handleSubmit = () => {
  if (props.isRegistration) {
    if (!isPasswordValid.value || !name.value) {
      return
    }
    const data: RegisterData = {
      name: name.value,
      email: email.value,
      password: password.value
    }
    emit('submit', data)
  } else {
    const data: LoginData = {
      email: email.value,
      password: password.value
    }
    emit('submit', data)
  }
}

const handleSecondaryAction = () => {
  router.push(props.secondaryActionLink)
}
</script>