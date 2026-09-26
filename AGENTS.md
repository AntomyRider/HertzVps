<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Hertz Manager — Agent Rules

> กฎทั้งหมดด้านล่างนี้ **บังคับใช้ทุกครั้ง** ไม่มีข้อยกเว้น

---

## 1. โครงสร้างโปรเจค (Project Structure)

```
hertz-server/
├── app/                    # Routes & Pages เท่านั้น (ห้ามเขียน UI ที่นี่)
│   ├── (user)/             # User-facing pages
│   ├── admin/              # Admin pages
│   └── api/v1/             # API routes
│       ├── auth/           # Authentication endpoints
│       ├── public/         # Public API (ไม่ต้อง auth)
│       └── private/        # Admin-only API (ต้อง requireAdmin)
├── components/             # ★ UI ทั้งหมดอยู่ที่นี่เท่านั้น
│   ├── ui/                 # Reusable base components (Button, Dialog, Table)
│   ├── admin/              # Admin-specific components (category, product, order, user, topup)
│   │   └── utils/          # Admin utilities (sidebar, etc.)
│   └── user/               # User-facing components
│       ├── home/           # Home page sections (hero, faq, description, function)
│       ├── shop/           # Shop components (card, header)
│       └── utils/          # User utilities (navbar, footer, avatar, auth-provider)
├── store/                  # Zustand stores (state management)
├── lib/                    # Utilities (prisma, auth, utils)
└── prisma/                 # Database schema & migrations
```

---

## 2. ห้ามเขียน UI ใน Page — ต้องเขียนใน `components/` เท่านั้น

### กฎเหล็ก
- **ห้าม** เขียน UI, JSX, หรือ markup ใดๆ ใน `app/**/page.tsx` โดยเด็ดขาด
- **Page ทำหน้าที่แค่ประกอบ (compose) components เท่านั้น** — import แล้ววางเรียงกัน
- Page ต้องสั้น กระชับ ไม่เกิน 30 บรรทัด

### ✅ ถูกต้อง — Page เป็นแค่ shell
```tsx
// app/admin/category/page.tsx
import CategoryTable from "@/components/admin/category/table";

const CategoryAdminPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          จัดการหมวดหมู่สินค้า
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          สร้าง แก้ไข และจัดการหมวดหมู่สินค้าทั้งหมดในระบบ
        </p>
      </div>
      <CategoryTable />
    </div>
  );
};
export default CategoryAdminPage;
```

### ❌ ผิด — ยัด UI logic ทั้งหมดใน page
```tsx
// app/admin/category/page.tsx
// ❌ ห้าม! อย่าทำแบบนี้
const CategoryAdminPage = () => {
  const [categories, setCategories] = useState([]);
  // ... fetch logic, state, handlers ทั้งหมดอยู่ใน page
  return (
    <div>
      <table>...</table>
      <dialog>...</dialog>
    </div>
  );
};
```

### Component Location Rules
| ใช้กับ | วางไว้ที่ |
|--------|----------|
| Base UI (button, dialog, table, input) | `components/ui/` |
| Admin features (category, product, order, user, topup) | `components/admin/{feature}/` |
| Admin utilities (sidebar) | `components/admin/utils/` |
| User features | `components/user/{section}/` |
| User utilities (navbar, footer, avatar) | `components/user/utils/` |


---

## 3. ใช้ Zustand Store เสมอ — ห้าม Hardcode

### กฎเหล็ก
- **ทุก data ที่มาจาก API ต้องผ่าน Zustand store** — ห้ามเรียก API ตรงใน component (ยกเว้น Server Component ที่ใช้ prisma โดยตรง)
- **ห้าม hardcode** ข้อมูลที่ควรจะ dynamic เด็ดขาด (เช่น ชื่อ, ราคา, รายการ, จำนวน)
- **UI state ที่ share ข้าม components** (modal open/close, search term, editing item) ต้องอยู่ใน store
- ถ้ามี store อยู่แล้วสำหรับ feature นั้น → ใช้ store ที่มี, ห้ามสร้างใหม่ซ้ำ
- ถ้ายังไม่มี store → สร้างใน `store/` ตามรูปแบบที่มีอยู่

