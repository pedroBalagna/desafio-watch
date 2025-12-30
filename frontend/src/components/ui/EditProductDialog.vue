<template>
  <v-dialog v-model="dialogOpen" max-width="800">
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        {{ product?.name || "Editar Produto" }}
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form @submit.prevent="handleSubmit">
          <v-list-subheader class="px-0 mb-2">Informações do Produto</v-list-subheader>

        <v-text-field
          v-model="formData.sku"
          label="SKU"
          required
          variant="outlined"
          density="comfortable"
        ></v-text-field>

        <v-text-field
          v-model="formData.name"
          label="Nome"
          required
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
              variant="outlined"
              density="comfortable"
              prefix="R$"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
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
          <v-col cols="4">
            <v-text-field
              v-model="formData.unit"
              label="Unidade"
              variant="outlined"
              density="comfortable"
            ></v-text-field>
          </v-col>
        </v-row>

          <v-switch v-model="formData.isActive" label="Produto Ativo" color="primary"></v-switch>

          <v-divider class="my-4" v-if="product"></v-divider>

          <div v-if="product" class="mt-4">
            <v-list-subheader class="px-0 mb-2">Informações Adicionais</v-list-subheader>
            <v-list-item class="px-0">
              <v-list-item-title>Estoque Atual</v-list-item-title>
              <v-list-item-subtitle>{{ product.currentStock }} {{ product.unit }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item class="px-0">
              <v-list-item-title>SKU</v-list-item-title>
              <v-list-item-subtitle>{{ product.sku }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="product.barcode" class="px-0">
              <v-list-item-title>Código de Barras</v-list-item-title>
              <v-list-item-subtitle>{{ product.barcode }}</v-list-item-subtitle>
            </v-list-item>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          prepend-icon="mdi-delete"
          text="Excluir"
          variant="text"
          color="error"
          @click="$emit('delete')"
        ></v-btn>
        <v-btn color="grey-darken-1" variant="text" @click="handleClose">Cancelar</v-btn>
        <v-btn
          prepend-icon="mdi-content-save"
          text="Salvar"
          variant="elevated"
          color="#ff501a"
          @click="handleSubmit"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { categoryService, type Category } from "@/services/categories";
import type { Product } from "@/services/products";
import { supplierService, type Supplier } from "@/services/suppliers";
import { onMounted, ref, watch } from "vue";

interface Props {
  isOpen: boolean;
  product?: Product;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:isOpen", "submit", "delete"]);

const dialogOpen = ref(props.isOpen);
const categories = ref<Category[]>([]);
const suppliers = ref<Supplier[]>([]);

const formData = ref({
  sku: "",
  name: "",
  description: "",
  categoryId: undefined as string | undefined,
  supplierId: undefined as string | undefined,
  unitPrice: 0,
  costPrice: 0,
  minStock: 0,
  maxStock: undefined as number | undefined,
  unit: "UN",
  isActive: true,
});

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

watch(
  () => props.product,
  (newProduct) => {
    if (newProduct) {
      formData.value = {
        sku: newProduct.sku,
        name: newProduct.name,
        description: newProduct.description || "",
        categoryId: newProduct.categoryId || undefined,
        supplierId: newProduct.supplierId || undefined,
        unitPrice: Number(newProduct.unitPrice),
        costPrice: Number(newProduct.costPrice),
        minStock: newProduct.minStock,
        maxStock: newProduct.maxStock || undefined,
        unit: newProduct.unit,
        isActive: newProduct.isActive,
      };
    }
  },
  { immediate: true }
);

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

const handleSubmit = () => {
  const submitData: Partial<Product> = {
    sku: formData.value.sku,
    name: formData.value.name,
    description: formData.value.description || undefined,
    unitPrice: formData.value.unitPrice,
    costPrice: formData.value.costPrice,
    minStock: formData.value.minStock || 0,
    unit: formData.value.unit,
    isActive: formData.value.isActive,
  };

  if (formData.value.categoryId) {
    submitData.categoryId = formData.value.categoryId;
  } else {
    submitData.categoryId = undefined;
  }
  if (formData.value.supplierId) {
    submitData.supplierId = formData.value.supplierId;
  } else {
    submitData.supplierId = undefined;
  }
  if (formData.value.maxStock !== undefined && formData.value.maxStock > 0) {
    submitData.maxStock = formData.value.maxStock;
  } else {
    submitData.maxStock = undefined;
  }

  emit("submit", submitData);
  handleClose();
};

const handleClose = () => {
  dialogOpen.value = false;
};
</script>
