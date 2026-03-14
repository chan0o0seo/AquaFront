<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { uploadFiles } from '@/api'
import {
  Bold, Italic, Heading2, Heading3,
  List, ListOrdered, Quote, Minus,
  Link2, Image as ImageIcon, Loader2
} from 'lucide-vue-next'
import { ref } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const isUploadingImage = ref(false)

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image.configure({ allowBase64: false, HTMLAttributes: { class: 'rounded-xl max-w-full my-3' } }),
    Placeholder.configure({ placeholder: '상품 특징, 사육 환경 권장 사항, 주의사항 등을 자세히 써주시면 판매에 도움이 됩니다.\n\n이미지도 삽입할 수 있어요 📷' }),
    Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-sky-600 underline' } }),
  ],
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none outline-none min-h-[200px] px-4 py-3 text-slate-800',
    },
  },
})

// Sync parent value into editor (e.g. edit mode load)
watch(() => props.modelValue, (val) => {
  if (!editor.value) return
  const current = editor.value.getHTML()
  if (val !== current) editor.value.commands.setContent(val, false)
})

onBeforeUnmount(() => editor.value?.destroy())

function setLink() {
  const url = window.prompt('링크 URL을 입력하세요', editor.value?.getAttributes('link').href ?? '')
  if (url === null) return
  if (url.trim() === '') {
    editor.value?.chain().focus().unsetLink().run()
  } else {
    editor.value?.chain().focus().setLink({ href: url }).run()
  }
}

async function insertImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    isUploadingImage.value = true
    try {
      const [url] = await uploadFiles([file])
      editor.value?.chain().focus().setImage({ src: url }).run()
    } catch {
      alert('이미지 업로드에 실패했습니다.')
    } finally {
      isUploadingImage.value = false
    }
  }
  input.click()
}
</script>

<template>
  <div class="rounded-xl border border-sky-100 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-sky-400 focus-within:border-transparent transition-all">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-sky-50 bg-slate-50">
      <!-- Bold -->
      <button
        type="button"
        @click="editor?.chain().focus().toggleBold().run()"
        :class="['p-1.5 rounded-lg transition-colors', editor?.isActive('bold') ? 'bg-sky-100 text-sky-600' : 'text-slate-500 hover:bg-slate-100']"
        title="굵게"
      >
        <Bold class="w-4 h-4" />
      </button>

      <!-- Italic -->
      <button
        type="button"
        @click="editor?.chain().focus().toggleItalic().run()"
        :class="['p-1.5 rounded-lg transition-colors', editor?.isActive('italic') ? 'bg-sky-100 text-sky-600' : 'text-slate-500 hover:bg-slate-100']"
        title="기울임"
      >
        <Italic class="w-4 h-4" />
      </button>

      <div class="w-px h-5 bg-slate-200 mx-1" />

      <!-- H2 -->
      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="['p-1.5 rounded-lg transition-colors', editor?.isActive('heading', { level: 2 }) ? 'bg-sky-100 text-sky-600' : 'text-slate-500 hover:bg-slate-100']"
        title="제목 2"
      >
        <Heading2 class="w-4 h-4" />
      </button>

      <!-- H3 -->
      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="['p-1.5 rounded-lg transition-colors', editor?.isActive('heading', { level: 3 }) ? 'bg-sky-100 text-sky-600' : 'text-slate-500 hover:bg-slate-100']"
        title="제목 3"
      >
        <Heading3 class="w-4 h-4" />
      </button>

      <div class="w-px h-5 bg-slate-200 mx-1" />

      <!-- Bullet List -->
      <button
        type="button"
        @click="editor?.chain().focus().toggleBulletList().run()"
        :class="['p-1.5 rounded-lg transition-colors', editor?.isActive('bulletList') ? 'bg-sky-100 text-sky-600' : 'text-slate-500 hover:bg-slate-100']"
        title="글머리 기호"
      >
        <List class="w-4 h-4" />
      </button>

      <!-- Ordered List -->
      <button
        type="button"
        @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="['p-1.5 rounded-lg transition-colors', editor?.isActive('orderedList') ? 'bg-sky-100 text-sky-600' : 'text-slate-500 hover:bg-slate-100']"
        title="번호 목록"
      >
        <ListOrdered class="w-4 h-4" />
      </button>

      <!-- Blockquote -->
      <button
        type="button"
        @click="editor?.chain().focus().toggleBlockquote().run()"
        :class="['p-1.5 rounded-lg transition-colors', editor?.isActive('blockquote') ? 'bg-sky-100 text-sky-600' : 'text-slate-500 hover:bg-slate-100']"
        title="인용구"
      >
        <Quote class="w-4 h-4" />
      </button>

      <!-- Horizontal Rule -->
      <button
        type="button"
        @click="editor?.chain().focus().setHorizontalRule().run()"
        class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        title="구분선"
      >
        <Minus class="w-4 h-4" />
      </button>

      <div class="w-px h-5 bg-slate-200 mx-1" />

      <!-- Link -->
      <button
        type="button"
        @click="setLink"
        :class="['p-1.5 rounded-lg transition-colors', editor?.isActive('link') ? 'bg-sky-100 text-sky-600' : 'text-slate-500 hover:bg-slate-100']"
        title="링크"
      >
        <Link2 class="w-4 h-4" />
      </button>

      <!-- Image Upload -->
      <button
        type="button"
        @click="insertImage"
        :disabled="isUploadingImage"
        class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-40"
        title="이미지 삽입"
      >
        <Loader2 v-if="isUploadingImage" class="w-4 h-4 animate-spin text-sky-500" />
        <ImageIcon v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Editor Area -->
    <EditorContent :editor="editor" />
  </div>
</template>

<style>
/* Tiptap placeholder */
.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #94a3b8;
  pointer-events: none;
  height: 0;
  white-space: pre-line;
}

/* Prose styles (no @tailwindcss/typography needed) */
.tiptap h2 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #1e293b; }
.tiptap h3 { font-size: 1.1rem; font-weight: 600; margin: 0.75rem 0 0.4rem; color: #334155; }
.tiptap p { margin: 0.5rem 0; line-height: 1.7; }
.tiptap ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
.tiptap ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
.tiptap li { margin: 0.2rem 0; }
.tiptap blockquote { border-left: 3px solid #bae6fd; padding-left: 1rem; color: #64748b; margin: 0.75rem 0; }
.tiptap hr { border: none; border-top: 1px solid #e2e8f0; margin: 1rem 0; }
.tiptap strong { font-weight: 700; }
.tiptap em { font-style: italic; }
</style>