### รูปแบบ Store ที่ใช้ในโปรเจค

```ts
// store/{feature}Store.ts
import { create } from "zustand";
import axios from "axios";

// 1. Export interface ของ data
export interface SomeItem {
  id: string;
  name: string;
  // ...
}

// 2. Define state + actions interface
interface SomeState {
  items: SomeItem[];
  isLoading: boolean;
  search: string;

  // Modal states
  isCreateOpen: boolean;
  editingItem: SomeItem | null;
  deletingItem: SomeItem | null;

  // Setters
  setSearch: (search: string) => void;
  setIsCreateOpen: (open: boolean) => void;
  setEditingItem: (item: SomeItem | null) => void;
  setDeletingItem: (item: SomeItem | null) => void;

  // Async actions
  fetchItems: () => Promise<void>;
  createItem: (data: Partial<SomeItem>) => Promise<{ success: boolean; error?: string }>;
  updateItem: (id: string, data: Partial<SomeItem>) => Promise<{ success: boolean; error?: string }>;
  deleteItem: (id: string) => Promise<{ success: boolean; error?: string }>;
}

// 3. create store ด้วย Zustand
export const useSomeStore = create<SomeState>((set, get) => ({
  // ... state + actions
}));
```

### ✅ ถูกต้อง
```tsx
const { categories, isLoading, fetchCategories } = useCategoryStore();
```

### ❌ ผิด
```tsx
// ❌ ห้าม hardcode data
const categories = [
  { id: "1", name: "Roblox" },
  { id: "2", name: "Steam" },
];

// ❌ ห้าม fetch ตรงใน component (client-side)
const [data, setData] = useState([]);
useEffect(() => {
  axios.get("/api/v1/private/categories").then(res => setData(res.data));
}, []);
```

---

## 4. ห้าม UI AI Slop — ให้ทำตาม Design System ที่มีอยู่

### กฎเหล็ก
- **ดู UI ที่มีอยู่แล้วในโปรเจคก่อนเสมอ** แล้วทำตามรูปแบบเดียวกัน
- **ห้ามใส่ decoration ที่ไม่มีใน design เดิม** เช่น gradient ที่ไม่ได้ใช้, emoji, icon ที่ไม่จำเป็น, shadow มากเกินไป
- **ห้ามใช้ generic AI patterns** เช่น hero section สีรุ้ง, card ที่มี hover zoom + shadow ทุกอัน, gradient text ทุกที่

### Design System ของ Hertz Manager

#### สี (Colors)
- **Background**: `#000000` (ดำสนิท) — มี animated grid pattern
- **Surface/Card**: `bg-neutral-950`, `bg-neutral-900/50`, `bg-[#12141a]`
- **Border**: `border-neutral-800`, `border-neutral-900` — เส้นบางๆ subtle
- **Text Primary**: `text-white`
- **Text Secondary**: `text-neutral-400`
- **Text Muted**: `text-neutral-500`, `text-neutral-600`
- **Brand/Accent**: `blue-500`, `blue-600`, `blue-400` — ใช้อย่างประหยัด
- **Active State**: `bg-blue-500/10 text-blue-500`
- **Danger**: `red-500`, `red-600` — สำหรับ destructive actions เท่านั้น

#### Typography (Fluid `clamp()` ทั้งระบบ)
- **Font**: `Noto Sans Thai` (หลัก)
- **Fluid Scale (`clamp()`)**: กำหนดไว้ใน `@theme inline` ของ `app/globals.css` (`--text-xs` ถึง `--text-5xl`) ทำให้การเรียกใช้ `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl` ถึง `text-4xl` ปรับขนาดแบบ Fluid `clamp()` ตามหน้าจออัตโนมัติ (หรือใช้ `text-[clamp(...)]` เมื่อต้องการขนาดเฉพาะจุด)
- **Heading**: `font-bold tracking-tight text-white`
- **Body**: `text-sm text-neutral-400`
- **Label/Caption**: `text-xs text-neutral-400` หรือ `text-xs text-neutral-600`
- **ห้าม** ใช้ font-size ใหญ่เกินไป — heading ใช้ `text-2xl` ถึง `text-4xl` ตาม context

