<template>
  <div class="text-center pa-4">
    <v-dialog v-model="dialogOpen" width="600">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          {{ title }}
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form @submit.prevent="handleSubmit" ref="form">
            <v-text-field
              v-model="formData.sku"
              label="SKU"
              required
              :rules="[(v) => !!v || 'SKU é obrigatório']"
              variant="outlined"
              density="comfortable"
            ></v-text-field>

            <v-text-field
              class="my-3"
              v-model="formData.name"
              label="Nome do Produto"
              required
              :rules="[(v) => !!v || 'Nome é obrigatório']"
              variant="outlined"
              density="comfortable"
            ></v-text-field>

            <v-textarea
              v-model="formData.description"
              label="Descrição"
              variant="outlined"
              density="comfortable"
            ></v-textarea>

            <v-select
              v-model="formData.categoryId"
              label="Categoria"
              :items="categories"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="comfortable"
              clearable
            ></v-select>

            <v-select
              v-model="formData.supplierId"
              label="Fornecedor"
              :items="suppliers"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="comfortable"
              clearable
            ></v-select>

            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model.number="formData.unitPrice"
                  label="Preço de Venda"
                  type="number"
                  step="0.01"
                  required
                  :rules="[(v) => !!v || 'Preço é obrigatório']"
                  variant="outlined"
                  density="comfortable"
                  prefix="R$"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="formData.costPrice"
                  label="Preço de Custo"
                  type="number"
                  step="0.01"
                  required
                  :rules="[(v) => !!v || 'Custo é obrigatório']"
                  variant="outlined"
                  density="comfortable"
                  prefix="R$"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="4">
                <v-text-field
                  v-model.number="formData.currentStock"
                  label="Estoque Atual"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model.number="formData.minStock"
                  label="Estoque Mínimo"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model.number="formData.maxStock"
                  label="Estoque Máximo"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="handleClose"> Cancelar </v-btn>
          <v-btn color="#ff501a" variant="elevated" @click="handleSubmit" :disabled="!isFormValid">
            Criar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { categoryService, type Category } from "@/services/categories";
import { supplierService, type Supplier } from "@/services/suppliers";
import { type Product } from "@/services/products";
import { computed, onMounted, ref, watch } from "vue";

interface Props {
  isOpen: boolean;
  title: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:isOpen", "submit"]);

const dialogOpen = ref(props.isOpen);
const categories = ref<Category[]>([]);
const suppliers = ref<Supplier[]>([]);

watch(
  () => props.isOpen,
  (newValue) => {
    dialogOpen.value = newValue;
    if (newValue) {
      loadCategories();
      loadSuppliers();
    }
  }
);

watch(dialogOpen, (newValue) => {
  emit("update:isOpen", newValue);
});

onMounted(() => {
  loadCategories();
  loadSuppliers();
});

const loadCategories = async () => {
  try {
    categories.value = await categoryService.getAllCategories();
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
  }
};

const loadSuppliers = async () => {
  try {
    suppliers.value = await supplierService.getAllSuppliers();
  } catch (error) {
    console.error("Erro ao carregar fornecedores:", error);
  }
};

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const formData = ref({
  sku: "",
  name: "",
  description: "",
  categoryId: undefined as string | undefined,
  supplierId: undefined as string | undefined,
  unitPrice: 0,
  costPrice: 0,
  currentStock: 0,
  minStock: 0,
  maxStock: undefined as number | undefined,
  unit: "UN",
  isActive: true,
});

const isFormValid = computed(() => {
  return (
    !!formData.value.sku &&
    !!formData.value.name &&
    formData.value.unitPrice > 0 &&
    formData.value.costPrice > 0
  );
});

const handleSubmit = async () => {
  if (!form.value) return;
  
  const { valid } = await form.value.validate();

  if (!valid) return;

  const submitData: Omit<Product, "id" | "createdAt" | "updatedAt" | "category" | "supplier"> = {
    sku: formData.value.sku,
    name: formData.value.name,
    description: formData.value.description || undefined,
    unitPrice: formData.value.unitPrice,
    costPrice: formData.value.costPrice,
    currentStock: formData.value.currentStock || 0,
    minStock: formData.value.minStock || 0,
    unit: formData.value.unit,
    isActive: formData.value.isActive,
    ...(formData.value.categoryId && { categoryId: formData.value.categoryId }),
    ...(formData.value.supplierId && { supplierId: formData.value.supplierId }),
    ...(formData.value.maxStock !== undefined && formData.value.maxStock > 0 && { maxStock: formData.value.maxStock }),
  };

  emit("submit", submitData);

  formData.value = {
    sku: "",
    name: "",
    description: "",
    categoryId: undefined,
    supplierId: undefined,
    unitPrice: 0,
    costPrice: 0,
    currentStock: 0,
    minStock: 0,
    maxStock: undefined,
    unit: "UN",
    isActive: true,
  };
  dialogOpen.value = false;
};

const handleClose = () => {
  dialogOpen.value = false;
};
</script>
