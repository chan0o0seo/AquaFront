<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Shield, ClipboardList, Users, Package, Gavel, MessageSquare,
  CheckCircle, XCircle, Check, X, Loader2, Percent, Banknote,
  Plus, Edit2, Trash2, Play
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { sellerApi, settlementApi, type SellerApplicationResponse, type CommissionPolicyResponse, type CommissionPolicyRequest } from '@/api'

const router = useRouter()
const authStore = useAuthStore()
const { isAdmin } = storeToRefs(authStore)

const activeTab = ref('applications')
const isProcessing = ref(false)

// ── 판매자 신청 ───────────────────────────────────
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const selectedApplicationId = ref<number | null>(null)
const rejectReason = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const applications = ref<SellerApplicationResponse[]>([])

const pendingCount = computed(() => applications.value.length)

async function fetchApplications() {
  isLoading.value = true
  errorMsg.value = ''
  try {
    applications.value = await sellerApi.getPendingApplications()
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message ?? '목록을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

const handleApprove = (id: number) => {
  selectedApplicationId.value = id
  showApproveModal.value = true
}
const handleReject = (id: number) => {
  selectedApplicationId.value = id
  rejectReason.value = ''
  showRejectModal.value = true
}

const confirmApprove = async () => {
  if (!selectedApplicationId.value || isProcessing.value) return
  isProcessing.value = true
  try {
    await sellerApi.approveApplication(selectedApplicationId.value)
    applications.value = applications.value.filter(a => a.id !== selectedApplicationId.value)
    showApproveModal.value = false
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '승인에 실패했습니다.')
  } finally {
    isProcessing.value = false
  }
}

const confirmReject = async () => {
  if (!selectedApplicationId.value || !rejectReason.value.trim() || isProcessing.value) return
  isProcessing.value = true
  try {
    await sellerApi.rejectApplication(selectedApplicationId.value, rejectReason.value)
    applications.value = applications.value.filter(a => a.id !== selectedApplicationId.value)
    showRejectModal.value = false
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '반려에 실패했습니다.')
  } finally {
    isProcessing.value = false
  }
}

// ── 수수료 정책 ──────────────────────────────────
const policies = ref<CommissionPolicyResponse[]>([])
const isLoadingPolicies = ref(false)
const policiesError = ref('')

const showPolicyModal = ref(false)
const editingPolicy = ref<CommissionPolicyResponse | null>(null)
const policyForm = ref<CommissionPolicyRequest>({ rate: 0, productType: '', description: '' })
const isSavingPolicy = ref(false)

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  FISH: '어류', INVERTEBRATE: '무척추동물', PLANT: '수초',
  EQUIPMENT: '장비', FOOD: '사료', ACCESSORY: '용품',
}

async function fetchPolicies() {
  isLoadingPolicies.value = true
  policiesError.value = ''
  try {
    policies.value = await sellerApi.getCommissionPolicies()
  } catch (e: any) {
    policiesError.value = e?.response?.data?.message ?? '수수료 정책을 불러오지 못했습니다.'
  } finally {
    isLoadingPolicies.value = false
  }
}

function openCreatePolicy() {
  editingPolicy.value = null
  policyForm.value = { rate: 0, productType: '', description: '' }
  showPolicyModal.value = true
}

function openEditPolicy(policy: CommissionPolicyResponse) {
  editingPolicy.value = policy
  policyForm.value = {
    rate: policy.rate,
    productType: policy.productType ?? '',
    description: policy.description ?? '',
  }
  showPolicyModal.value = true
}

async function savePolicy() {
  if (isSavingPolicy.value) return
  isSavingPolicy.value = true
  try {
    const body: CommissionPolicyRequest = {
      rate: policyForm.value.rate,
      productType: policyForm.value.productType?.trim() || undefined,
      description: policyForm.value.description?.trim() || undefined,
    }
    if (editingPolicy.value) {
      const updated = await sellerApi.updateCommissionPolicy(editingPolicy.value.id, body)
      const idx = policies.value.findIndex(p => p.id === editingPolicy.value!.id)
      if (idx !== -1) policies.value[idx] = updated
    } else {
      const created = await sellerApi.createCommissionPolicy(body)
      policies.value.push(created)
    }
    showPolicyModal.value = false
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '저장에 실패했습니다.')
  } finally {
    isSavingPolicy.value = false
  }
}

