<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Shield, ClipboardList, Users, Package, Gavel, MessageSquare,
  CheckCircle, XCircle, Check, X, Home
} from 'lucide-vue-next'

const router = useRouter()

// Mock: assume ADMIN role
const isAdmin = ref(true)

const activeTab = ref('applications')
const statusFilter = ref('전체')
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const selectedApplicationId = ref<number | null>(null)
const rejectReason = ref('')

const navItems = [
  { key: 'applications', icon: ClipboardList, label: '판매자 신청 관리', badge: 3 },
  { key: 'members',      icon: Users,          label: '회원 관리' },
  { key: 'products',     icon: Package,        label: '상품 관리' },
  { key: 'auctions',     icon: Gavel,          label: '경매 관리' },
  { key: 'community',    icon: MessageSquare,  label: '커뮤니티 관리' },
]

const filterTabs = ['전체 (12)', '대기 중 (3)', '승인됨 (7)', '반려됨 (2)']

const applications = ref([
  {
    id: 1, status: 'PENDING',
    memberName: '김수족', memberNickname: '수족관왕', memberInitial: '김',
    appliedAt: '2026-03-09 14:23', role: 'SELLER',
    businessName: '아쿠아팜 수족관', businessAddress: '서울 강남구 논현동 123',
    phoneNumber: '010-1234-5678',
    storeDescription: '10년 경력의 수족관 운영자입니다. 어류, 갑각류 전문으로 건강한 개체만 판매합니다.'
  },
  {
    id: 2, status: 'PENDING',
    memberName: '이브리더', memberNickname: '새우마스터', memberInitial: '이',
    appliedAt: '2026-03-09 11:05', role: 'BREEDER',
    businessName: '이브리더 새우농장', businessAddress: '경기 고양시 일산동구 456',
    phoneNumber: '010-9876-5432',
    storeDescription: 'CRS, CBS 전문 브리더입니다. 고등급 개체 직접 브리딩 판매.'
  },
  {
    id: 3, status: 'PENDING',
    memberName: '박수초', memberNickname: '수초농부', memberInitial: '박',
    appliedAt: '2026-03-08 16:40', role: 'SELLER',
    businessName: '그린수초팜', businessAddress: '경기 파주시 교하읍 789',
    phoneNumber: '010-5555-6666',
    storeDescription: ''
  },
  {
    id: 4, status: 'APPROVED',
    memberName: '최플레코', memberNickname: '플레코마스터', memberInitial: '최',
    appliedAt: '2026-03-07 10:00', approvedAt: '2026-03-07 14:30', role: 'BREEDER',
    businessName: '플레코팜', businessAddress: '인천 부평구 부평동 321',
    phoneNumber: '010-7777-8888',
    storeDescription: 'L번호 플레코 전문 브리더, 10년 경력.'
  },
  {
    id: 5, status: 'REJECTED',
    memberName: '정신입', memberNickname: '물생활초보', memberInitial: '정',
    appliedAt: '2026-03-06 09:15', rejectedAt: '2026-03-06 15:00',
    rejectionReason: '사업장 주소가 실제 주소와 일치하지 않습니다. 정확한 사업장 정보를 기재하여 재신청해 주세요.',
    role: 'SELLER',
    businessName: '정신입 수족관', businessAddress: '주소 미기재',
    phoneNumber: '010-1111-2222',
    storeDescription: ''
  }
])

const filteredApplications = computed(() => {
  const map: Record<string, string> = { '대기 중 (3)': 'PENDING', '승인됨 (7)': 'APPROVED', '반려됨 (2)': 'REJECTED' }
  if (statusFilter.value === '전체 (12)') return applications.value
  return applications.value.filter(a => a.status === map[statusFilter.value])
})

const statusBadgeClass = (status: string) => {
  if (status === 'PENDING')  return 'bg-amber-100 text-amber-700'
  if (status === 'APPROVED') return 'bg-emerald-100 text-emerald-700'
  return 'bg-red-100 text-red-600'
}
const statusLabel = (status: string) => {
  if (status === 'PENDING')  return '검토 중'
  if (status === 'APPROVED') return '승인됨'
  return '반려됨'
}

