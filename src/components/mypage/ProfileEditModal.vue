<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { X, Loader2, Camera } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  user: {
    nickname: string
    initial: string
    memberType: 'buyer' | 'seller' | 'breeder'
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', updated: { nickname: string }): void
}>()

const nickname = ref(props.user.nickname)
const isSaving = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)

// Sync nickname when modal opens
watch(
    () => props.modelValue,
    (open) => {
      if (open) {
        nickname.value = props.user.nickname
        previewUrl.value = null
      }
    }
)

// Computed helpers
const nicknameError = ref('')
const isValid = () => {
  if (nickname.value.trim().length < 2) return false
  return true
}

function validate() {
  if (nickname.value.trim().length === 0) {
    nicknameError.value = '닉네임을 입력해주세요'
    return false
  }
  if (nickname.value.trim().length < 2) {
    nicknameError.value = '닉네임은 최소 2자 이상이어야 합니다'
    return false
  }
  nicknameError.value = ''
  return true
}

function close() {
  emit('update:modelValue', false)
}

function save() {
  if (!validate()) return
  isSaving.value = true
  setTimeout(() => {
    isSaving.value = false
    emit('saved', { nickname: nickname.value.trim() })
    close()
  }, 1000)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) close()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

const memberTypeMap = {
  buyer:   { label: '일반 구매자',   class: 'bg-sky-100 text-sky-600' },
  seller:  { label: '수족관 운영자', class: 'bg-amber-100 text-amber-600' },
  breeder: { label: '홈 브리더',     class: 'bg-emerald-100 text-emerald-600' },
}
</script>

<template>
  <Transition name="modal">
    <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
        @click.self="close"
    >
      <div class="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md mx-4">

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-black text-slate-900">프로필 편집</h2>
          <button
              @click="close"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sky-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="닫기"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Avatar -->
        <div class="flex flex-col items-center mb-6">
          <div
              class="w-20 h-20 rounded-full bg-gradient-to-br from-sky-300 to-teal-400 flex items-center justify-center text-white text-3xl font-black overflow-hidden"
          >
            <img v-if="previewUrl" :src="previewUrl" alt="프로필 사진 미리보기" class="w-full h-full object-cover" />
            <span v-else>{{ user.initial }}</span>
          </div>
          <button
              type="button"
              @click="fileInputRef?.click()"
              class="flex items-center gap-1 text-sky-500 text-sm hover:underline mt-2 cursor-pointer"
          >
            <Camera class="w-3.5 h-3.5" />
            사진 변경
          </button>
          <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileChange"
          />
        </div>

        <!-- Nickname Field -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">닉네임</label>
          <input
              v-model="nickname"
              type="text"
              maxlength="20"
              @input="validate"
              class="border border-sky-100 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-sky-400 focus:outline-none transition-all text-slate-900 placeholder-slate-400"
              :class="nicknameError ? 'border-red-300 focus:ring-red-300' : ''"
              placeholder="닉네임을 입력하세요"
          />
          <div class="flex items-center justify-between mt-1">
            <p v-if="nicknameError" class="text-red-500 text-xs">{{ nicknameError }}</p>
            <span v-else class="flex-1" />
            <span class="text-xs text-slate-400">{{ nickname.length }}/20</span>
          </div>
        </div>

        <!-- Member Type (readonly) -->
        <div class="mb-8">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">회원 유형</label>
          <div class="border border-sky-100 rounded-xl px-4 py-3 bg-slate-50">
            <span
                :class="['rounded-full text-xs px-3 py-1 inline-block font-medium', memberTypeMap[user.memberType].class]"
            >
              {{ memberTypeMap[user.memberType].label }}
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1.5">회원 유형 변경은 판매자 신청을 통해 가능합니다</p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
              type="button"
              @click="close"
              class="flex-1 border border-sky-100 text-slate-600 rounded-full py-3 hover:bg-sky-50 transition-colors font-medium cursor-pointer"
          >
            취소
          </button>
          <button
              type="button"
              @click="save"
              :disabled="isSaving || !isValid()"
              class="flex-1 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-full py-3 transition-colors cursor-pointer"
          >
            <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
            <span>{{ isSaving ? '저장 중...' : '저장하기' }}</span>
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
  opacity: 0;
}
</style>
