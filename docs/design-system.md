# Design System \& UI Guidelines — SIPENA

Dokumentasi spesifikasi desain antarmuka, token warna, tipografi, layout, dan panduan komponen untuk **SIPENA (Sistem Informasi Pengelolaan dan Evaluasi Nilai Aksi CSR)**, menggunakan identitas **Purpose-Driven Impact System**.

**Tagline:** *Mencatat Aksi, Mengukur Dampak.*



\---

## 1\. Filosofi Desain (*Design Principles*)

1. **Credible \& Institutional:** SIPENA harus terlihat terpercaya untuk perusahaan, tim CSR, manajemen, serta NGO/yayasan. Deep navy menjadi fondasi visual yang tegas tanpa membuat antarmuka terasa kaku.
2. **Purpose-Driven \& Human-Centered:** Identitas merek menghubungkan teknologi dengan kolaborasi dan dampak sosial. Warna *impact red* menandai aksi penting; warna SDGs hanya muncul ketika merepresentasikan tujuan pembangunan yang relevan.
3. **Clarity Before Decoration:** Hirarki tipografi, alignment, ruang kosong, dan pemisahan konten lebih penting daripada ornamen. Jangan mengisi seluruh area dengan kartu, ikon, grafik, atau gradasi.
4. **Scannable Data \& Evidence:** Dashboard mendukung pembacaan cepat atas program, anggaran, mitra yang benar-benar bekerja sama, capaian SDGs/ESG, wilayah penerima manfaat, dan realisasi monitoring. Setiap metrik harus memiliki label, konteks, dan satuan yang jelas.
5. **Accessible \& Consistent UX:** Alur perusahaan dan mitra memiliki kewenangan berbeda tetapi menggunakan bahasa komponen yang sama. Form bertahap, status, validasi, dan navigasi harus dapat dipahami tanpa pelatihan panjang.
6. **Transparent Decision Support:** Rekomendasi AI dan analisis dampak menyampaikan dasar data serta keterbatasannya. Prediksi potensi dampak sebelum program tidak boleh disamakan dengan hasil aktual setelah program.

**Karakter visual:** modern, classy, profesional, rapi, kontras terkontrol, humanis, dan tidak berlebihan.

\---

## 2\. Palet Warna (*Color Tokens*)

### A. Identitas Brand — Deep Navy \& Impact Red

|Token|HEX|Penggunaan|
|-|-|-|
|**`brand-deep-navy`**|**`#181343`**|Identitas utama, heading penting, struktur navigasi, tombol utama navy, footer/section gelap|
|`brand-secondary-navy`|`#26224C`|Variasi lapisan gelap, hover navy, panel aksen, elemen analitik tertentu|
|**`brand-impact-red`**|**`#D9385F`**|CTA konversi, highlight headline, indikator interaksi yang diprioritaskan, aksen brand|
|`brand-surface-light`|`#F4F4F6`|Latar netral alternatif dan area yang membutuhkan pemisahan tonal|
|`brand-pure-white`|`#FFFFFF`|Kartu, formulir, modal, dan konten berkontras tinggi|

**Aturan:** tombol navy dan impact red adalah dua varian aksi yang sah. Gunakan **satu CTA dominan per konteks** agar tidak terjadi kompetisi visual. Impact red merupakan warna brand, **bukan** warna *error*; status kesalahan tetap menggunakan token `error`.

**Catatan aksesibilitas (rekomendasi tambahan):** kontras teks putih pada `#D9385F` sekitar **4,49:1**, sedikit di bawah ambang **4,5:1** untuk teks normal WCAG AA. Pertahankan warna brand asli untuk aksen, tetapi gunakan varian interaktif lebih gelap (misalnya `#D63259`, sekitar **4,71:1**) jika tombol memakai teks putih berukuran normal. Varian ini merupakan **usulan implementasi**, bukan penggantian token warna resmi yang diberikan.

### B. Semantic \& Surface Tokens — Purpose-Driven Impact System

Nilai berikut **dipertahankan sesuai panduan baru**, tanpa menggantinya dengan palet Emerald lama.

