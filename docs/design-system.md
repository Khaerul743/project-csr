# Design System & UI Guidelines - Project CSR

Dokumentasi spesifikasi desain antarmuka, token warna, tipografi, dan panduan komponen untuk **Project CSR** berbasis tema **Emerald Impact & Corporate Slate**.

---

## 1. Filosofi Desain (*Design Principle*)

1. **Credible & Institutional:** Tampilan dirancang formal dan terpercaya untuk menarik level korporat (Direksi CSR, Manajer ESG, Corporate Affairs).
2. **High-Impact & Sustainable:** Elemen warna hijau emerald modern dipadukan dengan slate gelap untuk merepresentasikan dampak sosial, lingkungan, dan tata kelola yang baik (ESG).
3. **Accessible & High Usability:** Antarmuka intuitif bagi mitra non-profit/NGO untuk menjelajahi peluang CSR, mengajukan proposal, dan melaporkan kemajuan program.
4. **Scannable Data:** Kartu proyek, badge SDG, dan tabel metrik didesain dengan hierarki visual yang jelas dan ruang napas (*whitespace*) yang proporsional.

---

## 2. Palet Warna (*Color Tokens*)

### A. Brand Primary: *Emerald Green*
Digunakan untuk aksi utama (CTA), brand identity, highlight progress, dan indikator kesuksesan.

| Token | Hex Code | Penggunaan |
| :--- | :--- | :--- |
| `primary-50` | `#ecfdf5` | Background badge aktif, hover light surface |
| `primary-100` | `#d1fae5` | Border badge, subtle highlight |
| `primary-500` | `#10b981` | Aksen grafis, icon highlight |
| **`primary-600`** | **`#059669`** | **Tombol utama (Button Primary), brand logo, link aktif** |
| `primary-700` | `#047857` | State hover tombol primary |
| `primary-900` | `#064e3b` | Dark green background, accent text |

### B. Neutral & Surface: *Corporate Slate*
Fondasi untuk tipografi, border, navbar, card surface, dan background.

| Token | Hex Code | Penggunaan |
| :--- | :--- | :--- |
| `slate-50` | `#f8fafc` | **Canvas background utama** (Light mode) |
| `slate-100` | `#f1f5f9` | Background secondary, input field background |
| `slate-200` | `#e2e8f0` | **Border default kartu dan pemisah (divider)** |
| `slate-400` | `#94a3b8` | Teks placeholder, icon sekunder |
| `slate-500` | `#64748b` | Teks caption, metadata, tanggal |
| `slate-700` | `#334155` | Teks body / paragraf utama |
| **`slate-900`** | **`#0f172a`** | **Heading utama, tombol secondary dark, navbar dark** |
| `surface-card` | `#ffffff` | Background kartu, modal dialog |

### C. Aksen & Kategori SDG (*Sustainable Development Goals*)
Digunakan untuk label kategori proyek CSR agar mudah dibedakan secara visual:

| Kategori SDG | Warna Badge | Hex / Tailwind |
| :--- | :--- | :--- |
| 🌿 **Lingkungan & Energi** | Emerald | `bg-emerald-50 text-emerald-700 border-emerald-200` |
| 🎓 **Pendidikan & Riset** | Royal Blue | `bg-blue-50 text-blue-700 border-blue-200` |
| 🏥 **Kesehatan & Gizi** | Coral Rose | `bg-rose-50 text-rose-700 border-rose-200` |
| 💼 **Ekonomi & UMKM** | Amber Gold | `bg-amber-50 text-amber-700 border-amber-200` |
| 🤝 **Sosial & Bencana** | Purple Violet | `bg-purple-50 text-purple-700 border-purple-200` |

### D. Status Feedback System
- **Success (`ACTIVE`, Disetujui):** `#10B981` (Emerald)
- **Warning / Review (`STAGING`, Menunggu Review):** `#F59E0B` (Amber)
- **Danger (`SUSPENDED`, Ditolak):** `#EF4444` (Red)
- **Info (`INACTIVE`, Draft):** `#64748B` (Slate)

---

## 3. Tipografi (*Typography Scale*)

- **Font Family Utama:** `Plus Jakarta Sans`, sans-serif (alternatif: `Inter`)
- **Font Monospace (Kode/ID):** `Geist Mono` / `ui-monospace`

### Skala Hierarki Tipografi:

