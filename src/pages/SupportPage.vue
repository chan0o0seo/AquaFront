<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { HelpCircle, MessageCircle, Mail, Clock, ChevronDown, ChevronUp, CheckCircle } from 'lucide-vue-next'
import { inquiryApi, type InquiryResponse, type InquiryCategory, type CreateInquiryRequest } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { isLoggedIn, user } = storeToRefs(authStore)

type Tab = 'faq' | 'inquiry' | 'history'
const activeTab = ref<Tab>('faq')

// ── FAQ ──────────────────────────────────────────────────────────────
type FaqCategory = '전체' | '주문·결제' | '경매' | '판매자' | '계정'
const faqCategory = ref<FaqCategory>('전체')
const faqCategories: FaqCategory[] = ['전체', '주문·결제', '경매', '판매자', '계정']
const expandedFaq = ref<number | null>(null)

interface FaqItem {
  id: number
  category: Exclude<FaqCategory, '전체'>
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    id: 1,
    category: '주문·결제',
    question: '주문 후 취소는 어떻게 하나요?',
    answer: '주문 상세 페이지에서 "주문 취소" 버튼을 통해 취소할 수 있습니다. 단, 배송이 시작된 이후에는 취소가 불가능하며, 판매자에게 직접 반품 요청을 해야 합니다.',
  },
  {
    id: 2,
    category: '주문·결제',
    question: '결제 수단은 어떤 것이 있나요?',
    answer: '신용/체크카드, 실시간 계좌이체, 가상계좌, 카카오페이, 네이버페이 등을 지원합니다. 결제 페이지에서 원하는 수단을 선택하실 수 있습니다.',
  },
  {
    id: 3,
    category: '주문·결제',
    question: '세금계산서 발급이 가능한가요?',
    answer: '사업자 회원의 경우 마이페이지 > 주문 내역에서 세금계산서 발급 요청이 가능합니다. 개인 회원은 현금영수증만 신청 가능합니다.',
  },
  {
    id: 4,
    category: '경매',
    question: '경매에 참여하려면 어떻게 해야 하나요?',
    answer: '회원가입 후 로그인 상태에서 경매 페이지에 접속하여 입찰 금액을 입력하면 됩니다. 입찰은 현재 최고가보다 높은 금액만 가능합니다.',
  },
  {
    id: 5,
    category: '경매',
    question: '경매 낙찰 후 결제는 어떻게 되나요?',
    answer: '경매 종료 후 낙찰자에게 결제 안내 알림이 발송됩니다. 24시간 이내에 결제를 완료하지 않으면 낙찰이 취소될 수 있습니다.',
  },
  {
    id: 6,
    category: '경매',
    question: '즉시구매가 있는 경매란 무엇인가요?',
    answer: '판매자가 즉시구매가를 설정한 경우, 해당 금액으로 경매 종료를 기다리지 않고 바로 구매할 수 있습니다. 즉시구매 시 경매는 즉시 종료됩니다.',
  },
  {
    id: 7,
    category: '판매자',
    question: '판매자로 전환하려면 어떻게 해야 하나요?',
    answer: '마이페이지 > 판매자 신청 메뉴에서 신청서를 작성하면 됩니다. 관리자 검토 후 승인되면 판매자 기능을 이용할 수 있습니다.',
  },
  {
    id: 8,
    category: '판매자',
    question: '정산은 어떻게 이루어지나요?',
    answer: '구매자의 구매 확정 후 영업일 기준 3일 이내에 등록된 정산 계좌로 입금됩니다. 수수료는 판매 금액의 일정 비율로 차감됩니다.',
  },
  {
    id: 9,
    category: '판매자',
    question: '판매 수수료는 얼마인가요?',
    answer: '기본 수수료는 판매 금액의 5%입니다. 브리더 회원의 경우 별도 수수료 정책이 적용될 수 있습니다. 자세한 내용은 판매자 센터에서 확인하세요.',
  },
  {
    id: 10,
    category: '계정',
    question: '비밀번호를 잊어버렸어요.',
    answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하세요. 가입 시 등록한 이메일로 재설정 링크가 발송됩니다.',
  },
  {
    id: 11,
    category: '계정',
    question: '회원 탈퇴는 어떻게 하나요?',
    answer: '마이페이지 > 계정 설정 > 회원 탈퇴 메뉴에서 탈퇴 신청이 가능합니다. 탈퇴 시 모든 데이터가 삭제되며 복구가 불가능하니 신중히 결정해 주세요.',
  },
  {
    id: 12,
    category: '계정',
    question: '소셜 계정으로 가입한 경우 이메일 변경이 가능한가요?',
    answer: '소셜 로그인으로 가입한 계정은 해당 소셜 플랫폼의 이메일이 사용됩니다. 이메일 변경을 원하시면 1:1 문의를 통해 고객센터에 문의해 주세요.',
  },
]

