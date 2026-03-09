<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, Camera, Plus, X, Gavel, AlertTriangle, Check, ChevronRight, ChevronLeft
} from 'lucide-vue-next'

const router = useRouter()

const currentStep = ref(1)

const form = reactive({
  images: [] as string[],
  productType: '',
  name: '',
  description: '',
  species: '',
  waterType: '',
  difficulty: '',
  minimumTankSize: null as number | null,
  startPrice: null as number | null,
  buyNowEnabled: false,
  buyNowPrice: null as number | null,
  startAt: '',
  endAt: '',
})

const agreements = ref([false, false, false])
const allAgreed = computed(() => agreements.value.every(Boolean))

const showBioFields = computed(() =>
    ['FISH', 'INVERTEBRATE', 'PLANT'].includes(form.productType)
)

const productTypes = [
  { key: 'FISH', label: '어류', emoji: '🐠' },
  { key: 'INVERTEBRATE', label: '새우/갑각류', emoji: '🦐' },
  { key: 'PLANT', label: '수초', emoji: '🌿' },
  { key: 'EQUIPMENT', label: '용품', emoji: '🔧' },
  { key: 'ACCESSORY', label: '소품', emoji: '🪨' },
]

const typeLabelMap: Record<string, string> = {
  FISH: '어류', INVERTEBRATE: '새우/갑각류', PLANT: '수초', EQUIPMENT: '용품', ACCESSORY: '소품'
}

// Step 1 validation
const step1Valid = computed(() =>
    form.productType !== '' && form.name.trim() !== '' && form.description.trim() !== ''
)

// Step 2 validation
const step2Valid = computed(() =>
    form.startPrice !== null && form.startPrice > 0 && form.startAt !== '' && form.endAt !== ''
)

const stepErrors = ref('')

const goNext = () => {
  stepErrors.value = ''
  if (currentStep.value === 1 && !step1Valid.value) {
    stepErrors.value = '상품 유형, 상품명, 상품 설명을 모두 입력해주세요.'
    return
  }
  if (currentStep.value === 2 && !step2Valid.value) {
    stepErrors.value = '시작가, 경매 시작/종료 일시를 모두 입력해주세요.'
    return
  }
  if (currentStep.value < 3) currentStep.value++
}

const goBack = () => {
  if (currentStep.value > 1) currentStep.value--
  else router.push('/mypage/seller')
}

const submit = () => {
  if (!allAgreed.value) return
  router.push('/mypage/seller')
}

// Image upload simulation
const addImage = () => {
  if (form.images.length < 5) {
    form.images.push(`img-${Date.now()}`)
  }
}

const removeImage = (idx: number) => {
  form.images.splice(idx, 1)
}

// Quick time presets
const setStartPreset = (preset: string) => {
  const now = new Date()
  if (preset === '1h') now.setHours(now.getHours() + 1)
  else if (preset === 'tonight') { now.setHours(20, 0, 0, 0) }
  else if (preset === 'tomorrow') { now.setDate(now.getDate() + 1); now.setHours(10, 0, 0, 0) }
  form.startAt = now.toISOString().slice(0, 16)
  form.endAt = ''
}

const setDuration = (hours: number) => {
  if (!form.startAt) return
  const start = new Date(form.startAt)
  start.setHours(start.getHours() + hours)
  form.endAt = start.toISOString().slice(0, 16)
}

const formatPrice = (p: number | null) => p ? '₩' + p.toLocaleString() : '-'
const formatDate = (d: string) => d ? new Date(d).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'
const durationText = computed(() => {
  if (!form.startAt || !form.endAt) return '-'
  const ms = new Date(form.endAt).getTime() - new Date(form.startAt).getTime()
  const h = Math.round(ms / 3600000)
  if (h >= 168) return `${Math.round(h / 24)}일`
  if (h >= 24) return `${Math.round(h / 24)}일`
  return `${h}시간`
})

const stepLabels = ['상품 정보', '경매 설정', '확인 및 등록']
</script>

