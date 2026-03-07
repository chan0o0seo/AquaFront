<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Edit, Trash2, Package, AlertTriangle, Loader2 } from 'lucide-vue-next'

type ProductStatus = 'ACTIVE' | 'SOLD_OUT' | 'DELETED'
type FilterStatus = 'ALL' | 'ACTIVE' | 'SOLD_OUT'

interface Product {
  id: number
  name: string
  imageUrls: string[]
  price: number
  stock: number
  status: ProductStatus
  productType: string
  createdAt: string
}

// Mock products
const products = ref<Product[]>([
  {
    id: 1,
    name: '레드 크리스탈 새우 10마리',
    imageUrls: [],
    price: 45000,
    stock: 3,
    status: 'ACTIVE',
    productType: 'INVERTEBRATE',
    createdAt: '2025-01-15T00:00:00Z'
  },
  {
    id: 2,
    name: 'ADA 아마조니아 소일 9L',
    imageUrls: [],
    price: 35000,
    stock: 12,
    status: 'ACTIVE',
    productType: 'EQUIPMENT',
    createdAt: '2025-01-14T00:00:00Z'
  },
  {
    id: 3,
    name: '슈퍼레드 구피 수컷 5마리',
    imageUrls: [],
    price: 18000,
    stock: 0,
    status: 'SOLD_OUT',
    productType: 'FISH',
    createdAt: '2025-01-10T00:00:00Z'
  },
  {
    id: 4,
    name: '남미 모스 컵',
    imageUrls: [],
    price: 8000,
    stock: 20,
    status: 'ACTIVE',
    productType: 'PLANT',
    createdAt: '2025-01-08T00:00:00Z'
  }
])

const router = useRouter()

// Filter state
const filterStatus = ref<FilterStatus>('ALL')

// View mode: 'grid' | 'table'
const viewMode = ref<'grid' | 'table'>('grid')

// Inline stock edit state
const editingStockId = ref<number | null>(null)
const editingStockValue = ref<number>(0)
const isSavingStock = ref(false)

// Delete confirm state
const confirmDeleteId = ref<number | null>(null)
const isDeletingId = ref<number | null>(null)

// Filtered products
const filteredProducts = computed(() => {
  if (filterStatus.value === 'ALL') return products.value
  return products.value.filter(p => p.status === filterStatus.value)
})

// Filter tab counts
const counts = computed(() => ({
  ALL: products.value.length,
  ACTIVE: products.value.filter(p => p.status === 'ACTIVE').length,
  SOLD_OUT: products.value.filter(p => p.status === 'SOLD_OUT').length
}))

// Helpers
const statusLabel = (status: ProductStatus) => {
  if (status === 'ACTIVE') return { text: '판매중', cls: 'bg-emerald-100 text-emerald-700' }
  if (status === 'SOLD_OUT') return { text: '품절', cls: 'bg-slate-100 text-slate-500' }
  return { text: '삭제됨', cls: 'bg-red-100 text-red-500' }
}

const isLowStock = (p: Product) => p.stock > 0 && p.stock <= 5

// Inline stock edit
const openStockEdit = (product: Product) => {
  editingStockId.value = product.id
  editingStockValue.value = product.stock
  confirmDeleteId.value = null
}

const cancelStockEdit = () => {
  editingStockId.value = null
}

const saveStock = async (product: Product) => {
  if (isSavingStock.value) return
  isSavingStock.value = true
  try {
    // PATCH /api/products/{productId}/stock
    await new Promise(resolve => setTimeout(resolve, 600))
    product.stock = editingStockValue.value
    product.status = editingStockValue.value === 0 ? 'SOLD_OUT' : 'ACTIVE'
    editingStockId.value = null
  } finally {
    isSavingStock.value = false
  }
}

// Delete confirm
const openDeleteConfirm = (id: number) => {
  confirmDeleteId.value = id
  editingStockId.value = null
}

const cancelDelete = () => {
  confirmDeleteId.value = null
}

const deleteProduct = async (id: number) => {
  if (isDeletingId.value) return
  isDeletingId.value = id
  try {
    // DELETE /api/products/{id}
    await new Promise(resolve => setTimeout(resolve, 700))
    products.value = products.value.filter(p => p.id !== id)
    confirmDeleteId.value = null
  } finally {
    isDeletingId.value = null
  }
}

const goToEdit = (id: number) => {
  router.push(`/seller/products/${id}/edit`)
}

const goToNew = () => {
  router.push('/seller/products/new')
}
</script>