async function deletePolicy(id: number) {
  if (!confirm('이 수수료 정책을 삭제하시겠습니까?')) return
  try {
    await sellerApi.deleteCommissionPolicy(id)
    policies.value = policies.value.filter(p => p.id !== id)
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '삭제에 실패했습니다.')
  }
}

// ── 정산 일괄 처리 ────────────────────────────────
const isBatching = ref(false)
const batchResult = ref<'idle' | 'success' | 'error'>('idle')
const batchMessage = ref('')

async function runSettlementBatch() {
  if (!confirm('정산 일괄 처리를 실행하시겠습니까?\n처리 중인 주문에 대해 정산이 생성됩니다.')) return
  isBatching.value = true
  batchResult.value = 'idle'
  try {
    await settlementApi.batchProcess()
    batchResult.value = 'success'
    batchMessage.value = '정산 일괄 처리가 완료되었습니다.'
  } catch (e: any) {
    batchResult.value = 'error'
    batchMessage.value = e?.response?.data?.message ?? '정산 처리에 실패했습니다.'
  } finally {
    isBatching.value = false
  }
}

// ── 공통 ─────────────────────────────────────────
const navItems = [
  { key: 'applications', icon: ClipboardList, label: '판매자 신청 관리' },
  { key: 'commission',   icon: Percent,       label: '수수료 정책' },
  { key: 'settlements',  icon: Banknote,      label: '정산 처리' },
  { key: 'members',      icon: Users,         label: '회원 관리' },
  { key: 'products',     icon: Package,       label: '상품 관리' },
  { key: 'auctions',     icon: Gavel,         label: '경매 관리' },
  { key: 'community',    icon: MessageSquare, label: '커뮤니티 관리' },
]

const otherTabs = [
  { key: 'members',   icon: Users,         label: '회원 관리' },
  { key: 'products',  icon: Package,       label: '상품 관리' },
  { key: 'auctions',  icon: Gavel,         label: '경매 관리' },
  { key: 'community', icon: MessageSquare, label: '커뮤니티 관리' },
]

function handleTabChange(key: string) {
  activeTab.value = key
  if (key === 'commission' && policies.value.length === 0) fetchPolicies()
}

