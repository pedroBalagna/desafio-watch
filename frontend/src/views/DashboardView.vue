<script setup lang="ts">
import { productService, type Product } from "@/services/products";
import { stockService, type StockDashboard } from "@/services/stock";
import { onMounted, ref } from "vue";

const dashboard = ref<StockDashboard | null>(null);
const loading = ref(true);
const lowStockProducts = ref<Product[]>([]);

onMounted(async () => {
  try {
    const [dashboardData, lowStock] = await Promise.all([
      stockService.getDashboard().catch(() => null),
      productService.getAllProducts().catch(() => []),
    ]);

    dashboard.value = dashboardData;
    lowStockProducts.value = lowStock
      .filter((p: Product) => p.currentStock <= p.minStock)
      .slice(0, 5);
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
  } finally {
    loading.value = false;
  }
});

const stats = [
  {
    title: "Total de Produtos",
    icon: "mdi-package-variant-closed",
    color: "#ff501a",
    key: "totalProducts",
  },
  {
    title: "Estoque Baixo",
    icon: "mdi-alert-circle",
    color: "#ffa726",
    key: "lowStockProducts",
  },
  {
    title: "Sem Estoque",
    icon: "mdi-package-variant-closed-remove",
    color: "#ef5350",
    key: "outOfStockProducts",
  },
  {
    title: "Armazéns",
    icon: "mdi-warehouse",
    color: "#42a5f5",
    key: "totalWarehouses",
  },
];

const getStatValue = (key: string) => {
  if (!dashboard.value || !dashboard.value.summary) return "-";
  const summary = dashboard.value.summary;
  switch (key) {
    case "totalProducts":
      return summary.totalProducts;
    case "lowStockProducts":
      return summary.lowStockProducts;
    case "outOfStockProducts":
      return summary.outOfStockProducts;
    case "totalWarehouses":
      return summary.totalWarehouses;
    default:
      return "-";
  }
};
</script>

<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h1>Dashboard</h1>
      <p class="subtitle">Visão geral do sistema de estoque</p>
    </div>

    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <template v-else>
      <!-- Stats Cards -->
      <div class="stats-grid">
        <v-card v-for="stat in stats" :key="stat.key" class="stat-card" elevation="0">
          <div class="stat-icon" :style="{ backgroundColor: stat.color + '20' }">
            <v-icon :icon="stat.icon" :color="stat.color" size="28" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ getStatValue(stat.key) }}</span>
            <span class="stat-label">{{ stat.title }}</span>
          </div>
        </v-card>
      </div>

      <!-- Produtos com Estoque Baixo -->
      <v-card class="section-card" elevation="0">
        <div class="section-header">
          <h2>
            <v-icon icon="mdi-alert" color="warning" class="mr-2" />
            Produtos com Estoque Baixo
          </h2>
        </div>

        <v-table v-if="lowStockProducts.length > 0">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Produto</th>
              <th>Estoque Atual</th>
              <th>Estoque Mínimo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in lowStockProducts" :key="product.id">
              <td class="font-weight-medium">{{ product.sku }}</td>
              <td>{{ product.name }}</td>
              <td>{{ product.currentStock }} {{ product.unit }}</td>
              <td>{{ product.minStock }} {{ product.unit }}</td>
              <td>
                <v-chip
                  :color="product.currentStock === 0 ? 'error' : 'warning'"
                  size="small"
                  variant="flat"
                >
                  {{ product.currentStock === 0 ? "Sem Estoque" : "Baixo" }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>

        <div v-else class="empty-state">
          <v-icon icon="mdi-check-circle" color="success" size="48" />
          <p>Todos os produtos estão com estoque adequado!</p>
        </div>
      </v-card>

      <!-- Quick Actions -->
      <v-card class="section-card" elevation="0">
        <div class="section-header">
          <h2>
            <v-icon icon="mdi-lightning-bolt" color="primary" class="mr-2" />
            Ações Rápidas
          </h2>
        </div>

        <div class="quick-actions">
          <router-link to="/products" class="action-btn">
            <v-icon icon="mdi-plus-box" size="24" />
            <span>Novo Produto</span>
          </router-link>
          <router-link to="/stock" class="action-btn">
            <v-icon icon="mdi-swap-horizontal" size="24" />
            <span>Movimentação</span>
          </router-link>
          <router-link to="/warehouses" class="action-btn">
            <v-icon icon="mdi-warehouse" size="24" />
            <span>Armazéns</span>
          </router-link>
          <router-link to="/suppliers" class="action-btn">
            <v-icon icon="mdi-truck" size="24" />
            <span>Fornecedores</span>
          </router-link>
        </div>
      </v-card>
    </template>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
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

.loading-container {
  display: flex;
  justify-content: center;
  padding: 4rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
}

.section-card {
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.section-header {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.section-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
  display: flex;
  align-items: center;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #666;
}

.empty-state p {
  margin-top: 1rem;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1.25rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 80, 26, 0.08) 0%, rgba(255, 122, 26, 0.08) 100%);
  color: #ff501a;
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
}

.action-btn:hover {
  background: linear-gradient(135deg, rgba(255, 80, 26, 0.15) 0%, rgba(255, 122, 26, 0.15) 100%);
  transform: translateY(-2px);
}
</style>
