<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Shield, ClipboardList, Users, Package, Gavel, MessageSquare,
  CheckCircle, XCircle, Check, X, Loader2, Percent, Banknote,
  Plus, Edit2, Trash2, Play, Search, ChevronLeft, ChevronRight,
  Bell, Send, FlaskConical
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { sellerApi, settlementApi, adminApi, type SellerApplicationResponse, type CommissionPolicyResponse, type CommissionPolicyRequest, type AdminMemberResponse, type MemberRole, type AdminProductResponse, type AdminProductStatus, type AdminAuctionResponse, type AdminAuctionStatus, type AdminPostResponse } from '@/api'

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

// ── 회원 관리 ─────────────────────────────────────
const members = ref<AdminMemberResponse[]>([])
const isLoadingMembers = ref(false)
const membersError = ref('')
const memberKeyword = ref('')
const memberRoleFilter = ref('')
const memberPage = ref(0)
const memberTotalPages = ref(0)
const memberTotalElements = ref(0)
const PAGE_SIZE = 15

const ROLE_LABELS: Record<MemberRole, string> = {
  BUYER: '구매자',
  SELLER: '판매자',
  BREEDER: '브리더',
  ADMIN: '관리자',
}
const ROLE_COLORS: Record<MemberRole, string> = {
  BUYER: 'bg-slate-100 text-slate-600',
  SELLER: 'bg-sky-100 text-sky-700',
  BREEDER: 'bg-teal-100 text-teal-700',
  ADMIN: 'bg-red-100 text-red-700',
}

async function fetchMembers(page = 0) {
  isLoadingMembers.value = true
  membersError.value = ''
  try {
    const result = await adminApi.getMembers({
      keyword: memberKeyword.value,
      role: memberRoleFilter.value,
      page,
      size: PAGE_SIZE,
    })
    members.value = result.content
    memberPage.value = result.number
    memberTotalPages.value = result.totalPages
    memberTotalElements.value = result.totalElements
  } catch (e: any) {
    membersError.value = e?.response?.data?.message ?? '회원 목록을 불러오지 못했습니다.'
  } finally {
    isLoadingMembers.value = false
  }
}

function handleMemberSearch() {
  fetchMembers(0)
}

// 역할 변경 모달
const showRoleModal = ref(false)
const selectedMember = ref<AdminMemberResponse | null>(null)
const newRole = ref<MemberRole>('BUYER')
const isUpdatingRole = ref(false)

function openRoleModal(member: AdminMemberResponse) {
  selectedMember.value = member
  newRole.value = member.role
  showRoleModal.value = true
}

async function confirmRoleUpdate() {
  if (!selectedMember.value || isUpdatingRole.value) return
  isUpdatingRole.value = true
  try {
    const updated = await adminApi.updateRole(selectedMember.value.id, newRole.value)
    const idx = members.value.findIndex(m => m.id === selectedMember.value!.id)
    if (idx !== -1) members.value[idx] = updated
    showRoleModal.value = false
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '역할 변경에 실패했습니다.')
  } finally {
    isUpdatingRole.value = false
  }
}

// 회원 삭제
const showDeleteMemberModal = ref(false)
const memberToDelete = ref<AdminMemberResponse | null>(null)
const isDeletingMember = ref(false)

function openDeleteMemberModal(member: AdminMemberResponse) {
  memberToDelete.value = member
  showDeleteMemberModal.value = true
}

async function confirmDeleteMember() {
  if (!memberToDelete.value || isDeletingMember.value) return
  isDeletingMember.value = true
  try {
    await adminApi.deleteMember(memberToDelete.value.id)
    members.value = members.value.filter(m => m.id !== memberToDelete.value!.id)
    memberTotalElements.value -= 1
    showDeleteMemberModal.value = false
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '회원 삭제에 실패했습니다.')
  } finally {
    isDeletingMember.value = false
  }
}

// ── 상품 관리 ─────────────────────────────────────
const products = ref<AdminProductResponse[]>([])
const isLoadingProducts = ref(false)
const productsError = ref('')
const productKeyword = ref('')
const productStatusFilter = ref('')
const productPage = ref(0)
const productTotalPages = ref(0)
const productTotalElements = ref(0)

const PRODUCT_STATUS_LABELS: Record<AdminProductStatus, string> = {
  ACTIVE: '판매중', SOLD_OUT: '품절', DELETED: '삭제됨',
}
const PRODUCT_STATUS_COLORS: Record<AdminProductStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  SOLD_OUT: 'bg-amber-100 text-amber-700',
  DELETED: 'bg-red-100 text-red-500',
}

async function fetchProducts(page = 0) {
  isLoadingProducts.value = true
  productsError.value = ''
  try {
    const result = await adminApi.getProducts({ keyword: productKeyword.value, status: productStatusFilter.value, page, size: PAGE_SIZE })
    products.value = result.content
    productPage.value = result.number
    productTotalPages.value = result.totalPages
    productTotalElements.value = result.totalElements
  } catch (e: any) {
    productsError.value = e?.response?.data?.message ?? '상품 목록을 불러오지 못했습니다.'
  } finally {
    isLoadingProducts.value = false
  }
}

