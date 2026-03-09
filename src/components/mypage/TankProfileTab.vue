<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { Fish, Camera, X, Plus, Pencil } from 'lucide-vue-next'

type WaterType = '민물' | '해수' | '기수'
type Mode = 'view' | 'edit'

const hasTank = ref(false)
const mode = ref<Mode>('view')

const tankData = ref({
  name: '거실 수초 수조',
  size: '60cm',
  waterType: '민물' as WaterType,
  creatures: ['네온테트라', '레드 체리 새우', '코리도라스'],
  plants: ['모스', '아마조니아 소일'],
  description: '조용한 자연 수초 어항을 추구합니다',
  photoUrl: null as string | null,
})

// ---- Form draft (used while editing) ----
const draft = ref({ ...tankData.value, creatures: [...tankData.value.creatures], plants: [...tankData.value.plants] })

function openCreate() {
  draft.value = { name: '', size: '60cm', waterType: '민물', creatures: [], plants: [], description: '', photoUrl: null }
  mode.value = 'edit'
}

function openEdit() {
  draft.value = { ...tankData.value, creatures: [...tankData.value.creatures], plants: [...tankData.value.plants] }
  mode.value = 'edit'
}

function cancelEdit() {
  mode.value = 'view'
}

function save() {
  tankData.value = { ...draft.value, creatures: [...draft.value.creatures], plants: [...draft.value.plants] }
  hasTank.value = true
  mode.value = 'view'
}

// ---- Water type toggle ----
const waterTypes: WaterType[] = ['민물', '해수', '기수']

// ---- Tag input helpers ----
const creatureInput = ref('')
const plantInput = ref('')

function addTag(list: string[], inputRef: { value: string }) {
  const val = inputRef.value.trim()
  if (val && !list.includes(val)) list.push(val)
  inputRef.value = ''
}

function removeTag(list: string[], idx: number) {
  list.splice(idx, 1)
}

function onCreatureKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); addTag(draft.value.creatures, creatureInput) }
}
function onPlantKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); addTag(draft.value.plants, plantInput) }
}

// ---- Photo upload ----
const fileInputRef = ref<HTMLInputElement | null>(null)
let blobUrl: string | null = null

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (blobUrl) URL.revokeObjectURL(blobUrl)
  blobUrl = URL.createObjectURL(file)
  draft.value.photoUrl = blobUrl
}

function removePhoto() {
  if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null }
  draft.value.photoUrl = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

onUnmounted(() => {
  if (blobUrl) URL.revokeObjectURL(blobUrl)
})

// ---- Description char count ----
const descMax = 100
const descCount = computed(() => draft.value.description.length)
</script>