|Token|HEX|Peran|
|-|-|-|
|`background`, `surface`, `surface-bright`|`#F9F9FB`|Kanvas aplikasi / landing page|
|`surface-container-lowest`|`#FFFFFF`|Permukaan kartu paling terang|
|`surface-container-low`|`#F3F3F5`|Lapisan konten yang halus|
|`surface-container`|`#EEEEF0`|Kontainer sekunder|
|`surface-container-high`|`#E8E8EA`|Kontainer kontras sedang|
|`surface-container-highest`, `surface-variant`|`#E2E2E4`|Lapisan paling tegas pada tema terang|
|`surface-dim`|`#D9DADC`|Lapisan redup|
|`on-background`, `on-surface`|`#1A1C1D`|Teks utama pada permukaan terang|
|`on-surface-variant`|`#47464F`|Teks sekunder|
|`outline`|`#787680`|Outline dengan penekanan lebih kuat|
|`outline-variant`|`#C8C5D0`|Border dan pemisah ringan|
|`inverse-surface`|`#2F3132`|Kontainer invers|
|`inverse-on-surface`|`#F0F0F2`|Teks pada kontainer invers|
|`surface-tint`, `secondary`|`#5D588C` / `#5D5987`|Nuansa indigo semantik; mengikuti fungsi token masing-masing|
|`primary`|`#000000`|**Token semantik sumber**; tidak otomatis menggantikan warna brand navy|
|`on-primary`|`#FFFFFF`|Teks pada `primary`|
|`primary-container`|`#191444`|Kontainer primary semantik gelap|
|`on-primary-container`|`#837EB4`|Teks/aksen terkait primary container|
|`tertiary`|`#000000`|**Token semantik sumber**, bukan alias impact red|
|`error`|`#BA1A1A`|Status kesalahan dan validasi negatif|
|`error-container`|`#FFDAD6`|Latar pesan error|
|`on-error-container`|`#93000A`|Teks pada error container|

**Penting — dua tingkat token:** dalam panduan sumber, `primary` dan `tertiary` bernilai `#000000`, sedangkan arahan identitas visual menggunakan deep navy `#181343` dan impact red `#D9385F`. **Jangan mengubah nilai sumber secara diam-diam.** Gunakan alias `brand-deep-navy` / `brand-impact-red` untuk komponen yang harus mengikuti tampilan baru; biarkan token semantik sumber tetap tersedia.

Token semantik lain yang juga dipertahankan dari panduan: `on-secondary #FFFFFF`, `secondary-container #CFC9FE`, `on-secondary-container #575380`, `on-tertiary #FFFFFF`, `tertiary-container #400012`, `on-tertiary-container #EA456B`, `inverse-primary #C6C0FA`, `primary-fixed #E4DFFF`, `primary-fixed-dim #C6C0FA`, `on-primary-fixed #191444`, `on-primary-fixed-variant #454172`, `secondary-fixed #E4DFFF`, `secondary-fixed-dim #C7C1F5`, `on-secondary-fixed #1A153F`, `on-secondary-fixed-variant #46426D`, `tertiary-fixed #FFD9DD`, `tertiary-fixed-dim #FFB2BB`, `on-tertiary-fixed #400012`, dan `on-tertiary-fixed-variant #910033`.

### C. Kategori SDGs, Bidang CSR, dan ESG

* **SDG 1–17:** gunakan **warna resmi masing-masing SDG hanya untuk identitas tujuan**, misalnya chip SDG, legenda chart distribusi, atau rincian kontribusi per tujuan. Hindari 17 warna sebagai dekorasi pada seluruh UI.
* **Bidang fokus CSR:** kategori seperti pendidikan, kesehatan, lingkungan, ekonomi/UMKM, dan kemanusiaan harus dibedakan lewat **label teks dan ikon**. Bila memerlukan warna kategori khusus, tetapkan token terpisah; jangan menyamakan kategori bidang CSR dengan nomor SDG.
* **ESG:** tampilkan label **Environmental, Social, Governance** berdasarkan aturan pemetaan SDG–ESG yang disepakati. Pemetaan harus mendukung kemungkinan satu SDG terkait lebih dari satu pilar.
* **Visualisasi:** urutan dan warna yang digunakan pada grafik harus konsisten di seluruh dashboard; selalu sediakan label dan tooltip, bukan warna saja.

### D. Status \& Feedback System