// 상품 상태 변경 모달
const showProductStatusModal = ref(false)
const selectedProduct = ref<AdminProductResponse | null>(null)
const newProductStatus = ref<AdminProductStatus>('ACTIVE')
const isUpdatingProductStatus = ref(false)

function openProductStatusModal(product: AdminProductResponse) {
  selectedProduct.value = product
  newProductStatus.value = product.status
  showProductStatusModal.value = true
}

async function confirmProductStatusUpdate() {
  if (!selectedProduct.value || isUpdatingProductStatus.value) return
  isUpdatingProductStatus.value = true
  try {
    const updated = await adminApi.updateProductStatus(selectedProduct.value.id, newProductStatus.value)
    const idx = products.value.findIndex(p => p.id === selectedProduct.value!.id)
    if (idx !== -1) products.value[idx] = updated
    showProductStatusModal.value = false
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '상태 변경에 실패했습니다.')
  } finally {
    isUpdatingProductStatus.value = false
  }
}

// 상품 삭제
const showDeleteProductModal = ref(false)
const productToDelete = ref<AdminProductResponse | null>(null)
const isDeletingProduct = ref(false)

function openDeleteProductModal(product: AdminProductResponse) {
  productToDelete.value = product
  showDeleteProductModal.value = true
}

async function confirmDeleteProduct() {
  if (!productToDelete.value || isDeletingProduct.value) return
  isDeletingProduct.value = true
  try {
    await adminApi.deleteProduct(productToDelete.value.id)
    products.value = products.value.filter(p => p.id !== productToDelete.value!.id)
    productTotalElements.value -= 1
    showDeleteProductModal.value = false
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '상품 삭제에 실패했습니다.')
  } finally {
    isDeletingProduct.value = false
  }
}

// ── 경매 관리 ─────────────────────────────────────
const auctions = ref<AdminAuctionResponse[]>([])
const isLoadingAuctions = ref(false)
const auctionsError = ref('')
const auctionStatusFilter = ref('')
const auctionPage = ref(0)
const auctionTotalPages = ref(0)
const auctionTotalElements = ref(0)

const AUCTION_STATUS_LABELS: Record<AdminAuctionStatus, string> = {
  SCHEDULED: '예정', ACTIVE: '진행중', ENDED: '종료', CANCELLED: '취소됨',
}
const AUCTION_STATUS_COLORS: Record<AdminAuctionStatus, string> = {
  SCHEDULED: 'bg-sky-100 text-sky-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  ENDED: 'bg-slate-100 text-slate-500',
  CANCELLED: 'bg-red-100 text-red-500',
}

async function fetchAuctions(page = 0) {
  isLoadingAuctions.value = true
  auctionsError.value = ''
  try {
    const result = await adminApi.getAuctions({ status: auctionStatusFilter.value, page, size: PAGE_SIZE })
    auctions.value = result.content
    auctionPage.value = result.number
    auctionTotalPages.value = result.totalPages
    auctionTotalElements.value = result.totalElements
  } catch (e: any) {
    auctionsError.value = e?.response?.data?.message ?? '경매 목록을 불러오지 못했습니다.'
  } finally {
    isLoadingAuctions.value = false
  }
}

// 경매 강제 취소 모달
const showCancelAuctionModal = ref(false)
const auctionToCancel = ref<AdminAuctionResponse | null>(null)
const isCancellingAuction = ref(false)

function openCancelAuctionModal(auction: AdminAuctionResponse) {
  auctionToCancel.value = auction
  showCancelAuctionModal.value = true
}

async function confirmCancelAuction() {
  if (!auctionToCancel.value || isCancellingAuction.value) return
  isCancellingAuction.value = true
  try {
    const updated = await adminApi.cancelAuction(auctionToCancel.value.id)
    const idx = auctions.value.findIndex(a => a.id === auctionToCancel.value!.id)
    if (idx !== -1) auctions.value[idx] = updated
    showCancelAuctionModal.value = false
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '경매 취소에 실패했습니다.')
  } finally {
    isCancellingAuction.value = false
  }
}

// ── 커뮤니티 관리 ──────────────────────────────────
const posts = ref<AdminPostResponse[]>([])
const isLoadingPosts = ref(false)
const postsError = ref('')
const postKeyword = ref('')
const includeDeleted = ref(false)
const postPage = ref(0)
const postTotalPages = ref(0)
const postTotalElements = ref(0)

async function fetchPosts(page = 0) {
  isLoadingPosts.value = true
  postsError.value = ''
  try {
    const result = await adminApi.getPosts({ keyword: postKeyword.value, includeDeleted: includeDeleted.value, page, size: PAGE_SIZE })
    posts.value = result.content
    postPage.value = result.number
    postTotalPages.value = result.totalPages
    postTotalElements.value = result.totalElements
  } catch (e: any) {
    postsError.value = e?.response?.data?.message ?? '게시글 목록을 불러오지 못했습니다.'
  } finally {
    isLoadingPosts.value = false
  }
}

// 게시글 삭제
const showDeletePostModal = ref(false)
const postToDelete = ref<AdminPostResponse | null>(null)
const isDeletingPost = ref(false)

