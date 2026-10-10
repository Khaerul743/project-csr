import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Building2,
  Users2,
  BarChart3,
  CheckCircle2,
  Search,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                CSR Impact Hub
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold tracking-wider uppercase">
                Platform Kolaborasi ESG
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Daftar Akun
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
          {/* Subtle decorative glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <Badge variant="emerald" hasDot size="md">
                Kemitraan Berkelanjutan & Berdampak
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6">
              Jembatan Strategis Antara <br className="hidden sm:inline" />
              <span className="text-emerald-600">Perusahaan</span> dan{" "}
              <span className="text-slate-900">Mitra CSR</span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-10">
              Platform terintegrasi yang memudahkan perusahaan meluncurkan program CSR terarah, serta membantu yayasan dan mitra menemukan inisiatif sosial yang tepat sasaran.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Mulai Bergabung Sekarang
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Masuk ke Dashboard
                </Button>
              </Link>
            </div>

            {/* Quick value badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mitra Terverifikasi</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Selaras dengan 17 SDG</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Transparansi Anggaran & Laporan</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3">
                Dirancang untuk Efisiensi Ekosistem CSR
              </h2>
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                Menghubungkan sumber daya korporat dengan keahlian eksekusi mitra di lapangan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Card 1 */}
              <Card className="hover:border-emerald-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <CardTitle>Bagi Perusahaan</CardTitle>
                  <CardDescription>
                    Publikasikan program CSR, kelola alokasi pendanaan, seleksi proposal mitra yang paling relevan, dan pastikan kepatuhan ESG.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Manajemen inisiatif CSR fleksibel
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Seleksi proposal mitra transparan
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Card 2 */}
              <Card className="hover:border-emerald-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <Users2 className="w-6 h-6" />
                  </div>
                  <CardTitle>Bagi Mitra & NGO</CardTitle>
                  <CardDescription>
                    Temukan inisiatif CSR yang sesuai dengan fokus organisasi Anda, ajukan rencana program, dan perluas jangkauan manfaat.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Eksplorasi proyek berdasarkan kategori
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Peluang kolaborasi langsung dengan industri
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Card 3 */}
              <Card className="hover:border-emerald-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <CardTitle>Dampak & Akuntabilitas</CardTitle>
                  <CardDescription>
                    Pantau target penerima manfaat, pelaporan berkala, dan dokumentasi kemajuan proyek dengan metrik yang terukur.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Pelaporan berbasis pencapaian nyata
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Katalog portfolio proyek terdahulu
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-white">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="font-bold tracking-tight">CSR Impact Hub</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; 2026 CSR Impact Hub. Platform Kolaborasi Perusahaan & Mitra CSR.
          </p>
        </div>
      </footer>
    </div>
  );
}