|Status|Token/acuan|Penggunaan|
|-|-|-|
|**Error / Gagal / Ditolak**|`error #BA1A1A`; `error-container #FFDAD6`|Validasi form, error sistem, dan penolakan yang memiliki konsekuensi|
|**Primary / Dipilih**|`brand-deep-navy #181343`|Tab terpilih, filter aktif, langkah saat ini|
|**Aksi penting**|`brand-impact-red #D9385F`|CTA utama tertentu dan penekanan brand, bukan semua pesan error|
|**Success / Warning / Info**|*Belum ditetapkan eksplisit dalam panduan sumber*|Gunakan token status tersendiri yang diuji kontrasnya; jangan menduplikasi `impact-red` sebagai status generik|
|**Draft / Netral**|`on-surface-variant #47464F` dengan surface netral|Status informasi tanpa urgensi|

\---

## 3\. Tipografi (*Typography Scale*)

**Font Heading / Display:** `Plus Jakarta Sans`, sans-serif.  
**Font Body / UI / Data:** `Inter`, sans-serif.  
**Font Monospace (opsional untuk ID atau data teknis):** `ui-monospace`, monospace; bukan font utama brand.

### Skala Hierarki Tipografi

|Token|Font|Ukuran|Weight|Line Height|Letter Spacing|Penggunaan|
|-|-|-|-|-|-|-|
|**`headline-xl`**|Plus Jakarta Sans|**48px**|700|56px|`-0.02em`|Hero landing page / headline editorial|
|`headline-lg`|Plus Jakarta Sans|36px|700|44px|`-0.01em`|Heading section utama|
|`headline-md`|Plus Jakarta Sans|28px|600|36px|Normal|Judul halaman / modul|
|`headline-sm`|Plus Jakarta Sans|22px|600|28px|Normal|Judul kartu dan subbagian|
|`headline-lg-mobile`|Plus Jakarta Sans|28px|700|34px|Normal|Hero mobile|
|`headline-md-mobile`|Plus Jakarta Sans|24px|600|30px|Normal|Heading section mobile|
|`body-lg`|Inter|18px|400|28px|Normal|Intro dan paragraf yang menonjol|
|**`body-md`**|Inter|**16px**|400|24px|Normal|Isi halaman dan penjelasan utama|
|`body-sm`|Inter|14px|400|20px|Normal|Deskripsi komponen, tabel, formulir|
|`label-lg`|Inter|14px|600|20px|`0.01em`|Tombol dan label form utama|
|`label-md`|Inter|12px|600|16px|`0.02em`|Badge, caption, metadata|

**Pedoman:** gunakan navy pada headline brand, impact red untuk **frasa pendek yang benar-benar penting**, bukan keseluruhan paragraf. Batasi panjang baris teks laporan panjang sekitar **65–75 karakter**. Hindari teks operasional terlalu kecil hanya agar lebih banyak data muat dalam satu layar.

\---

## 4\. Spacing, Radius, \& Elevation

### A. Grid \& Spacing

Gunakan **fluid 12-column grid** dengan alignment yang konsisten.

|Token|Nilai|Fungsi|
|-|-|-|
|`gutter`|`24px`|Jarak antarkolom/grid|
|`margin`|`32px`|Margin dasar area konten|
|`space-xs`|`4px`|Ikon dan elemen rapat|
|`space-sm`|`8px`|Label–input, chip, ikon–teks|
|`space-md`|`16px`|Jarak antarfield/row|
|`space-lg`|`24px`|Pemisah subkelompok / jarak komponen|
|`space-xl`|`48px`|Ruang antarkelompok besar|
|`space-2xl`|`80px`|Ruang antarseksi landing page|

* **Mobile:** gunakan margin horizontal mulai sekitar `24px` ketika ruang memungkinkan; sesuaikan agar konten tetap muat di layar sempit.
* **Desktop:** tingkatkan margin luar hingga `64px` atau lebih pada area landing page yang luas.
* **Dashboard:** utamakan keterbacaan tabel dan filter. Spacing boleh lebih padat dibanding landing page, tetapi jangan mengorbankan ukuran interaksi.
* **Whitespace:** sisakan ruang kosong yang disengaja. Jangan menambahkan dekorasi hanya untuk mengisi area.

### B. Border Radius

|Token|Nilai|Penggunaan|
|-|-|-|
|`rounded-sm`|`4px`|Checkbox, indikator kecil|
|`rounded-default`|`8px`|Tombol, input, elemen interaktif utama|
|`rounded-md`|`12px`|Dropdown, kontainer sedang|
|`rounded-lg`|`16px`|Card fitur, proyek, dan media|
|`rounded-xl`|`24px`|Hero showcase / panel besar bila diperlukan|
|`rounded-full`|`9999px`|Chips, badge status, avatar|

