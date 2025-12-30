<script setup lang="ts">
import { supplierService, type Supplier } from "@/services/suppliers";
import { onMounted, ref } from "vue";

const suppliers = ref<Supplier[]>([]);
const loading = ref(true);
const isDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const isEditing = ref(false);
const selectedSupplier = ref<Supplier | null>(null);
const deleteError = ref("");

const formData = ref({
  name: "",
  email: "",
  phone: "",
  address: "",
  cnpj: "",
});

onMounted(async () => {
  await loadSuppliers();
});

const loadSuppliers = async () => {
  try {
    loading.value = true;
    suppliers.value = await supplierService.getAllSuppliers(true);
  } catch (error) {
    console.error("Erro ao carregar fornecedores:", error);
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  isEditing.value = false;
  formData.value = { name: "", email: "", phone: "", address: "", cnpj: "" };
  isDialogOpen.value = true;
};

const openEditDialog = (supplier: Supplier) => {
  isEditing.value = true;
  selectedSupplier.value = supplier;
  formData.value = {
    name: supplier.name,
    email: supplier.email || "",
    phone: supplier.phone || "",
    address: supplier.address || "",
    cnpj: supplier.cnpj || "",
  };
  isDialogOpen.value = true;
};

const handleSubmit = async () => {
  try {
    if (isEditing.value && selectedSupplier.value) {
      const updated = await supplierService.updateSupplier(
        selectedSupplier.value.id,
        formData.value
      );
      const index = suppliers.value.findIndex(
        (s) => s.id === selectedSupplier.value!.id
      );
      if (index !== -1) {
        suppliers.value[index] = updated;
      }
    } else {
      const created = await supplierService.createSupplier(formData.value);
      suppliers.value.push(created);
    }
    isDialogOpen.value = false;
  } catch (error) {
    console.error("Erro ao salvar fornecedor:", error);
  }
};

const openDeleteDialog = (supplier: Supplier) => {
  selectedSupplier.value = supplier;
  deleteError.value = "";
  isDeleteDialogOpen.value = true;
};

const handleDelete = async () => {
  if (!selectedSupplier.value) return;
  try {
    await supplierService.deleteSupplier(selectedSupplier.value.id);
    suppliers.value = suppliers.value.filter(
      (s) => s.id !== selectedSupplier.value!.id
    );
    isDeleteDialogOpen.value = false;
  } catch (error) {
    deleteError.value = "Erro ao excluir fornecedor. Verifique se não há produtos vinculados.";
    console.error("Erro ao excluir fornecedor:", error);
  }
};

const formatCNPJ = (cnpj?: string) => {
  if (!cnpj) return "—";
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
};

const headers = [
  { title: "Nome", key: "name", sortable: true },
  { title: "Email", key: "email", sortable: false },
  { title: "Telefone", key: "phone", sortable: false },
  { title: "CNPJ", key: "cnpj", sortable: false },
  { title: "Status", key: "isActive", sortable: true },
  { title: "Ações", key: "actions", sortable: false, align: "end" as const },
];
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>Fornecedores</h1>
        <p class="subtitle">Gerencie os fornecedores do sistema</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        Novo Fornecedor
      </v-btn>
    </div>

    <v-card elevation="0" class="data-card">
      <v-data-table
        :items="suppliers"
        :headers="headers"
        :loading="loading"
        item-value="id"
        class="elevation-0"
      >
        <template v-slot:[`item.email`]="{ item }">
          <span>{{ item.email || "—" }}</span>
        </template>

        <template v-slot:[`item.phone`]="{ item }">
          <span>{{ item.phone || "—" }}</span>
        </template>

        <template v-slot:[`item.cnpj`]="{ item }">
          <span class="font-mono">{{ formatCNPJ(item.cnpj) }}</span>
        </template>

        <template v-slot:[`item.isActive`]="{ item }">
          <v-chip
            :color="item.isActive ? 'success' : 'default'"
            size="small"
            variant="flat"
          >
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
    <v-dialog v-model="isDialogOpen" max-width="600">
      <v-card>
        <v-card-title class="dialog-title">
          {{ isEditing ? "Editar Fornecedor" : "Novo Fornecedor" }}
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="handleSubmit">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.name"
                  label="Nome *"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.email"
                  label="Email"
                  variant="outlined"
                  type="email"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.phone"
                  label="Telefone"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.cnpj"
                  label="CNPJ"
                  variant="outlined"
                  placeholder="00.000.000/0000-00"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.address"
                  label="Endereço"
                  variant="outlined"
                  rows="2"
                />
              </v-col>
            </v-row>
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
        <v-card-title class="dialog-title text-error">
          Confirmar Exclusão
        </v-card-title>

        <v-card-text>
          <p>Tem certeza que deseja excluir o fornecedor "{{ selectedSupplier?.name }}"?</p>
          <v-alert v-if="deleteError" type="error" variant="tonal" class="mt-4">
            {{ deleteError }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="isDeleteDialogOpen = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" @click="handleDelete">
            Excluir
          </v-btn>
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

.font-mono {
  font-family: monospace;
  font-size: 0.9em;
}

.dialog-title {
  font-weight: 600;
  padding: 1.25rem 1.5rem 0;
}
</style>
