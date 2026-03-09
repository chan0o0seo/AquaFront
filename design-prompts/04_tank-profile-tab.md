# Prompt: 내 수조 프로필 탭 (TankProfileTab Component)

Build a **Vue 3 Single File Component** (`TankProfileTab.vue`) using `<script setup lang="ts">` and **Tailwind CSS**.
This is a tab panel rendered inside a larger MyPage layout — do NOT include the surrounding page shell or sidebar.
The component manages the full create/view/edit lifecycle of a user's aquarium profile.

---

## Design System

- **Background**: white page, `bg-sky-50` for cards
- **Border**: `border-sky-100`, `rounded-2xl` for cards
- **Primary color**: `sky-500`
- **Tag/chip**: `rounded-full bg-sky-50 border border-sky-100 text-slate-600 px-3 py-1 text-sm`
- **Dashed upload area**: `border-2 border-dashed border-sky-200 rounded-xl`
- **Icons**: `lucide-vue-next`

---

## Component Spec

### View States
The component has 2 top-level states controlled by `const mode = ref<'view' | 'edit'>('view')`
AND `const hasTank = ref(false)`.

So actual states are:
1. `!hasTank` → Empty state
2. `hasTank && mode === 'view'` → View mode
3. `hasTank && mode === 'edit'` → Edit mode (same form, populated)
4. `!hasTank && mode === 'edit'` → Create mode (empty form)

---

### State 1: Empty State (`!hasTank && mode === 'view'`)
Centered vertically in the panel:
- Fish emoji `text-6xl mb-4` (🐠) or `Fish` lucide icon large
- Text: "아직 등록된 수조가 없어요" (`text-slate-400 mb-6`)
- Button: "수조 프로필 만들기" → `bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full px-8 py-3` — sets `mode = 'edit'`

---

### State 2: View Mode (`hasTank && mode === 'view'`)

Header row:
- Title: `font-bold text-slate-900 text-lg` (tank name)
- Size info: `text-slate-500 text-sm`
- "편집" button: `text-sm text-sky-500 hover:underline` — sets `mode = 'edit'`

Card structure (`bg-sky-50 rounded-2xl p-6 border border-sky-100`):

**섹션 1: 기본 정보**
- 수조 이름, 수조 크기, 수질 타입 (민물/해수/기수) displayed as label-value rows

**섹션 2: 키우는 생물**
- Label: `text-sm text-slate-500 block mb-2` "키우는 물고기/새우"
- Tags: flex-wrap row of chip tags

**섹션 3: 수초 / 레이아웃 스타일**
- Same chip tag style

**섹션 4: 레이아웃 사진**
- If no photo: dashed placeholder box with "수조 사진 없음" text
- If photo: `<img>` with `rounded-xl object-cover w-full max-h-48`

**섹션 5: 한줄 소개**
- `text-slate-600 text-sm italic`

---

### State 3 & 4: Edit / Create Form

Page heading: "수조 프로필 만들기" (create) or "수조 프로필 편집" (edit)

Form fields:

**수조 이름** (required)
- Text input, placeholder "예: 거실 수초 수조"

**수조 크기**
- Dropdown `<select>` with options: 30cm 미만, 30cm, 45cm, 60cm, 90cm, 120cm 이상
- Styled: same input style but as select

**수질 타입**
- 3 toggle buttons (exclusive): 민물 / 해수 / 기수
- Selected state: `bg-sky-500 text-white`, unselected: `bg-sky-50 text-slate-600 border border-sky-100`
- `rounded-full px-5 py-2 text-sm font-medium`

**키우는 생물** (TagInput)
- Text input with `+` button or Enter key to add tags
- Tags display below as chips with `×` to remove
- Placeholder: "예: 네온테트라, 레드 체리 새우"

**수초 / 레이아웃 스타일** (TagInput, same pattern)
- Placeholder: "예: 모스, 아마조니아"

**레이아웃 사진 업로드**
- Dashed upload area: `border-2 border-dashed border-sky-200 rounded-xl p-8 text-center cursor-pointer hover:border-sky-400 transition-colors`
- Inside: camera icon + "사진 업로드 (선택)" text
- Hidden `<input type="file" accept="image/*">` triggered on click
- Image preview once selected: show thumbnail with "×" to remove

**한줄 소개** (optional textarea)
- `rows="3"` , maxlength 100, character counter

**Bottom buttons**
- "취소" (ghost, goes back to view or empty state)
- "저장하기" (sky-500 solid, saves and switches to view mode)
- Save sets `hasTank = true` and `mode = 'view'`

---

### Mock Data for pre-filled edit state
```ts
const tankData = ref({
  name: '거실 수초 수조',
  size: '60cm',
  waterType: '민물' as '민물' | '해수' | '기수',
  creatures: ['네온테트라', '레드 체리 새우', '코리도라스'],
  plants: ['모스', '아마조니아 소일'],
  description: '조용한 자연 수초 어항을 추구합니다',
  photoUrl: null as string | null
})
```

---

## Code Requirements
- `<script setup lang="ts">` only
- Tailwind utility classes only
- `lucide-vue-next`: `Fish`, `Camera`, `X`, `Plus`, `Pencil`, `Loader2`
- No router/store imports
- Tag input implemented inline (no external library)
- File input handled with `URL.createObjectURL()` for preview