<template>
  <div>
    <!-- Header row -->
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-2xl font-black text-slate-900">내 상품 관리</h2>
      <button
        @click="goToNew"
        class="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white
               font-semibold rounded-full text-sm transition-colors duration-150"
      >
        <Package class="w-4 h-4" />
        상품 등록
      </button>
    </div>

    <!-- Filter tabs + view toggle -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-1 bg-sky-50 rounded-xl p-1 border border-sky-100">
        <button
          v-for="(label, key) in { ALL: '전체', ACTIVE: '판매중', SOLD_OUT: '품절' } as const"
          :key="key"
          @click="filterStatus = key as FilterStatus"
          class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
          :class="filterStatus === key
            ? 'bg-white text-slate-800 shadow-sm'
            : 'text-slate-400 hover:text-slate-600'"
        >
          {{ label }}
          <span
            class="ml-1 text-xs"
            :class="filterStatus === key ? 'text-sky-500' : 'text-slate-400'"
          >{{ counts[key] }}</span>
        </button>
      </div>

      <!-- View toggle -->
      <div class="flex gap-1 bg-sky-50 rounded-xl p-1 border border-sky-100">
        <button
          @click="viewMode = 'grid'"
          class="px-3 py-1.5 rounded-lg text-sm transition-all duration-150"
          :class="viewMode === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
        >
          격자
        </button>
        <button
          @click="viewMode = 'table'"
          class="px-3 py-1.5 rounded-lg text-sm transition-all duration-150"
          :class="viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
        >
          목록
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filteredProducts.length === 0" class="text-center py-20 bg-sky-50 rounded-2xl border border-sky-100">
      <Package class="w-12 h-12 text-sky-200 mx-auto mb-3" />
      <p class="text-slate-400 font-medium">등록된 상품이 없어요</p>
      <button
        @click="goToNew"
        class="mt-4 text-sky-500 text-sm font-semibold hover:underline"
      >
        첫 상품 등록하기
      </button>
    </div>

    <!-- ── GRID VIEW ── -->
    <div v-show="viewMode === 'grid'" class="grid grid-cols-2 gap-4">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="bg-white rounded-2xl border border-sky-100 overflow-hidden
               transition-shadow duration-150 hover:shadow-md"
      >
        <!-- Thumbnail -->
        <div class="aspect-square bg-gradient-to-br from-sky-100 to-teal-100 relative">
          <img
            v-if="product.imageUrls[0]"
            :src="product.imageUrls[0]"
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Package class="w-10 h-10 text-sky-200" />
          </div>
          <!-- Status badge -->
          <span
            class="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full"
            :class="statusLabel(product.status).cls"
          >{{ statusLabel(product.status).text }}</span>
          <!-- Low stock warning -->
          <span
            v-if="isLowStock(product)"
            class="absolute top-2 right-2 flex items-center gap-1 text-xs font-semibold
                   bg-amber-100 text-amber-700 px-2 py-1 rounded-full"
          >
            <AlertTriangle class="w-3 h-3" />
            재고 {{ product.stock }}개
          </span>
        </div>

        <!-- Info -->
        <div class="p-4">
          <p class="font-semibold text-slate-800 text-sm line-clamp-1">{{ product.name }}</p>
          <p class="text-sky-600 font-bold mt-1">₩{{ product.price.toLocaleString() }}</p>
          <p class="text-slate-400 text-xs mt-0.5">재고 {{ product.stock }}개</p>

          <!-- Inline stock edit area -->
          <div v-show="editingStockId === product.id" class="mt-3 flex items-center gap-2">
            <input
              v-model.number="editingStockValue"
              type="number"
              min="0"
              class="w-20 px-3 py-1.5 rounded-xl border border-sky-200 text-sm text-slate-800
                     focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
              @keydown.enter="saveStock(product)"
              @keydown.esc="cancelStockEdit"
            />
            <button
              @click="saveStock(product)"
              :disabled="isSavingStock"
              class="flex items-center gap-1 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white
                     rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Loader2 v-if="isSavingStock" class="w-3 h-3 animate-spin" />
              저장
            </button>
            <button
              @click="cancelStockEdit"
              class="px-3 py-1.5 text-slate-400 hover:text-slate-600 text-xs transition-colors"
            >
              취소
            </button>
          </div>

          <!-- Inline delete confirm area -->
          <div v-show="confirmDeleteId === product.id" class="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <p class="text-red-500 text-xs font-semibold mb-2">정말 삭제하시겠어요?</p>
            <div class="flex gap-2">
              <button
                @click="deleteProduct(product.id)"
                :disabled="isDeletingId === product.id"
                class="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white
                       rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Loader2 v-if="isDeletingId === product.id" class="w-3 h-3 animate-spin" />
                삭제
              </button>
              <button
                @click="cancelDelete"
                class="px-3 py-1.5 text-slate-400 hover:text-slate-600 text-xs transition-colors"
              >
                취소
              </button>
            </div>
          </div>

          <!-- Action buttons (hide when editing/confirming) -->
          <div
            v-show="editingStockId !== product.id && confirmDeleteId !== product.id"
            class="mt-3 flex gap-1.5"
          >
            <button
              @click="goToEdit(product.id)"
              class="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-sky-600
                     border border-slate-200 hover:border-sky-200 rounded-xl transition-all"
            >
              <Edit class="w-3 h-3" />
              수정
            </button>
            <button
              @click="openStockEdit(product)"
              class="flex-1 px-3 py-1.5 text-xs text-slate-500 hover:text-sky-600
                     border border-slate-200 hover:border-sky-200 rounded-xl transition-all"
            >
              재고 변경
            </button>
            <button
              @click="openDeleteConfirm(product.id)"
              class="flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 hover:text-red-600
                     border border-red-100 hover:border-red-300 rounded-xl transition-all"
            >
              <Trash2 class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── TABLE VIEW ── -->
    <div v-show="viewMode === 'table'" class="bg-white rounded-2xl border border-sky-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-sky-50">
            <th class="text-left text-xs text-slate-400 font-semibold px-5 py-3">상품명</th>
            <th class="text-right text-xs text-slate-400 font-semibold px-4 py-3">가격</th>
            <th class="text-right text-xs text-slate-400 font-semibold px-4 py-3">재고</th>
            <th class="text-center text-xs text-slate-400 font-semibold px-4 py-3">상태</th>
            <th class="text-right text-xs text-slate-400 font-semibold px-5 py-3">관리</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="product in filteredProducts" :key="product.id">
            <!-- Main row -->
            <tr class="border-b border-sky-50 last:border-0 hover:bg-sky-50/40 transition-colors">
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-teal-100 flex-shrink-0
                              flex items-center justify-center overflow-hidden">
                    <img
                      v-if="product.imageUrls[0]"
                      :src="product.imageUrls[0]"
                      :alt="product.name"
                      class="w-full h-full object-cover"
                    />
                    <Package v-else class="w-5 h-5 text-sky-300" />
                  </div>
                  <span class="font-medium text-slate-800 line-clamp-1">{{ product.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-right font-semibold text-sky-600">
                ₩{{ product.price.toLocaleString() }}
              </td>
              <td class="px-4 py-3 text-right">
                <span
                  class="font-medium"
                  :class="isLowStock(product) ? 'text-amber-600' : 'text-slate-700'"
                >
                  {{ product.stock }}개
                </span>
                <AlertTriangle
                  v-if="isLowStock(product)"
                  class="w-3 h-3 text-amber-500 inline ml-1 -mt-0.5"
                />
              </td>
              <td class="px-4 py-3 text-center">
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full"
                  :class="statusLabel(product.status).cls"
                >{{ statusLabel(product.status).text }}</span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="goToEdit(product.id)"
                    class="p-1.5 text-slate-400 hover:text-sky-500 rounded-lg hover:bg-sky-50 transition-all"
                    title="수정"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button
                    @click="openStockEdit(product)"
                    class="px-2.5 py-1 text-xs text-slate-500 hover:text-sky-600
                           border border-slate-200 hover:border-sky-200 rounded-lg transition-all"
                  >
                    재고
                  </button>
                  <button
                    @click="openDeleteConfirm(product.id)"
                    class="p-1.5 text-red-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                    title="삭제"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Inline stock edit row -->
            <tr v-show="editingStockId === product.id" class="bg-sky-50/60">
              <td colspan="5" class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-semibold text-slate-600">재고 변경:</span>
                  <input
                    v-model.number="editingStockValue"
                    type="number"
                    min="0"
                    class="w-24 px-3 py-1.5 rounded-xl border border-sky-200 text-sm text-slate-800
                           focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent bg-white"
                    @keydown.enter="saveStock(product)"
                    @keydown.esc="cancelStockEdit"
                  />
                  <button
                    @click="saveStock(product)"
                    :disabled="isSavingStock"
                    class="flex items-center gap-1 px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white
                           rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <Loader2 v-if="isSavingStock" class="w-3 h-3 animate-spin" />
                    저장
                  </button>
                  <button
                    @click="cancelStockEdit"
                    class="text-slate-400 hover:text-slate-600 text-xs transition-colors"
                  >
                    취소
                  </button>
                </div>
              </td>
            </tr>

            <!-- Inline delete confirm row -->
            <tr v-show="confirmDeleteId === product.id" class="bg-red-50/60">
              <td colspan="5" class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <span class="text-red-500 text-xs font-semibold">정말 삭제하시겠어요?</span>
                  <button
                    @click="deleteProduct(product.id)"
                    :disabled="isDeletingId === product.id"
                    class="flex items-center gap-1 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white
                           rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <Loader2 v-if="isDeletingId === product.id" class="w-3 h-3 animate-spin" />
                    삭제
                  </button>
                  <button
                    @click="cancelDelete"
                    class="text-slate-400 hover:text-slate-600 text-xs transition-colors"
                  >
                    취소
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
