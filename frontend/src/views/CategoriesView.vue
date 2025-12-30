<script setup lang="ts">
import { categoryService, type Category } from "@/services/categories";
import { onMounted, ref } from "vue";

const categories = ref<Category[]>([]);
const loading = ref(true);
const isDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const isEditing = ref(false);
const selectedCategory = ref<Category | null>(null);
const deleteError = ref("");

const formData = ref({
  name: "",
  description: "",
});

onMounted(async () => {
  await loadCategories();
});

const loadCategories = async () => {
  try {
    loading.value = true;
    categories.value = await categoryService.getAllCategories(true);
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  isEditing.value = false;
  formData.value = { name: "", description: "" };
  isDialogOpen.value = true;
};

const openEditDialog = (category: Category) => {
  isEditing.value = true;
  selectedCategory.value = category;
  formData.value = {
    name: category.name,
    description: category.description || "",
  };
  isDialogOpen.value = true;
};

const handleSubmit = async () => {
  try {
    if (isEditing.value && selectedCategory.value) {
      const updated = await categoryService.updateCategory(
        selectedCategory.value.id,
        formData.value
      );
      const index = categories.value.findIndex((c) => c.id === selectedCategory.value!.id);
      if (index !== -1) {
        categories.value[index] = updated;
      }
    } else {
      const created = await categoryService.createCategory(formData.value);
      categories.value.push(created);
    }
    isDialogOpen.value = false;
  } catch (error) {
    console.error("Erro ao salvar categoria:", error);
  }
};

const openDeleteDialog = (category: Category) => {
  selectedCategory.value = category;
  deleteError.value = "";
  isDeleteDialogOpen.value = true;
};

const handleDelete = async () => {
  if (!selectedCategory.value) return;
  try {
    await categoryService.deleteCategory(selectedCategory.value.id);
    categories.value = categories.value.filter((c) => c.id !== selectedCategory.value!.id);
    isDeleteDialogOpen.value = false;
  } catch (error) {
    deleteError.value = "Erro ao excluir categoria. Verifique se não há produtos vinculados.";
    console.error("Erro ao excluir categoria:", error);
  }
};

const headers = [
  { title: "Nome", key: "name", sortable: true },
  { title: "Descrição", key: "description", sortable: false },
  { title: "Status", key: "isActive", sortable: true },
  { title: "Ações", key: "actions", sortable: false, align: "end" as const },
];
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>Categorias</h1>
        <p class="subtitle">Gerencie as categorias de produtos</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        Nova Categoria
      </v-btn>
    </div>

    <v-card elevation="0" class="data-card">
      <v-data-table
        :items="categories"
        :headers="headers"
        :loading="loading"
        item-value="id"
        class="elevation-0"
      >
        <template v-slot:[`item.description`]="{ item }">
          <span class="description-text">
            {{ item.description || "—" }}
          </span>
        </template>

        <template v-slot:[`item.isActive`]="{ item }">
          <v-chip :color="item.isActive ? 'success' : 'default'" size="small" variant="flat">
            {{ item.isActive ? "Ativo" : "Inativo" }}
          </v-chip>
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
          {{ isEditing ? "Editar Categoria" : "Nova Categoria" }}
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="handleSubmit">
            <v-text-field
              v-model="formData.name"
              label="Nome"
              variant="outlined"
              required
              class="mb-4"
            />
            <v-textarea
              v-model="formData.description"
              label="Descrição"
              variant="outlined"
              rows="3"
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
          <p>Tem certeza que deseja excluir a categoria "{{ selectedCategory?.name }}"?</p>
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

.description-text {
  color: #666;
  max-width: 300px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-title {
  font-weight: 600;
  padding: 1.25rem 1.5rem 0;
}
</style>
