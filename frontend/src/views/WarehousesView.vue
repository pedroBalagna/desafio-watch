<script setup lang="ts">
import { warehouseService, type Warehouse } from "@/services/warehouses";
import { onMounted, ref } from "vue";

const warehouses = ref<Warehouse[]>([]);
const loading = ref(true);
const isDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const isEditing = ref(false);
const selectedWarehouse = ref<Warehouse | null>(null);
const deleteError = ref("");

const formData = ref<{
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}>({
  name: "",
  code: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
});

onMounted(async () => {
  await loadWarehouses();
});

const loadWarehouses = async () => {
  try {
    loading.value = true;
    warehouses.value = await warehouseService.getAllWarehouses(true);
  } catch (error) {
    console.error("Erro ao carregar armazéns:", error);
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  isEditing.value = false;
  formData.value = {
    name: "",
    code: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  };
  isDialogOpen.value = true;
};

const openEditDialog = (warehouse: Warehouse) => {
  isEditing.value = true;
  selectedWarehouse.value = warehouse;
  formData.value = {
    name: warehouse.name,
    code: warehouse.code,
    address: warehouse.address || "",
    city: warehouse.city || "",
    state: warehouse.state || "",
    zipCode: warehouse.zipCode || "",
  };
  isDialogOpen.value = true;
};

const handleSubmit = async () => {
  try {
    if (isEditing.value && selectedWarehouse.value) {
      // Preparar dados para atualização (campos opcionais)
      const updateData: {
        name: string;
        code: string;
        address?: string;
        city?: string;
        state?: string;
        zipCode?: string;
      } = {
        name: formData.value.name,
        code: formData.value.code,
      };

      // Adicionar apenas campos que não estão vazios
      if (formData.value.address?.trim()) {
        updateData.address = formData.value.address.trim();
      }
      if (formData.value.city?.trim()) {
        updateData.city = formData.value.city.trim();
      }
      if (formData.value.state?.trim()) {
        updateData.state = formData.value.state.trim();
      }
      if (formData.value.zipCode?.trim()) {
        updateData.zipCode = formData.value.zipCode.trim();
      }

      const updated = await warehouseService.updateWarehouse(
        selectedWarehouse.value.id,
        updateData
      );
      const index = warehouses.value.findIndex((w) => w.id === selectedWarehouse.value!.id);
      if (index !== -1) {
        warehouses.value[index] = updated;
      }
    } else {
      // Preparar dados para criação (isActive obrigatório)
      const createData: {
        name: string;
        code: string;
        address?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        isActive: boolean;
      } = {
        name: formData.value.name,
        code: formData.value.code,
        isActive: true,
      };

      // Adicionar apenas campos que não estão vazios
      if (formData.value.address?.trim()) {
        createData.address = formData.value.address.trim();
      }
      if (formData.value.city?.trim()) {
        createData.city = formData.value.city.trim();
      }
      if (formData.value.state?.trim()) {
        createData.state = formData.value.state.trim();
      }
      if (formData.value.zipCode?.trim()) {
        createData.zipCode = formData.value.zipCode.trim();
      }

      const created = await warehouseService.createWarehouse(createData);
      warehouses.value.push(created);
    }
    isDialogOpen.value = false;
  } catch (error) {
    console.error("Erro ao salvar armazém:", error);
  }
};

const openDeleteDialog = (warehouse: Warehouse) => {
  selectedWarehouse.value = warehouse;
  deleteError.value = "";
  isDeleteDialogOpen.value = true;
};

const handleDelete = async () => {
  if (!selectedWarehouse.value) return;
  try {
    await warehouseService.deleteWarehouse(selectedWarehouse.value.id);
    warehouses.value = warehouses.value.filter((w) => w.id !== selectedWarehouse.value!.id);
    isDeleteDialogOpen.value = false;
  } catch (error) {
    deleteError.value = "Erro ao excluir armazém. Verifique se não há estoque vinculado.";
    console.error("Erro ao excluir armazém:", error);
  }
};

const getFullAddress = (warehouse: Warehouse) => {
  const parts = [warehouse.address, warehouse.city, warehouse.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
};

const headers = [
  { title: "Código", key: "code", sortable: true },
  { title: "Nome", key: "name", sortable: true },
  { title: "Localização", key: "location", sortable: false },
  { title: "Status", key: "isActive", sortable: true },
  { title: "Ações", key: "actions", sortable: false, align: "end" as const },
];

const states = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>Armazéns</h1>
        <p class="subtitle">Gerencie os locais de armazenamento</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        Novo Armazém
      </v-btn>
    </div>

    <v-card elevation="0" class="data-card">
      <v-data-table
        :items="warehouses"
        :headers="headers"
        :loading="loading"
        item-value="id"
        class="elevation-0"
      >
        <template v-slot:[`item.code`]="{ item }">
          <v-chip size="small" variant="outlined" color="primary">
            {{ item.code }}
          </v-chip>
        </template>

        <template v-slot:[`item.location`]="{ item }">
          <div class="location-cell">
            <v-icon icon="mdi-map-marker" size="16" class="mr-1" color="grey" />
            <span>{{ getFullAddress(item) }}</span>
          </div>
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
    <v-dialog v-model="isDialogOpen" max-width="600">
      <v-card>
        <v-card-title class="dialog-title">
          {{ isEditing ? "Editar Armazém" : "Novo Armazém" }}
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="handleSubmit">
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.code"
                  label="Código *"
                  variant="outlined"
                  required
                  placeholder="ARM-001"
                />
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field v-model="formData.name" label="Nome *" variant="outlined" required />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="formData.address" label="Endereço" variant="outlined" />
              </v-col>
              <v-col cols="12" md="5">
                <v-text-field v-model="formData.city" label="Cidade" variant="outlined" />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="formData.state"
                  label="Estado"
                  variant="outlined"
                  :items="states"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.zipCode"
                  label="CEP"
                  variant="outlined"
                  placeholder="00000-000"
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
        <v-card-title class="dialog-title text-error"> Confirmar Exclusão </v-card-title>

        <v-card-text>
          <p>Tem certeza que deseja excluir o armazém "{{ selectedWarehouse?.name }}"?</p>
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

.location-cell {
  display: flex;
  align-items: center;
  color: #666;
}

.dialog-title {
  font-weight: 600;
  padding: 1.25rem 1.5rem 0;
}
</style>