const handleApprove = (id: number) => { selectedApplicationId.value = id; showApproveModal.value = true }
const handleReject  = (id: number) => { selectedApplicationId.value = id; showRejectModal.value = true; rejectReason.value = '' }

const confirmApprove = () => {
  const app = applications.value.find(a => a.id === selectedApplicationId.value)
  if (app) app.status = 'APPROVED'
  showApproveModal.value = false
}
const confirmReject = () => {
  const app = applications.value.find(a => a.id === selectedApplicationId.value)
  if (app) { app.status = 'REJECTED'; (app as any).rejectionReason = rejectReason.value }
  showRejectModal.value = false
}

const otherTabs: { key: string; icon: any; label: string }[] = [
  { key: 'members',   icon: Users,         label: '회원 관리' },
  { key: 'products',  icon: Package,       label: '상품 관리' },
  { key: 'auctions',  icon: Gavel,         label: '경매 관리' },
  { key: 'community', icon: MessageSquare, label: '커뮤니티 관리' },
]
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- 403 -->
    <div v-if="!isAdmin" class="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <Shield class="w-14 h-14 text-red-300 mx-auto mb-4" />
      <p class="text-xl font-black text-slate-900 mb-2">접근 권한이 없습니다</p>
      <p class="text-slate-400 text-sm mb-6">관리자 전용 페이지입니다.</p>
      <button
          @click="router.push('/')"
          class="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition"
      >
        홈으로
      </button>
    </div>

    <!-- Admin Content -->
    <main v-else class="max-w-6xl mx-auto px-6 py-12 mt-16">
      <div class="flex gap-8">
        <!-- Left Sidebar -->
        <aside class="w-56 flex-shrink-0">
          <div class="sticky top-24">
            <!-- Admin Badge -->
            <div class="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 text-center">
              <Shield class="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div class="font-black text-slate-800 text-sm">관리자 센터</div>
              <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full inline-block mt-1">ADMIN</span>
            </div>
            <!-- Nav -->
            <nav class="space-y-1">
              <button
                  v-for="item in navItems"
                  :key="item.key"
                  @click="activeTab = item.key"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition"
                  :class="activeTab === item.key
                  ? 'bg-sky-50 text-sky-600 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50'"
              >
                <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
                <span class="flex-1 text-sm">{{ item.label }}</span>
                <span
                    v-if="item.badge"
                    class="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {{ item.badge }}
                </span>
              </button>
            </nav>
          </div>
        </aside>

        <!-- Right Content -->
        <div class="flex-1 min-w-0">

          <!-- Applications Tab -->
          <div v-if="activeTab === 'applications'">
            <!-- Stats Bar -->
            <div class="grid grid-cols-4 gap-4 mb-6">
              <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100">
                <div class="text-2xl font-black text-slate-900">12</div>
                <div class="text-xs text-slate-400 mt-0.5">전체 신청</div>
              </div>
              <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100">
                <div class="text-2xl font-black text-amber-500">3</div>
                <div class="text-xs text-slate-400 mt-0.5">대기 중</div>
              </div>
              <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100">
                <div class="text-2xl font-black text-emerald-600">7</div>
                <div class="text-xs text-slate-400 mt-0.5">이번 주 승인</div>
              </div>
              <div class="bg-sky-50 rounded-2xl p-4 border border-sky-100">
                <div class="text-2xl font-black text-red-500">2</div>
                <div class="text-xs text-slate-400 mt-0.5">반려됨</div>
              </div>
            </div>

            <!-- Header Row -->
            <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h1 class="text-2xl font-black text-slate-900">판매자 신청 관리</h1>
              <div class="flex gap-2 flex-wrap">
                <button
                    v-for="tab in filterTabs"
                    :key="tab"
                    @click="statusFilter = tab"
                    :class="[
                    'px-4 py-2 text-sm rounded-full font-semibold transition',
                    statusFilter === tab
                      ? 'bg-sky-500 text-white'
                      : 'bg-sky-50 text-slate-600 border border-sky-100 hover:bg-sky-100'
                  ]"
                >
                  {{ tab }}
                </button>
              </div>
            </div>

            <!-- Application Cards -->
            <div class="space-y-4">
              <div
                  v-for="app in filteredApplications"
                  :key="app.id"
                  class="bg-white rounded-2xl border border-sky-100 p-6"
              >
                <!-- Top Row -->
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-sky-300 to-teal-400 flex items-center justify-center text-white font-black flex-shrink-0">
                      {{ app.memberInitial }}
                    </div>
                    <div>
                      <div class="font-semibold text-slate-900">{{ app.memberName }} <span class="font-normal text-slate-400 text-sm">{{ app.memberNickname }}</span></div>
                      <div class="text-xs text-slate-400 mt-0.5">신청일 {{ app.appliedAt }}</div>
                    </div>
                  </div>
                  <span :class="['rounded-full px-3 py-1 text-xs font-semibold', statusBadgeClass(app.status)]">
                    {{ statusLabel(app.status) }}
                  </span>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-sky-50 text-sm">
                  <div>
                    <div class="text-xs text-slate-400 mb-0.5">신청 유형</div>
                    <span :class="[
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      app.role === 'BREEDER' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    ]">
                      {{ app.role === 'BREEDER' ? '브리더' : '판매자' }}
                    </span>
                  </div>
                  <div>
                    <div class="text-xs text-slate-400 mb-0.5">사업장명</div>
                    <div class="text-slate-700 font-medium">{{ app.businessName }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-slate-400 mb-0.5">연락처</div>
                    <div class="text-slate-700">{{ app.phoneNumber }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-slate-400 mb-0.5">사업장 주소</div>
                    <div class="text-slate-700">{{ app.businessAddress }}</div>
                  </div>
                </div>

                <!-- Store Description -->
                <div v-if="app.storeDescription" class="mt-3 bg-sky-50 rounded-xl p-3 text-sm text-slate-600 italic">
                  "{{ app.storeDescription }}"
                </div>

                <!-- Rejection Reason (REJECTED) -->
                <div v-if="app.status === 'REJECTED' && (app as any).rejectionReason" class="mt-3 bg-red-50 rounded-xl p-3 text-sm text-red-600">
                  <span class="font-semibold">반려 사유:</span> {{ (app as any).rejectionReason }}
                </div>

                <!-- Action Row -->
                <div class="flex gap-3 mt-5 pt-4 border-t border-sky-50 flex-wrap">
                  <!-- PENDING actions -->
                  <template v-if="app.status === 'PENDING'">
                    <button
                        @click="handleReject(app.id)"
                        class="flex items-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-full px-5 py-2 text-sm font-semibold transition"
                    >
                      <X class="w-4 h-4" />
                      반려
                    </button>
                    <button
                        @click="handleApprove(app.id)"
                        class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full px-5 py-2 text-sm font-bold transition"
                    >
                      <Check class="w-4 h-4" />
                      승인
                    </button>
                  </template>
                  <!-- APPROVED actions -->
                  <template v-if="app.status === 'APPROVED'">
                    <button class="px-4 py-2 border border-sky-100 text-slate-500 hover:bg-sky-50 rounded-full text-sm transition">
                      승인 취소
                    </button>
                  </template>
                  <!-- REJECTED actions -->
                  <template v-if="app.status === 'REJECTED'">
                    <button class="px-4 py-2 border border-sky-100 text-slate-500 hover:bg-sky-50 rounded-full text-sm transition">
                      재검토
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- Other tabs placeholder -->
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
            <button
                @click="showApproveModal = false"
                class="flex-1 px-4 py-2.5 border border-sky-100 text-slate-600 hover:bg-sky-50 rounded-full text-sm font-semibold transition"
            >
              취소
            </button>
            <button
                @click="confirmApprove"
                class="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-sm font-bold transition"
            >
              승인하기
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
            <button
                @click="showRejectModal = false"
                class="flex-1 px-4 py-2.5 border border-sky-100 text-slate-600 hover:bg-sky-50 rounded-full text-sm font-semibold transition"
            >
              취소
            </button>
            <button
                @click="confirmReject"
                :disabled="!rejectReason.trim()"
                class="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full text-sm font-bold transition"
            >
              반려하기
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
