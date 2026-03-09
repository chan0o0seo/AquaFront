# Prompt: 프로필 편집 모달 (ProfileEditModal Component)

Build a **Vue 3 Single File Component** (`ProfileEditModal.vue`) using `<script setup lang="ts">` and **Tailwind CSS**.
This is a modal dialog triggered from the MyPage sidebar's "프로필 편집" button.

---

## Design System

- **Overlay**: `fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50`
- **Modal card**: `bg-white rounded-3xl shadow-xl p-8 w-full max-w-md mx-4`
- **Border**: `border-sky-100`, `rounded-2xl` for inner cards
- **Primary color**: `sky-500`
- **Input style**: `border border-sky-100 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-sky-400 focus:outline-none transition-all`
- **Icons**: `lucide-vue-next`

---

## Component Spec

### Props & Emits
```ts
const props = defineProps<{
  modelValue: boolean  // v-model for open/close
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
```

### Modal Layout

```
┌──────────────────────────────────────┐
│  프로필 편집                    [×]  │
│                                      │
│     ┌──────┐                         │
│     │  아  │  ← avatar circle       │
│     └──────┘                         │
│                                      │
│  닉네임                              │
│  [________________]                  │
│                                      │
│  회원 유형                           │
│  [일반 구매자 badge - readonly]      │
│                                      │
│  [취소]          [저장하기]          │
└──────────────────────────────────────┘
```

### Avatar
- Circle `w-20 h-20 rounded-full bg-gradient-to-br from-sky-300 to-teal-400 flex items-center justify-center text-white text-3xl font-black mx-auto`
- Show `user.initial` inside
- Below avatar: small "사진 변경" link (ghost, `text-sky-500 text-sm hover:underline`) — clicking shows file input (hidden `<input type="file" accept="image/*">`)

### Fields

**닉네임**
- Text input, pre-filled with `user.nickname`
- Max length 20 chars
- Character counter: `text-xs text-slate-400 text-right mt-1` showing `X/20`
- Validation: cannot be empty, min 2 chars — show `text-red-500 text-xs` if invalid

**회원 유형**
- Readonly display only (cannot be changed here)
- Badge: `rounded-full text-xs px-3 py-1 inline-block`
  - buyer → `bg-sky-100 text-sky-600` "일반 구매자"
  - seller → `bg-amber-100 text-amber-600` "수족관 운영자"
  - breeder → `bg-emerald-100 text-emerald-600` "홈 브리더"
- Hint below: `text-xs text-slate-400` "회원 유형 변경은 판매자 신청을 통해 가능합니다"

### Buttons (bottom row, full width split 50/50)
- 취소: `border border-sky-100 text-slate-600 rounded-full py-3 w-full hover:bg-sky-50`
- 저장하기: `bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full py-3 w-full` — disabled until nickname is valid

### Saving State
- Button shows `<Loader2 class="animate-spin" />` + "저장 중..." for 1s
- On success: emit `'saved'` and close modal

### Close Behavior
- Click [×] button → close
- Click overlay backdrop → close
- Press Escape key → close (`onMounted` add keydown listener, `onUnmounted` remove)

---

## Code Requirements
- `<script setup lang="ts">` with `defineProps` / `defineEmits`
- `v-model` pattern for open/close (`modelValue` prop + `update:modelValue` emit)
- Tailwind utility classes only
- `lucide-vue-next`: `X`, `Loader2`, `Camera`
- No router/store imports
- Use `<Transition name="modal">` for fade-in animation:
```css
/* Add in <style> block */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
```
