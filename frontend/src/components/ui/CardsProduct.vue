<template>
  <v-card class="ma-4 bg-white shadow" rounded="lg" variant="flat">
    <v-card-item>
      <v-card-title class="text-body-2 d-flex align-center">
        <v-spacer></v-spacer>
        <v-chip
          class="ms-2 text-medium-emphasis"
          prepend-icon="mdi-package-variant"
          color="primary"
          size="small"
          :text="product.currentStock.toString()"
          variant="flat"
        ></v-chip>
      </v-card-title>

      <div class="py-2">
        <div class="text-h6">{{ product.name }}</div>

        <div class="font-weight-light text-medium-emphasis min-w-[360px] w-[360px] text-truncate">
          {{ product.description || "Sem descrição" }}
        </div>
      </div>
      <v-chip class="w-auto max-w-40 text-truncate" color="secondary">
        <div class="text-truncate w-auto max-w-36">
          {{ product.category?.name || "Sem categoria" }}
        </div>
      </v-chip>
    </v-card-item>

    <v-divider></v-divider>

    <div class="pa-4 d-flex align-center">
      <v-chip :color="getStockColor(product.currentStock, product.minStock)" variant="flat">
        {{ getStockLabel(product.currentStock, product.minStock) }}
      </v-chip>

      <v-spacer></v-spacer>

      <v-chip class="me-2" color="success" variant="flat">
        R$ {{ formatPrice(product.unitPrice) }}
      </v-chip>

      <v-btn
        class="text-none"
        color="#ff501a"
        prepend-icon="mdi-pencil"
        variant="text"
        border
        @click="$emit('open')"
      >
        Abrir
      </v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { Product } from "@/services/products";

interface Props {
  product: Product;
}

defineProps<Props>();
defineEmits(["open"]);

const formatPrice = (price: number | string) => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) {
    return "0,00";
  }
  return numPrice.toFixed(2).replace(".", ",");
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
</script>
