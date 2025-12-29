<script setup lang="ts">
import { productService, type Product } from "@/services/products";
import { onMounted, ref } from "vue";
import ButtonAct from "../components/ui/ButtonAct.vue";
import CreateProductDialog from "../components/ui/CreateProductDialog.vue";
import DialogConfirm from "../components/ui/DialogConfirm.vue";
import EditProductDialog from "../components/ui/EditProductDialog.vue";

const products = ref<Product[]>([]);
const isCreateDialogOpen = ref(false);
const isEditDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const selectedProductId = ref<string | null>(null);
const selectedProduct = ref<Product | undefined>(undefined);
const deleteError = ref("");

onMounted(async () => {
  try {
    const response = await productService.getAllProducts();
    products.value = Array.isArray(response) ? response : [];
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
});

const handleCreateSubmit = async (
  formData: Omit<Product, "id" | "createdAt" | "updatedAt" | "category" | "supplier">
) => {
  try {
    const newProduct = await productService.createProduct(formData);
    products.value.push(newProduct);
    isCreateDialogOpen.value = false;
  } catch (error) {
    console.error("Erro ao criar produto:", error);
  }
};

const handleEditSubmit = async (formData: Partial<Product>) => {
  if (!selectedProductId.value) return;
  try {
    const updatedProduct = await productService.updateProduct(selectedProductId.value, formData);
    const index = products.value.findIndex((p) => p.id === selectedProductId.value);
    if (index !== -1) {
      products.value[index] = updatedProduct;
    }
    isEditDialogOpen.value = false;
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
  }
};

const handleDeleteConfirm = async () => {
  if (!selectedProductId.value) return;
  try {
    await productService.deleteProduct(selectedProductId.value);
    products.value = products.value.filter((p) => p.id !== selectedProductId.value);
    isDeleteDialogOpen.value = false;
    deleteError.value = "";
  } catch (error: unknown) {
    deleteError.value = "Erro ao excluir produto. Tente novamente.";
    console.error("Erro ao excluir produto:", error);
  }
};

const openEditDialog = async (productId: string) => {
  try {
    selectedProductId.value = productId;
    selectedProduct.value = await productService.getProductById(productId);
    isEditDialogOpen.value = true;
  } catch (error) {
    console.error("Erro ao carregar produto:", error);
  }
};

const handleDelete = (productId: string) => {
  selectedProductId.value = productId;
  isDeleteDialogOpen.value = true;
};

const formatPrice = (price: number | string) => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) {
    return "R$ 0,00";
  }
  return `R$ ${numPrice.toFixed(2).replace(".", ",")}`;
};

const getStockLabel = (currentStock: number, minStock: number) => {
  if (currentStock === 0) {
    return "Sem Estoque";
  } else if (currentStock <= minStock) {
    return "Estoque Baixo";
  }
  return "Em Estoque";
};

const getStockColor = (currentStock: number, minStock: number) => {
  if (currentStock === 0) {
    return "error";
  } else if (currentStock <= minStock) {
    return "warning";
  }
  return "success";
};

const headers = [
  { title: "SKU", key: "sku", sortable: true },
  { title: "Nome", key: "name", sortable: true },
  { title: "Categoria", key: "category", sortable: false },
  { title: "Estoque", key: "currentStock", sortable: true },
  { title: "Status", key: "status", sortable: false },
  { title: "Preço", key: "unitPrice", sortable: true },
  { title: "Ações", key: "actions", sortable: false, align: "end" as const },
];
</script>

<template>
  <div class="d-flex flex-column pa-4">
    <div class="d-flex justify-end mb-4">
      <ButtonAct buttonText="Criar Produto" @click="isCreateDialogOpen = true" />
    </div>

    <v-card>
      <v-data-table :items="products" :headers="headers" item-value="id" class="elevation-1">
        <template v-slot:[`item.category`]="{ item }">
          {{ item.category?.name || "Sem categoria" }}
        </template>

        <template v-slot:[`item.currentStock`]="{ item }">
          {{ item.currentStock }} {{ item.unit }}
        </template>

        <template v-slot:[`item.status`]="{ item }">
          <v-chip
            :color="getStockColor(item.currentStock, item.minStock)"
            size="small"
            variant="flat"
          >
            {{ getStockLabel(item.currentStock, item.minStock) }}
          </v-chip>
        </template>

        <template v-slot:[`item.unitPrice`]="{ item }">
          {{ formatPrice(item.unitPrice) }}
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            icon="mdi-pencil"
            variant="text"
            size="small"
            color="primary"
            @click="openEditDialog(item.id)"
          ></v-btn>
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            @click="handleDelete(item.id)"
          ></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <CreateProductDialog
      v-model:isOpen="isCreateDialogOpen"
      title="Criar Novo Produto"
      @submit="handleCreateSubmit"
    />

    <EditProductDialog
      v-model:isOpen="isEditDialogOpen"
      :product="selectedProduct"
      @submit="handleEditSubmit"
      @delete="
        () => {
          isDeleteDialogOpen = true;
        }
      "
    />

    <DialogConfirm
      v-model:isOpen="isDeleteDialogOpen"
      title="Confirmar exclusão"
      message="Tem certeza que deseja excluir este produto?"
      type="delete"
      confirmButtonText="Excluir"
      :error="deleteError"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>
