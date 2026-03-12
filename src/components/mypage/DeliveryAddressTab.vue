<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, MapPin, Pencil, Trash2, Star, Loader2, X, Check } from 'lucide-vue-next'
import { memberApi } from '@/api/member.api'
import type { DeliveryAddressResponse, DeliveryAddressRequest } from '@/api/member.api'

const addresses = ref<DeliveryAddressResponse[]>([])
const isLoading = ref(true)
const error = ref('')

// Modal state
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const isSaving = ref(false)
const saveError = ref('')

const formData = ref<DeliveryAddressRequest>({
  recipientName: '',
  phoneNumber: '',
  zipCode: '',
  address: '',
  detailAddress: '',
})

// Delete confirm
const deletingId = ref<number | null>(null)

async function fetchAddresses() {
  isLoading.value = true
  error.value = ''
  try {
    addresses.value = await memberApi.getAddresses()
    console.log(addresses)
  } catch {
    error.value = '배송지를 불러오는 데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

function openAdd() {
  isEditing.value = false
  editingId.value = null
  formData.value = { recipientName: '', phoneNumber: '', zipCode: '', address: '', detailAddress: '' }
  saveError.value = ''
  showModal.value = true
}

function openEdit(addr: DeliveryAddressResponse) {
  isEditing.value = true
  editingId.value = addr.id
  formData.value = {
    recipientName: addr.recipientName,
    phoneNumber: addr.phoneNumber,
    zipCode: addr.zipCode,
    address: addr.address,
    detailAddress: addr.detailAddress ?? '',
  }
  saveError.value = ''
  showModal.value = true
}

function formatPhone(e: Event) {
  const input = e.target as HTMLInputElement
  const digits = input.value.replace(/\D/g, '').slice(0, 11)
  let formatted = digits
  if (digits.length > 7) {
    formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  } else if (digits.length > 3) {
    formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`
  }
  formData.value.phoneNumber = formatted
}

async function saveAddress() {
  isSaving.value = true
  saveError.value = ''
  try {
    if (isEditing.value && editingId.value !== null) {
      const updated = await memberApi.updateAddress(editingId.value, formData.value)
      const idx = addresses.value.findIndex(a => a.id === editingId.value)
      if (idx !== -1) addresses.value[idx] = updated
    } else {
      const newAddr = await memberApi.addAddress(formData.value)
      addresses.value.push(newAddr)
    }
    showModal.value = false
  } catch {
    saveError.value = '저장에 실패했습니다. 다시 시도해 주세요.'
  } finally {
    isSaving.value = false
  }
}

async function deleteAddress(id: number) {
  deletingId.value = id
  try {
    await memberApi.deleteAddress(id)
    addresses.value = addresses.value.filter(a => a.id !== id)
  } catch {
    // ignore
  } finally {
    deletingId.value = null
  }
}

async function setDefault(id: number) {
  try {
    const updated = await memberApi.setDefaultAddress(id)
    // Update all: reset isDefault, then apply
    addresses.value = addresses.value.map(a => ({ ...a, isDefault: a.id === updated.id }))
  } catch {
    // ignore
  }
}

onMounted(fetchAddresses)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-black text-slate-900">배송지 관리</h1>
      <button
        @click="openAdd"
        class="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-colors text-sm"
      >
        <Plus class="w-4 h-4" />
        배송지 추가
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-16">
      <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16 text-red-500">{{ error }}</div>

    <!-- Empty -->
    <div v-else-if="addresses.length === 0" class="text-center py-16 bg-sky-50 rounded-2xl border border-sky-100">
      <MapPin class="w-10 h-10 text-sky-300 mx-auto mb-3" />
      <p class="text-slate-500 font-medium">등록된 배송지가 없습니다.</p>
      <button
        @click="openAdd"
        class="mt-4 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full text-sm transition-colors"
      >
        첫 배송지 추가하기
      </button>
    </div>

    <!-- Address List -->
    <div v-else class="space-y-4">
      <div
        v-for="addr in addresses"
        :key="addr.id"
        class="rounded-2xl border p-5 transition-colors"
        :class="addr.isDefault ? 'bg-sky-50 border-sky-200' : 'bg-white border-slate-100'"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-slate-900">{{ addr.recipientName }}</span>
              <span
                v-if="addr.isDefault"
                class="text-xs px-2 py-0.5 bg-sky-500 text-white rounded-full font-semibold"
              >기본</span>
            </div>
            <p class="text-sm text-slate-600">{{ addr.phoneNumber }}</p>
            <p class="text-sm text-slate-700 mt-1">[{{ addr.zipCode }}] {{ addr.address }}</p>
            <p v-if="addr.detailAddress" class="text-sm text-slate-500">{{ addr.detailAddress }}</p>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              v-if="!addr.isDefault"
              @click="setDefault(addr.id)"
              class="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-sky-600 border border-slate-200 hover:border-sky-300 rounded-full transition-colors"
            >
              <Star class="w-3 h-3" />
              기본 설정
            </button>
            <button
              @click="openEdit(addr)"
              class="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              @click="deleteAddress(addr.id)"
              :disabled="deletingId === addr.id"
              class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Loader2 v-if="deletingId === addr.id" class="w-4 h-4 animate-spin" />
              <Trash2 v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        @click.self="showModal = false"
      >
        <div class="bg-white rounded-2xl w-full max-w-md shadow-xl">
          <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <h2 class="text-lg font-bold text-slate-900">{{ isEditing ? '배송지 수정' : '배송지 추가' }}</h2>
            <button @click="showModal = false" class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="saveAddress" class="px-6 py-5 space-y-4">
            <!-- 받는 사람 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">받는 사람</label>
              <input
                v-model="formData.recipientName"
                type="text"
                required
                placeholder="이름을 입력하세요"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300 text-sm"
              />
            </div>

            <!-- 전화번호 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">전화번호</label>
              <input
                :value="formData.phoneNumber"
                @input="formatPhone"
                type="tel"
                required
                placeholder="010-0000-0000"
                maxlength="13"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300 text-sm"
              />
            </div>

            <!-- 우편번호 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">우편번호</label>
              <input
                v-model="formData.zipCode"
                type="text"
                required
                placeholder="우편번호"
                maxlength="6"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300 text-sm"
              />
            </div>

            <!-- 주소 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">주소</label>
              <input
                v-model="formData.address"
                type="text"
                required
                placeholder="기본 주소"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300 text-sm"
              />
            </div>

            <!-- 상세주소 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">상세 주소 <span class="text-slate-400 font-normal">(선택)</span></label>
              <input
                v-model="formData.detailAddress"
                type="text"
                placeholder="상세 주소"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300 text-sm"
              />
            </div>

            <!-- Error -->
            <p v-if="saveError" class="text-sm text-red-500">{{ saveError }}</p>

            <!-- Actions -->
            <div class="flex gap-3 pt-1">
              <button
                type="button"
                @click="showModal = false"
                class="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                :disabled="isSaving"
                class="flex-1 py-2.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
                <Check v-else class="w-4 h-4" />
                {{ isEditing ? '수정 완료' : '추가 완료' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