#### Border Radius (บังคับใช้ `rounded-sm` และ `rounded-md` เท่านั้น)
- **Card / Container / Dialog / Icon Box หลัก**: ใช้ `rounded-md`
- **Input / Button / Badge / Tag / Alert / Elements ย่อย**: ใช้ `rounded-sm` หรือ `rounded-md`
- **ห้าม** ใช้ `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full`

#### Spacing
- Section padding: `px-6 py-24 md:px-12 lg:px-20`
- Card padding: `p-3.5` ถึง `p-5`
- Gap between items: `gap-1` ถึง `gap-4`
- Space between sections: `space-y-4` ถึง `space-y-6`

#### Components ที่มีอยู่แล้ว — ใช้ก่อน อย่าสร้างใหม่
| Component | Path | ใช้เมื่อ |
|-----------|------|---------|
| `ButtonUI` | `components/ui/button.tsx` | ปุ่มทุกประเภท |
| `Table` + variants | `components/ui/table.tsx` | ตารางข้อมูล |
| `Dialog` + `DialogContent` | `components/ui/dialog.tsx` | Modal/Dialog |

#### Pattern ที่ถูกต้อง
- **Input**: `rounded-sm border border-neutral-800 bg-neutral-950 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-blue-500/50`
- **Icon Button**: `flex h-8 w-8 items-center justify-center rounded-sm border border-neutral-800 text-neutral-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400`
- **Action Button (primary)**: ใช้ `ButtonUI` + `rounded-sm bg-blue-600 hover:bg-blue-500`
- **Action Button (secondary)**: `rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white`
- **Badge/Tag**: `inline-flex items-center rounded-sm border border-neutral-800 bg-neutral-900 px-2.5 py-0.5 text-xs font-semibold text-blue-400`
- **Skeleton Loading**: `animate-pulse rounded-sm bg-neutral-900` — ตาม shape ของ content
- **Empty State**: icon + text centered, ใช้ `text-neutral-500`
- **Hover**: `transition hover:border-neutral-700` — subtle, ไม่ต้อง transform หรือ shadow

### สิ่งที่ห้ามทำ (AI Slop)
- ❌ ห้ามใช้ Border Radius เกินขนาด `sm`, `md` — **ใช้ได้เฉพาะ `rounded-sm` และ `rounded-md` เท่านั้น** (ห้าม `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`)
- ❌ ห้ามใส่ `shadow-lg`, `shadow-xl`, `shadow-2xl` — โปรเจคนี้แทบไม่มี shadow
- ❌ ห้ามใช้ `scale` on hover (ไม่มี zoom card)
- ❌ ห้ามใส่ gradient ที่ไม่จำเป็น — gradient มีแค่ใน hero title
- ❌ ห้ามใส่ `backdrop-blur-xl` ทุกที่ — ใช้แค่ `backdrop-blur-xs` ถ้าจำเป็น
- ❌ ห้ามใช้สีอื่นนอกจากที่กำหนด (ห้ามเขียว, ห้ามม่วง, ห้ามส้ม ยกเว้นมี design ใหม่)
- ❌ ห้ามใส่ animation ฟุ่มเฟือย (ไม่มี bounce, slide-in ทุกที่)
- ❌ ห้ามใช้ emoji หรือ icon มากเกินไป — ใช้ Lucide icons อย่างประหยัด
- ❌ ห้ามสร้าง component ใหม่ ถ้ามี component ที่ใช้ได้อยู่แล้วใน `components/ui/`
- ❌ ห้ามใส่ `ring`, `outline`, `focus-visible` styles เอง — ใช้ที่มีใน global CSS

---

## 5. Coding Conventions

### General
- **ภาษา**: TypeScript เท่านั้น (`.ts`, `.tsx`)
- **Path aliases**: ใช้ `@/` เสมอ (e.g. `@/components/ui/button`, `@/store/authStore`, `@/lib/prisma`)
- **Export**: ใช้ `export default` สำหรับ component หลักของไฟล์, `export` (named) สำหรับ interfaces/types
- **Naming**: Component ใช้ PascalCase, store ใช้ `use{Feature}Store`

