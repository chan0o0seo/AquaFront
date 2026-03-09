# Prompt: 계정 설정 탭 (AccountSettingsTab Component)

Build a **Vue 3 Single File Component** (`AccountSettingsTab.vue`) using `<script setup lang="ts">` and **Tailwind CSS**.
This is a tab panel rendered inside a larger MyPage layout — do NOT include the surrounding page shell or sidebar.

---

## Design System

- **Background**: white page, `bg-sky-50` for section backgrounds
- **Border**: `border-sky-100`, `rounded-2xl` for section cards, `rounded-xl` for inputs
- **Primary color**: `sky-500` (save buttons, active states)
- **Danger color**: `red-500` (delete account, password mismatch)
- **Text**: `text-slate-900` (headings), `text-slate-600` (body), `text-slate-400` (hints)
- **Input style**: `border border-sky-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-400 focus:outline-none`
- **Section cards**: `bg-white rounded-2xl border border-sky-100 p-6 mb-6`
- **Icons**: `lucide-vue-next`

---

## Component Spec

### Layout
- Full-width panel
- Page heading: `text-3xl font-black text-slate-900 mb-6` → "계정 설정"
- Split into **3 stacked sections**: 프로필 정보, 비밀번호 변경, 위험 구역

---

### Section 1: 프로필 정보 변경
Card with title "기본 정보"

Fields:
- 닉네임 (text input, current value pre-filled: '아쿠아리스트')
- 이메일 (text input, disabled/readonly, value: 'aqua@example.com', hint: "이메일은 변경할 수 없습니다")
- 휴대폰 번호 (tel input)

Save button: `bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full px-6 py-2.5 text-sm`
Aligned to the right of the section.

---

### Section 2: 비밀번호 변경
Card with title "비밀번호 변경"

Fields (each with eye toggle button):
- 현재 비밀번호
- 새 비밀번호
- 새 비밀번호 확인

Validation UI:
- If new password and confirm don't match → show `text-red-500 text-xs` error: "비밀번호가 일치하지 않습니다"
- If new password < 8 chars → show hint: "8자 이상 입력해주세요"
- If passwords match → show `text-emerald-500 text-xs` with check icon: "비밀번호가 일치합니다"

Submit button: `bg-sky-500 text-white rounded-full` — disabled and grayed out until all fields valid

Password strength bar (optional):
- Thin progress bar below "새 비밀번호" field
- 3 stages: weak (red), medium (amber), strong (emerald)
- Based on length: < 8 weak, 8-11 medium, 12+ strong

---

### Section 3: 위험 구역
Card with `border-red-100 bg-red-50/30` background

Contents:
- Title: "위험 구역" with `text-red-600`
- Row: "로그아웃" label on left, ghost button `border border-slate-200 text-slate-600 rounded-full px-4 py-2 text-sm hover:bg-slate-50`
- Divider
- Row: "회원 탈퇴" label + description "탈퇴 시 모든 데이터가 삭제됩니다" in `text-slate-400 text-sm`
  - Button: `border border-red-200 text-red-500 rounded-full px-4 py-2 text-sm hover:bg-red-50`

Clicking "회원 탈퇴" opens a **confirmation dialog** (inline, not browser confirm()):
- Overlay: `fixed inset-0 bg-black/20 flex items-center justify-center z-50`
- Modal card: `bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg`
- Content: warning icon, "정말 탈퇴하시겠어요?", description text
- Buttons: "취소" (ghost) and "탈퇴하기" (solid red `bg-red-500 text-white rounded-full`)

---

### State & Interaction
```ts
// Profile section
const nickname = ref('아쿠아리스트')
const phone = ref('')
const isSavingProfile = ref(false)

// Password section
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPw = ref(false)
const showNewPw = ref(false)
const showConfirmPw = ref(false)

// Modal
const showDeleteModal = ref(false)
```

Save profile → button shows spinner for 1s then shows success state ("저장됨 ✓") for 1.5s

---

## Code Requirements
- `<script setup lang="ts">` only
- Tailwind utility classes only
- `lucide-vue-next`: `Eye`, `EyeOff`, `AlertTriangle`, `Check`, `LogOut`, `Trash2`
- No external UI libraries
- No router/store imports
