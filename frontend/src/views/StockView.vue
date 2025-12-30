<script setup lang="ts">
import { stockService, type StockMovement, type MovementType } from "@/services/stock";
import { productService, type Product } from "@/services/products";
import { warehouseService, type Warehouse } from "@/services/warehouses";
import { onMounted, ref, computed } from "vue";

const movements = ref<StockMovement[]>([]);
const products = ref<Product[]>([]);
const warehouses = ref<Warehouse[]>([]);
const loading = ref(true);
const isDialogOpen = ref(false);
const dialogMode = ref<"movement" | "transfer" | "adjust">("movement");

const formData = ref({
  type: "IN" as MovementType,
  productId: "",
  warehouseId: "",
  toWarehouseId: "",
  quantity: 0,
  unitPrice: 0,
  newQuantity: 0,
  reference: "",
  notes: "",
  reason: "",
});

const movementTypes: { value: MovementType; title: string; color: string }[] = [
  { value: "IN", title: "Entrada", color: "success" },
  { value: "OUT", title: "Saída", color: "error" },
  { value: "RETURN", title: "Devolução", color: "info" },
  { value: "DAMAGE", title: "Avaria", color: "warning" },
];

onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  try {
    loading.value = true;
    const [movementsData, productsData, warehousesData] = await Promise.all([
      stockService.getMovements({ limit: 50 }),
      productService.getAllProducts(),
      warehouseService.getAllWarehouses(),
    ]);
    movements.value = movementsData.data || [];
    products.value = productsData;
    warehouses.value = warehousesData;
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  } finally {
    loading.value = false;
  }
};

const openMovementDialog = () => {
  dialogMode.value = "movement";
  resetForm();
  isDialogOpen.value = true;
};

const openTransferDialog = () => {
  dialogMode.value = "transfer";
  resetForm();
  isDialogOpen.value = true;
};

const openAdjustDialog = () => {
  dialogMode.value = "adjust";
  resetForm();
  isDialogOpen.value = true;
};

const resetForm = () => {
  formData.value = {
    type: "IN",
    productId: "",
    warehouseId: "",
    toWarehouseId: "",
    quantity: 0,
    unitPrice: 0,
    newQuantity: 0,
    reference: "",
    notes: "",
    reason: "",
  };
};

const handleSubmit = async () => {
  try {
    if (dialogMode.value === "movement") {
      await stockService.createMovement({
        type: formData.value.type,
        productId: formData.value.productId,
        warehouseId: formData.value.warehouseId,
        quantity: formData.value.quantity,
        unitPrice: formData.value.unitPrice || undefined,
        reference: formData.value.reference || undefined,
        notes: formData.value.notes || undefined,
      });
    } else if (dialogMode.value === "transfer") {
      await stockService.transferStock({
        productId: formData.value.productId,
        fromWarehouseId: formData.value.warehouseId,
        toWarehouseId: formData.value.toWarehouseId,
        quantity: formData.value.quantity,
        reference: formData.value.reference || undefined,
        notes: formData.value.notes || undefined,
      });
    } else {
      await stockService.adjustStock({
        productId: formData.value.productId,
        warehouseId: formData.value.warehouseId,
        newQuantity: formData.value.newQuantity,
        reason: formData.value.reason || undefined,
        reference: formData.value.reference || undefined,
      });
    }
    isDialogOpen.value = false;
    await loadData();
  } catch (error) {
    console.error("Erro ao processar movimentação:", error);
  }
};

const getTypeLabel = (type: MovementType) => {
  const labels: Record<MovementType, string> = {
    IN: "Entrada",
    OUT: "Saída",
    ADJUST: "Ajuste",
    TRANSFER: "Transferência",
    RETURN: "Devolução",
    DAMAGE: "Avaria",
  };
  return labels[type];
};