onMounted(fetchApplications)

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- 권한 없음 -->
    <div v-if="!isAdmin" class="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <Shield class="w-14 h-14 text-red-300 mx-auto mb-4" />
      <p class="text-xl font-black text-slate-900 mb-2">접근 권한이 없습니다</p>
      <p class="text-slate-400 text-sm mb-6">관리자 전용 페이지입니다.</p>
      <button @click="router.push('/')" class="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition">
        홈으로
      </button>
    </div>

    <!-- Admin Content -->
    <main v-else class="max-w-6xl mx-auto px-6 py-12 mt-16">
      <div class="flex gap-8">
        <!-- Left Sidebar -->
        <aside class="w-56 flex-shrink-0">
          <div class="sticky top-24">
            <div class="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 text-center">
              <Shield class="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div class="font-black text-slate-800 text-sm">관리자 센터</div>
              <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full inline-block mt-1">ADMIN</span>
            </div>
            <nav class="space-y-1">
              <button
                v-for="item in navItems"
                :key="item.key"
                @click="handleTabChange(item.key)"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition"
                :class="activeTab === item.key ? 'bg-sky-50 text-sky-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'"
              >
                <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
                <span class="flex-1 text-sm">{{ item.label }}</span>
                <span
                  v-if="item.key === 'applications' && pendingCount > 0"
                  class="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                >{{ pendingCount }}</span>
              </button>
            </nav>
          </div>
        </aside>

        <!-- Right Content -->
        <div class="flex-1 min-w-0">

          <!-- ── 판매자 신청 관리 탭 ── -->
          <div v-if="activeTab === 'applications'">
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-2xl font-black text-slate-900">판매자 신청 관리</h1>
              <span class="text-sm text-slate-400">심사 대기 중 {{ pendingCount }}건</span>
            </div>

            <div v-if="isLoading" class="flex justify-center py-24">
              <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
            </div>
            <div v-else-if="errorMsg" class="text-center py-24 text-red-500 text-sm">{{ errorMsg }}</div>
            <div v-else-if="applications.length === 0" class="text-center py-24">
              <ClipboardList class="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p class="text-slate-400 text-sm">대기 중인 판매자 신청이 없습니다</p>
            </div>

            <div v-else class="space-y-4">
              <div v-for="app in applications" :key="app.id" class="bg-white rounded-2xl border border-sky-100 p-6">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="font-bold text-slate-900 text-lg">{{ app.businessName }}</div>
                    <div class="text-xs text-slate-400 mt-0.5">신청일 {{ formatDate(app.createdAt) }}</div>
                  </div>
                  <span class="rounded-full px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700">검토 중</span>
                </div>
                <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-sky-50 text-sm">
                  <div>
                    <div class="text-xs text-slate-400 mb-0.5">사업자등록번호</div>
                    <div class="text-slate-700 font-medium font-mono">{{ app.businessRegistrationNumber }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-slate-400 mb-0.5">사업장 연락처</div>
                    <div class="text-slate-700">{{ app.businessPhoneNumber }}</div>
                  </div>
                  <div class="col-span-2">
                    <div class="text-xs text-slate-400 mb-0.5">사업장 주소</div>
                    <div class="text-slate-700">{{ app.businessAddress }}</div>
                  </div>
                </div>
                <div class="flex gap-3 mt-5 pt-4 border-t border-sky-50">
                  <button @click="handleReject(app.id)" class="flex items-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-full px-5 py-2 text-sm font-semibold transition">
                    <X class="w-4 h-4" /> 반려
                  </button>
                  <button @click="handleApprove(app.id)" class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full px-5 py-2 text-sm font-bold transition">
                    <Check class="w-4 h-4" /> 승인
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ── 수수료 정책 탭 ── -->
          <div v-else-if="activeTab === 'commission'">
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-2xl font-black text-slate-900">수수료 정책 관리</h1>
              <button
                @click="openCreatePolicy"
                class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold px-5 py-2.5 rounded-full transition"
              >
                <Plus class="w-4 h-4" /> 정책 추가
              </button>
            </div>

            <div v-if="isLoadingPolicies" class="flex justify-center py-24">
              <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
            </div>
            <div v-else-if="policiesError" class="text-center py-24 text-red-500 text-sm">{{ policiesError }}</div>
            <div v-else-if="policies.length === 0" class="text-center py-24">
              <Percent class="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p class="text-slate-400 text-sm">등록된 수수료 정책이 없습니다</p>
              <button @click="openCreatePolicy" class="mt-4 px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-full transition">
                첫 정책 추가하기
              </button>
            </div>

            <div v-else class="space-y-3">
              <div v-for="policy in policies" :key="policy.id" class="bg-white rounded-2xl border border-sky-100 p-5">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                      <Percent class="w-6 h-6 text-sky-500" />
                    </div>
                    <div>
                      <div class="font-bold text-slate-900 text-lg">{{ policy.rate }}%</div>
                      <div class="text-xs text-slate-400 mt-0.5">
                        {{ policy.productType ? (PRODUCT_TYPE_LABELS[policy.productType] ?? policy.productType) : '전체 상품 유형' }}
                        {{ policy.description ? ` · ${policy.description}` : '' }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button @click="openEditPolicy(policy)" class="p-2 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition">
                      <Edit2 class="w-4 h-4" />
                    </button>
                    <button @click="deletePolicy(policy.id)" class="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-sky-50 text-xs text-slate-400">
                  최종 수정 {{ formatDate(policy.updatedAt) }}
                </div>
              </div>
            </div>
          </div>

          <!-- ── 정산 처리 탭 ── -->
          <div v-else-if="activeTab === 'settlements'">
            <div class="mb-6">
              <h1 class="text-2xl font-black text-slate-900">정산 일괄 처리</h1>
              <p class="text-slate-400 text-sm mt-1">구매 확정된 주문에 대해 판매자 정산을 일괄 생성합니다.</p>
            </div>

            <div class="bg-white rounded-2xl border border-sky-100 p-8 text-center">
              <Banknote class="w-14 h-14 text-sky-300 mx-auto mb-4" />
              <h2 class="text-lg font-bold text-slate-900 mb-2">정산 일괄 처리 실행</h2>
              <p class="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                CONFIRMED(구매 확정) 상태의 주문을 기반으로 각 판매자의 정산을 생성합니다.<br />
                이 작업은 되돌릴 수 없으므로 신중하게 실행해주세요.
              </p>

              <!-- 결과 메시지 -->
              <div
                v-if="batchResult !== 'idle'"
                class="mb-6 px-4 py-3 rounded-xl text-sm font-medium"
                :class="batchResult === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'"
              >
                {{ batchMessage }}
              </div>

              <button
                @click="runSettlementBatch"
                :disabled="isBatching"
                class="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-full transition"
              >
                <Loader2 v-if="isBatching" class="w-5 h-5 animate-spin" />
                <Play v-else class="w-5 h-5" />
                {{ isBatching ? '처리 중...' : '정산 일괄 처리 실행' }}
              </button>
            </div>
          </div>

          <!-- 기타 탭 (준비 중) -->
          <div
            v-for="tab in otherTabs"
            :key="tab.key"
            v-show="activeTab === tab.key"
            class="flex flex-col items-center justify-center py-32"
          >
            <component :is="tab.icon" class="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p class="text-slate-400 text-sm">준비 중인 기능입니다</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Approve Modal -->
    <Transition name="fade">
      <div v-if="showApproveModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
        <div class="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6">
          <CheckCircle class="w-12 h-12 text-sky-500 mx-auto mb-4" />
          <h2 class="font-black text-slate-900 text-center text-lg">판매자 신청을 승인하시겠습니까?</h2>
          <p class="text-sm text-slate-500 text-center mt-1 mb-6">승인 시 해당 회원의 권한이 판매자로 변경됩니다.</p>
          <div class="flex gap-3">
            <button @click="showApproveModal = false" :disabled="isProcessing" class="flex-1 px-4 py-2.5 border border-sky-100 text-slate-600 hover:bg-sky-50 rounded-full text-sm font-semibold transition disabled:opacity-50">취소</button>
            <button @click="confirmApprove" :disabled="isProcessing" class="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">
              <Loader2 v-if="isProcessing" class="w-4 h-4 animate-spin" />
              {{ isProcessing ? '처리 중...' : '승인하기' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Reject Modal -->
    <Transition name="fade">
      <div v-if="showRejectModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
        <div class="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6">
          <XCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 class="font-black text-slate-900 text-center text-lg">반려 사유를 입력해주세요</h2>
          <div class="mt-4">
            <textarea
              v-model="rejectReason"
              rows="4"
              placeholder="반려 사유를 구체적으로 작성해주세요. 이 내용은 신청자에게 전달됩니다."
              class="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
            />
            <div class="text-xs text-right text-slate-400 mt-1">{{ rejectReason.length }}자</div>
          </div>
          <div class="flex gap-3 mt-4">
            <button @click="showRejectModal = false" :disabled="isProcessing" class="flex-1 px-4 py-2.5 border border-sky-100 text-slate-600 hover:bg-sky-50 rounded-full text-sm font-semibold transition disabled:opacity-50">취소</button>
            <button @click="confirmReject" :disabled="!rejectReason.trim() || isProcessing" class="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full text-sm font-bold transition flex items-center justify-center gap-2">
              <Loader2 v-if="isProcessing" class="w-4 h-4 animate-spin" />
              {{ isProcessing ? '처리 중...' : '반려하기' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Commission Policy Modal -->
    <Transition name="fade">
      <div v-if="showPolicyModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
        <div class="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6">
          <h2 class="font-black text-slate-900 text-lg mb-5">
            {{ editingPolicy ? '수수료 정책 수정' : '수수료 정책 추가' }}
          </h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">수수료율 (%)</label>
              <input
                v-model.number="policyForm.rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="예: 5.0"
                class="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">적용 상품 유형 <span class="text-slate-400 font-normal">(비우면 전체 적용)</span></label>
              <select
                v-model="policyForm.productType"
                class="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
              >
                <option value="">전체 상품 유형</option>
                <option v-for="(label, type) in PRODUCT_TYPE_LABELS" :key="type" :value="type">{{ label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">설명 <span class="text-slate-400 font-normal">(선택)</span></label>
              <input
                v-model="policyForm.description"
                type="text"
                placeholder="예: 기본 수수료 정책"
                class="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="showPolicyModal = false" :disabled="isSavingPolicy" class="flex-1 px-4 py-2.5 border border-sky-100 text-slate-600 hover:bg-sky-50 rounded-full text-sm font-semibold transition disabled:opacity-50">취소</button>
            <button @click="savePolicy" :disabled="isSavingPolicy || policyForm.rate < 0" class="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white rounded-full text-sm font-bold transition flex items-center justify-center gap-2">
              <Loader2 v-if="isSavingPolicy" class="w-4 h-4 animate-spin" />
              {{ isSavingPolicy ? '저장 중...' : '저장' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
