<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import {
  Bold, Italic, UnderlineIcon, Strikethrough, Highlighter,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code2, Minus,
  AlignLeft, AlignCenter, AlignRight,
  ImagePlus, Link2, Undo, Redo,
  Palette, X
} from 'lucide-vue-next'
import { uploadFile } from '@/api'

const props = defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// ── Tiptap editor ───────────────────────────────────────
const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: false, underline: false }),
    Underline,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Image.configure({ inline: false, allowBase64: false }),
    Link.configure({ openOnClick: false, autolink: true }),
    Placeholder.configure({ placeholder: props.placeholder ?? '내용을 입력하세요...' }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
  ],
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
})

// 외부에서 v-model이 변경될 때 (edit mode 초기화 등)
watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false)
  }
})

onBeforeUnmount(() => editor.value?.destroy())

// ── 색상 팔레트 ─────────────────────────────────────────
const showColorPicker = ref(false)
const showHighlightPicker = ref(false)
const TEXT_COLORS = [
  '#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#64748b',
  '#1e293b', '#ffffff',
]
const HIGHLIGHT_COLORS = [
  '#fef08a', '#bbf7d0', '#bae6fd', '#fecaca', '#e9d5ff',
  '#fed7aa', '#f5f5f4',
]

function setColor(color: string) {
  editor.value?.chain().focus().setColor(color).run()
  showColorPicker.value = false
}
function setHighlight(color: string) {
  editor.value?.chain().focus().toggleHighlight({ color }).run()
  showHighlightPicker.value = false
}
function unsetColor() {
  editor.value?.chain().focus().unsetColor().run()
  showColorPicker.value = false
}

// ── 이미지 업로드 ────────────────────────────────────────
const imageInputRef = ref<HTMLInputElement | null>(null)
const isUploadingImage = ref(false)

async function onImageFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  input.value = ''
  isUploadingImage.value = true
  try {
    const url = await uploadFile(file, 'community')
    editor.value?.chain().focus().setImage({ src: url }).run()
  } catch {
    alert('이미지 업로드에 실패했습니다.')
  } finally {
    isUploadingImage.value = false
  }
}

// ── 링크 ─────────────────────────────────────────────────
function setLink() {
  const prev = editor.value?.getAttributes('link').href ?? ''
  const url = prompt('링크 URL을 입력하세요', prev)
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().unsetLink().run()
  } else {
    editor.value?.chain().focus().setLink({ href: url }).run()
  }
}

// ── 툴바 버튼 헬퍼 ──────────────────────────────────────
function btn(active: boolean) {
  return active
    ? 'bg-sky-100 text-sky-600'
    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
}
</script>