<template>
  <main class="min-h-screen bg-slate-50 pt-20 pb-20">
    <div class="max-w-3xl mx-auto px-6 py-12">

      <!-- Header -->
      <div class="mb-8">
        <button @click="goBack" class="flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-colors mb-4">
          <ArrowLeft class="w-4 h-4" />
          <span class="text-sm">뒤로가기</span>
        </button>
        <h1 class="text-2xl font-black text-slate-900 mb-2">경매 등록</h1>
        <p class="text-sm text-slate-400">경매를 통해 희귀 개체를 합리적인 가격에 판매하세요</p>
      </div>

      <!-- Step Indicator -->
      <div class="mb-10">
        <div class="flex items-center gap-0">
          <template v-for="(label, i) in stepLabels" :key="i">
            <div class="flex flex-col items-center">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                   :class="currentStep === i + 1
                  ? 'bg-sky-500 text-white'
                  : currentStep > i + 1
                    ? 'bg-sky-100 text-sky-600 font-bold'
                    : 'bg-slate-100 text-slate-400'">
                <Check v-if="currentStep > i + 1" class="w-4 h-4" />
                <span v-else>{{ i + 1 }}</span>
              </div>
              <span class="text-xs mt-1 text-center"
                    :class="currentStep === i + 1 ? 'text-sky-600 font-semibold' : 'text-slate-400'">
                {{ label }}
              </span>
            </div>
            <div v-if="i < stepLabels.length - 1"
                 class="flex-1 h-0.5 mb-4 mx-1 transition-colors"
                 :class="currentStep > i + 1 ? 'bg-sky-500' : 'bg-sky-100'" />
          </template>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="stepErrors" class="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
        {{ stepErrors }}
      </div>

      <!-- STEP 1: 상품 정보 -->
      <div v-if="currentStep === 1">
        <div class="bg-white rounded-2xl border border-sky-100 p-6 space-y-6">

          <!-- 이미지 업로드 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">상품 이미지</label>
            <p class="text-xs text-slate-400 mb-3">최대 5장, 첫 번째 이미지가 대표 이미지로 사용됩니다</p>
            <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
              <!-- Uploaded images -->
              <div v-for="(img, idx) in form.images" :key="img"
                   class="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center">
                <span class="text-2xl">🐠</span>
                <span v-if="idx === 0" class="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-sky-500/80 text-white py-0.5">대표</span>
                <button @click="removeImage(idx)"
                        class="absolute top-1 right-1 w-5 h-5 bg-slate-800/60 rounded-full flex items-center justify-center text-white">
                  <X class="w-3 h-3" />
                </button>
              </div>
              <!-- Add slot -->
              <button v-if="form.images.length < 5" @click="addImage"
                      class="aspect-square border-2 border-dashed border-sky-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-sky-50 transition-colors">
                <Camera v-if="form.images.length === 0" class="w-6 h-6 text-sky-400 mb-1" />
                <Plus v-else class="w-5 h-5 text-sky-400" />
                <span v-if="form.images.length === 0" class="text-xs text-sky-400">대표 이미지</span>
              </button>
            </div>
          </div>

          <!-- 상품 유형 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              상품 유형 <span class="text-red-400 ml-0.5">*</span>
            </label>
            <div class="flex flex-wrap gap-2">
              <button v-for="type in productTypes" :key="type.key"
                      @click="form.productType = type.key"
                      class="px-4 py-2 text-sm rounded-xl transition-colors"
                      :class="form.productType === type.key
                  ? 'bg-sky-500 text-white font-medium'
                  : 'bg-sky-50 text-slate-600 border border-sky-100 hover:bg-sky-100'">
                {{ type.emoji }} {{ type.label }}
              </button>
            </div>
          </div>

          <!-- 상품명 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              상품명 <span class="text-red-400 ml-0.5">*</span>
            </label>
            <input v-model="form.name" type="text" maxlength="100"
                   placeholder="경매 상품명을 입력하세요"
                   class="w-full border border-sky-100 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
          </div>

          <!-- 상품 설명 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              상품 설명 <span class="text-red-400 ml-0.5">*</span>
            </label>
            <textarea v-model="form.description"
                      placeholder="개체 특징, 크기, 사육 기간, 건강 상태 등을 자세히 입력해주세요"
                      class="w-full border border-sky-100 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none min-h-[160px]" />
          </div>

          <!-- 생물 정보 (FISH / INVERTEBRATE / PLANT only) -->
          <div v-if="showBioFields">
            <label class="block text-sm font-semibold text-slate-700 mb-3">생물 정보</label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-slate-500 mb-1.5">어종/품종명</label>
                <input v-model="form.species" type="text" placeholder="예: 크리스탈 레드 쉬림프"
                       class="w-full border border-sky-100 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-1.5">수질</label>
                <select v-model="form.waterType"
                        class="w-full border border-sky-100 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white">
                  <option value="">선택</option>
                  <option value="FRESHWATER">담수</option>
                  <option value="SALTWATER">해수</option>
                  <option value="BRACKISH">기수</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-1.5">난이도</label>
                <select v-model="form.difficulty"
                        class="w-full border border-sky-100 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white">
                  <option value="">선택</option>
                  <option value="BEGINNER">입문</option>
                  <option value="INTERMEDIATE">중급</option>
                  <option value="ADVANCED">고급</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-1.5">최소 수조 크기</label>
                <div class="relative">
                  <input v-model.number="form.minimumTankSize" type="number"
                         class="w-full border border-sky-100 rounded-xl px-4 py-3 pr-8 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">L</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 2: 경매 설정 -->
      <div v-if="currentStep === 2">
        <div class="bg-white rounded-2xl border border-sky-100 p-6 space-y-6">

          <!-- 시작가 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              시작가 <span class="text-red-400 ml-0.5">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₩</span>
              <input v-model.number="form.startPrice" type="number" step="1000" min="1000"
                     class="w-full border border-sky-100 rounded-xl pl-8 pr-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
            </div>
            <p class="text-xs text-slate-400 mt-1">₩1,000 단위로 입력해주세요</p>
          </div>

          <!-- 즉시구매가 -->
          <div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-slate-700">즉시구매가 <span class="text-xs font-normal text-slate-400 ml-1">(선택)</span></p>
                <p class="text-xs text-slate-400 mt-0.5">즉시구매가를 설정하면 입찰자가 바로 낙찰받을 수 있습니다</p>
              </div>
              <button @click="form.buyNowEnabled = !form.buyNowEnabled"
                      class="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
                      :class="form.buyNowEnabled ? 'bg-sky-500' : 'bg-slate-200'">
                <span class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                      :class="form.buyNowEnabled ? 'translate-x-5' : 'translate-x-0.5'" />
              </button>
            </div>
            <div v-if="form.buyNowEnabled" class="mt-3 relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₩</span>
              <input v-model.number="form.buyNowPrice" type="number" step="1000"
                     placeholder="즉시구매가 입력"
                     class="w-full border border-sky-100 rounded-xl pl-8 pr-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
            </div>
          </div>

          <!-- 경매 시작 일시 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              경매 시작 <span class="text-red-400 ml-0.5">*</span>
            </label>
            <input v-model="form.startAt" type="datetime-local"
                   class="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400" />
            <div class="flex gap-2 mt-2">
              <button @click="setStartPreset('1h')"
                      class="bg-sky-50 text-sky-600 border border-sky-100 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-sky-100 cursor-pointer transition-colors">
                1시간 후
              </button>
              <button @click="setStartPreset('tonight')"
                      class="bg-sky-50 text-sky-600 border border-sky-100 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-sky-100 cursor-pointer transition-colors">
                오늘 저녁 8시
              </button>
              <button @click="setStartPreset('tomorrow')"
                      class="bg-sky-50 text-sky-600 border border-sky-100 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-sky-100 cursor-pointer transition-colors">
                내일 오전 10시
              </button>
            </div>
          </div>

          <!-- 경매 종료 일시 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              경매 종료 <span class="text-red-400 ml-0.5">*</span>
            </label>
            <input v-model="form.endAt" type="datetime-local"
                   class="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400" />
            <div class="flex gap-2 mt-2">
              <button v-for="d in [{ label: '24시간', h: 24 }, { label: '48시간', h: 48 }, { label: '72시간', h: 72 }, { label: '1주일', h: 168 }]"
                      :key="d.h" @click="setDuration(d.h)"
                      class="bg-sky-50 text-sky-600 border border-sky-100 rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-sky-100 cursor-pointer transition-colors">
                {{ d.label }}
              </button>
            </div>
          </div>

          <!-- 유의사항 -->
          <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700 space-y-1">
            <p class="flex items-center gap-1 font-semibold mb-2">
              <AlertTriangle class="w-4 h-4 text-amber-500 flex-shrink-0" />
              유의사항
            </p>
            <p>· 경매 시작 후에는 취소할 수 없습니다</p>
            <p>· 입찰이 발생한 경우 시작가, 종료 시간 변경 불가</p>
            <p>· 낙찰 후 3일 이내 결제가 이루어지지 않으면 차순위 낙찰됩니다</p>
          </div>
        </div>
      </div>

      <!-- STEP 3: 확인 및 등록 -->
      <div v-if="currentStep === 3">
        <!-- Preview card -->
        <div class="bg-sky-50 rounded-2xl border border-sky-100 p-6 mb-4">
          <div class="flex gap-5">
            <div class="w-32 aspect-square rounded-xl bg-gradient-to-br from-sky-100 to-teal-200 flex items-center justify-center text-4xl flex-shrink-0">
              🐠
            </div>
            <div class="flex-1 min-w-0">
              <span v-if="form.productType" class="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 inline-block mb-2">
                {{ typeLabelMap[form.productType] ?? form.productType }}
              </span>
              <p class="font-black text-slate-900 text-lg leading-snug mb-1">{{ form.name || '상품명 미입력' }}</p>
              <p class="text-slate-500 text-sm line-clamp-2">{{ form.description || '설명 미입력' }}</p>
            </div>
          </div>
        </div>

        <!-- 경매 정보 요약 -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div v-for="item in [
            { label: '시작가', value: formatPrice(form.startPrice) },
            { label: '즉시구매가', value: form.buyNowEnabled ? formatPrice(form.buyNowPrice) : '-' },
            { label: '시작 일시', value: formatDate(form.startAt) },
            { label: '종료 일시', value: formatDate(form.endAt) },
            { label: '경매 기간', value: durationText },
          ]" :key="item.label"
               class="bg-white rounded-xl p-3 text-center border border-sky-100">
            <p class="text-xs text-slate-400 mb-1">{{ item.label }}</p>
            <p class="font-black text-slate-800 text-sm">{{ item.value }}</p>
          </div>
        </div>

        <!-- 최종 확인 체크박스 -->
        <div class="bg-white rounded-2xl border border-sky-100 p-6 space-y-4">
          <p class="text-sm font-semibold text-slate-700 mb-2">최종 확인</p>
          <label v-for="(text, idx) in [
            '경매 진행 중 취소 및 가격 변경이 불가함을 확인했습니다',
            '낙찰 후 3일 이내 배송할 수 있습니다',
            '생물의 경우 생착 보증 정책에 동의합니다',
          ]" :key="idx"
                 class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="agreements[idx]"
                   class="w-5 h-5 rounded border-sky-200 accent-sky-500 cursor-pointer" />
            <span class="text-sm text-slate-600">{{ text }}</span>
          </label>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <div class="flex items-center justify-between mt-8 pt-6 border-t border-sky-50">
        <button v-if="currentStep > 1" @click="goBack"
                class="flex items-center gap-2 border border-sky-200 text-sky-500 hover:bg-sky-50 rounded-full px-6 py-3 font-semibold transition-colors">
          <ChevronLeft class="w-4 h-4" />
          이전
        </button>
        <div v-else />

        <button v-if="currentStep < 3" @click="goNext"
                class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full px-8 py-3 font-bold transition-colors">
          다음
          <ChevronRight class="w-4 h-4" />
        </button>

        <button v-else @click="submit"
                :disabled="!allAgreed"
                class="flex items-center gap-2 rounded-full px-8 py-3 font-bold transition-colors"
                :class="allAgreed
            ? 'bg-sky-500 hover:bg-sky-600 text-white'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'">
          <Gavel class="w-4 h-4" />
          경매 등록하기
        </button>
      </div>

    </div>
  </main>
</template>