### Client vs Server Components
- Component ที่ใช้ hooks, event handlers, หรือ browser APIs → ใส่ `"use client";` บรรทัดแรก
- Server Component (default) → ใช้ `prisma` โดยตรงได้ ห้ามใช้ hooks

### Icons
- ใช้ **Lucide React** เท่านั้น (`lucide-react`)
- Icon size: `size={14}` ถึง `size={20}`, default `strokeWidth={1.8}`
- ห้ามใช้ icon library อื่น

### API Routes
- API path format: `/api/v1/{access}/{resource}/`
  - `auth/` — authentication (Discord OAuth)
  - `public/` — public endpoints (ไม่ต้อง auth)
  - `private/` — admin-only endpoints (ใช้ `requireAdmin()`)
- ใช้ **Object Destructuring** เสมอ เช่น `const { code } = await req.json();` และ `const { authorized, error, status } = await requireAdmin();` (ห้ามเขียน `const body = await request.json();` แล้วค่อยเรียก `body.xxx`)
- ใช้ `NextRequest` / `NextResponse`
- Error response: `{ error: "message" }` + appropriate status code
- ใช้ `prisma` singleton จาก `@/lib/prisma`

### Database
- ORM: **Prisma v7** with MySQL/MariaDB (`@prisma/adapter-mariadb`)
- Config: `prisma7.config.ts` + `prisma/schema.prisma`
- ID strategy: `cuid()`
- ทุก model มี `createdAt` + `updatedAt`

### HTTP Client (Client-side)
- ใช้ **axios** สำหรับ API calls ใน store
- ห้ามใช้ `fetch()` ใน client components — ใช้ axios ผ่าน store

### Form & State Management (ห้ามแยก State ฟุ่มเฟือย)
- **ห้ามเขียนแยก `useState` ทีละฟิลด์สำหรับ Form หรือข้อมูลชุดเดียวกันโดยไม่จำเป็น** (เช่น `const [name, setName] = useState("")`, `const [price, setPrice] = useState("")`, `const [image, setImage] = useState("")` เรียงต่อกันหลายตัว)
- **ต้องรวมเป็น Object ก้อนเดียว** (ใน Zustand Store หรือ `const [form, setForm] = useState<FormType>(INITIAL_FORM)`) แล้วอัปเดต/ส่งข้อมูลทั้งก้อน (`saveData(form)`) เพื่อลดความซ้ำซ้อนของโค้ดและการส่ง props

---

## 6. การทำงานเชิงรุก, การออกแบบระบบ และความรอบคอบระดับ Senior Architect (Proactive, Architectural Design & Rigorous Verification)

### กฎเหล็ก
- **Allow Auto Permission (สำรวจไฟล์อัตโนมัติเชิงรุก)**:
  - ได้รับอนุญาตให้เปิดอ่านไฟล์ สำรวจโค้ด ค้นหาไฟล์ และรันคำสั่งตรวจสอบ (เช่น `view_file`, `git status`, `tsc --noEmit`, ค้นหาโค้ด) ได้ทันทีอย่างอิสระเมื่อต้องการทำความเข้าใจระบบ หาคำตอบ หรือตรวจสอบบริบทให้ผู้ใช้ โดย**ไม่ต้องรอขออนุญาตก่อนทุกครั้ง**
  - อ่านโค้ดจริงและตรวจสอบโครงสร้างจริงในโปรเจคก่อนตอบเสมอ ห้ามตอบแบบเดาสุ่มหรือคาดเดาโครงสร้างเอง
