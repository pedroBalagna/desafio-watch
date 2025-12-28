<script setup lang="ts">
import { productService, type Product } from "@/services/products";
import { onMounted, ref } from "vue";
import ButtonAct from "../components/ui/ButtonAct.vue";
import CardsProduct from "../components/ui/CardsProduct.vue";
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

const handleCreateSubmit = async (formData: any) => {
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
  } catch (error: any) {
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
</script>

<template>
  <div class="d-flex flex-column justify-center align-center h-auto">
    <ButtonAct buttonText="Criar Produto" @click="isCreateDialogOpen = true" />
    <div class="d-flex w-screen flex-wrap justify-center align-center">
      <CardsProduct
        v-for="product in products"
        :key="product.id"
        :product="product"
        @open="openEditDialog(product.id)"
      />
    </div>

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
