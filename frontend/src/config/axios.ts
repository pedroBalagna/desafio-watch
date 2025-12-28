import axios from 'axios'

const TOKEN_KEY = 'authToken'

// Configuração global do axios para adicionar token nas requisições
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axios