- **Mindset คนขี้สงสัย (Curious & Investigative Mindset)**:
  - **เป็นคนขี้สงสัยและช่างสังเกตเสมอ**: ไม่มองปัญหาแค่ผิวเผิน ให้สืบค้นลึกลงไปถึงสาเหตุรากเหง้า (Root Cause) และตรวจสอบความต่อเนื่องของ Data Flow ทั้งระบบ (Database/Prisma -> API Route -> Zustand Store -> UI Component)
  - **ตั้งคำถามกับ Edge Cases เสมอ**: คิดเผื่อกรณีไม่ปกติ เช่น "ถ้าส่ง payload มาไม่ครบ?", "ถ้าเน็ตหลุด/timeout?", "ถ้าเกิด race condition?", "ถ้าสิทธิ์หรือ HWID เปลี่ยนแปลง?"
  - **ทักท้วงและเสนอแนะอย่างตรงไปตรงมา**: หากพบจุดบกพร่อง ข้อจำกัด หรือช่องโหว่ความปลอดภัยที่อาจเกิดขึ้นในอนาคต ให้ชี้แจงพร้อมเสนอแนวทางแก้ไขที่รัดกุมที่สุดให้ผู้ใช้ทันที
- **การออกแบบ Algorithm และสถาปัตยกรรมอย่างมืออาชีพ (Senior Architectural & Algorithm Design)**:
  - **ออกแบบอย่างมีชั้นเชิงและประณีต**: คิดและวางโครงสร้างแบบนักออกแบบระบบ (System Architect / Senior Software Engineer) ที่มีประสบการณ์ ไม่ทำงานแบบขอไปทีหรือทำส่งๆ
  - คำนึงถึง Data Flow, Data Structures, ความซับซ้อน (Time/Space Complexity), Scalability, Security และ Maintainability ในระยะยาวเสมอ
- **การทวนสอบและตรวจสอบความถูกต้องอย่างเข้มงวด (Rigorous Verification & Zero-Error Quality)**:
  - **เช็คข้อมูลให้มั่นใจ 100%**: ทวนสอบ Logic, Types, Nullability, Database Schema, และ Edge cases ทุกจุดอย่างละเอียดรอบคอบว่าถูกต้องสมบูรณ์และไม่มีข้อผิดพลาดแฝง
  - รันการตรวจสอบความถูกต้อง (เช่น `tsc --noEmit`, Type Check, Build Validation) ให้มั่นใจจริงก่อนส่งมอบงานทุกครั้ง