function openDeletePostModal(post: AdminPostResponse) {
  postToDelete.value = post
  showDeletePostModal.value = true
}

async function confirmDeletePost() {
  if (!postToDelete.value || isDeletingPost.value) return
  isDeletingPost.value = true
  try {
    await adminApi.deletePost(postToDelete.value.id)
    posts.value = posts.value.filter(p => p.id !== postToDelete.value!.id)
    postTotalElements.value -= 1
    showDeletePostModal.value = false
  } catch (e: any) {
    alert(e?.response?.data?.message ?? '게시글 삭제에 실패했습니다.')
  } finally {
    isDeletingPost.value = false
  }
}

// ── 마케팅 푸시 ────────────────────────────────────
const testPushForm = ref({ targetEmail: '', title: '', body: '', imageUrl: '' })
const isSendingTest = ref(false)
const testResult = ref<'idle' | 'success' | 'error'>('idle')
const testResultMsg = ref('')

async function sendTestPush() {
  if (isSendingTest.value) return
  isSendingTest.value = true
  testResult.value = 'idle'
  try {
    await adminApi.sendTestPush({
      targetEmail: testPushForm.value.targetEmail,
      title: testPushForm.value.title,
      body: testPushForm.value.body,
      imageUrl: testPushForm.value.imageUrl || undefined,
    })
    testResult.value = 'success'
    testResultMsg.value = `${testPushForm.value.targetEmail} 으로 테스트 푸시를 발송했습니다.`
  } catch (e: any) {
    testResult.value = 'error'
    testResultMsg.value = e?.response?.data?.message ?? '테스트 발송에 실패했습니다.'
  } finally {
    isSendingTest.value = false
  }
}

const marketingForm = ref({ title: '', body: '', imageUrl: '' })
const isSendingMarketing = ref(false)
const marketingResult = ref<'idle' | 'success' | 'error'>('idle')
const marketingResultMsg = ref('')
const showMarketingConfirm = ref(false)

function openMarketingConfirm() {
  showMarketingConfirm.value = true
}

