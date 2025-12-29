<template>
  <v-dialog v-model="dialogOpen" transition="dialog-bottom-transition" fullscreen>
    <v-card>
      <v-toolbar>
        <v-btn icon="mdi-close" @click="handleClose"></v-btn>
        <v-toolbar-title>{{ product?.name || 'Editar Produto' }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            prepend-icon="mdi-delete"
            text="Excluir"
            variant="text"
            color="error"
            @click="$emit('delete')"
          ></v-btn>
          <v-btn
            prepend-icon="mdi-content-save"
            text="Salvar"
            variant="text"
            color="#ff501a"
            @click="handleSubmit"
          ></v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-list lines="two" class="pa-4">
        <v-list-subheader>Informações do Produto</v-list-subheader>

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

        <v-switch
          v-model="formData.isActive"
          label="Produto Ativo"
          color="primary"
        ></v-switch>
      </v-list>

      <v-list v-if="product">
        <v-list-subheader>Informações Adicionais</v-list-subheader>
        <v-list-item>
          <v-list-item-title>Estoque Atual</v-list-item-title>
          <v-list-item-subtitle>{{ product.currentStock }} {{ product.unit }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>SKU</v-list-item-title>
          <v-list-item-subtitle>{{ product.sku }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-if="product.barcode">
          <v-list-item-title>Código de Barras</v-list-item-title>
          <v-list-item-subtitle>{{ product.barcode }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Product } from '@/services/products'
import { categoryService, type Category } from '@/services/categories'
import { supplierService, type Supplier } from '@/services/suppliers'

interface Props {
  isOpen: boolean
  product?: Product
}

const props = defineProps<Props>()
const emit = defineEmits(['update:isOpen', 'submit', 'delete'])

const dialogOpen = ref(props.isOpen)
const categories = ref<Category[]>([])
const suppliers = ref<Supplier[]>([])

const formData = ref({
  sku: '',
  name: '',
  description: '',
  categoryId: undefined as string | undefined,
  supplierId: undefined as string | undefined,
  unitPrice: 0,
  costPrice: 0,
  minStock: 0,
  maxStock: undefined as number | undefined,
  unit: 'UN',
  isActive: true
})

watch(() => props.isOpen, (newValue) => {
  dialogOpen.value = newValue
  if (newValue) {
    loadCategories()
    loadSuppliers()
  }
})

watch(dialogOpen, (newValue) => {
  emit('update:isOpen', newValue)
})

watch(() => props.product, (newProduct) => {
  if (newProduct) {
    formData.value = {
      sku: newProduct.sku,
      name: newProduct.name,
      description: newProduct.description || '',
      categoryId: newProduct.categoryId || undefined,
      supplierId: newProduct.supplierId || undefined,
      unitPrice: Number(newProduct.unitPrice),
      costPrice: Number(newProduct.costPrice),
      minStock: newProduct.minStock,
      maxStock: newProduct.maxStock || undefined,
      unit: newProduct.unit,
      isActive: newProduct.isActive
    }
  }
}, { immediate: true })

onMounted(() => {
  loadCategories()
  loadSuppliers()
})

const loadCategories = async () => {
  try {
    categories.value = await categoryService.getAllCategories()
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
  }
}

const loadSuppliers = async () => {
  try {
    suppliers.value = await supplierService.getAllSuppliers()
  } catch (error) {
    console.error('Erro ao carregar fornecedores:', error)
  }
}

const handleSubmit = () => {
  const submitData: Partial<Product> = {
    sku: formData.value.sku,
    name: formData.value.name,
    description: formData.value.description || undefined,
    unitPrice: formData.value.unitPrice,
    costPrice: formData.value.costPrice,
    minStock: formData.value.minStock || 0,
    unit: formData.value.unit,
    isActive: formData.value.isActive
  }

  if (formData.value.categoryId) {
    submitData.categoryId = formData.value.categoryId
  } else {
    submitData.categoryId = null
  }
  if (formData.value.supplierId) {
    submitData.supplierId = formData.value.supplierId
  } else {
    submitData.supplierId = null
  }
  if (formData.value.maxStock !== undefined && formData.value.maxStock > 0) {
    submitData.maxStock = formData.value.maxStock
  } else {
    submitData.maxStock = null
  }

  emit('submit', submitData)
  handleClose()
}

const handleClose = () => {
  dialogOpen.value = false
}
</script>