const getTypeColor = (type: MovementType) => {
  const colors: Record<MovementType, string> = {
    IN: "success",
    OUT: "error",
    ADJUST: "info",
    TRANSFER: "purple",
    RETURN: "cyan",
    DAMAGE: "warning",
  };
  return colors[type];
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const dialogTitle = computed(() => {
  const titles = {
    movement: "Nova Movimentação",
    transfer: "Transferência de Estoque",
    adjust: "Ajuste de Inventário",
  };
  return titles[dialogMode.value];
});

const headers = [
  { title: "Data", key: "createdAt", sortable: true },
  { title: "Tipo", key: "type", sortable: true },
  { title: "Produto", key: "product", sortable: false },
  { title: "Armazém", key: "warehouse", sortable: false },
  { title: "Quantidade", key: "quantity", sortable: true },
  { title: "Referência", key: "reference", sortable: false },
];
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>Movimentações de Estoque</h1>
        <p class="subtitle">Gerencie entradas, saídas e transferências</p>
      </div>
      <div class="header-actions">
        <v-btn
          color="success"
          variant="tonal"
          prepend-icon="mdi-arrow-down-bold"
          @click="openMovementDialog"
        >
          Movimentação
        </v-btn>
        <v-btn
          color="purple"
          variant="tonal"
          prepend-icon="mdi-swap-horizontal"
          @click="openTransferDialog"
        >
          Transferir
        </v-btn>
        <v-btn
          color="info"
          variant="tonal"
          prepend-icon="mdi-clipboard-check"
          @click="openAdjustDialog"
        >
          Ajustar
        </v-btn>
      </div>
    </div>

    <v-card elevation="0" class="data-card">
      <v-data-table
        :items="movements"
        :headers="headers"
        :loading="loading"
        item-value="id"
        class="elevation-0"
      >
        <template v-slot:[`item.createdAt`]="{ item }">
          <span class="text-no-wrap">{{ formatDate(item.createdAt) }}</span>
        </template>

        <template v-slot:[`item.type`]="{ item }">
          <v-chip
            :color="getTypeColor(item.type)"
            size="small"
            variant="flat"
          >
            {{ getTypeLabel(item.type) }}
          </v-chip>
        </template>

        <template v-slot:[`item.product`]="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.product?.name || "—" }}</div>
            <div class="text-caption text-grey">{{ item.product?.sku || "" }}</div>
          </div>
        </template>

        <template v-slot:[`item.warehouse`]="{ item }">
          <div v-if="item.type === 'TRANSFER'" class="transfer-cell">
            <span>{{ item.warehouse?.name }}</span>
            <v-icon icon="mdi-arrow-right" size="16" class="mx-1" />
            <span>{{ item.toWarehouse?.name }}</span>
          </div>
          <span v-else>{{ item.warehouse?.name || "—" }}</span>
        </template>

        <template v-slot:[`item.quantity`]="{ item }">
          <span
            :class="{
              'text-success': item.type === 'IN' || item.type === 'RETURN',
              'text-error': item.type === 'OUT' || item.type === 'DAMAGE',
            }"
            class="font-weight-medium"
          >
            {{ item.type === 'IN' || item.type === 'RETURN' ? '+' : '-' }}{{ item.quantity }}
          </span>
        </template>

        <template v-slot:[`item.reference`]="{ item }">
          <span class="text-caption">{{ item.reference || "—" }}</span>
        </template>
      </v-data-table>
    </v-card>

    <!-- Movement/Transfer/Adjust Dialog -->
    <v-dialog v-model="isDialogOpen" max-width="600">
      <v-card>
        <v-card-title class="dialog-title">
          {{ dialogTitle }}
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="handleSubmit">
            <v-row>
              <!-- Movement Type (only for movement mode) -->
              <v-col v-if="dialogMode === 'movement'" cols="12">
                <v-select
                  v-model="formData.type"
                  label="Tipo de Movimentação *"
                  variant="outlined"
                  :items="movementTypes"
                  item-value="value"
                  item-title="title"
                />
              </v-col>

              <!-- Product -->
              <v-col cols="12">
                <v-autocomplete
                  v-model="formData.productId"
                  label="Produto *"
                  variant="outlined"
                  :items="products"
                  item-value="id"
                  item-title="name"
                  required
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:subtitle>
                        SKU: {{ item.raw.sku }} | Estoque: {{ item.raw.currentStock }}
                      </template>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>

              <!-- Warehouse (From) -->
              <v-col :cols="dialogMode === 'transfer' ? 6 : 12">
                <v-select
                  v-model="formData.warehouseId"
                  :label="dialogMode === 'transfer' ? 'Armazém Origem *' : 'Armazém *'"
                  variant="outlined"
                  :items="warehouses"
                  item-value="id"
                  item-title="name"
                  required
                />
              </v-col>

              <!-- Warehouse To (only for transfer) -->
              <v-col v-if="dialogMode === 'transfer'" cols="6">
                <v-select
                  v-model="formData.toWarehouseId"
                  label="Armazém Destino *"
                  variant="outlined"
                  :items="warehouses.filter(w => w.id !== formData.warehouseId)"
                  item-value="id"
                  item-title="name"
                  required
                />
              </v-col>

              <!-- Quantity or New Quantity -->
              <v-col :cols="dialogMode === 'movement' ? 6 : 12">
                <v-text-field
                  v-if="dialogMode !== 'adjust'"
                  v-model.number="formData.quantity"
                  label="Quantidade *"
                  variant="outlined"
                  type="number"
                  min="1"
                  required
                />
                <v-text-field
                  v-else
                  v-model.number="formData.newQuantity"
                  label="Nova Quantidade *"
                  variant="outlined"
                  type="number"
                  min="0"
                  required
                />
              </v-col>

              <!-- Unit Price (only for movement) -->
              <v-col v-if="dialogMode === 'movement'" cols="6">
                <v-text-field
                  v-model.number="formData.unitPrice"
                  label="Preço Unitário"
                  variant="outlined"
                  type="number"
                  min="0"
                  step="0.01"
                  prefix="R$"
                />
              </v-col>

              <!-- Reason (only for adjust) -->
              <v-col v-if="dialogMode === 'adjust'" cols="12">
                <v-textarea
                  v-model="formData.reason"
                  label="Motivo do Ajuste"
                  variant="outlined"
                  rows="2"
                />
              </v-col>

              <!-- Reference -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.reference"
                  label="Referência"
                  variant="outlined"
                  placeholder="NF-12345"
                />
              </v-col>

              <!-- Notes -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.notes"
                  label="Observações"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="isDialogOpen = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="handleSubmit">
            Confirmar
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
  flex-wrap: wrap;
  gap: 1rem;
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

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.data-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.transfer-cell {
  display: flex;
  align-items: center;
}

.dialog-title {
  font-weight: 600;
  padding: 1.25rem 1.5rem 0;
}
</style>