const filteredFaqs = ref(faqItems)

const filterFaq = (category: FaqCategory) => {
  faqCategory.value = category
  filteredFaqs.value = category === '전체'
    ? faqItems
    : faqItems.filter(f => f.category === category)
  expandedFaq.value = null
}

const toggleFaq = (id: number) => {
  expandedFaq.value = expandedFaq.value === id ? null : id
}

// ── 1:1 문의 폼 ────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<InquiryCategory, string> = {
  ORDER_PAYMENT: '주문·결제',
  AUCTION: '경매',
  PRODUCT: '상품',
  SELLER: '판매자',
  ACCOUNT: '계정',
  OTHER: '기타',
}

const inquiryCategories: InquiryCategory[] = ['ORDER_PAYMENT', 'AUCTION', 'PRODUCT', 'SELLER', 'ACCOUNT', 'OTHER']

const form = ref<CreateInquiryRequest>({
  category: 'ORDER_PAYMENT',
  title: '',
  content: '',
  email: user.value?.email ?? '',
})

const isSubmitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')

const submitInquiry = async () => {
  submitError.value = ''
  if (!form.value.title.trim() || !form.value.content.trim() || !form.value.email.trim()) {
    submitError.value = '모든 항목을 입력해주세요.'
    return
  }
  isSubmitting.value = true
  try {
    await inquiryApi.create(form.value)
    submitSuccess.value = true
    form.value = { category: 'ORDER_PAYMENT', title: '', content: '', email: user.value?.email ?? '' }
  } catch {
    submitError.value = '문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isSubmitting.value = false
  }
}

// ── 내 문의 내역 ───────────────────────────────────────────────────
const myInquiries = ref<InquiryResponse[]>([])
const isLoadingHistory = ref(false)

const loadMyInquiries = async () => {
  if (!isLoggedIn.value) return
  isLoadingHistory.value = true
  try {
    myInquiries.value = await inquiryApi.getMyInquiries()
  } catch {
    // silent
  } finally {
    isLoadingHistory.value = false
  }
}

onMounted(() => {
  if (isLoggedIn.value) loadMyInquiries()
})

