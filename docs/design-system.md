# Design System & UI Guidelines (v2) - SIPENA

Dokumen ini adalah panduan desain utama (*Single Source of Truth*) untuk meredesign dan membangun antarmuka dashboard **SIPENA** (*Sistem Informasi Pengelolaan dan Evaluasi Nilai Aksi CSR*).

Acuan visual v2 ini menggabungkan identitas warna biru cerah dari pembaruan **Landing Page** dengan implementasi dashboard acuan pada [TemplateCustomizationView.tsx](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/src/components/dashboard/company/templates/TemplateCustomizationView.tsx) dan [CompanyDashboardView.tsx](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/src/components/dashboard/company/CompanyDashboardView.tsx).

---

## 1. Filosofi Desain (*Design Principles*)

1. **Minimalist & Structured Workspace**: Utamakan komposisi bersih berbasis ruang napas (*whitespace*) yang terukur, pemisahan hierarki yang jelas antara navigasi, area pratinjau/ringkasan, dan area aksi/editor utama.
2. **Vibrant Light-Blue SaaS Identity**: Gunakan kanvas terang `#F9F9FB` yang dipadukan dengan gradasi biru cerah Landing Page (`#1D6CE0` -> `#1765F5` -> `#1748D5`), aksen ice-blue lembut (`#EDF6FF`, `#F4F9FF`), dan teks utama deep navy (`#0A2558`) sehingga terasa modern, hangat, dan profesional.
3. **Alive & Illustrative (Hidup dengan Aset Visual Terarah)**: Setiap halaman yang baru dibuat atau di-redesign wajib memiliki elemen visual yang membuatnya terasa hidup (ikon custom, ilustrasi tematik PNG transparan, dan dekorasi *abstract organic gradient blob* pada latar belakang header/area terpilih), disesuaikan secara proporsional dengan konteks masing-masing menu agar tetap fokus dan tidak berlebihan.
4. **Accessible & Contrast-Safe (WCAG AA)**: Setiap kombinasi teks dan latar belakang wajib memenuhi kontras minimum 4.5:1 (3:1 untuk komponen grafis/teks besar), memiliki target klik minimum `44px` (`min-h-[44px]`), dukungan keyboard fokus yang jelas, serta bebas overflow horizontal di layar mobile maupun desktop.

---

## 2. Palet Warna & Matriks Kontras (*Color Tokens*)

### A. Brand Primary & Sky-Blue Gradients

| Role / Penggunaan | Token / Nilai Tailwind | Hex Code | Catatan Kontras & Aturan Pakai |
| :--- | :--- | :--- | :--- |
| **Display & Heading Ink** | `text-[#0A2558]` | `#0A2558` | Judul halaman (`h1`), judul kartu utama, tab inaktif, teks label tebal (`13.56:1` di atas `#EDF6FF`). |
| **Primary CTA / Active Tab Gradient** | `bg-gradient-to-r from-[#1D6CE0] via-[#1765F5] to-[#1748D5]` | `#1D6CE0` -> `#1765F5` -> `#1748D5` | Tombol aksi utama (*Save*, *Create*), tab kategori aktif, pill penting. Dengan teks putih: `4.91:1` / `4.98:1` / `7.18:1` (**PASS WCAG AA**). |
| **Brand Blue Solid / Icon Accent** | `text-[#1765F5]` / `border-[#1765F5]` | `#1765F5` | Aksen border kartu aktif, ikon interaktif, focus ring (`focus-visible:ring-[#1765F5]`). |
| **Sky-Blue Decorative Only** | `#43A5FF` / `#5EB8FF` / `#93C5FD` | `#43A5FF` / `#93C5FD` | **DILARANG** dipakai sebagai background dengan teks putih (kontras `#43A5FF`/`#FFFFFF` hanya `2.60:1`). Gunakan khusus untuk ilustrasi, hover border (`hover:border-[#93C5FD]`), dan dekorasi grafis. |

### B. Surface, Canvas & Border Hierarchy