### C. Elevation \& Shadows

* **Default:** gunakan `surface-container-lowest #FFFFFF` di atas latar `background #F9F9FB` atau `brand-surface-light #F4F4F6`, dengan border halus `1px` (`outline-variant #C8C5D0`, atau outline khusus berkontras lebih rendah jika dibutuhkan).
* **Hover Card:** cukup perubahan border, tone, atau bayangan tipis; hindari lonjakan elevation.
* **Modal / Popover:** gunakan bayangan ambient yang lembut, opacity rendah, dan warna gelap yang tidak mencolok.
* **Larangan:** tidak menggunakan `shadow-xl` untuk semua card, glow neon, gradient tebal, atau glassmorphism sebagai pola dasar.

\---

## 5\. Komponen Inti \& State Styling

### A. Buttons

1. **Primary — Navy**

   * Background `#181343`, teks putih; hover menggunakan varian `#26224C`.
   * `border-radius: 8px`, `label-lg`, padding horizontal memadai, focus ring kontras.
   * Cocok untuk aksi utama yang bersifat operasional: *Lihat Program*, *Lanjutkan*, *Simpan*.
2. **Accent / Conversion — Impact Red**

   * Background identitas `#D9385F`; untuk teks putih ukuran normal, gunakan varian kontras `#D63259` sebagai usulan aksesibilitas; hover sedikit lebih gelap **tanpa mengubah hue secara mencolok**.
   * Cocok untuk *Daftar Akun*, *Buat Akun*, atau CTA pemasaran utama pada satu section.
   * **Jangan** menggunakan warna ini sebagai arti otomatis dari *error*.
3. **Secondary / Outline**

   * Background transparan atau putih, border `1px` navy/outline, teks deep navy.
4. **Ghost / Text Button**

   * Tanpa latar dominan, hover dengan perubahan tone lembut; untuk tindakan sekunder.
5. **Disabled / Loading**

   * Nonaktif jelas secara visual, tidak boleh terkesan masih dapat diklik; tombol loading mempertahankan ukuran agar layout tidak bergeser.

### B. Form Inputs (*Input, Password, Select, Upload*)

* Default: latar putih atau `surface-container-lowest`, border `1px` tonal, radius `8px`.
* Label: **di atas input**, menggunakan `label-lg` atau `label-md` sesuai hierarki. Jangan mengandalkan placeholder sebagai satu-satunya label.
* Focus: gunakan ring/border navy atau impact red sesuai konteks interaksi, dengan kontras yang dapat terlihat.
* Error: `error #BA1A1A`, teks koreksi jelas, dan hubungan visual dengan field yang bermasalah.
* Helper text: singkat, menjelaskan format data, ukuran dokumen, atau alasan pengumpulan data.
* Upload dokumen: tampilkan format yang diterima, batas ukuran, nama berkas, status unggah, serta opsi mengganti/menghapus berkas.
* Field yang wajib diisi memakai penanda konsisten dan error ditampilkan setelah validasi yang relevan.

### C. Status Pills, Chips \& Tags

* Gunakan bentuk pill hanya untuk status, filter, kategori, dan metadata ringkas.
* Default: latar netral lembut dan teks yang cukup kontras; aktif memakai deep navy atau indikator yang sesuai.
* Setiap status wajib memiliki **teks** (`Menunggu Verifikasi`, `Perlu Revisi`, `Disetujui`, dll.), bukan warna semata.
* SDG ditulis sebagai `SDG 4 · Pendidikan Berkualitas`, bukan sekadar angka atau warna.

### D. Lists, Tables \& Filters

* Header tabel jelas; konten rata kiri, angka nominal rata kanan, dan tanggal ditulis konsisten.
* Gunakan pemisah 1px yang lembut; baris memiliki padding vertikal memadai (`16px` sebagai titik awal).
* Sediakan pencarian, filter status/periode/wilayah, urutan kolom jika relevan, dan empty state.
* Klik baris atau tombol *Detail* harus membuka data spesifik, bukan sekadar mengubah warna.
* Anggaran wajib menampilkan format IDR, periode, dan konteks *rencana* vs *realisasi*.

### E. Checkboxes \& Radio Buttons