const switchTab = (tab: Tab) => {
  activeTab.value = tab
  if (tab === 'history' && isLoggedIn.value && myInquiries.value.length === 0) {
    loadMyInquiries()
  }
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-16">
    <!-- 헤더 -->
    <section class="bg-white border-b border-sky-100">
      <div class="max-w-4xl mx-auto px-6 py-12 text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 bg-sky-50 rounded-2xl mb-4">
          <HelpCircle class="w-7 h-7 text-sky-500" />
        </div>
        <h1 class="text-2xl font-black text-slate-800 mb-2">무엇을 도와드릴까요?</h1>
        <p class="text-slate-500 text-sm">아쿠아 Hub 고객센터입니다. 빠르게 도움을 드리겠습니다.</p>
      </div>

      <!-- 빠른 연결 카드 -->
      <div class="max-w-4xl mx-auto px-6 pb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-sky-50 rounded-2xl border border-sky-100 p-5 flex items-center gap-4">
            <div class="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800">카카오톡 채널</p>
              <p class="text-xs text-slate-500 mt-0.5">@아쿠아Hub 채널 추가</p>
            </div>
          </div>
          <div class="bg-sky-50 rounded-2xl border border-sky-100 p-5 flex items-center gap-4">
            <div class="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800">이메일 문의</p>
              <p class="text-xs text-slate-500 mt-0.5">support@aquahub.kr</p>
            </div>
          </div>
          <div class="bg-sky-50 rounded-2xl border border-sky-100 p-5 flex items-center gap-4">
            <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800">운영 시간</p>
              <p class="text-xs text-slate-500 mt-0.5">평일 10:00 ~ 18:00</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 탭 -->
    <div class="max-w-4xl mx-auto px-6 mt-8">
      <div class="flex border-b border-slate-200 mb-6">
        <button
          v-for="tab in (['faq', 'inquiry', 'history'] as Tab[])"
          :key="tab"
          @click="switchTab(tab)"
          class="px-6 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px"
          :class="activeTab === tab
            ? 'border-sky-500 text-sky-600'
            : 'border-transparent text-slate-500 hover:text-slate-700'"
        >
          <span v-if="tab === 'faq'">자주 묻는 질문</span>
          <span v-else-if="tab === 'inquiry'">1:1 문의</span>
          <span v-else>
            내 문의 내역
            <span v-if="!isLoggedIn" class="text-xs text-slate-400 font-normal ml-1">(로그인 필요)</span>
          </span>
        </button>
      </div>

      <!-- FAQ 탭 -->
      <div v-if="activeTab === 'faq'" class="pb-16">
        <!-- 카테고리 필터 -->
        <div class="flex flex-wrap gap-2 mb-6">
          <button
            v-for="cat in faqCategories"
            :key="cat"
            @click="filterFaq(cat)"
            class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="faqCategory === cat
              ? 'bg-sky-500 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-sky-300'"
          >
            {{ cat }}
          </button>
        </div>

        <!-- 아코디언 -->
        <div class="space-y-2">
          <div
            v-for="item in filteredFaqs"
            :key="item.id"
            class="bg-white rounded-2xl border border-sky-100 overflow-hidden"
          >
            <button
              @click="toggleFaq(item.id)"
              class="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-sky-50/50 transition-colors"
            >
              <div class="flex items-center gap-3">
                <span class="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">{{ item.category }}</span>
                <span class="text-sm font-semibold text-slate-800">{{ item.question }}</span>
              </div>
              <ChevronDown v-if="expandedFaq !== item.id" class="w-4 h-4 text-slate-400 flex-shrink-0 ml-4" />
              <ChevronUp v-else class="w-4 h-4 text-sky-500 flex-shrink-0 ml-4" />
            </button>
            <div v-if="expandedFaq === item.id" class="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-sky-50 pt-4">
              {{ item.answer }}
            </div>
          </div>

          <p v-if="filteredFaqs.length === 0" class="text-center text-slate-400 py-10 text-sm">
            해당 카테고리에 등록된 FAQ가 없습니다.
          </p>
        </div>
      </div>

      <!-- 1:1 문의 탭 -->
      <div v-else-if="activeTab === 'inquiry'" class="pb-16">
        <!-- 비로그인 -->
        <div v-if="!isLoggedIn" class="bg-white rounded-2xl border border-sky-100 p-10 text-center">
          <HelpCircle class="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p class="text-slate-600 font-semibold mb-1">로그인이 필요합니다</p>
          <p class="text-sm text-slate-400 mb-5">1:1 문의는 회원만 이용할 수 있습니다.</p>
          <a href="/login" class="inline-block px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-full transition-colors">
            로그인하기
          </a>
        </div>

        <!-- 제출 성공 -->
        <div v-else-if="submitSuccess" class="bg-white rounded-2xl border border-sky-100 p-10 text-center">
          <div class="inline-flex items-center justify-center w-14 h-14 bg-emerald-50 rounded-full mb-4">
            <CheckCircle class="w-7 h-7 text-emerald-500" />
          </div>
          <p class="text-lg font-black text-slate-800 mb-1">문의가 접수되었습니다</p>
          <p class="text-sm text-slate-500 mb-6">답변은 입력하신 이메일로 발송되며,<br>영업일 기준 1~3일 내에 처리됩니다.</p>
          <div class="flex justify-center gap-3">
            <button
              @click="submitSuccess = false"
              class="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-full transition-colors"
            >
              추가 문의하기
            </button>
            <button
              @click="activeTab = 'history'"
              class="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-full hover:border-sky-300 transition-colors"
            >
              내 문의 확인
            </button>
          </div>
        </div>

        <!-- 문의 폼 -->
        <div v-else class="bg-white rounded-2xl border border-sky-100 p-6">
          <h2 class="text-base font-black text-slate-800 mb-5">문의 내용 작성</h2>

          <div class="space-y-4">
            <!-- 카테고리 -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">카테고리</label>
              <select
                v-model="form.category"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 bg-white"
              >
                <option v-for="cat in inquiryCategories" :key="cat" :value="cat">
                  {{ CATEGORY_LABELS[cat] }}
                </option>
              </select>
            </div>

            <!-- 제목 -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">제목</label>
              <input
                v-model="form.title"
                type="text"
                maxlength="200"
                placeholder="문의 제목을 입력해주세요"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 placeholder-slate-300"
              />
            </div>

            <!-- 내용 -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">내용</label>
              <textarea
                v-model="form.content"
                maxlength="2000"
                rows="6"
                placeholder="문의하실 내용을 자세히 입력해주세요"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 placeholder-slate-300 resize-none"
              />
              <p class="text-xs text-slate-400 mt-1 text-right">{{ form.content.length }}/2000</p>
            </div>

            <!-- 이메일 -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">답변 받을 이메일</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="example@email.com"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 placeholder-slate-300"
              />
            </div>

            <!-- 오류 메시지 -->
            <p v-if="submitError" class="text-sm text-red-500">{{ submitError }}</p>

            <!-- 제출 버튼 -->
            <button
              @click="submitInquiry"
              :disabled="isSubmitting"
              class="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold rounded-full transition-colors text-sm"
            >
              {{ isSubmitting ? '접수 중...' : '문의 접수하기' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 내 문의 내역 탭 -->
      <div v-else class="pb-16">
        <!-- 비로그인 -->
        <div v-if="!isLoggedIn" class="bg-white rounded-2xl border border-sky-100 p-10 text-center">
          <HelpCircle class="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p class="text-slate-600 font-semibold mb-1">로그인이 필요합니다</p>
          <p class="text-sm text-slate-400 mb-5">내 문의 내역은 회원만 확인할 수 있습니다.</p>
          <a href="/login" class="inline-block px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-full transition-colors">
            로그인하기
          </a>
        </div>

        <!-- 로딩 -->
        <div v-else-if="isLoadingHistory" class="space-y-3">
          <div v-for="n in 3" :key="n" class="bg-white rounded-2xl border border-sky-100 p-5 animate-pulse">
            <div class="h-4 bg-slate-100 rounded w-1/3 mb-2" />
            <div class="h-3 bg-slate-100 rounded w-2/3" />
          </div>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="myInquiries.length === 0" class="bg-white rounded-2xl border border-sky-100 p-10 text-center">
          <MessageCircle class="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p class="text-slate-600 font-semibold mb-1">문의 내역이 없습니다</p>
          <p class="text-sm text-slate-400 mb-5">궁금한 점이 있으시면 1:1 문의를 이용해 주세요.</p>
          <button
            @click="activeTab = 'inquiry'"
            class="inline-block px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-full transition-colors"
          >
            문의하기
          </button>
        </div>

        <!-- 목록 -->
        <div v-else class="space-y-3">
          <div
            v-for="inquiry in myInquiries"
            :key="inquiry.id"
            class="bg-white rounded-2xl border border-sky-100 p-5"
          >
            <div class="flex items-start justify-between gap-3 mb-2">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                  {{ CATEGORY_LABELS[inquiry.category] }}
                </span>
                <span
                  class="text-xs font-semibold px-2 py-0.5 rounded-full"
                  :class="inquiry.status === 'ANSWERED'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'"
                >
                  {{ inquiry.status === 'ANSWERED' ? '답변 완료' : '답변 대기' }}
                </span>
              </div>
              <span class="text-xs text-slate-400 flex-shrink-0">{{ formatDate(inquiry.createdAt) }}</span>
            </div>

            <p class="text-sm font-semibold text-slate-800 mb-1">{{ inquiry.title }}</p>
            <p class="text-xs text-slate-500 line-clamp-2">{{ inquiry.content }}</p>

            <!-- 답변 -->
            <div v-if="inquiry.status === 'ANSWERED' && inquiry.adminReply" class="mt-4 bg-sky-50 rounded-xl p-4">
              <p class="text-xs font-semibold text-sky-600 mb-1">고객센터 답변 · {{ formatDate(inquiry.repliedAt!) }}</p>
              <p class="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{{ inquiry.adminReply }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