<template>
  <div>
    <!-- ===== EMPTY STATE ===== -->
    <template v-if="!hasTank && mode === 'view'">
      <h1 class="text-3xl font-black text-slate-900 mb-6">내 수조 프로필</h1>
      <div class="flex flex-col items-center justify-center py-20">
        <Fish class="w-16 h-16 text-slate-200 mb-4" />
        <p class="text-slate-400 text-base mb-6">아직 등록된 수조가 없어요</p>
        <button
            @click="openCreate"
            class="bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full px-8 py-3 transition-colors duration-150 cursor-pointer"
        >
          수조 프로필 만들기
        </button>
      </div>
    </template>

    <!-- ===== VIEW MODE ===== -->
    <template v-else-if="hasTank && mode === 'view'">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-black text-slate-900 leading-tight">{{ tankData.name }}</h1>
          <p class="text-slate-500 text-sm mt-1">{{ tankData.size }} · {{ tankData.waterType }}</p>
        </div>
        <button
            @click="openEdit"
            class="flex items-center gap-1.5 text-sm text-sky-500 hover:underline cursor-pointer"
        >
          <Pencil class="w-4 h-4" />
          편집
        </button>
      </div>

      <div class="bg-sky-50 rounded-2xl p-6 border border-sky-100 space-y-6">
        <!-- 기본 정보 -->
        <section>
          <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">기본 정보</h2>
          <div class="space-y-2">
            <div class="flex items-center gap-4">
              <span class="text-sm text-slate-400 w-20 flex-shrink-0">수조 이름</span>
              <span class="text-sm font-medium text-slate-800">{{ tankData.name }}</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-slate-400 w-20 flex-shrink-0">수조 크기</span>
              <span class="text-sm font-medium text-slate-800">{{ tankData.size }}</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-slate-400 w-20 flex-shrink-0">수질 타입</span>
              <span class="text-sm font-medium text-slate-800">{{ tankData.waterType }}</span>
            </div>
          </div>
        </section>

        <!-- 키우는 생물 -->
        <section>
          <span class="text-sm text-slate-500 block mb-2">키우는 물고기 / 새우</span>
          <div class="flex flex-wrap gap-2">
            <span
                v-for="c in tankData.creatures"
                :key="c"
                class="rounded-full bg-white border border-sky-100 text-slate-600 px-3 py-1 text-sm"
            >{{ c }}</span>
            <span v-if="!tankData.creatures.length" class="text-sm text-slate-300">없음</span>
          </div>
        </section>

        <!-- 수초 / 레이아웃 스타일 -->
        <section>
          <span class="text-sm text-slate-500 block mb-2">수초 / 레이아웃 스타일</span>
          <div class="flex flex-wrap gap-2">
            <span
                v-for="p in tankData.plants"
                :key="p"
                class="rounded-full bg-white border border-sky-100 text-slate-600 px-3 py-1 text-sm"
            >{{ p }}</span>
            <span v-if="!tankData.plants.length" class="text-sm text-slate-300">없음</span>
          </div>
        </section>

        <!-- 레이아웃 사진 -->
        <section>
          <span class="text-sm text-slate-500 block mb-2">레이아웃 사진</span>
          <div v-if="tankData.photoUrl">
            <img :src="tankData.photoUrl" alt="수조 레이아웃" class="rounded-xl object-cover w-full max-h-48" />
          </div>
          <div v-else class="border-2 border-dashed border-sky-200 rounded-xl p-8 text-center">
            <p class="text-slate-300 text-sm">수조 사진 없음</p>
          </div>
        </section>

        <!-- 한줄 소개 -->
        <section v-if="tankData.description">
          <span class="text-sm text-slate-500 block mb-1">한줄 소개</span>
          <p class="text-slate-600 text-sm italic">{{ tankData.description }}</p>
        </section>
      </div>
    </template>

    <!-- ===== EDIT / CREATE FORM ===== -->
    <template v-else>
      <h1 class="text-3xl font-black text-slate-900 mb-6">
        {{ hasTank ? '수조 프로필 편집' : '수조 프로필 만들기' }}
      </h1>

      <div class="space-y-6">
        <!-- 수조 이름 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">
            수조 이름 <span class="text-sky-500">*</span>
          </label>
          <input
              v-model="draft.name"
              type="text"
              placeholder="예: 거실 수초 수조"
              maxlength="30"
              class="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
          />
        </div>

        <!-- 수조 크기 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">수조 크기</label>
          <select
              v-model="draft.size"
              class="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all cursor-pointer"
          >
            <option>30cm 미만</option>
            <option>30cm</option>
            <option>45cm</option>
            <option>60cm</option>
            <option>90cm</option>
            <option>120cm 이상</option>
          </select>
        </div>

        <!-- 수질 타입 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">수질 타입</label>
          <div class="flex gap-2">
            <button
                v-for="wt in waterTypes"
                :key="wt"
                @click="draft.waterType = wt"
                class="rounded-full px-5 py-2 text-sm font-medium transition-all duration-150 cursor-pointer"
                :class="draft.waterType === wt
                ? 'bg-sky-500 text-white'
                : 'bg-sky-50 text-slate-600 border border-sky-100 hover:border-sky-300'"
            >
              {{ wt }}
            </button>
          </div>
        </div>

        <!-- 키우는 생물 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">키우는 생물</label>
          <div class="flex gap-2 mb-2">
            <input
                v-model="creatureInput"
                @keydown="onCreatureKeydown"
                type="text"
                placeholder="예: 네온테트라, 레드 체리 새우"
                class="flex-1 border border-sky-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
            />
            <button
                @click="addTag(draft.creatures, creatureInput)"
                class="w-10 h-10 flex items-center justify-center rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-colors cursor-pointer flex-shrink-0"
            >
              <Plus class="w-5 h-5" />
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
                v-for="(c, i) in draft.creatures"
                :key="c"
                class="flex items-center gap-1 rounded-full bg-sky-50 border border-sky-100 text-slate-600 px-3 py-1 text-sm"
            >
              {{ c }}
              <button @click="removeTag(draft.creatures, i)" class="text-slate-400 hover:text-red-400 cursor-pointer">
                <X class="w-3 h-3" />
              </button>
            </span>
          </div>
        </div>

        <!-- 수초 / 레이아웃 스타일 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">수초 / 레이아웃 스타일</label>
          <div class="flex gap-2 mb-2">
            <input
                v-model="plantInput"
                @keydown="onPlantKeydown"
                type="text"
                placeholder="예: 모스, 아마조니아"
                class="flex-1 border border-sky-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
            />
            <button
                @click="addTag(draft.plants, plantInput)"
                class="w-10 h-10 flex items-center justify-center rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-colors cursor-pointer flex-shrink-0"
            >
              <Plus class="w-5 h-5" />
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
                v-for="(p, i) in draft.plants"
                :key="p"
                class="flex items-center gap-1 rounded-full bg-sky-50 border border-sky-100 text-slate-600 px-3 py-1 text-sm"
            >
              {{ p }}
              <button @click="removeTag(draft.plants, i)" class="text-slate-400 hover:text-red-400 cursor-pointer">
                <X class="w-3 h-3" />
              </button>
            </span>
          </div>
        </div>

        <!-- 레이아웃 사진 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">레이아웃 사진 (선택)</label>

          <!-- Preview -->
          <div v-if="draft.photoUrl" class="relative mb-2 inline-block">
            <img :src="draft.photoUrl" alt="미리보기" class="rounded-xl object-cover w-full max-h-48" />
            <button
                @click="removePhoto"
                class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Upload area -->
          <div
              v-else
              @click="triggerFileInput"
              class="border-2 border-dashed border-sky-200 rounded-xl p-8 text-center cursor-pointer hover:border-sky-400 transition-colors duration-150"
          >
            <Camera class="w-8 h-8 text-sky-300 mx-auto mb-2" />
            <p class="text-sm text-slate-400">사진 업로드 (선택)</p>
          </div>

          <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileChange"
          />
        </div>

        <!-- 한줄 소개 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">한줄 소개 (선택)</label>
          <div class="relative">
            <textarea
                v-model="draft.description"
                rows="3"
                :maxlength="descMax"
                placeholder="수조에 대해 한 줄로 소개해보세요"
                class="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all resize-none"
            />
            <span class="absolute bottom-3 right-3 text-xs text-slate-300">{{ descCount }}/{{ descMax }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-2">
          <button
              @click="cancelEdit"
              class="flex-1 border border-sky-100 text-slate-600 hover:bg-sky-50 font-semibold rounded-full px-6 py-3 text-sm transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
              @click="save"
              :disabled="!draft.name.trim()"
              class="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-200 disabled:cursor-not-allowed text-white font-semibold rounded-full px-6 py-3 text-sm transition-colors cursor-pointer"
          >
            저장하기
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