* Checkbox menggunakan radius `4px`; radio berbentuk lingkaran.
* Pilihan yang aktif memiliki fill / tanda pilih yang jelas; ukuran target sentuh harus memadai.
* Label dapat diklik bersama kontrol, disertai focus state dan deskripsi ketika diperlukan.

### F. Cards

* Background `#FFFFFF`; radius umumnya `16px`; border tipis dan shadow minimal.
* Hindari *card inside card inside card* yang berlebihan.
* **Program / Opportunity Card:** judul, bidang/SDG, lokasi, periode, status, dan aksi utama tersusun jelas. Thumbnail opsional.
* **Evidence / Impact Card:** metrik utama, pembanding/periode, sumber atau catatan data jika relevan.
* **Media / Story Card:** gambar rasio 16:9, heading, deskripsi singkat, metadata, dan tautan detail.

### G. Dashboard KPI, Charts, SDGs \& Peta

* **KPI:** tampilkan nilai, satuan, rentang waktu, dan perubahan bila data pembanding tersedia.
* **Distribusi SDGs:** tampilkan kontribusi untuk 17 SDGs, termasuk tujuan terbanyak, tersedikit, dan belum tercakup. Satu program dapat berkontribusi pada beberapa SDGs; jelaskan aturan penghitungannya.
* **SDGs → ESG:** saat membuat program, pengguna memilih SDGs relevan dan sistem menampilkan pilar ESG berdasarkan pemetaan yang ditetapkan. Jangan menyiratkan pemetaan otomatis universal.
* **Peta penerima manfaat:** sediakan legenda, filter wilayah/SDG/tahun, dan kemampuan melihat rincian. **Bedakan nol penerima manfaat dari data tidak tersedia.**
* **Alokasi anggaran:** tampilkan grafik per tahun serta opsi drill-down ke daftar program dan nilai anggaran.
* **Mitra bekerja sama:** KPI hanya menghitung mitra yang telah memiliki kerja sama dengan perusahaan, **bukan semua mitra terdaftar**.
* **Interaktivitas:** grafik dan ringkasan dapat dipilih/di-klik untuk melihat program, lokasi, mitra, dan indikator yang membentuk agregat.
* **AI:** rekomendasi diberi konteks data dan informasi keterbatasan; jangan membuat skor kepastian yang tidak didukung data.

### H. Monitoring \& Workflow

* Gunakan *stepper*, timeline, dan badge status untuk memperlihatkan proses dari opportunity → proposal → kerja sama → pelaksanaan → evaluasi.
* Daftar kegiatan monitoring berasal dari **kegiatan dalam proposal yang telah disepakati**; NGO memilih kegiatan tersebut dan mengisi progres, realisasi, bukti kegiatan, serta pencapaian indikator, bukan mengetik ulang rencana.
* Bedakan target, progres, realisasi, dan verifikasi perusahaan secara visual dan tekstual.

### I. Additional Components

* **Impact Metrics Display:** nominal/angka utama dengan label dan periode; contoh angka di mockup harus ditandai sebagai simulasi jika belum berasal dari data nyata.
* **Resource Download Banners:** panel navy dengan teks berkontras tinggi dan satu aksi jelas; gunakan bila memang ada materi yang dapat diunduh.
* **Empty / Error / Loading States:** berikan pesan yang dapat ditindaklanjuti, bukan ilustrasi dekoratif yang terlalu besar.
* **Public Survey:** mobile-first, tanpa login, tombol jelas, skala penilaian dan instruksi mudah dipahami.

\---

## 6\. Contoh Layout Halaman Login, Registrasi, Landing Page \& Dashboard

### A. Login — *Centered Institutional Form*

**Menggantikan konsep lama *Split Screen Showcase*.** Berdasarkan rancangan terbaru, login menggunakan fokus pada satu formulir terpusat.

1. **Header minimal:** logo SIPENA dan tautan navigasi seperlunya.
2. **Form container:** kartu putih dengan judul `Masuk ke Akun Institusi`, keterangan pendek, dan jarak antarfield yang jelas.
3. **Aksi utama:** tombol impact red untuk masuk; tampilkan tautan bantuan/registrasi sebagai aksi sekunder.
4. **Validasi:** error pada field spesifik, status loading, dan pesan autentikasi yang jelas.
5. **Responsif:** pada mobile, satu kolom dengan lebar penuh yang dibatasi margin; hindari panel dekoratif yang memperpanjang scroll.

### B. Registrasi — *Progressive Institution Onboarding*