async function confirmSendMarketing() {
  if (isSendingMarketing.value) return
  isSendingMarketing.value = true
  marketingResult.value = 'idle'
  showMarketingConfirm.value = false
  try {
    await adminApi.sendMarketingPush({
      title: marketingForm.value.title,
      body: marketingForm.value.body,
      imageUrl: marketingForm.value.imageUrl || undefined,
    })
    marketingResult.value = 'success'
    marketingResultMsg.value = '마케팅 푸시를 전체 사용자에게 발송했습니다.'
  } catch (e: any) {
    marketingResult.value = 'error'
    marketingResultMsg.value = e?.response?.data?.message ?? '마케팅 발송에 실패했습니다.'
  } finally {
    isSendingMarketing.value = false
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
  { key: 'push',         icon: Bell,          label: '마케팅 푸시' },
]


function handleTabChange(key: string) {
  activeTab.value = key
  if (key === 'commission' && policies.value.length === 0) fetchPolicies()
  if (key === 'members' && members.value.length === 0) fetchMembers(0)
  if (key === 'products' && products.value.length === 0) fetchProducts(0)
  if (key === 'auctions' && auctions.value.length === 0) fetchAuctions(0)
  if (key === 'community' && posts.value.length === 0) fetchPosts(0)
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

          <!-- ── 회원 관리 탭 ── -->
          <div v-else-if="activeTab === 'members'">
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-2xl font-black text-slate-900">회원 관리</h1>
              <span class="text-sm text-slate-400">총 {{ memberTotalElements.toLocaleString() }}명</span>
            </div>

            <!-- 검색 / 필터 -->
            <div class="flex gap-3 mb-5">
              <div class="relative flex-1">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  v-model="memberKeyword"
                  type="text"
                  placeholder="이름, 이메일, 닉네임 검색"
                  class="w-full pl-9 pr-4 py-2.5 border border-sky-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  @keydown.enter="handleMemberSearch"
                />
              </div>
              <select
                v-model="memberRoleFilter"
                class="border border-sky-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
                @change="handleMemberSearch"
              >
                <option value="">전체 역할</option>
                <option value="BUYER">구매자</option>
                <option value="SELLER">판매자</option>
                <option value="BREEDER">브리더</option>
                <option value="ADMIN">관리자</option>
              </select>
              <button
                @click="handleMemberSearch"
                class="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-xl transition"
              >
                검색
              </button>
            </div>

            <!-- 로딩 -->
            <div v-if="isLoadingMembers" class="flex justify-center py-24">
              <Loader2 class="w-8 h-8 animate-spin text-sky-400" />
            </div>
            <div v-else-if="membersError" class="text-center py-24 text-red-500 text-sm">{{ membersError }}</div>
            <div v-else-if="members.length === 0" class="text-center py-24">
              <Users class="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p class="text-slate-400 text-sm">검색 결과가 없습니다</p>
            </div>

            <!-- 회원 테이블 -->
            <div v-else>
              <div class="bg-white rounded-2xl border border-sky-100 overflow-hidden">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-sky-50 bg-slate-50 text-left">
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">이름 / 닉네임</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">이메일</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">연락처</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">역할</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">가입일</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-sky-50">
                    <tr v-for="member in members" :key="member.id" class="hover:bg-sky-50/40 transition">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                          <img
                            v-if="member.profileImageUrl"
                            :src="member.profileImageUrl"
                            class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                          <div v-else class="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                            <Users class="w-4 h-4 text-sky-400" />
                          </div>
                          <div>
                            <div class="font-semibold text-slate-900">{{ member.name }}</div>
                            <div class="text-xs text-slate-400">@{{ member.nickName }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-slate-600">{{ member.email }}</td>
                      <td class="px-4 py-3 text-slate-500 text-xs">{{ member.phoneNumber || '-' }}</td>
                      <td class="px-4 py-3">
                        <span
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          :class="ROLE_COLORS[member.role]"
                        >{{ ROLE_LABELS[member.role] }}</span>
                      </td>
                      <td class="px-4 py-3 text-slate-400 text-xs">{{ formatDate(member.createdAt) }}</td>
                      <td class="px-4 py-3 text-right">
                        <div class="flex items-center justify-end gap-1">
                          <button
                            @click="openRoleModal(member)"
                            class="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition"
                            title="역할 변경"
                          >
                            <Edit2 class="w-4 h-4" />
                          </button>
                          <button
                            @click="openDeleteMemberModal(member)"
                            class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                            title="삭제"
                          >
                            <Trash2 class="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 페이지네이션 -->
              <div v-if="memberTotalPages > 1" class="flex items-center justify-center gap-2 mt-5">
                <button
                  @click="fetchMembers(memberPage - 1)"
                  :disabled="memberPage === 0"
                  class="p-2 rounded-lg border border-sky-100 text-slate-500 hover:bg-sky-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft class="w-4 h-4" />
                </button>
                <span class="text-sm text-slate-500 px-2">
                  {{ memberPage + 1 }} / {{ memberTotalPages }}
                </span>
                <button
                  @click="fetchMembers(memberPage + 1)"
                  :disabled="memberPage >= memberTotalPages - 1"
                  class="p-2 rounded-lg border border-sky-100 text-slate-500 hover:bg-sky-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- ── 마케팅 푸시 탭 ── -->
          <div v-else-if="activeTab === 'push'">
            <div class="mb-8">
              <h1 class="text-2xl font-black text-slate-900">마케팅 푸시 알림</h1>
              <p class="text-slate-400 text-sm mt-1">웹 푸시 알림을 테스트하거나 전체 사용자에게 발송합니다.</p>
            </div>

            <!-- 테스트 발송 -->
            <div class="bg-white rounded-2xl border border-sky-100 p-6 mb-6">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                  <FlaskConical class="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <h2 class="font-bold text-slate-900">테스트 발송</h2>
                  <p class="text-xs text-slate-400">특정 이메일 계정으로 푸시 알림을 테스트합니다.</p>
                </div>
              </div>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">대상 이메일 <span class="text-red-400">*</span></label>
                  <input v-model="testPushForm.targetEmail" type="email" placeholder="test@example.com"
                    class="w-full border border-sky-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">제목 <span class="text-red-400">*</span></label>
                    <input v-model="testPushForm.title" type="text" placeholder="알림 제목"
                      class="w-full border border-sky-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">이미지 URL <span class="text-slate-300 font-normal">(선택)</span></label>
                    <input v-model="testPushForm.imageUrl" type="text" placeholder="https://..."
                      class="w-full border border-sky-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">내용 <span class="text-red-400">*</span></label>
                  <textarea v-model="testPushForm.body" rows="3" placeholder="푸시 알림 내용을 입력하세요."
                    class="w-full border border-sky-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
                </div>
              </div>
              <div v-if="testResult !== 'idle'" class="mt-4 px-4 py-3 rounded-xl text-sm font-medium"
                :class="testResult === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'">
                {{ testResultMsg }}
              </div>
              <div class="flex justify-end mt-4">
                <button
                  @click="sendTestPush"
                  :disabled="isSendingTest || !testPushForm.targetEmail || !testPushForm.title || !testPushForm.body"
                  class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-full text-sm transition"
                >
                  <Loader2 v-if="isSendingTest" class="w-4 h-4 animate-spin" />
                  <Send v-else class="w-4 h-4" />
                  {{ isSendingTest ? '발송 중...' : '테스트 발송' }}
                </button>
              </div>
            </div>

            <!-- 전체 마케팅 발송 -->
            <div class="bg-white rounded-2xl border border-amber-100 p-6">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Bell class="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 class="font-bold text-slate-900">전체 마케팅 발송</h2>
                  <p class="text-xs text-slate-400">마케팅 알림 수신에 동의한 전체 사용자에게 발송합니다.</p>
                </div>
              </div>
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">제목 <span class="text-red-400">*</span></label>
                    <input v-model="marketingForm.title" type="text" placeholder="알림 제목"
                      class="w-full border border-sky-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-600 mb-1.5">이미지 URL <span class="text-slate-300 font-normal">(선택)</span></label>
                    <input v-model="marketingForm.imageUrl" type="text" placeholder="https://..."
                      class="w-full border border-sky-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">내용 <span class="text-red-400">*</span></label>
                  <textarea v-model="marketingForm.body" rows="3" placeholder="푸시 알림 내용을 입력하세요."
                    class="w-full border border-sky-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none" />
                </div>
              </div>
              <div v-if="marketingResult !== 'idle'" class="mt-4 px-4 py-3 rounded-xl text-sm font-medium"
                :class="marketingResult === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'">
                {{ marketingResultMsg }}
              </div>
              <div class="flex justify-end mt-4">
                <button
                  @click="openMarketingConfirm"
                  :disabled="isSendingMarketing || !marketingForm.title || !marketingForm.body"
                  class="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-full text-sm transition"
                >
                  <Loader2 v-if="isSendingMarketing" class="w-4 h-4 animate-spin" />
                  <Send v-else class="w-4 h-4" />
                  {{ isSendingMarketing ? '발송 중...' : '전체 발송' }}
                </button>
              </div>
            </div>
          </div>

          <!-- ── 상품 관리 탭 ── -->
          <div v-else-if="activeTab === 'products'">
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-2xl font-black text-slate-900">상품 관리</h1>
              <span class="text-sm text-slate-400">총 {{ productTotalElements.toLocaleString() }}개</span>
            </div>
            <div class="flex gap-3 mb-5">
              <div class="relative flex-1">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input v-model="productKeyword" type="text" placeholder="상품명 검색"
                  class="w-full pl-9 pr-4 py-2.5 border border-sky-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  @keydown.enter="fetchProducts(0)" />
              </div>
              <select v-model="productStatusFilter" @change="fetchProducts(0)"
                class="border border-sky-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white">
                <option value="">전체 상태</option>
                <option value="ACTIVE">판매중</option>
                <option value="SOLD_OUT">품절</option>
                <option value="DELETED">삭제됨</option>
              </select>
              <button @click="fetchProducts(0)" class="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-xl transition">검색</button>
            </div>
            <div v-if="isLoadingProducts" class="flex justify-center py-24"><Loader2 class="w-8 h-8 animate-spin text-sky-400" /></div>
            <div v-else-if="productsError" class="text-center py-24 text-red-500 text-sm">{{ productsError }}</div>
            <div v-else-if="products.length === 0" class="text-center py-24">
              <Package class="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p class="text-slate-400 text-sm">검색 결과가 없습니다</p>
            </div>
            <div v-else>
              <div class="bg-white rounded-2xl border border-sky-100 overflow-hidden">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-sky-50 bg-slate-50 text-left">
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">상품명</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">판매자</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">유형</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">가격</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">재고</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">상태</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">등록일</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-sky-50">
                    <tr v-for="product in products" :key="product.id" class="hover:bg-sky-50/40 transition">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                          <img v-if="product.thumbnailUrl" :src="product.thumbnailUrl" class="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          <div v-else class="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                            <Package class="w-4 h-4 text-sky-300" />
                          </div>
                          <span class="font-medium text-slate-800 truncate max-w-[160px]">{{ product.name }}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-slate-500 text-xs">{{ product.sellerNickName }}</td>
                      <td class="px-4 py-3 text-slate-500 text-xs">{{ PRODUCT_TYPE_LABELS[product.productType] ?? product.productType }}</td>
                      <td class="px-4 py-3 text-slate-700 font-medium">{{ product.price.toLocaleString() }}원</td>
                      <td class="px-4 py-3 text-slate-500 text-xs">{{ product.stock }}</td>
                      <td class="px-4 py-3">
                        <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="PRODUCT_STATUS_COLORS[product.status]">
                          {{ PRODUCT_STATUS_LABELS[product.status] }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-slate-400 text-xs">{{ formatDate(product.createdAt) }}</td>
                      <td class="px-4 py-3 text-right">
                        <div class="flex items-center justify-end gap-1">
                          <button @click="openProductStatusModal(product)" class="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition" title="상태 변경">
                            <Edit2 class="w-4 h-4" />
                          </button>
                          <button @click="openDeleteProductModal(product)" class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition" title="강제 삭제">
                            <Trash2 class="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="productTotalPages > 1" class="flex items-center justify-center gap-2 mt-5">
                <button @click="fetchProducts(productPage - 1)" :disabled="productPage === 0" class="p-2 rounded-lg border border-sky-100 text-slate-500 hover:bg-sky-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <ChevronLeft class="w-4 h-4" />
                </button>
                <span class="text-sm text-slate-500 px-2">{{ productPage + 1 }} / {{ productTotalPages }}</span>
                <button @click="fetchProducts(productPage + 1)" :disabled="productPage >= productTotalPages - 1" class="p-2 rounded-lg border border-sky-100 text-slate-500 hover:bg-sky-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- ── 경매 관리 탭 ── -->
          <div v-else-if="activeTab === 'auctions'">
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-2xl font-black text-slate-900">경매 관리</h1>
              <span class="text-sm text-slate-400">총 {{ auctionTotalElements.toLocaleString() }}건</span>
            </div>
            <div class="flex gap-3 mb-5">
              <select v-model="auctionStatusFilter" @change="fetchAuctions(0)"
                class="border border-sky-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white">
                <option value="">전체 상태</option>
                <option value="SCHEDULED">예정</option>
                <option value="ACTIVE">진행중</option>
                <option value="ENDED">종료</option>
                <option value="CANCELLED">취소됨</option>
              </select>
              <button @click="fetchAuctions(0)" class="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-xl transition">조회</button>
            </div>
            <div v-if="isLoadingAuctions" class="flex justify-center py-24"><Loader2 class="w-8 h-8 animate-spin text-sky-400" /></div>
            <div v-else-if="auctionsError" class="text-center py-24 text-red-500 text-sm">{{ auctionsError }}</div>
            <div v-else-if="auctions.length === 0" class="text-center py-24">
              <Gavel class="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p class="text-slate-400 text-sm">검색 결과가 없습니다</p>
            </div>
            <div v-else>
              <div class="bg-white rounded-2xl border border-sky-100 overflow-hidden">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-sky-50 bg-slate-50 text-left">
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">경매품</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">판매자</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">시작가</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">현재가</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">입찰</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">종료일</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">상태</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-sky-50">
                    <tr v-for="auction in auctions" :key="auction.id" class="hover:bg-sky-50/40 transition">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                          <img v-if="auction.imageUrls?.[0]" :src="auction.imageUrls[0]" class="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          <div v-else class="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                            <Gavel class="w-4 h-4 text-sky-300" />
                          </div>
                          <span class="font-medium text-slate-800 truncate max-w-[140px]">{{ auction.productName }}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-slate-500 text-xs">{{ auction.sellerNickName }}</td>
                      <td class="px-4 py-3 text-slate-600 text-xs">{{ auction.startPrice.toLocaleString() }}원</td>
                      <td class="px-4 py-3 font-semibold text-slate-800">{{ auction.currentPrice.toLocaleString() }}원</td>
                      <td class="px-4 py-3 text-slate-500 text-xs">{{ auction.bidCount }}회</td>
                      <td class="px-4 py-3 text-slate-400 text-xs">{{ formatDate(auction.endAt) }}</td>
                      <td class="px-4 py-3">
                        <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="AUCTION_STATUS_COLORS[auction.status]">
                          {{ AUCTION_STATUS_LABELS[auction.status] }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-right">
                        <button
                          v-if="auction.status === 'SCHEDULED' || auction.status === 'ACTIVE'"
                          @click="openCancelAuctionModal(auction)"
                          class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                          title="강제 취소"
                        >
                          <X class="w-4 h-4" />
                        </button>
                        <span v-else class="text-slate-200 text-xs">—</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="auctionTotalPages > 1" class="flex items-center justify-center gap-2 mt-5">
                <button @click="fetchAuctions(auctionPage - 1)" :disabled="auctionPage === 0" class="p-2 rounded-lg border border-sky-100 text-slate-500 hover:bg-sky-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <ChevronLeft class="w-4 h-4" />
                </button>
                <span class="text-sm text-slate-500 px-2">{{ auctionPage + 1 }} / {{ auctionTotalPages }}</span>
                <button @click="fetchAuctions(auctionPage + 1)" :disabled="auctionPage >= auctionTotalPages - 1" class="p-2 rounded-lg border border-sky-100 text-slate-500 hover:bg-sky-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- ── 커뮤니티 관리 탭 ── -->
          <div v-else-if="activeTab === 'community'">
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-2xl font-black text-slate-900">커뮤니티 관리</h1>
              <span class="text-sm text-slate-400">총 {{ postTotalElements.toLocaleString() }}개</span>
            </div>
            <div class="flex gap-3 mb-5">
              <div class="relative flex-1">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input v-model="postKeyword" type="text" placeholder="게시글 제목, 작성자 검색"
                  class="w-full pl-9 pr-4 py-2.5 border border-sky-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  @keydown.enter="fetchPosts(0)" />
              </div>
              <label class="flex items-center gap-2 px-4 border border-sky-100 rounded-xl cursor-pointer select-none text-sm text-slate-600">
                <input type="checkbox" v-model="includeDeleted" @change="fetchPosts(0)" class="w-4 h-4 accent-sky-500" />
                삭제글 포함
              </label>
              <button @click="fetchPosts(0)" class="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-xl transition">검색</button>
            </div>
            <div v-if="isLoadingPosts" class="flex justify-center py-24"><Loader2 class="w-8 h-8 animate-spin text-sky-400" /></div>
            <div v-else-if="postsError" class="text-center py-24 text-red-500 text-sm">{{ postsError }}</div>
            <div v-else-if="posts.length === 0" class="text-center py-24">
              <MessageSquare class="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p class="text-slate-400 text-sm">검색 결과가 없습니다</p>
            </div>
            <div v-else>
              <div class="bg-white rounded-2xl border border-sky-100 overflow-hidden">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-sky-50 bg-slate-50 text-left">
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">제목</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">작성자</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">카테고리</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">조회</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">좋아요</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">댓글</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs">작성일</th>
                      <th class="px-4 py-3 font-semibold text-slate-500 text-xs text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-sky-50">
                    <tr v-for="post in posts" :key="post.id" class="hover:bg-sky-50/40 transition" :class="post.deleted ? 'opacity-50' : ''">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                          <span v-if="post.deleted" class="inline-flex px-1.5 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-500 flex-shrink-0">삭제</span>
                          <span class="font-medium text-slate-800 truncate max-w-[180px]">{{ post.title }}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-slate-500 text-xs">{{ post.authorNickName }}</td>
                      <td class="px-4 py-3 text-slate-500 text-xs">{{ post.categoryName }}</td>
                      <td class="px-4 py-3 text-slate-400 text-xs">{{ post.viewCount }}</td>
                      <td class="px-4 py-3 text-slate-400 text-xs">{{ post.likeCount }}</td>
                      <td class="px-4 py-3 text-slate-400 text-xs">{{ post.commentCount }}</td>
                      <td class="px-4 py-3 text-slate-400 text-xs">{{ formatDate(post.createdAt) }}</td>
                      <td class="px-4 py-3 text-right">
                        <button v-if="!post.deleted" @click="openDeletePostModal(post)"
                          class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition" title="강제 삭제">
                          <Trash2 class="w-4 h-4" />
                        </button>
                        <span v-else class="text-slate-200 text-xs">—</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="postTotalPages > 1" class="flex items-center justify-center gap-2 mt-5">
                <button @click="fetchPosts(postPage - 1)" :disabled="postPage === 0" class="p-2 rounded-lg border border-sky-100 text-slate-500 hover:bg-sky-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <ChevronLeft class="w-4 h-4" />
                </button>
                <span class="text-sm text-slate-500 px-2">{{ postPage + 1 }} / {{ postTotalPages }}</span>
                <button @click="fetchPosts(postPage + 1)" :disabled="postPage >= postTotalPages - 1" class="p-2 rounded-lg border border-sky-100 text-slate-500 hover:bg-sky-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>
            </div>
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

    <!-- Marketing Push Confirm Modal -->
  <Transition name="fade">
    <div v-if="showMarketingConfirm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div class="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6">
        <Bell class="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 class="font-black text-slate-900 text-center text-lg">전체 마케팅 푸시를 발송하시겠습니까?</h2>
        <div class="mt-4 bg-amber-50 rounded-xl px-4 py-3 text-sm text-slate-700 space-y-1">
          <p><span class="text-slate-400 text-xs">제목</span><br />{{ marketingForm.title }}</p>
          <p class="pt-1"><span class="text-slate-400 text-xs">내용</span><br />{{ marketingForm.body }}</p>
        </div>
        <p class="text-xs text-slate-400 text-center mt-3 mb-5">마케팅 알림 수신 동의 사용자 전체에게 발송됩니다.</p>
        <div class="flex gap-3">
          <button @click="showMarketingConfirm = false" class="flex-1 px-4 py-2.5 border border-sky-100 text-slate-600 hover:bg-sky-50 rounded-full text-sm font-semibold transition">취소</button>
          <button @click="confirmSendMarketing" class="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-sm font-bold transition flex items-center justify-center gap-2">
            <Send class="w-4 h-4" /> 발송하기
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Product Status Modal -->
  <Transition name="fade">
    <div v-if="showProductStatusModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div class="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6">
        <Edit2 class="w-10 h-10 text-sky-500 mx-auto mb-4" />
        <h2 class="font-black text-slate-900 text-center text-lg mb-1">상품 상태 변경</h2>
        <p class="text-xs text-slate-400 text-center mb-5 truncate">{{ selectedProduct?.name }}</p>
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">새 상태 선택</label>
          <select v-model="newProductStatus"
            class="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white">
            <option value="ACTIVE">판매중</option>
            <option value="SOLD_OUT">품절</option>
            <option value="DELETED">삭제됨</option>
          </select>
        </div>
        <div class="flex gap-3 mt-5">
          <button @click="showProductStatusModal = false" :disabled="isUpdatingProductStatus" class="flex-1 px-4 py-2.5 border border-sky-100 text-slate-600 hover:bg-sky-50 rounded-full text-sm font-semibold transition disabled:opacity-50">취소</button>
          <button @click="confirmProductStatusUpdate" :disabled="isUpdatingProductStatus || newProductStatus === selectedProduct?.status" class="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full text-sm font-bold transition flex items-center justify-center gap-2">
            <Loader2 v-if="isUpdatingProductStatus" class="w-4 h-4 animate-spin" />
            {{ isUpdatingProductStatus ? '변경 중...' : '변경하기' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Delete Product Modal -->
  <Transition name="fade">
    <div v-if="showDeleteProductModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div class="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6">
        <XCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 class="font-black text-slate-900 text-center text-lg">상품을 강제 삭제하시겠습니까?</h2>
        <p class="text-sm text-slate-500 text-center mt-2 mb-6">
          <span class="font-semibold text-slate-700">{{ productToDelete?.name }}</span><br />
          이 작업은 되돌릴 수 없습니다.
        </p>
        <div class="flex gap-3">
          <button @click="showDeleteProductModal = false" :disabled="isDeletingProduct" class="flex-1 px-4 py-2.5 border border-sky-100 text-slate-600 hover:bg-sky-50 rounded-full text-sm font-semibold transition disabled:opacity-50">취소</button>
          <button @click="confirmDeleteProduct" :disabled="isDeletingProduct" class="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-full text-sm font-bold transition flex items-center justify-center gap-2">
            <Loader2 v-if="isDeletingProduct" class="w-4 h-4 animate-spin" />
            {{ isDeletingProduct ? '삭제 중...' : '삭제하기' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Cancel Auction Modal -->
  <Transition name="fade">
    <div v-if="showCancelAuctionModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div class="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6">
        <XCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 class="font-black text-slate-900 text-center text-lg">경매를 강제 취소하시겠습니까?</h2>
        <p class="text-sm text-slate-500 text-center mt-2 mb-6">
          <span class="font-semibold text-slate-700">{{ auctionToCancel?.productName }}</span><br />
          입찰자에게 영향을 줄 수 있습니다.
        </p>
        <div class="flex gap-3">
          <button @click="showCancelAuctionModal = false" :disabled="isCancellingAuction" class="flex-1 px-4 py-2.5 border border-sky-100 text-slate-600 hover:bg-sky-50 rounded-full text-sm font-semibold transition disabled:opacity-50">취소</button>
          <button @click="confirmCancelAuction" :disabled="isCancellingAuction" class="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-full text-sm font-bold transition flex items-center justify-center gap-2">
            <Loader2 v-if="isCancellingAuction" class="w-4 h-4 animate-spin" />
            {{ isCancellingAuction ? '처리 중...' : '강제 취소' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Delete Post Modal -->
  <Transition name="fade">
    <div v-if="showDeletePostModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div class="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6">
        <XCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 class="font-black text-slate-900 text-center text-lg">게시글을 강제 삭제하시겠습니까?</h2>
        <p class="text-sm text-slate-500 text-center mt-2 mb-6 truncate">
          <span class="font-semibold text-slate-700">{{ postToDelete?.title }}</span>
        </p>
        <div class="flex gap-3">
          <button @click="showDeletePostModal = false" :disabled="isDeletingPost" class="flex-1 px-4 py-2.5 border border-sky-100 text-slate-600 hover:bg-sky-50 rounded-full text-sm font-semibold transition disabled:opacity-50">취소</button>
          <button @click="confirmDeletePost" :disabled="isDeletingPost" class="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-full text-sm font-bold transition flex items-center justify-center gap-2">
            <Loader2 v-if="isDeletingPost" class="w-4 h-4 animate-spin" />
            {{ isDeletingPost ? '삭제 중...' : '삭제하기' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Role Update Modal -->
  <Transition name="fade">
    <div v-if="showRoleModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div class="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6">
        <Edit2 class="w-10 h-10 text-sky-500 mx-auto mb-4" />
        <h2 class="font-black text-slate-900 text-center text-lg mb-1">역할 변경</h2>
        <p class="text-xs text-slate-400 text-center mb-5">
          {{ selectedMember?.name }} ({{ selectedMember?.email }})
        </p>
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">새 역할 선택</label>
          <select
            v-model="newRole"
            class="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
          >
            <option value="BUYER">구매자</option>
            <option value="SELLER">판매자</option>
            <option value="BREEDER">브리더</option>
            <option value="ADMIN">관리자</option>
          </select>
        </div>
        <div class="flex gap-3 mt-5">
          <button @click="showRoleModal = false" :disabled="isUpdatingRole" class="flex-1 px-4 py-2.5 border border-sky-100 text-slate-600 hover:bg-sky-50 rounded-full text-sm font-semibold transition disabled:opacity-50">취소</button>
          <button @click="confirmRoleUpdate" :disabled="isUpdatingRole || newRole === selectedMember?.role" class="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full text-sm font-bold transition flex items-center justify-center gap-2">
            <Loader2 v-if="isUpdatingRole" class="w-4 h-4 animate-spin" />
            {{ isUpdatingRole ? '변경 중...' : '변경하기' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Delete Member Modal -->
  <Transition name="fade">
    <div v-if="showDeleteMemberModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div class="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6">
        <XCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 class="font-black text-slate-900 text-center text-lg">회원을 삭제하시겠습니까?</h2>
        <p class="text-sm text-slate-500 text-center mt-2 mb-6">
          <span class="font-semibold text-slate-700">{{ memberToDelete?.name }}</span> ({{ memberToDelete?.email }})<br />
          삭제된 회원 정보는 복구할 수 없습니다.
        </p>
        <div class="flex gap-3">
          <button @click="showDeleteMemberModal = false" :disabled="isDeletingMember" class="flex-1 px-4 py-2.5 border border-sky-100 text-slate-600 hover:bg-sky-50 rounded-full text-sm font-semibold transition disabled:opacity-50">취소</button>
          <button @click="confirmDeleteMember" :disabled="isDeletingMember" class="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-full text-sm font-bold transition flex items-center justify-center gap-2">
            <Loader2 v-if="isDeletingMember" class="w-4 h-4 animate-spin" />
            {{ isDeletingMember ? '삭제 중...' : '삭제하기' }}
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