<template>
  <div class="rounded-xl border border-sky-100 overflow-hidden focus-within:ring-2 focus-within:ring-sky-400 transition-all">

    <!-- ── Toolbar ── -->
    <div class="flex flex-wrap items-center gap-0.5 p-2 bg-white border-b border-sky-50">

      <!-- Undo / Redo -->
      <button type="button" @click="editor?.chain().focus().undo().run()" :disabled="!editor?.can().undo()" class="p-1.5 rounded-lg disabled:opacity-30 text-slate-500 hover:bg-slate-100"><Undo class="w-4 h-4" /></button>
      <button type="button" @click="editor?.chain().focus().redo().run()" :disabled="!editor?.can().redo()" class="p-1.5 rounded-lg disabled:opacity-30 text-slate-500 hover:bg-slate-100"><Redo class="w-4 h-4" /></button>

      <div class="w-px h-5 bg-slate-200 mx-1" />

      <!-- Headings -->
      <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()" class="p-1.5 rounded-lg" :class="btn(editor?.isActive('heading', { level: 1 }) ?? false)"><Heading1 class="w-4 h-4" /></button>
      <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()" class="p-1.5 rounded-lg" :class="btn(editor?.isActive('heading', { level: 2 }) ?? false)"><Heading2 class="w-4 h-4" /></button>
      <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()" class="p-1.5 rounded-lg" :class="btn(editor?.isActive('heading', { level: 3 }) ?? false)"><Heading3 class="w-4 h-4" /></button>

      <div class="w-px h-5 bg-slate-200 mx-1" />

      <!-- Inline styles -->
      <button type="button" @click="editor?.chain().focus().toggleBold().run()" class="p-1.5 rounded-lg" :class="btn(editor?.isActive('bold') ?? false)"><Bold class="w-4 h-4" /></button>
      <button type="button" @click="editor?.chain().focus().toggleItalic().run()" class="p-1.5 rounded-lg" :class="btn(editor?.isActive('italic') ?? false)"><Italic class="w-4 h-4" /></button>
      <button type="button" @click="editor?.chain().focus().toggleUnderline().run()" class="p-1.5 rounded-lg" :class="btn(editor?.isActive('underline') ?? false)"><UnderlineIcon class="w-4 h-4" /></button>
      <button type="button" @click="editor?.chain().focus().toggleStrike().run()" class="p-1.5 rounded-lg" :class="btn(editor?.isActive('strike') ?? false)"><Strikethrough class="w-4 h-4" /></button>

      <div class="w-px h-5 bg-slate-200 mx-1" />

      <!-- Text color -->
      <div class="relative">
        <button
          type="button"
          @click="showColorPicker = !showColorPicker; showHighlightPicker = false"
          class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center gap-1"
          title="글자 색상"
        >
          <Palette class="w-4 h-4" />
          <span class="w-3 h-1 rounded-sm block" :style="{ background: editor?.getAttributes('textStyle').color ?? '#1e293b' }" />
        </button>
        <div v-if="showColorPicker" class="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl border border-sky-100 shadow-lg p-2 w-44">
          <div class="flex flex-wrap gap-1.5 mb-2">
            <button
              v-for="c in TEXT_COLORS"
              :key="c"
              type="button"
              @click="setColor(c)"
              class="w-6 h-6 rounded-full border border-slate-200 hover:scale-110 transition-transform"
              :style="{ background: c }"
            />
          </div>
          <button type="button" @click="unsetColor()" class="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"><X class="w-3 h-3" />색상 제거</button>
        </div>
      </div>

      <!-- Highlight -->
      <div class="relative">
        <button
          type="button"
          @click="showHighlightPicker = !showHighlightPicker; showColorPicker = false"
          class="p-1.5 rounded-lg flex items-center gap-1"
          :class="btn(editor?.isActive('highlight') ?? false)"
          title="형광펜"
        >
          <Highlighter class="w-4 h-4" />
        </button>
        <div v-if="showHighlightPicker" class="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl border border-sky-100 shadow-lg p-2">
          <div class="flex gap-1.5">
            <button
              v-for="c in HIGHLIGHT_COLORS"
              :key="c"
              type="button"
              @click="setHighlight(c)"
              class="w-6 h-6 rounded-full border border-slate-200 hover:scale-110 transition-transform"
              :style="{ background: c }"
            />
          </div>
        </div>
      </div>

      <div class="w-px h-5 bg-slate-200 mx-1" />

      <!-- Alignment -->
      <button type="button" @click="editor?.chain().focus().setTextAlign('left').run()" class="p-1.5 rounded-lg" :class="btn(editor?.isActive({ textAlign: 'left' }) ?? false)"><AlignLeft class="w-4 h-4" /></button>
      <button type="button" @click="editor?.chain().focus().setTextAlign('center').run()" class="p-1.5 rounded-lg" :class="btn(editor?.isActive({ textAlign: 'center' }) ?? false)"><AlignCenter class="w-4 h-4" /></button>
      <button type="button" @click="editor?.chain().focus().setTextAlign('right').run()" class="p-1.5 rounded-lg" :class="btn(editor?.isActive({ textAlign: 'right' }) ?? false)"><AlignRight class="w-4 h-4" /></button>

      <div class="w-px h-5 bg-slate-200 mx-1" />

      <!-- Lists & blocks -->
      <button type="button" @click="editor?.chain().focus().toggleBulletList().run()" class="p-1.5 rounded-lg" :class="btn(editor?.isActive('bulletList') ?? false)"><List class="w-4 h-4" /></button>
      <button type="button" @click="editor?.chain().focus().toggleOrderedList().run()" class="p-1.5 rounded-lg" :class="btn(editor?.isActive('orderedList') ?? false)"><ListOrdered class="w-4 h-4" /></button>
      <button type="button" @click="editor?.chain().focus().toggleBlockquote().run()" class="p-1.5 rounded-lg" :class="btn(editor?.isActive('blockquote') ?? false)"><Quote class="w-4 h-4" /></button>
      <button type="button" @click="editor?.chain().focus().toggleCodeBlock().run()" class="p-1.5 rounded-lg" :class="btn(editor?.isActive('codeBlock') ?? false)"><Code2 class="w-4 h-4" /></button>
      <button type="button" @click="editor?.chain().focus().setHorizontalRule().run()" class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><Minus class="w-4 h-4" /></button>

      <div class="w-px h-5 bg-slate-200 mx-1" />

      <!-- Link -->
      <button type="button" @click="setLink" class="p-1.5 rounded-lg" :class="btn(editor?.isActive('link') ?? false)"><Link2 class="w-4 h-4" /></button>

      <!-- Image upload -->
      <button
        type="button"
        @click="imageInputRef?.click()"
        :disabled="isUploadingImage"
        class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40"
        title="이미지 삽입"
      >
        <ImagePlus class="w-4 h-4" :class="isUploadingImage ? 'animate-pulse text-sky-400' : ''" />
      </button>
      <input ref="imageInputRef" type="file" accept="image/*" class="hidden" @change="onImageFileSelect" />
    </div>

    <!-- ── Editor area ── -->
    <EditorContent
      :editor="editor"
      class="min-h-[320px] bg-white cursor-text"
    />
  </div>