Gunakan **alur bertahap** dengan judul `Pendaftaran Akun Institusi` dan indikator progres yang menunjukkan tahapan aktif.

1. **Tahap identitas akun:** pilih tipe institusi (**Perusahaan** atau **NGO/Yayasan/Komunitas**) lalu lengkapi kredensial pendaftaran.
2. **Tahap profil institusi:** form disesuaikan dengan tipe organisasi; kelompokkan data organisasi, kontak, domisili, dan profil penanggung jawab (PIC).
3. **Tahap verifikasi:** unggah dokumen legalitas serta identitas pendukung sesuai jenis organisasi; tampilkan persyaratan dan status setiap berkas.
4. **Navigasi antarstep:** aksi `Kembali` dan `Lanjutkan`, validasi di tahap terkait, serta indikator langkah selesai. Pertahankan data yang sudah diisi saat berpindah langkah.
5. **Prinsip verifikasi:** pemeriksaan dokumen oleh platform tidak otomatis menjamin keabsahan hukum organisasi.

**Bentuk:** formulir vertikal terpusat, putih pada kanvas cool-neutral, heading navy, dan tombol impact red sebagai aksen konversi. Jangan kembali ke layout dua panel besar hanya untuk menambahkan testimonial.

### C. Landing Page — *Evidence-Led Editorial Layout*

1. **Navbar** minimal: logo, tautan utama, masuk, dan CTA daftar.
2. **Hero** berpusat pada headline Plus Jakarta Sans: teks navy dengan frasa kunci impact red; penjelasan singkat dan dua CTA maksimal.
3. **Product showcase** sebagai bukti visual, dengan frame putih, border ringan, dan satu preview data yang jelas; jangan memakai banyak widget melayang.
4. **Problem → Solution** dalam dua area yang seimbang: masalah tata kelola CSR dan pendekatan SIPENA.
5. **Dua portal pengguna** untuk perusahaan dan mitra, masing-masing dengan manfaat dan CTA yang berbeda.
6. **Alur empat fase** dari perencanaan hingga evaluasi, memakai penomoran dan garis penghubung ringan.
7. **BI \& Impact** dengan contoh visualisasi SDGs/ESG, monitoring, dan rekomendasi AI.
8. **CTA penutup dan footer** menggunakan kontras navy/putih yang rapi dan ruang kosong memadai.

**Aturan:** bergantian menggunakan `background #F9F9FB`, `brand-surface-light #F4F4F6`, dan kartu putih. Jangan mengubah landing page menjadi katalog kartu yang terlalu padat.

### D. Dashboard — *Structured Operational Intelligence*

* **Navigasi:** sidebar untuk modul operasional, topbar untuk identitas halaman, akun, dan aksi kontekstual. Varian sidebar terang/gelap mengikuti area modul dan tetap konsisten dalam setiap konteks.
* **Ringkasan:** KPI secukupnya di bagian atas; grafik, daftar tugas, dan tabel detail setelahnya.
* **Modul perusahaan:** overview CSR, peluang/inisiatif, proposal masuk, pelaksanaan program, pendanaan, mitra kerja sama, dashboard SDGs/ESG, dan pelaporan.
* **Modul mitra:** pencarian opportunity, proposal, kerja sama, daftar kegiatan monitoring yang diturunkan dari proposal, laporan realisasi, dan bukti kegiatan.
* **BI:** filter tahun dan wilayah, visualisasi kontribusi SDGs, pilar ESG, anggaran, status program, dan peta penerima manfaat. Grafik dapat membawa pengguna ke rincian sumber data.
* **Perilaku responsif:** tabel panjang memakai pola scroll horizontal yang terkontrol atau detail mobile, sidebar menjadi navigasi ringkas, filter tetap mudah ditemukan.

\---

## 7\. Variabel Tailwind CSS v4 (`app/globals.css`)

Contoh implementasi token **mengikuti nilai panduan baru**. Warna brand diberi alias tersendiri agar tidak bertabrakan dengan token semantik `primary` yang memang ditetapkan `#000000` dalam spesifikasi sumber.