| Token / Kelas | Hex Code | Fungsi Utama |
| :--- | :--- | :--- |
| **App Canvas (`--background`)** | `#F9F9FB` | Latar belakang utama kanvas dashboard (terdefinisi di `app/globals.css`). |
| **Card Surface** | `#FFFFFF` | Permukaan utama kartu workspace, modal, form editor, dan tab nonaktif. |
| **Soft Ice-Blue Tint** | `#EDF6FF` | Bingkai ikon header, background hero preview card, pill counter, kartu template terpilih. |
| **Subtle Sky Wash** | `#F4F9FF` / `#F8FBFF` | Zona gradien halus preview card, hover state tab/kartu, banner Tips Penggunaan. |
| **Primary Card Border** | `#DBEAFE` | Border standar kartu workspace v2 (`border-[#DBEAFE]`), lebih selaras dengan palet biru daripada abu-abu polos. |
| **Ice-Blue Accent Border** | `#CBE7FD` | Border kontainer ikon (`w-12 h-12`), divider tipis di zona hero biru, dan tombol sekunder lembut. |
| **Neutral Divider / Field Border** | `#E2E8F0` / `slate-200` | Border input form, kartu daftar inaktif, dan pemisah netral. |

### C. Tipografi Teks Netral

- **Primary Body:** `text-slate-700` (`#334155`, kontras `9.78:1` di atas `#F4F9FF`).
- **Secondary / Deskripsi / Metadata:** `text-slate-600` (`#475569`) untuk deskripsi halaman, metadata tanggal, dan teks pendamping. Hindari `text-slate-400` untuk teks informatif penting karena kontrasnya rendah di atas background terang.

### D. Semantic Status Feedback

- **Success / Active Default Badge:** `bg-[#ECFDF5] border border-emerald-200 text-[#065F46]` (`7.29:1`) dengan ikon `#047857` (`5.48:1`). Dipakai untuk badge `Default`, status aktif terverifikasi, dan toggle `ON`.
- **Info / Neutral:** `bg-[#EDF6FF] border border-[#CBE7FD] text-[#0A2558]`.
- **Warning / Overdue Attention:** Amber hangat (`bg-amber-50 border-amber-200 text-amber-800`) atau aksen ilustrasi coral lembut (`#FB7185` hanya untuk elemen visual/ikon).
- **Error / Destructive Alert:** `bg-rose-50 border-rose-200 text-rose-900` dengan ikon `text-rose-700` dan tombol hapus `text-rose-600 hover:bg-rose-50`.

---

## 3. Tipografi & Skala Ruang (*Typography & Scale*)

Mengacu pada konfigurasi di `app/globals.css` (`html { font-size: 14.4px; }` atau skala 90%):

- **Font Display (`fontFamily: "var(--font-display)"`):** `Plus Jakarta Sans`, sans-serif untuk `h1`, judul kartu utama, dan judul modal.
- **Font Body (`var(--font-body)`):** `Inter`, sans-serif untuk deskripsi, label input, konten kartu, tabel, dan teks editor.

| Elemen | Kelas Tailwind | Weight | Contoh Penggunaan |
| :--- | :--- | :--- | :--- |
| **Page Title (`h1`)** | `text-xl sm:text-2xl tracking-tight` | `font-extrabold` (800) | Judul utama menu di Page Header (`#0A2558`). |
| **Section / Card Title** | `text-base sm:text-lg` | `font-bold` (700) | Header editor, modal title, sub-section penting. |
| **Subheading / Strip Header** | `text-xs sm:text-sm` | `font-bold` / `font-semibold` | Label strip pemilih, judul sub-banner Tips. |
| **Body & Deskripsi** | `text-xs sm:text-sm leading-relaxed` | `font-normal` (400) | Paragraf pengantar header, isi pesan, konten modal. |
| **Form Labels & Metadata** | `text-xs` | `font-semibold` / `font-bold` | Label input, tanggal pembaruan, chip variabel. |
| **Micro Badge** | `text-[10px]` / `text-[11px]` | `font-bold` | Badge `Default` ringkas di selector card strip. |

---

## 4. Standar Elemen Visual Hidup (Ilustrasi, Ikon Custom & Abstract Blob)

Setiap halaman baru atau hasil redesign **harus terasa hidup secara visual** namun tetap rapi dan fungsional. Gunakan 3 elemen utama berikut secara proporsional sesuai karakteristik menu:

### A. Abstract Organic Gradient Blobs (Dekorasi Latar Header)

Digunakan pada **Page Header** (khususnya di level shell/kontainer konten penuh seperti `TemplateHeaderBackdrop` di `CompanyDashboardView.tsx`) untuk menciptakan nuansa SaaS modern yang lembut dan elegan:

