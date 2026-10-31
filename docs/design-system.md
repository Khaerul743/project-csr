# 🎨 Design System & UI Guidelines — Project CSR (Sipena)

Dokumentasi spesifikasi desain antarmuka, token warna, tipografi, dan panduan komponen untuk **Project CSR (Sipena)** berbasis tema **Emerald Impact & Corporate Slate Navy**.

---

## 1. Filosofi Desain (*Design Principles*)

1. **Credible & Institutional**: Tampilan dirancang formal, terpercaya, dan bersih untuk level eksekutif korporat (Direksi CSR, Manajer ESG, Corporate Affairs).
2. **High-Impact & Sustainable**: Elemen hijau emerald modern dipadukan dengan navy slate gelap untuk merepresentasikan dampak sosial, kelestarian lingkungan, dan tata kelola yang baik (ESG).
3. **Data-Dense yet Scannable**: Kartu inisiatif, badge SDG, ringkasan RAB, dan metrik dampak didesain dengan hierarki visual kontras tinggi dan ruang napas (*whitespace*) yang terukur.
4. **Accessible & Responsive**: Bekerja mulus baik pada desktop resolusi tinggi maupun smartphone (khususnya untuk halaman survei warga di lapangan).

---

## 2. Palet Warna & Token Desain (*Color Tokens*)

### A. Brand Primary: *Emerald Green*
Warna identitas platform, aksi utama (CTA), indikator capaian, dan highlight keberlanjutan.

| Token | Hex Code | Contoh Penggunaan |
| :--- | :--- | :--- |
| `emerald-50` | `#ecfdf5` | Background badge aktif, hover light surface |
| `emerald-100` | `#d1fae5` | Border badge, subtle highlight container |
| `emerald-500` | `#10b981` | Aksen grafis, icon highlight, progress bar aktif |
| **`emerald-600`** | **`#059669`** | **Tombol utama (Button Primary), logo brand, link aktif** |
| `emerald-700` | `#047857` | State hover tombol primary |
| `emerald-900` | `#064e3b` | Teks kontras tinggi pada badge terang |

### B. Brand Corporate: *Slate Navy & Dark Canvas*
Warna dasar institusional untuk heading, header dashboard, navbar, dan card frame.

| Token | Hex Code | Contoh Penggunaan |
| :--- | :--- | :--- |
| **`brand-navy`** | **`#181343`** | **Brand accent navy, tombol sekunder, card heading** |
| `brand-dark` | `#0d0a26` | Hero section gradient, dark header |
| `slate-50` | `#f8fafc` | **Canvas background utama** (Light mode) |
| `slate-100` | `#f1f5f9` | Background secondary container, input field background |
| `slate-200` | `#e2e8f0` | **Border default kartu dan pemisah (divider)** |
| `slate-400` | `#94a3b8` | Teks placeholder, icon sekunder |
| `slate-500` | `#64748b` | Teks caption, metadata waktu/tanggal |
| `slate-700` | `#334155` | Teks body / paragraf utama |
| `slate-900` | `#0f172a` | Heading utama, dark badge |
| `white` | `#ffffff` | Background kartu, modal dialog |

### C. Secondary Accent: *Warm Amber / Orange* (`#f6ac2f`)
Warna aksen hangat yang melengkapi dominasi hijau emerald untuk menarik perhatian pada proses transisi aktif dan metrik evaluasi tanpa memicu kesan bahaya/merah.

| Token | Hex Code | Contoh Penggunaan |
| :--- | :--- | :--- |
| `amber-50` | `#fffbeb` | Background badge status evaluasi ringan |
| `amber-100` | `#fef3c7` | Border chip aksen, container catatan revisi |
| **`amber-500`** | **`#f6ac2f`** | **Metrik angka kunci, highlight tahap evaluasi, badge proposal masuk** |
| `amber-600` | `#d97706` | Teks kontras tinggi pada background terang |

### D. Kategori SDG (*Sustainable Development Goals*)
Digunakan untuk chip / badge kategori inisiatif CSR:

