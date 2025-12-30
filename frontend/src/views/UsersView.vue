<script setup lang="ts">
import { userService, type User } from "@/services/users";
import { onMounted, ref } from "vue";

const users = ref<User[]>([]);
const loading = ref(true);
const isDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const isEditing = ref(false);
const selectedUser = ref<User | null>(null);
const deleteError = ref("");
const showPassword = ref(false);

const formData = ref({
  name: "",
  email: "",
  password: "",
  role: "USER",
});

const roles = [
  { value: "USER", title: "Usuário" },
  { value: "ADMIN", title: "Administrador" },
  { value: "MANAGER", title: "Gerente" },
];

onMounted(async () => {
  await loadUsers();
});

const loadUsers = async () => {
  try {
    loading.value = true;
    users.value = await userService.getAllUsers();
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  isEditing.value = false;
  formData.value = { name: "", email: "", password: "", role: "USER" };
  showPassword.value = false;
  isDialogOpen.value = true;
};

const openEditDialog = (user: User) => {
  isEditing.value = true;
  selectedUser.value = user;
  formData.value = {
    name: user.name,
    email: user.email,
    password: "",
    role: user.role || "USER",
  };
  showPassword.value = false;
  isDialogOpen.value = true;
};

const handleSubmit = async () => {
  try {
    if (isEditing.value && selectedUser.value) {
      const updateData: {
        name: string;
        email: string;
        role: string;
        password?: string;
      } = {
        name: formData.value.name,
        email: formData.value.email,
        role: formData.value.role,
      };
      if (formData.value.password) {
        updateData.password = formData.value.password;
      }
      const updated = await userService.updateUser(selectedUser.value.id, updateData);
      const index = users.value.findIndex((u) => u.id === selectedUser.value!.id);
      if (index !== -1) {
        users.value[index] = updated;
      }
    } else {
      const created = await userService.createUser(formData.value);
      users.value.push(created);
    }
    isDialogOpen.value = false;
  } catch (error) {
    console.error("Erro ao salvar usuário:", error);
  }
};

const openDeleteDialog = (user: User) => {
  selectedUser.value = user;
  deleteError.value = "";
  isDeleteDialogOpen.value = true;
};

const handleDelete = async () => {
  if (!selectedUser.value) return;
  try {
    await userService.deleteUser(selectedUser.value.id);
    users.value = users.value.filter((u) => u.id !== selectedUser.value!.id);
    isDeleteDialogOpen.value = false;
  } catch (error) {
    deleteError.value = "Erro ao excluir usuário.";
    console.error("Erro ao excluir usuário:", error);
  }
};

const getRoleLabel = (role?: string) => {
  const labels: Record<string, string> = {
    USER: "Usuário",
    ADMIN: "Administrador",
    MANAGER: "Gerente",
  };
  return labels[role || "USER"] || role;
};

const getRoleColor = (role?: string) => {
  const colors: Record<string, string> = {
    USER: "default",
    ADMIN: "error",
    MANAGER: "warning",
  };
  return colors[role || "USER"] || "default";
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("pt-BR");
};

const headers = [
  { title: "Nome", key: "name", sortable: true },
  { title: "Email", key: "email", sortable: true },
  { title: "Função", key: "role", sortable: true },
  { title: "Status", key: "isActive", sortable: true },
  { title: "Criado em", key: "createdAt", sortable: true },
  { title: "Ações", key: "actions", sortable: false, align: "end" as const },
];
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>Usuários</h1>
        <p class="subtitle">Gerencie os usuários do sistema</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        Novo Usuário
      </v-btn>
    </div>

    <v-card elevation="0" class="data-card">
      <v-data-table
        :items="users"
        :headers="headers"
        :loading="loading"
        item-value="id"
        class="elevation-0"
      >
        <template v-slot:[`item.name`]="{ item }">
          <div class="user-cell">
            <v-avatar size="32" color="primary" class="mr-3">
              <span class="text-white text-caption">
                {{ item.name?.charAt(0).toUpperCase() }}
              </span>
            </v-avatar>
            <span class="font-weight-medium">{{ item.name }}</span>
          </div>
        </template>

        <template v-slot:[`item.role`]="{ item }">
          <v-chip :color="getRoleColor(item.role)" size="small" variant="flat">
            {{ getRoleLabel(item.role) }}
          </v-chip>
        </template>

        <template v-slot:[`item.isActive`]="{ item }">
          <v-chip :color="item.isActive ? 'success' : 'default'" size="small" variant="flat">
            {{ item.isActive ? "Ativo" : "Inativo" }}
          </v-chip>
        </template>

        <template v-slot:[`item.createdAt`]="{ item }">
          <span class="text-caption">{{ formatDate(item.createdAt) }}</span>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            icon="mdi-pencil"
            variant="text"
            size="small"
            color="primary"
            @click="openEditDialog(item)"
          />
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            @click="openDeleteDialog(item)"
          />
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="isDialogOpen" max-width="500">
      <v-card>
        <v-card-title class="dialog-title">
          {{ isEditing ? "Editar Usuário" : "Novo Usuário" }}
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="handleSubmit">
            <v-text-field
              v-model="formData.name"
              label="Nome *"
              variant="outlined"
              required
              class="mb-4"
            />
            <v-text-field
              v-model="formData.email"
              label="Email *"
              variant="outlined"
              type="email"
              required
              class="mb-4"
            />
            <v-text-field
              v-model="formData.password"
              :label="isEditing ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'"
              variant="outlined"
              :type="showPassword ? 'text' : 'password'"
              :required="!isEditing"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              class="mb-4"
            />
            <v-select
              v-model="formData.role"
              label="Função"
              variant="outlined"
              :items="roles"
              item-value="value"
              item-title="title"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="isDialogOpen = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="handleSubmit">
            {{ isEditing ? "Salvar" : "Criar" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="isDeleteDialogOpen" max-width="400">
      <v-card>
        <v-card-title class="dialog-title text-error"> Confirmar Exclusão </v-card-title>

        <v-card-text>
          <p>Tem certeza que deseja excluir o usuário "{{ selectedUser?.name }}"?</p>
          <v-alert v-if="deleteError" type="error" variant="tonal" class="mt-4">
            {{ deleteError }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="isDeleteDialogOpen = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" @click="handleDelete"> Excluir </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.subtitle {
  color: #666;
  margin-top: 0.25rem;
}

.data-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.user-cell {
  display: flex;
  align-items: center;
}

.dialog-title {
  font-weight: 600;
  padding: 1.25rem 1.5rem 0;
}
</style>