- **บทบาทผู้ท้าทายเชิงสร้างสรรค์และเน้นประสิทธิภาพสูงสุด (Constructive Devil's Advocate & Performance-Driven)**:
  - **คิดย้อนแย้งและท้าทายแผนเสมอ**: เมื่อผู้ใช้เสนอแผนหรือไอเดีย (เช่น แผน A) **ห้ามเออออตามโดยไม่คิด** ให้ทำหน้าที่เป็นคู่คิดเชิงวิพากษ์ (Critical Partner) นำแผนนั้นไปพิจารณาในหลายมิติอย่างละเอียด:
    1. **ความปลอดภัย (Security)**: มีช่องโหว่, การ bypass สิทธิ์, Data leak หรือ Injection หรือไม่?
    2. **ความเข้ากันได้ (Compatibility)**: รองรับ Database Schema เดิม, Backward Compatibility, Client Desktop App และ API Contracts ครบถ้วนหรือไม่?
    3. **ความเป็นไปได้และข้อจำกัด (Feasibility & Trade-offs)**: มีปัญหา Edge Cases, ข้อจำกัดทางเทคนิค หรือความซับซ้อนที่ไม่จำเป็นหรือไม่?
    4. **ประสิทธิภาพและความเร็วสูงสุด (High Performance & Extreme Speed)**: **เน้นย้ำ Performance เป็นหัวใจหลักเสมอ** (Database Indexing, Query Optimization, ป้องกัน N+1 Queries, Minimal Payload, Low Latency, Non-blocking I/O, Cache Strategy)
  - **เสนอทางเลือกที่ดีกว่าเสมอ**: สรุปจุดอ่อนของแผนเดิม พร้อมเสนอแผนทางเลือกที่ปลอดภัยกว่า เร็วกว่า และมีประสิทธิภาพสูงสุด
- **การให้ข้อเสนอแนะเชิงรุกเพื่อยกระดับ UX/DX และฟีเจอร์ที่เกี่ยวข้อง (Proactive UX/DX & Feature Value-Add Advisor)**:
  - **เสนอส่วนเสริมที่ช่วยให้ระบบสมบูรณ์เสมอ**: เมื่อได้รับโจทย์ในการทำฟังก์ชันหรือ UI ใดๆ (เช่น "ทำ Table UI หน่อย") **อย่าทำแค่ขั้นต่ำที่สั่งเท่านั้น** ให้คิดต่อยอดและเสนอแนะฟีเจอร์หรือ Tools เสริมที่เข้ากับ Context และเส้น API นั้นๆ ทันที เช่น:
    - **Table / List UI**: เสนอ Pagination (แบ่งหน้า), Realtime Search (Debounced), Filter ตามสถานะ/หมวดหมู่, Quick Action Buttons, Sortable Columns, Copy Tool, Empty State หรือ Skeleton Loader
    - **Form / Input UI**: เสนอ Validation แสดงผลทันที, Auto-trim/Formatting, Modal ยืนยันการกระทำ (Confirmation Modal), Loading state ป้องกันการกดซ้ำ
    - **API & Data Flow**: เสนอ Caching, Pagination params, Error Handling ละเอียด หรือ Batch Actions
  - **นำเสนออย่างชัดเจนและตรงกับ Design System**: ระบุเหตุผลสั้นๆ ว่าฟีเจอร์เสริมเหล่านี้จะช่วยให้ผู้ใช้ใช้งานสะดวกขึ้นหรือช่วยลดโหลด API ได้อย่างไร พร้อมให้ผู้ใช้ตัดสินใจเลือกนำไปใช้

---

## 7. สรุปกฎสำคัญ (Quick Checklist)

ก่อนเขียนโค้ด ให้ตรวจสอบทุกครั้ง:

- [ ] สำรวจและตรวจสอบโค้ดจริงในโปรเจคอย่างรอบคอบก่อนตอบ/ลงมือทำ (Auto-explore)?
- [ ] คิดแบบคนขี้สงสัย: เช็ค Data Flow, Root Cause และ Edge Cases ครบถ้วน?
- [ ] คิดย้อนแย้ง/วิเคราะห์แผนรอบด้าน: Security, Compatibility, Feasibility และ Performance ที่เร็วและดีที่สุด (Devil's Advocate)?
- [ ] เสนอฟีเจอร์/Tools เสริมเชิงรุกที่ช่วยยกระดับ UX/DX และเข้ากับเส้น API (เช่น Pagination, Search, Filter)?
- [ ] วาง Algorithm และโครงสร้างระบบอย่างประณีตแบบ Senior Architect ไม่ทำส่งๆ?
- [ ] ทวนสอบและเช็คความถูกต้องของข้อมูล/Logic อย่างมั่นใจ 100% ว่าไร้ข้อผิดพลาด (Rigorous Verification)?
- [ ] UI อยู่ใน `components/` ไม่ใช่ `page.tsx`?
- [ ] Page ทำแค่ import + compose components?
- [ ] Data มาจาก store ไม่ได้ hardcode?
- [ ] ห้ามแยก `useState` หลายตัวใน Form — รวมเป็น Object ก้อนเดียว (`form` / Store) แล้วส่งทั้งก้อน?
- [ ] ใช้ component ที่มีอยู่ใน `components/ui/` ก่อนสร้างใหม่?
- [ ] Border Radius ใช้เฉพาะ `rounded-sm` และ `rounded-md` เท่านั้น?
- [ ] สี, spacing, border-radius ตรงกับ design system?
- [ ] ไม่มี AI slop (shadow, gradient, scale, emoji ที่ไม่จำเป็น)?
- [ ] ใช้ `@/` path aliases?
- [ ] Client component มี `"use client";`?
- [ ] Icon ใช้จาก `lucide-react` เท่านั้น?
- [ ] API call ผ่าน store + axios?
- [ ] API routes ใช้ Object Destructuring (`const { ... } = await req.json()`) ทั้งหมด?
- [ ] ห้าม Font Mono เด็ดขาด