- **Penempatan:** Letakkan di wrapper konten utama penuh (`relative flex-1 flex flex-col min-w-0 overflow-x-clip`) dengan posisi `absolute top-0 right-0 z-0`, **bukan** di dalam wrapper sempit `max-w-7xl` jika parent masih memiliki margin luar, agar gambar tidak terpotong (*cropped*) secara vertikal sebelum tepi layar.
- **Konstruksi SVG:**
  - Gunakan kurva SVG organik asimetris (*irregular soft-edged blob*, kapsul miring, dan titik aksen kecil) dengan gradasi pastel biru ke lavender lembut (`#DBEAFE` -> `#E0E7FF` -> `#DDD6FE`) pada opasitas rendah (`0.48` - `0.68`).
  - Perluas koordinat path melewati tepi atas/kanan `viewBox` (misalnya `y = -20` dan `x = 560` pada `viewBox="0 0 540 230"`) saat memakai `blur-[1px]`, sehingga tepian luar menempel solid penuh (*flush*) tanpa celah pudar, sementara lengkungan dalam tetap lembut.
- **Aturan Anti-Ganggu:** Wajib menggunakan `aria-hidden="true"`, `pointer-events-none`, `select-none`, berada pada layer `z-0`, dan seluruh elemen interaktif maupun teks berada pada `relative z-10`.
- **Fleksibilitas Penggunaan:** Bentuk, jumlah lobe, dan penempatannya dapat disesuaikan per halaman (misalnya sudut kanan atas di belakang CTA utama, atau aksen latar lembut di banner empty-state), selama tetap ringan dan tidak mengaburkan teks.

### B. Custom Icons & Ilustrasi PNG Transparan (`public/images/...`)

Untuk titik fokus halaman, hindari hanya mengandalkan kotak ikon 16px polos dari library ikon di semua tempat. Sediakan atau manfaatkan aset PNG transparan bertema **biru cerah SIPENA** (`#EDF6FF`, `#5EB8FF`, `#1765F5`, `#0A2558`):

1. **Header Feature Icon (`48x48`):** Diletakkan dalam bingkai `w-12 h-12 rounded-2xl bg-[#EDF6FF] border border-[#CBE7FD]` di samping judul halaman (contoh: `/images/templates/template-header-icon.png`).
2. **Hero / Preview / Empty-State Illustration (`120px` - `180px`):** Ilustrasi bertema spesifik konteks menu (contoh: `/images/templates/paper-plane-invite.png` untuk undangan kolaborasi, `/images/templates/overdue-clock-notice.png` untuk tenggat waktu). Gunakan `object-contain` dan jaga rasio aspek agar tidak terdistorsi.
3. **Contextual Banner Icon (`40x40`):** Ikon ilustratif hangat dalam bingkai soft surface untuk banner informasi/tips (contoh: `/images/templates/tips-lightbulb-icon.png`).
4. **Checklist Kualitas Aset:** Pastikan background benar-benar transparan (bukan kotak putih/kotak checker palsu), tidak memakan ruang berlebih hingga mendorong konten utama ke bawah lipatan layar, dan memiliki alt deskriptif atau `alt=""` jika murni dekoratif di samping label teks.

---

## 5. Anatomi Layout & Komponen Acuan

Mengacu langsung pada tata letak [TemplateCustomizationView.tsx](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/src/components/dashboard/company/templates/TemplateCustomizationView.tsx):

### 1. Open Canvas Page Header (Compact)
- Tidak wajib dibungkus card box tersendiri agar menyatu mulus dengan kanvas `#F9F9FB` dan dekorasi abstract blob di belakang CTA kanan.
- Kiri: Ikon custom (`w-12 h-12 rounded-2xl`) + `h1` + deskripsi 1-2 kalimat singkat (`max-w-2xl`).
- Kanan: 1 CTA utama berbentuk pill (`rounded-full`, `min-h-[44px]`, gradien biru `#1D6CE0 -> #1765F5 -> #1748D5`).

### 2. Category Tabs & Compact Selector Strip
- **Tabs:** Pill button (`rounded-full`, `min-h-[44px]`) dengan counter jumlah item (`bg-white/20` saat aktif, `bg-[#EDF6FF]` saat tidak aktif) dan atribut `role="tablist"` / `role="tab"`.
- **Selector Strip (jika menu memiliki daftar item ringkas):** Grid responsif kartu ringkas (`rounded-2xl`, `min-h-[44px]`). Item aktif ditandai `bg-[#EDF6FF] border-[#1765F5] ring-1 ring-[#1765F5]/20`, sedangkan item default memakai badge hijau lembut `Default`.

