<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { useDebouncedFn } from '../../composables/useDebounce'

interface AutocompleteItem {
  keyword: string
  count?: number
}

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', keyword: string): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const autocompleteList = ref<AutocompleteItem[]>([])
const popularKeywords = ref<string[]>([])
const showAutocomplete = ref(false)
const isLoadingAutocomplete = ref(false)

const fetchAutocomplete = async (keyword: string) => {
  if (!keyword.trim()) {
    autocompleteList.value = []
    return
  }

  isLoadingAutocomplete.value = true
  try {
    const response = await fetch(`/api/search/autocomplete?keyword=${encodeURIComponent(keyword)}`)
    if (response.ok) {
      const json = await response.json()
      const names: string[] = json.data ?? json
      autocompleteList.value = names.map(name => ({ keyword: name }))
    }
  } catch (error) {
    console.error('Autocomplete error:', error)
    autocompleteList.value = []
  } finally {
    isLoadingAutocomplete.value = false
  }
}

const debouncedFetchAutocomplete = useDebouncedFn(fetchAutocomplete, 300)

const fetchPopularKeywords = async () => {
  try {
    const response = await fetch('/api/search/popular')
    if (response.ok) {
      const json = await response.json()
      popularKeywords.value = json.data ?? json
    }
  } catch (error) {
    console.error('Popular keywords error:', error)
    popularKeywords.value = ['베타', '구피', '코리도라스', '수초', 'LED조명', '여과기']
  }
}

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
  debouncedFetchAutocomplete(value)
}

const handleClear = () => {
  emit('update:modelValue', '')
  autocompleteList.value = []
  inputRef.value?.focus()
}

const handleSearch = () => {
  showAutocomplete.value = false
  emit('search', props.modelValue)
}

const handleAutocompleteClick = (keyword: string) => {
  emit('update:modelValue', keyword)
  showAutocomplete.value = false
  emit('search', keyword)
}

const handlePopularClick = (keyword: string) => {
  emit('update:modelValue', keyword)
  emit('search', keyword)
}

const handleFocus = () => {
  showAutocomplete.value = true
}

const handleBlur = () => {
  setTimeout(() => {
    showAutocomplete.value = false
  }, 150)
}

const highlightMatch = (text: string, keyword: string): string => {
  if (!text) return ''
  if (!keyword) return text
  try {
    const regex = new RegExp(`(${keyword})`, 'gi')
    return text.replace(regex, '<span class="font-bold text-sky-600">$1</span>')
  } catch {
    return text
  }
}

watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    autocompleteList.value = []
  }
})

onMounted(() => {
  fetchPopularKeywords()
})
</script>

<template>
  <div class="sticky top-16 z-40 bg-white border-b border-sky-100 py-4">
    <div class="max-w-3xl mx-auto px-4">
      <!-- Search Input -->
      <div class="relative">
        <div class="relative">
          <Search class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-400" />
          <input
            ref="inputRef"
            type="text"
            :value="modelValue"
            @input="handleInput"
            @keydown.enter="handleSearch"
            @focus="handleFocus"
            @blur="handleBlur"
            placeholder="어종명, 판매자, 태그로 검색해보세요"
            class="w-full rounded-full border-2 border-sky-200 focus:border-sky-400 focus:outline-none px-14 py-4 text-lg transition-colors"
          />
          <button
            v-show="modelValue"
            @click="handleClear"
            class="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X class="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <!-- Autocomplete Dropdown -->
        <div
          v-show="showAutocomplete && autocompleteList.length > 0"
          class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-sky-100 py-2 z-50"
        >
          <button
            v-for="item in autocompleteList"
            :key="item.keyword"
            @click="handleAutocompleteClick(item.keyword)"
            class="w-full px-5 py-3 text-left hover:bg-sky-50 cursor-pointer text-slate-700 flex items-center gap-3 transition-colors"
          >
            <Search class="w-4 h-4 text-slate-400" />
            <span v-html="highlightMatch(item.keyword, modelValue)" />
            <span v-if="item.count" class="ml-auto text-xs text-slate-400">{{ item.count }}개</span>
          </button>
        </div>
      </div>

      <!-- Popular Keywords -->
      <div v-show="!modelValue" class="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
        <span class="text-xs text-slate-400 font-semibold whitespace-nowrap flex items-center gap-1">
          <span class="text-amber-500">🔥</span> 인기 검색어:
        </span>
        <div class="flex gap-2">
          <button
            v-for="keyword in popularKeywords"
            :key="keyword"
            @click="handlePopularClick(keyword)"
            class="rounded-full bg-sky-50 border border-sky-100 px-4 py-1 text-sm text-slate-600 hover:bg-sky-100 cursor-pointer whitespace-nowrap transition-colors"
          >
            {{ keyword }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