| Kategori SDG | Warna Badge | Tailwind Class |
| :--- | :--- | :--- |
| 🌿 **Lingkungan & Energi** (`ENVIRONMENT`) | Emerald | `bg-emerald-50 text-emerald-700 border-emerald-200` |
| 🎓 **Pendidikan & Riset** (`EDUCATION`) | Royal Blue | `bg-blue-50 text-blue-700 border-blue-200` |
| 🏥 **Kesehatan & Gizi** (`HEALTH`) | Coral Rose | `bg-rose-50 text-rose-700 border-rose-200` |
| 💼 **Ekonomi & UMKM** (`EMPOWERMENT`) | Warm Amber | `bg-amber-50 text-amber-700 border-amber-200` |
| 🤝 **Sosial & Bencana** (`DISASTER`, `POVERTY`)| Purple | `bg-purple-50 text-purple-700 border-purple-200` |
| 🏗️ **Infrastruktur Sosial** (`INFRASTRUCTURE`)| Cyan | `bg-cyan-50 text-cyan-700 border-cyan-200` |

### E. Status Feedback System
- **Success (`ACTIVE`, Disetujui, `ACCEPTED`, `VERIFIED`):** `#10B981` / `#059669` (Emerald)
- **Active Transition / Review (`SUBMITTED`, `UNDER_REVIEW`, `IN_PROGRESS`):** `#3B82F6` (Blue) / `#F59E0B` (Amber)
- **Warning / Revision (`REVISION_REQUESTED`, `ON_HOLD`):** `#F59E0B` (Amber)
- **Danger / Critical (`REJECTED`, `CANCELLED`, `TERMINATED`):** `#EF4444` (Red)
- **Neutral / Draft (`DRAFT`, `PENDING`, `WITHDRAWN`):** `#64748B` (Slate)

---

## 3. Tipografi (*Typography Scale*)

- **Font Family Utama:** `Plus Jakarta Sans`, sans-serif (alternatif fallback: `Inter`, system-ui).
- **Font Monospace:** `ui-monospace`, `SFMono-Regular`, `Menlo`, monospace.

| Skala | Kelas Tailwind | Ukuran | Weight | Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Display Title** | `text-4xl lg:text-5xl` | 36px - 48px | 800 (Extrabold) | Hero section landing page |
| **Heading 1** | `text-2xl lg:text-3xl` | 24px - 30px | 800 (Extrabold) | Judul utama dashboard / halaman |
| **Heading 2** | `text-xl lg:text-2xl` | 20px - 24px | 700 (Bold) | Header section / sub-judul besar |
| **Heading 3** | `text-lg` | 18px | 700 (Bold) | Judul kartu program / modal header |
| **Heading 4** | `text-base` | 16px | 600 (Semibold) | Sub-header kartu, label tabel |
| **Body Regular** | `text-sm` | 14px | 400 (Regular) | Paragraf teks, input form |
| **Body Small** | `text-xs` | 12px | 500 (Medium) | Metadata, timestamp, keterangan tabel |
| **Micro Caption** | `text-[10px] / text-[11px]` | 10px - 11px | 600 (Semibold) | Tag uppercase, badge kecil |

---

## 4. Komponen Primitif UI (`src/components/ui/`)

### 1. `Button` (`src/components/ui/button.tsx`)
Mendukung varian:
- `primary`: `bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs`
- `secondary`: `bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs`
- `outline`: `border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold`
- `danger`: `bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs`
- Mendukung properti `leftIcon`, `rightIcon`, `isLoading`, dan ukuran `sm`, `md`, `lg`.

### 2. `Badge` (`src/components/ui/badge.tsx`)
Digunakan untuk label status, role, dan pilar CSR:
- Varian: `emerald`, `amber`, `blue`, `rose`, `purple`, `cyan`, `slate`.
- Mendukung indikator titik bulat berkedip (`hasDot={true}`).

### 3. `Card` & `CardContent` (`src/components/ui/card.tsx`)
- Menggunakan radius `rounded-3xl` atau `rounded-2xl` dengan border halus `border border-slate-200/90 shadow-xs`.
- State hover menggunakan `hover:shadow-md transition duration-200`.

### 4. `Modal` (`src/components/ui/modal.tsx`)
- Backdrop: `fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4`.
- Dialog Container: `bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col`.
- Header: Gradien elegan `bg-gradient-to-r from-slate-900 to-slate-850 text-white` atau clean light surface.

---

## 5. Token Tema CSS (`app/globals.css`)

```css
@import "tailwindcss";

@theme {
  --color-brand-emerald-primary: #059669;
  --color-brand-emerald-light: #10B981;
  --color-brand-accent-amber: #f6ac2f;
  --color-brand-corporate-navy: #181343;
}
```