### 3. Main Workspace Cards (Split / Bento Layout)
- **Container Utama:** `bg-white rounded-3xl border border-[#DBEAFE] shadow-xs overflow-hidden`.
- **Split Workspace (`42:58`):** Pada desktop gunakan `grid-cols-1 lg:grid-cols-12 gap-5 items-start` (`lg:col-span-5` untuk panel pratinjau/ringkasan kiri dan `lg:col-span-7` untuk panel pengaturan/editor/aksi kanan). Di layar tablet & mobile, otomatis menumpuk satu kolom (`Preview` di atas `Editor`).
- **Zona Atas Preview Card:** Gradien lembut `bg-gradient-to-b from-[#EDF6FF] via-[#F4F9FF] to-white` sebagai panggung ilustrasi, badge status, judul, dan metadata tanggal, lalu konten utama bersih di bawahnya.
- **Zona Editor / Pengaturan:** Header info ringkas + tombol aksi sekunder destruktif terpisah (`Trash2` dengan konfirmasi modal), input fields (`rounded-xl`, focus ring `#1765F5`), toggle/switch aksesibel (`role="switch"`), quick-action chips bila relevan, dan footer aksi (Secondary outline button + Primary blue-gradient button).

### 4. Compact Informational Banner (Tips / Panduan)
- Letakkan di bagian bawah workspace dalam bentuk banner horizontal ringkas (`rounded-3xl bg-gradient-to-r from-[#F4F9FF] via-white to-[#EDF6FF]/70 border border-[#DBEAFE]`), berisi ikon informatif, judul singkat, 1 baris penjelasan, dan tautan/tombol aksi sekunder (misal *Pelajari lebih lanjut* yang membuka modal panduan).

### 5. Radius Standardisasi
- **Workspace Card, Banner, Modal:** `rounded-3xl`
- **Sub-card, Preset Card, Alert Banner, Kotak Ikon Header:** `rounded-2xl`
- **Input Text, Textarea, Variable Chip:** `rounded-xl`
- **Button Utama, Tab Filter, Badge Status, Toggle:** `rounded-full`

---

## 6. Guardrails Teknis & Ergonomi Interaktif

1. **Pertahankan Kontrak Backend:** Redesign UI tidak boleh mengubah API contract, nama field payload, maupun skema database Drizzle kecuali diminta secara eksplisit.
2. **State & Feedback Lengkap:** Sediakan skeleton loading bertema ice-blue (`#EDF6FF`), empty state yang membantu pengguna (beserta preset/CTA awal bila relevan), error alert ber-aksi muat ulang (`role="alert"`), dan konfirmasi modal untuk aksi hapus atau destruktif.
3. **Zero Anti-Patterns:**
   - Hindari scrollbar internal yang sempit atau memaksa di area pratinjau utama bila teks masih bisa mengalir wajar dalam tinggi compact.
   - Pastikan tidak ada elemen yang memicu horizontal overflow di lebar layar `375px` ke atas.
   - Hindari penggunaan tanda hubung panjang (*em dash*) pada copy UI berbahasa Indonesia jika tidak diperlukan.

---

## 7. Peta Implementasi Bertahap Redesign Dashboard

Untuk menjaga konsistensi saat merombak seluruh tampilan dashboard ke depan, urutan kerja yang disarankan:

1. **Fase 1 - Shell & Komponen Primitif:**
   - Selaraskan tema [Sidebar.tsx](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/src/components/dashboard/Sidebar.tsx) dan [DashboardHeader.tsx](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/src/components/dashboard/DashboardHeader.tsx) ke palet Sky-Blue & Deep Navy `#0A2558`.
   - Perbarui varian default di `src/components/ui/` ([button.tsx](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/src/components/ui/button.tsx), [card.tsx](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/src/components/ui/card.tsx), [badge.tsx](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/src/components/ui/badge.tsx), [modal.tsx](file:///c:/Users/Pongo/Documents/projects/next.js/project-csr/src/components/ui/modal.tsx)) agar seluruh halaman baru otomatis mewarisi gaya v2.
2. **Fase 2 - Menu Utama Dashboard Perusahaan (`company/`):**
   - Overview, Peluang CSR, Proposal, Kolaborasi & MoU (termasuk daftar undangan), Program & Monitoring, Keuangan & Evaluasi Mitra, serta Profil.
3. **Fase 3 - Menu Dashboard Mitra (`partner/`) & Super Admin (`admin/`):**
   - Menyelaraskan tampilan dengan pola kartu, badge status, dekorasi abstract header, dan aset ilustrasi khusus tiap peran.
