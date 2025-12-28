# Desafio Watch - Gerenciador de Estoque

Sistema de gerenciamento de estoque desenvolvido com Vue 3, TypeScript e Vuetify.

## 🚀 Tecnologias Utilizadas

- Vue 3
- TypeScript
- Vuetify
- Tailwind CSS
- Vue Router
- Material Design Icons

## 📋 Funcionalidades

- Autenticação de usuários
- Criação, edição e exclusão de produtos
- Gerenciamento de categorias e fornecedores
- Controle de estoque (quantidade atual, mínima e máxima)
- Interface responsiva e moderna
- Cards com informações de produtos e status de estoque
- Exibição de preços formatados

## 🛠️ Configuração do Ambiente

### Pré-requisitos

- Node.js (versão LTS recomendada)
- npm ou yarn

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/harduim300/Frontend-Project-Watch
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto `frontend` baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure a URL da API:

```env
VITE_API_URL=https://desafio-watch.vercel.app
```

**Nota**: No Vite, todas as variáveis de ambiente devem começar com `VITE_` para serem expostas ao código do cliente.

## 🚀 Executando o Projeto

### Desenvolvimento

```bash
npm run dev
```

### Build para Produção

```bash
npm run build
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── layout/
│   │   ├── HeaderVue.vue
│   │   └── FooterVue.vue
│   ├── ui/
│   │   ├── AuthForm.vue
│   │   ├── ButtonAct.vue
│   │   ├── CardsProduct.vue
│   │   ├── CreateProductDialog.vue
│   │   ├── DialogConfirm.vue
│   │   ├── EditProductDialog.vue
│   │   └── ProgressCard.vue
│   └── icons/
│       └── IconLogo.vue
├── services/
│   ├── auth.ts
│   ├── products.ts
│   ├── categories.ts
│   └── suppliers.ts
├── views/
│   ├── HomeView.vue
│   ├── RegisterView.vue
│   └── ProductsView.vue
└── router/
    └── index.ts
```

## 🔒 Autenticação

O sistema utiliza um sistema de autenticação baseado em tokens JWT, com as seguintes funcionalidades:

- Login
- Registro de usuários
- Proteção de rotas
- Persistência de sessão

## 📦 Gerenciamento de Produtos

### Funcionalidades

- Criação de produtos com SKU, nome, descrição, categoria, fornecedor
- Controle de preços (venda e custo)
- Gerenciamento de estoque (atual, mínimo e máximo)
- Edição de produtos existentes
- Exclusão de produtos
- Exibição de status de estoque (Sem Estoque, Estoque Baixo, Em Estoque)

## 🎨 Interface do Usuário

### Componentes Principais

- **HeaderVue**: Cabeçalho com logo e menu de usuário
- **CardsProduct**: Cards para exibição de produtos
- **CreateProductDialog**: Dialog para criação de produtos
- **EditProductDialog**: Dialog para edição de produtos
- **DialogConfirm**: Diálogos de confirmação
- **AuthForm**: Formulário de autenticação

### Estilização

- Utilização do Vuetify para componentes base
- Tailwind CSS para estilos customizados
- Design responsivo e moderno

## 🔄 Rotas

- `/`: Página inicial (login)
- `/register`: Registro de usuários
- `/products`: Listagem e gerenciamento de produtos