</template>

<style>
/* Tiptap editor content styles */
.tiptap {
  padding: 1.25rem 1.5rem;
  outline: none;
  min-height: 320px;
  font-size: 0.9rem;
  line-height: 1.75;
  color: #334155;
}
.tiptap p { margin-bottom: 0.75rem; }
.tiptap h1 { font-size: 1.6rem; font-weight: 900; color: #0f172a; margin: 1.2rem 0 0.5rem; }
.tiptap h2 { font-size: 1.3rem; font-weight: 800; color: #0f172a; margin: 1rem 0 0.4rem; }
.tiptap h3 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0.8rem 0 0.3rem; }
.tiptap strong { font-weight: 700; }
.tiptap em { font-style: italic; }
.tiptap u { text-decoration: underline; }
.tiptap s { text-decoration: line-through; }
.tiptap ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
.tiptap ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
.tiptap li { margin-bottom: 0.25rem; }
.tiptap blockquote {
  border-left: 3px solid #bae6fd;
  padding: 0.5rem 1rem;
  background: #f0f9ff;
  color: #475569;
  border-radius: 0 8px 8px 0;
  margin: 0.75rem 0;
}
.tiptap pre {
  background: #1e293b;
  color: #e2e8f0;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  margin: 0.75rem 0;
  overflow-x: auto;
  font-family: 'Fira Code', monospace;
  font-size: 0.82rem;
}
.tiptap code {
  background: #f1f5f9;
  color: #0ea5e9;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.83rem;
}
.tiptap pre code { background: none; color: inherit; padding: 0; }
.tiptap hr { border: none; border-top: 2px solid #e2e8f0; margin: 1rem 0; }
.tiptap img {
  max-width: 100%;
  border-radius: 10px;
  margin: 0.75rem 0;
  display: block;
}
.tiptap a { color: #0ea5e9; text-decoration: underline; }
.tiptap p.is-editor-empty:first-child::before {
  color: #94a3b8;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
.tiptap mark { border-radius: 3px; padding: 0 2px; }

/* 정렬 */
.tiptap [style*="text-align: center"] { text-align: center; }
.tiptap [style*="text-align: right"]  { text-align: right; }
.tiptap [style*="text-align: left"]   { text-align: left; }
</style>