| Tingkat | Ukuran (Desktop) | Weight | Line Height | Contoh Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title (Display)** | `36px - 44px` (`text-4xl - 5xl`) | Bold (700) | `1.2` | Hero section landing page, judul besar |
| **Heading 1 (H1)** | `28px - 32px` (`text-3xl`) | Bold (700) | `1.25` | Judul halaman dashboard / auth title |
| **Heading 2 (H2)** | `22px - 24px` (`text-2xl`) | Semi-Bold (600) | `1.3` | Judul modul, section header |
| **Heading 3 (H3)** | `18px - 20px` (`text-xl`) | Semi-Bold (600) | `1.4` | Judul kartu proyek, sub-header |
| **Heading 4 (H4)** | `16px` (`text-base`) | Semi-Bold (600) | `1.4` | Label form tebal, judul metrik |
| **Body Regular** | `14px - 15px` (`text-sm - base`)| Regular (400) | `1.5` | Paragraf deskripsi proyek, form input |
| **Body Small** | `13px` (`text-xs - sm`) | Medium (500) | `1.5` | Teks pendukung, table cell kecil |
| **Badge / Caption** | `11px - 12px` (`text-xs`) | Semi-Bold (600) | `1.2` | Tag kategori SDG, status role |

---

## 4. Spacing, Radius, & Elevation

### A. Border Radius
- `rounded-lg` (`8px`) : Form input, tombol ukuran regular.
- `rounded-xl` (`12px`) : Dropdown menu, popover, kartu kecil.
- `rounded-2xl` (`16px`) : **Kartu Proyek CSR, container form auth, card dashboard**.
- `rounded-full` (`9999px`) : Badge status, avatar, pill buttons.

### B. Elevation & Shadows
- **Card Shadow (Default):** `box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05);` (`shadow-sm`)
- **Card Hover:** `box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04);` (`shadow-md` transisi halus)
- **Modal / Dropdown:** `shadow-xl` dengan backdrop blur `backdrop-blur-sm bg-slate-900/40`.

---

## 5. Komponen Inti & State Styling

### A. Buttons
1. **Primary Button:**
   - Background: `bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800`
   - Teks: `text-white font-medium`
   - Fokus: `focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`
   - Radius: `rounded-xl px-5 py-2.5 shadow-sm hover:shadow transition-all`
2. **Secondary Button:**
   - Background: `bg-slate-900 hover:bg-slate-800 text-white`
3. **Outline / Ghost Button:**
   - Background: `bg-transparent hover:bg-slate-100 border border-slate-300 text-slate-700`

### B. Form Inputs (Input, Password, Select)
- Default: `border border-slate-300 bg-white text-slate-900 rounded-xl px-4 py-2.5 text-sm`
- Placeholder: `placeholder:text-slate-400`
- Focus State: `focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all`
- Error State: `border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900`
- Helper Text: `text-xs text-slate-500 mt-1` (atau `text-rose-600` untuk pesan error).

### C. Status Pills & Badges
- Format: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border`
- Contoh Dot Indikator: `w-1.5 h-1.5 rounded-full bg-emerald-500`

---

## 6. Contoh Layout Halaman Auth (Login & Register)

### Konsep: *Split Screen Showcase*
1. **Sisi Kiri (Brand Showcase & Impact Testimonial - 50% width on Desktop):**
   - Background: Gradien halus `bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950`.
   - Konten: Logo CSR Platform, headline *"Menghubungkan Perusahaan dan Mitra untuk Dampak Sosial Nyata"*, metrik ringkas dampak CSR, dan kutipan testimoni mitra.
2. **Sisi Kanan (Form Input Area - 50% width):**
   - Background: `bg-slate-50` / `bg-white`.
   - Header: Salam sambutan ramah (*"Selamat Datang Kembali"* / *"Mulai Kolaborasi Dampak"*).
   - Form Card: Input field bersih dengan icon, tombol submit emerald, dan link navigasi cepat (Login <-> Register).

---

## 7. Variabel Tailwind CSS v4 (`globals.css`)
Pemetaan token ke file `app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-brand-emerald-50: #ecfdf5;
  --color-brand-emerald-100: #d1fae5;
  --color-brand-emerald-500: #10b981;
  --color-brand-emerald-600: #059669;
  --color-brand-emerald-700: #047857;
  
  --color-brand-slate-50: #f8fafc;
  --color-brand-slate-100: #f1f5f9;
  --color-brand-slate-200: #e2e8f0;
  --color-brand-slate-700: #334155;
  --color-brand-slate-900: #0f172a;
}
```