```css
@import "tailwindcss";

@theme {
  /\* Identitas brand SIPENA \*/
  --color-brand-deep-navy: #181343;
  --color-brand-secondary-navy: #26224C;
  --color-brand-impact-red: #D9385F;
  --color-brand-impact-red-contrast: #D63259; /\* usulan untuk CTA dengan teks putih \*/
  --color-brand-surface-light: #F4F4F6;
  --color-brand-pure-white: #FFFFFF;

  /\* Background, surfaces \& text \*/
  --color-background: #F9F9FB;
  --color-on-background: #1A1C1D;
  --color-surface: #F9F9FB;
  --color-surface-dim: #D9DADC;
  --color-surface-bright: #F9F9FB;
  --color-surface-container-lowest: #FFFFFF;
  --color-surface-container-low: #F3F3F5;
  --color-surface-container: #EEEEF0;
  --color-surface-container-high: #E8E8EA;
  --color-surface-container-highest: #E2E2E4;
  --color-surface-variant: #E2E2E4;
  --color-on-surface: #1A1C1D;
  --color-on-surface-variant: #47464F;
  --color-outline: #787680;
  --color-outline-variant: #C8C5D0;
  --color-inverse-surface: #2F3132;
  --color-inverse-on-surface: #F0F0F2;
  --color-surface-tint: #5D588C;

  /\* Semantic source tokens: pertahankan nilai asal \*/
  --color-primary: #000000;
  --color-on-primary: #FFFFFF;
  --color-primary-container: #191444;
  --color-on-primary-container: #837EB4;
  --color-inverse-primary: #C6C0FA;
  --color-secondary: #5D5987;
  --color-on-secondary: #FFFFFF;
  --color-secondary-container: #CFC9FE;
  --color-on-secondary-container: #575380;
  --color-tertiary: #000000;
  --color-on-tertiary: #FFFFFF;
  --color-tertiary-container: #400012;
  --color-on-tertiary-container: #EA456B;
  --color-error: #BA1A1A;
  --color-on-error: #FFFFFF;
  --color-error-container: #FFDAD6;
  --color-on-error-container: #93000A;
  --color-primary-fixed: #E4DFFF;
  --color-primary-fixed-dim: #C6C0FA;
  --color-on-primary-fixed: #191444;
  --color-on-primary-fixed-variant: #454172;
  --color-secondary-fixed: #E4DFFF;
  --color-secondary-fixed-dim: #C7C1F5;
  --color-on-secondary-fixed: #1A153F;
  --color-on-secondary-fixed-variant: #46426D;
  --color-tertiary-fixed: #FFD9DD;
  --color-tertiary-fixed-dim: #FFB2BB;
  --color-on-tertiary-fixed: #400012;
  --color-on-tertiary-fixed-variant: #910033;

  /\* Typeface \*/
  --font-display: "Plus Jakarta Sans", sans-serif;
  --font-body: "Inter", sans-serif;

  /\* Shapes \*/
  --radius-sm: 0.25rem;
  --radius-default: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-full: 9999px;

  /\* Layout spacing (Tailwind custom spacing tokens) \*/
  --spacing-gutter: 24px;
  --spacing-page-margin: 32px;
  --spacing-section-xl: 48px;
  --spacing-section-2xl: 80px;
}

@layer base {
  body {
    background: var(--color-background);
    color: var(--color-on-surface);
    font-family: var(--font-body);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
  }
}

@layer components {
  .headline-xl {
    font-family: var(--font-display);
    font-size: 48px;
    font-weight: 700;
    line-height: 56px;
    letter-spacing: -0.02em;
  }

  .headline-lg {
    font-family: var(--font-display);
    font-size: 36px;
    font-weight: 700;
    line-height: 44px;
    letter-spacing: -0.01em;
  }

  .headline-md {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 600;
    line-height: 36px;
  }

  .headline-sm {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 600;
    line-height: 28px;
  }

  .btn-primary {
    background: var(--color-brand-deep-navy);
    color: #FFFFFF;
    border-radius: var(--radius-default);
    font: 600 14px/20px var(--font-body);
  }

  .btn-primary:hover {
    background: var(--color-brand-secondary-navy);
  }

  .btn-accent {
    background: var(--color-brand-impact-red-contrast);
    color: #FFFFFF;
    border-radius: var(--radius-default);
    font: 600 14px/20px var(--font-body);
  }

  .card-sipena {
    background: var(--color-surface-container-lowest);
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--radius-lg);
  }
}

@media (max-width: 640px) {
  .headline-xl {
    font-size: 28px;
    line-height: 34px;
    letter-spacing: normal;
  }

  .headline-md {
    font-size: 24px;
    line-height: 30px;
  }
}
```

