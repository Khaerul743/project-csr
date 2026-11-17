import { tool } from "@langchain/core/tools";
import { eq, ne, and, or, like, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { opportunities } from "@/db/schema/opportunities";
import { companies } from "@/db/schema/companies";
import { partners } from "@/db/schema/partners";
import { proposals } from "@/db/schema/proposals";
import { programs } from "@/db/schema/programs";
import { programStages } from "@/db/schema/program-stages";
import { programActivities } from "@/db/schema/program-activities";
import { AuthUser } from "@/common/guards/auth.guard";
import {
  searchOpportunitiesInputSchema,
  getOpportunityDetailInputSchema,
  getMyProposalsInputSchema,
  getProposalDetailInputSchema,
  getMyProgramsOverviewInputSchema,
  getProgramMilestonesProgressInputSchema,
  getCsrSdgsBenchmarkInputSchema,
  getCompanyGeographicFootprintInputSchema,
} from "./chatbot.schema";
import {
  INDONESIA_PROVINCE_GEO,
  matchGeoProvinceName,
} from "@/components/dashboard/company/overview/indonesia-geo-coordinates";

export interface ToolExecutionEvent {
  toolName: string;
  args: any;
  resultSummary?: string;
  cardData?: any;
}

export function createChatbotTools(authUser: AuthUser, onToolExecuted?: (event: ToolExecutionEvent) => void) {
  // 1. Search Opportunities Tool
  const searchOpportunities = tool(
    async (input) => {
      try {
        const conditions = [eq(opportunities.status, "OPEN")];

        if (input.focusArea) {
          conditions.push(eq(opportunities.focusArea, input.focusArea));
        }

        if (input.location) {
          const loc = `%${input.location.trim()}%`;
          conditions.push(
            or(like(opportunities.targetCity, loc), like(opportunities.targetProvince, loc))!
          );
        }

        if (input.keyword) {
          const kw = `%${input.keyword.trim()}%`;
          conditions.push(
            or(like(opportunities.title, kw), like(opportunities.description, kw))!
          );
        }

        const rows = await db
          .select({
            id: opportunities.id,
            title: opportunities.title,
            focusArea: opportunities.focusArea,
            estimatedBudget: opportunities.estimatedBudget,
            targetCity: opportunities.targetCity,
            targetProvince: opportunities.targetProvince,
            deadline: opportunities.deadline,
            companyName: companies.name,
            companyCity: companies.city,
          })
          .from(opportunities)
          .leftJoin(companies, eq(opportunities.companyId, companies.id))
          .where(and(...conditions))
          .orderBy(desc(opportunities.createdAt))
          .limit(5);

        const filteredRows = rows.filter((r) => {
          if (input.minBudget && r.estimatedBudget && Number(r.estimatedBudget) < input.minBudget) {
            return false;
          }
          if (input.maxBudget && r.estimatedBudget && Number(r.estimatedBudget) > input.maxBudget) {
            return false;
          }
          return true;
        });

        if (onToolExecuted) {
          onToolExecuted({
            toolName: "searchOpportunities",
            args: input,
            resultSummary: `Ditemukan ${filteredRows.length} peluang CSR terbuka`,
            cardData: { type: "OPPORTUNITIES", items: filteredRows },
          });
        }

        if (filteredRows.length === 0) {
          return JSON.stringify({
            message: "Tidak ditemukan peluang CSR aktif dengan kriteria tersebut saat ini.",
            totalFound: 0,
            suggestions: "Coba perluas lokasi pencarian atau jangan batasi rentang budget.",
          });
        }

        return JSON.stringify({
          totalFound: filteredRows.length,
          opportunities: filteredRows.map((o) => ({
            id: o.id,
            title: o.title,
            company: o.companyName || "Perusahaan Korporasi",
            focusArea: o.focusArea,
            budget: o.estimatedBudget ? `Rp ${Number(o.estimatedBudget).toLocaleString("id-ID")}` : "Menyesuaikan",
            location: [o.targetCity, o.targetProvince].filter(Boolean).join(", ") || "Seluruh Indonesia",
            deadline: o.deadline ? new Date(o.deadline).toISOString().split("T")[0] : "Belum ditentukan",
          })),
        });
      } catch (err: any) {
        return JSON.stringify({ error: `Gagal mencari peluang: ${err.message}` });
      }
    },
    {
      name: "searchOpportunities",
      description:
        "Mencari daftar peluang CSR aktif (OPEN) di platform SIPENA berdasarkan fokus area, lokasi kota/provinsi, rentang budget, atau kata kunci.",
      schema: searchOpportunitiesInputSchema,
    }
  );

  // 2. Get Opportunity Detail Tool
  const getOpportunityDetail = tool(
    async (input) => {
      try {
        const rows = await db
          .select({
            id: opportunities.id,
            title: opportunities.title,
            description: opportunities.description,
            focusArea: opportunities.focusArea,
            targetCity: opportunities.targetCity,
            targetProvince: opportunities.targetProvince,
            estimatedBudget: opportunities.estimatedBudget,
            deadline: opportunities.deadline,
            status: opportunities.status,
            companyName: companies.name,
            companyIndustry: companies.industry,
            companyCsrVision: companies.csrVision,
          })
          .from(opportunities)
          .leftJoin(companies, eq(opportunities.companyId, companies.id))
          .where(eq(opportunities.id, input.opportunityId))
          .limit(1);

        if (!rows[0]) {
          return JSON.stringify({ error: `Peluang CSR dengan ID '${input.opportunityId}' tidak ditemukan.` });
        }

        const opp = rows[0];
        if (onToolExecuted) {
          onToolExecuted({
            toolName: "getOpportunityDetail",
            args: input,
            resultSummary: `Detail peluang: ${opp.title}`,
            cardData: { type: "OPPORTUNITY_DETAIL", item: opp },
          });
        }

        return JSON.stringify({
          id: opp.id,
          title: opp.title,
          description: opp.description,
          focusArea: opp.focusArea,
          company: opp.companyName,
          companyIndustry: opp.companyIndustry,
          estimatedBudget: opp.estimatedBudget
            ? `Rp ${Number(opp.estimatedBudget).toLocaleString("id-ID")}`
            : "Fleksibel",
          location: [opp.targetCity, opp.targetProvince].filter(Boolean).join(", ") || "Nasional",
          deadline: opp.deadline ? new Date(opp.deadline).toISOString().split("T")[0] : "Terbuka",
          status: opp.status,
        });
      } catch (err: any) {
        return JSON.stringify({ error: `Gagal memuat detail peluang: ${err.message}` });
      }
    },
    {
      name: "getOpportunityDetail",
      description:
        "Mengambil informasi rincian lengkap satu peluang CSR (deskripsi latar belakang, kriteria mitra, budget, deadline, profil perusahaan penyelenggara).",
      schema: getOpportunityDetailInputSchema,
    }
  );

  // 3. Get My Proposals Tool
  const getMyProposals = tool(
    async (input) => {
      try {
        const conditions: any[] = [];

        if (authUser.partnerId) {
          conditions.push(eq(proposals.partnerId, authUser.partnerId));
        } else if (authUser.companyId) {
          conditions.push(eq(opportunities.companyId, authUser.companyId));
        }

        if (input.status) {
          conditions.push(eq(proposals.status, input.status));
        }

        const rows = await db
          .select({
            id: proposals.id,
            title: proposals.title,
            opportunityTitle: opportunities.title,
            partnerName: partners.name,
            companyName: companies.name,
            proposedBudget: proposals.proposedBudget,
            status: proposals.status,
            aiScore: proposals.aiScore,
            feedback: proposals.feedback,
            createdAt: proposals.createdAt,
          })
          .from(proposals)
          .leftJoin(opportunities, eq(proposals.opportunityId, opportunities.id))
          .leftJoin(companies, eq(opportunities.companyId, companies.id))
          .leftJoin(partners, eq(proposals.partnerId, partners.id))
          .where(and(...conditions))
          .orderBy(desc(proposals.createdAt))
          .limit(8);

        if (onToolExecuted) {
          onToolExecuted({
            toolName: "getMyProposals",
            args: input,
            resultSummary: `Ditemukan ${rows.length} proposal`,
            cardData: { type: "PROPOSALS", items: rows },
          });
        }

        return JSON.stringify({
          total: rows.length,
          proposals: rows.map((p) => ({
            id: p.id,
            title: p.title,
            opportunity: p.opportunityTitle || "Peluang CSR",
            partner: p.partnerName,
            company: p.companyName,
            budget: `Rp ${Number(p.proposedBudget).toLocaleString("id-ID")}`,
            status: p.status,
            aiScore: p.aiScore ? `${p.aiScore}/100` : "Belum dinilai",
            hasFeedback: Boolean(p.feedback),
            feedbackSnippet: p.feedback ? p.feedback.slice(0, 150) + "..." : null,
          })),
        });
      } catch (err: any) {
        return JSON.stringify({ error: `Gagal mengambil daftar proposal: ${err.message}` });
      }
    },
    {
      name: "getMyProposals",
      description:
        "Melihat riwayat proposal CSR milik pengguna saat ini (Mitra: proposal yang diajukan; Perusahaan: proposal yang masuk untuk peluang mereka) beserta status evaluasi dan catatan reviewer.",
      schema: getMyProposalsInputSchema,
    }
  );

  // 4. Get Proposal Detail Tool
  const getProposalDetail = tool(
    async (input) => {
      try {
        const rows = await db
          .select({
            id: proposals.id,
            title: proposals.title,
            summary: proposals.summary,
            proposedBudget: proposals.proposedBudget,
            durationMonths: proposals.durationMonths,
            targetBeneficiaries: proposals.targetBeneficiaries,
            feedback: proposals.feedback,
            status: proposals.status,
            aiScore: proposals.aiScore,
            aiScreeningResult: proposals.aiScreeningResult,
            opportunityTitle: opportunities.title,
            partnerName: partners.name,
            companyName: companies.name,
          })
          .from(proposals)
          .leftJoin(opportunities, eq(proposals.opportunityId, opportunities.id))
          .leftJoin(companies, eq(opportunities.companyId, companies.id))
          .leftJoin(partners, eq(proposals.partnerId, partners.id))
          .where(eq(proposals.id, input.proposalId))
          .limit(1);

        if (!rows[0]) {
          return JSON.stringify({ error: `Proposal dengan ID '${input.proposalId}' tidak ditemukan.` });
        }

        const prop = rows[0];
        let screeningParsed = null;
        if (prop.aiScreeningResult) {
          try {
            screeningParsed = JSON.parse(prop.aiScreeningResult);
          } catch {
            screeningParsed = prop.aiScreeningResult;
          }
        }

        return JSON.stringify({
          id: prop.id,
          title: prop.title,
          summary: prop.summary,
          proposedBudget: `Rp ${Number(prop.proposedBudget).toLocaleString("id-ID")}`,
          duration: `${prop.durationMonths || 6} bulan`,
          targetBeneficiaries: prop.targetBeneficiaries || "Masyarakat umum",
          status: prop.status,
          feedbackFromReviewer: prop.feedback || "Belum ada catatan revisi.",
          aiScore: prop.aiScore ? `${prop.aiScore}/100` : "Belum dinilai",
          aiScreeningSummary: screeningParsed?.overallSummary || null,
          weaknessesOrRevisionPoints: screeningParsed?.weaknesses || null,
        });
      } catch (err: any) {
        return JSON.stringify({ error: `Gagal memuat detail proposal: ${err.message}` });
      }
    },
    {
      name: "getProposalDetail",
      description:
        "Mendapatkan rincian lengkap sebuah proposal, termasuk ringkasan latar belakang, target penerima manfaat, catatan revisi dari perusahaan, dan analisis kelemahan dari AI Screener.",
      schema: getProposalDetailInputSchema,
    }
  );

  // 5. Get My Programs Overview Tool
  const getMyProgramsOverview = tool(
    async (input) => {
      try {
        const conditions: any[] = [];
        if (authUser.partnerId) {
          conditions.push(eq(programs.partnerId, authUser.partnerId));
        } else if (authUser.companyId) {
          conditions.push(eq(programs.companyId, authUser.companyId));
        }

        if (input.status) {
          conditions.push(eq(programs.status, input.status));
        }

        const rows = await db
          .select({
            id: programs.id,
            title: programs.title,
            focusArea: programs.focusArea,
            budget: programs.budget,
            spentBudget: programs.spentBudget,
            status: programs.status,
            targetBeneficiaries: programs.targetBeneficiaries,
            actualBeneficiaries: programs.actualBeneficiaries,
            partnerName: partners.name,
            companyName: companies.name,
          })
          .from(programs)
          .leftJoin(companies, eq(programs.companyId, companies.id))
          .leftJoin(partners, eq(programs.partnerId, partners.id))
          .where(and(...conditions))
          .orderBy(desc(programs.createdAt))
          .limit(8);

        return JSON.stringify({
          totalPrograms: rows.length,
          programs: rows.map((p) => {
            const b = Number(p.budget || 0);
            const s = Number(p.spentBudget || 0);
            const pct = b > 0 ? Math.round((s / b) * 100) : 0;
            return {
              id: p.id,
              title: p.title,
              focusArea: p.focusArea,
              partner: p.partnerName,
              company: p.companyName,
              status: p.status,
              totalBudget: `Rp ${b.toLocaleString("id-ID")}`,
              spentBudget: `Rp ${s.toLocaleString("id-ID")} (${pct}%)`,
              targetBeneficiaries: p.targetBeneficiaries || "Belum ada target",
              actualBeneficiaries: p.actualBeneficiaries || "0",
            };
          }),
        });
      } catch (err: any) {
        return JSON.stringify({ error: `Gagal mengambil daftar program: ${err.message}` });
      }
    },
    {
      name: "getMyProgramsOverview",
      description:
        "Melihat ringkasan eksekutif program CSR yang sedang berjalan, direncanakan, atau selesai milik pengguna saat ini (termasuk serapan anggaran dan capaian penerima manfaat).",
      schema: getMyProgramsOverviewInputSchema,
    }
  );

  // 6. Get Program Milestones Progress Tool
  const getProgramMilestonesProgress = tool(
    async (input) => {
      try {
        const [progRows, stages, activities] = await Promise.all([
          db
            .select({
              id: programs.id,
              title: programs.title,
              budget: programs.budget,
              spentBudget: programs.spentBudget,
              status: programs.status,
              targetBeneficiaries: programs.targetBeneficiaries,
              actualBeneficiaries: programs.actualBeneficiaries,
            })
            .from(programs)
            .where(eq(programs.id, input.programId))
            .limit(1),
          db
            .select()
            .from(programStages)
            .where(eq(programStages.programId, input.programId))
            .orderBy(programStages.orderIndex),
          db
            .select()
            .from(programActivities)
            .where(eq(programActivities.programId, input.programId))
            .orderBy(desc(programActivities.createdAt))
            .limit(5),
        ]);

        if (!progRows[0]) {
          return JSON.stringify({ error: `Program dengan ID '${input.programId}' tidak ditemukan.` });
        }

        const prog = progRows[0];
        return JSON.stringify({
          programTitle: prog.title,
          status: prog.status,
          totalBudget: `Rp ${Number(prog.budget).toLocaleString("id-ID")}`,
          spentBudget: `Rp ${Number(prog.spentBudget || 0).toLocaleString("id-ID")}`,
          beneficiaries: `${prog.actualBeneficiaries || 0} / ${prog.targetBeneficiaries || "0"} orang`,
          stages: stages.map((s) => ({
            stageName: s.title,
            status: s.status,
            targetTimeline: s.targetTimeline || "N/A",
          })),
          recentActivities: activities.map((a) => ({
            title: a.title,
            status: a.status,
            date: a.activityDate ? new Date(a.activityDate).toISOString().split("T")[0] : "N/A",
            beneficiariesReached: a.beneficiariesReached || 0,
          })),
        });
      } catch (err: any) {
        return JSON.stringify({ error: `Gagal memuat progres tahapan program: ${err.message}` });
      }
    },
    {
      name: "getProgramMilestonesProgress",
      description:
        "Melihat rincian tahapan (stages), progres aktivitas lapangan terbaru, dan verifikasi capaian pada suatu program CSR.",
      schema: getProgramMilestonesProgressInputSchema,
    }
  );

  // 7. Get My Organization Profile Tool
  const getMyOrganizationProfile = tool(
    async () => {
      try {
        if (authUser.partnerId) {
          const rows = await db
            .select()
            .from(partners)
            .where(eq(partners.id, authUser.partnerId))
            .limit(1);

          if (!rows[0]) return JSON.stringify({ message: "Profil mitra belum lengkap." });
          const p = rows[0];
          return JSON.stringify({
            organizationType: "PARTNER (Mitra NGO / Yayasan)",
            name: p.name,
            tagline: p.tagline,
            legalType: p.organizationType,
            focusArea: p.focusArea,
            city: p.city,
            province: p.province,
            description: p.description,
          });
        }

        if (authUser.companyId) {
          const rows = await db
            .select()
            .from(companies)
            .where(eq(companies.id, authUser.companyId))
            .limit(1);

          if (!rows[0]) return JSON.stringify({ message: "Profil perusahaan belum lengkap." });
          const c = rows[0];
          return JSON.stringify({
            organizationType: "COMPANY (Perusahaan Korporasi)",
            name: c.name,
            industry: c.industry,
            csrVision: c.csrVision,
            city: c.city,
            province: c.province,
            description: c.description,
          });
        }

        return JSON.stringify({ organizationType: "User Mandiri", name: authUser.email });
      } catch (err: any) {
        return JSON.stringify({ error: `Gagal membaca profil organisasi: ${err.message}` });
      }
    },
    {
      name: "getMyOrganizationProfile",
      description:
        "Mendapatkan profil resmi organisasi pengguna saat ini (Visi CSR dan industri bagi Perusahaan; atau fokus isu dan legalitas bagi Mitra NGO).",
      schema: searchOpportunitiesInputSchema.pick({}), // empty schema
    }
  );

  // 8. Get CSR & SDGs Benchmark Tool
  const getCsrSdgsBenchmark = tool(
    async (input) => {
      const benchmarks = [
        {
          focusArea: "LINGKUNGAN",
          sdgs: ["SDG 13: Aksi Iklim", "SDG 14: Ekosistem Lautan", "SDG 15: Ekosistem Daratan"],
          sampleMetrics: [
            "Jumlah bibit pohon/mangrove tertanam dan tingkat kelulusan hidup (survival rate > 80%)",
            "Estimasi penyerapan emisi karbon (ton CO2e)",
            "Luas area konservasi yang direhabilitasi (hektar)",
            "Jumlah volume sampah plastik yang terkelola/didaur ulang (kg/ton)",
          ],
        },
        {
          focusArea: "PENDIDIKAN",
          sdgs: ["SDG 4: Pendidikan Berkualitas", "SDG 8: Pekerjaan Layak & Pertumbuhan Ekonomi"],
          sampleMetrics: [
            "Jumlah siswa/mahasiswa penerima beasiswa",
            "Peningkatan nilai kompetensi/sertifikasi vokasi (%)",
            "Tingkat serapan kerja lulusan pelatihan (> 60% dalam 6 bulan)",
            "Fasilitas ruang kelas/lab komputer yang direvitalisasi",
          ],
        },
        {
          focusArea: "KESEHATAN",
          sdgs: ["SDG 2: Tanpa Kelaparan", "SDG 3: Kehidupan Sehat & Sejahtera"],
          sampleMetrics: [
            "Penurunan angka prevalensi balita stunting di desa target",
            "Jumlah ibu hamil dan balita yang menerima makanan tambahan bergizi (PMT)",
            "Cakupan layanan posyandu dan pemeriksaan kesehatan gratis",
          ],
        },
        {
          focusArea: "PEMBERDAYAAN_EKONOMI",
          sdgs: ["SDG 1: Tanpa Kemiskinan", "SDG 8: Pekerjaan Layak", "SDG 10: Berkurangnya Kesenjangan"],
          sampleMetrics: [
            "Peningkatan omzet bulanan kelompok UMKM mitra (> 25%)",
            "Jumlah perempuan pelaku usaha mikro yang terfasilitasi modal bergulir",
            "Akses pasar digital dan perizinan legal (NIB / Halal)",
          ],
        },
      ];

      return JSON.stringify({
        guidance: "Standar Kerangka Pilar ESG & UN SDGs untuk Program CSR Berdampak Tinggi",
        query: input.topic || "Semua Fokus CSR",
        frameworks: benchmarks,
      });
    },
    {
      name: "getCsrSdgsBenchmark",
      description:
        "Mengambil panduan standar 17 UN SDGs, 7 Fokus Area CSR SIPENA, dan metrik indikator keberhasilan terukur (Pilar ESG) untuk brainstorming program CSR.",
      schema: getCsrSdgsBenchmarkInputSchema,
    }
  );

  // 9. Get Company Geographic Footprint & Unreached Territories Tool
  const getCompanyGeographicFootprint = tool(
    async (input) => {
      try {
        const companyId = authUser.companyId;
        if (!companyId) {
          return JSON.stringify({
            message:
              "Tool ini dikhususkan untuk akun Perusahaan (Company / CSR Admin). Pengguna saat ini tidak terikat pada entitas perusahaan tertentu.",
          });
        }

        // Fetch company name & profile
        const [companyRow] = await db
          .select({ id: companies.id, name: companies.name, csrVision: companies.csrVision })
          .from(companies)
          .where(eq(companies.id, companyId))
          .limit(1);

        // Fetch all active & completed programs and opportunities of this company
        const [progRows, oppRows, allVerifiedPartners] = await Promise.all([
          db
            .select({
              id: programs.id,
              title: programs.title,
              targetProvince: programs.targetProvince,
              targetCity: programs.targetCity,
              focusArea: programs.focusArea,
              status: programs.status,
              budget: programs.budget,
              actualBeneficiaries: programs.actualBeneficiaries,
            })
            .from(programs)
            .where(and(eq(programs.companyId, companyId), ne(programs.status, "CANCELLED"))),
          db
            .select({
              id: opportunities.id,
              title: opportunities.title,
              targetProvince: opportunities.targetProvince,
              targetCity: opportunities.targetCity,
              focusArea: opportunities.focusArea,
              status: opportunities.status,
            })
            .from(opportunities)
            .where(eq(opportunities.companyId, companyId)),
          db
            .select({
              id: partners.id,
              name: partners.name,
              province: partners.province,
              city: partners.city,
              focusArea: partners.focusArea,
              status: partners.status,
            })
            .from(partners)
            .where(and(eq(partners.status, "ACTIVE"), eq(partners.isVerified, true))),
        ]);

        // Map covered provinces
        const coveredSet = new Set<string>();
        progRows.forEach((p) => {
          const matched = matchGeoProvinceName(p.targetProvince);
          if (matched) coveredSet.add(matched);
        });
        oppRows.forEach((o) => {
          const matched = matchGeoProvinceName(o.targetProvince);
          if (matched) coveredSet.add(matched);
        });

        const coveredProvincesList = Array.from(coveredSet);
        const totalNational = 38;
        const unreachedCount = Math.max(0, totalNational - coveredProvincesList.length);

        // Unreached provinces list
        let unreachedCandidates = Object.entries(INDONESIA_PROVINCE_GEO)
          .filter(([name]) => !coveredSet.has(name))
          .map(([name, geo]) => ({ name, island: geo.island }));

        if (input.islandGroup) {
          const islandFilter = input.islandGroup.toLowerCase().trim();
          const filtered = unreachedCandidates.filter(
            (c) =>
              c.island.toLowerCase().includes(islandFilter) ||
              islandFilter.includes(c.island.toLowerCase())
          );
          if (filtered.length > 0) {
            unreachedCandidates = filtered;
          }
        }

        // Regional benchmark data
        const getRegionalRecommendationContext = (provName: string, island: string) => {
          if (provName.includes("Nusa Tenggara Timur") || provName.includes("Nusa Tenggara Barat")) {
            return {
              urgency:
                "Tingginya angka prevalensi stunting balita pedesaan, kerentanan pangan keluarga, dan terbatasnya akses fasilitas MCK/sanitasi higienis.",
              proposedTitle: "Program Air Bersih Pedesaan & Kebun Gizi Mandiri Pencegah Stunting",
              focusArea: "KESEHATAN",
              sdgs: ["SDG 2: Tanpa Kelaparan", "SDG 3: Kehidupan Sehat", "SDG 6: Air Bersih & Sanitasi"],
            };
          }
          if (island === "Papua") {
            return {
              urgency:
                "Kesenjangan sarana ruang kelas sekolah 3T, akses buku literasi digital pemuda, dan kebutuhan elektrifikasi surya mandiri di pelosok.",
              proposedTitle: "Revitalisasi Sarana Sekolah 3T & Laboratorium Belajar Mandiri Tenaga Surya",
              focusArea: "PENDIDIKAN",
              sdgs: ["SDG 4: Pendidikan Berkualitas", "SDG 7: Energi Bersih", "SDG 9: Industri & Infrastruktur"],
            };
          }
          if (island === "Maluku") {
            return {
              urgency:
                "Degradasi ekosistem terumbu karang dan pesisir, ancaman abrasi pulau terluar, serta keterbatasan rantai pasok ekonomi nelayan tradisional.",
              proposedTitle: "Konservasi Pesisir Terpadu & Sentra Pemberdayaan Ekonomi Nelayan Pesisir",
              focusArea: "LINGKUNGAN",
              sdgs: ["SDG 14: Ekosistem Laut", "SDG 8: Pekerjaan Layak", "SDG 13: Aksi Iklim"],
            };
          }
          if (island === "Kalimantan") {
            return {
              urgency:
                "Restorasi ekosistem gambut, pencegahan karhutla, dan penyediaan infrastruktur dasar air bersih perpipaan komunal warga pedesaan.",
              proposedTitle: "Restorasi Ekosistem Gambut Berbasis Masyarakat & Penyediaan Air Bersih Komunal",
              focusArea: "LINGKUNGAN",
              sdgs: ["SDG 15: Ekosistem Darat", "SDG 6: Air Bersih", "SDG 13: Aksi Iklim"],
            };
          }
          if (island === "Sulawesi") {
            return {
              urgency:
                "Pendampingan pascapanen komoditas perkebunan kakao/kopi UMKM tani, mitigasi kerentanan gempa/longsor, dan nutrisi keluarga.",
              proposedTitle: "Inkubasi Bisnis UMKM Tani Berkelanjutan & Ketangguhan Bencana Komunal",
              focusArea: "PEMBERDAYAAN_EKONOMI",
              sdgs: ["SDG 8: Pekerjaan Layak", "SDG 11: Kota & Permukiman Tangguh", "SDG 1: Tanpa Kemiskinan"],
            };
          }
          return {
            urgency:
              "Pemberdayaan ekonomi produktif keluarga prasejahtera, peningkatan keterampilan kerja vokasi pemuda, dan pengelolaan sampah terpadu.",
            proposedTitle: "Sentra Inkubasi Wirausaha Hijau & Pelatihan Vokasi Keterampilan Kerja Pemuda",
            focusArea: "PEMBERDAYAAN_EKONOMI",
            sdgs: ["SDG 1: Tanpa Kemiskinan", "SDG 8: Pekerjaan Layak", "SDG 12: Konsumsi Berkelanjutan"],
          };
        };

        // Enrich candidates with partners & scoring
        const enriched = unreachedCandidates.map((c) => {
          const partnersInProv = allVerifiedPartners.filter((p) => {
            const match = matchGeoProvinceName(p.province);
            return match === c.name;
          });

          const recContext = getRegionalRecommendationContext(c.name, c.island);
          let score = 10;
          if (partnersInProv.length > 0) score += 20; // Bonus: verified partners ready in the area
          if (input.focusArea && recContext.focusArea === input.focusArea) score += 30; // Matches requested focus

          return {
            province: c.name,
            island: c.island,
            urgencyTopic: recContext.urgency,
            proposedProgramTitle: recContext.proposedTitle,
            focusArea: recContext.focusArea,
            sdgs: recContext.sdgs,
            verifiedPartnersCount: partnersInProv.length,
            samplePartners: partnersInProv.slice(0, 3).map((p) => ({
              id: p.id,
              name: p.name,
              focusArea: p.focusArea,
              city: p.city || c.name,
            })),
            score,
          };
        });

        // Sort by score descending and take limit
        enriched.sort((a, b) => b.score - a.score);
        const topRecommendations = enriched.slice(0, input.limit || 5);

        // Emit card event for interactive rendering in Chatbot UI
        if (onToolExecuted) {
          onToolExecuted({
            toolName: "getCompanyGeographicFootprint",
            args: input,
            resultSummary: `Cakupan saat ini: ${coveredProvincesList.length} dari 38 provinsi. Menemukan ${topRecommendations.length} wilayah rekomendasi ekspansi baru.`,
            cardData: {
              type: "TERRITORY_EXPANSION",
              companyName: companyRow?.name || "Perusahaan",
              coveredCount: coveredProvincesList.length,
              totalNational: totalNational,
              unreachedCount: unreachedCount,
              coveredProvinces: coveredProvincesList,
              recommendations: topRecommendations,
            },
          });
        }

        return JSON.stringify({
          companyName: companyRow?.name || "Perusahaan",
          nationalCoverage: {
            coveredCount: coveredProvincesList.length,
            totalProvinces: totalNational,
            unreachedCount: unreachedCount,
            coveredProvinces: coveredProvincesList,
          },
          topUnreachedTerritoriesRecommendations: topRecommendations.map((r) => ({
            province: r.province,
            islandGroup: r.island,
            dominantSocialNeed: r.urgencyTopic,
            proposedInitiativeTitle: r.proposedProgramTitle,
            suggestedFocusArea: r.focusArea,
            relevantSdgs: r.sdgs,
            registeredLocalPartnersCount: r.verifiedPartnersCount,
            readyPartnerNames: r.samplePartners.map((p) => `${p.name} (${p.city})`),
          })),
          guidanceForAdvisor:
            "Jelaskan status cakupan saat ini secara apresiatif, lalu paparkan 2-3 usulan program ekspansi wilayah dengan detail urgensi lokal, sasaran SDGs, dan ajak pengguna membuat peluang CSR di wilayah tersebut melalui kartu interaktif yang tersedia.",
        });
      } catch (err: any) {
        return JSON.stringify({
          error: `Gagal menganalisis jangkauan geografis perusahaan: ${err.message}`,
        });
      }
    },
    {
      name: "getCompanyGeographicFootprint",
      description:
        "Menganalisis peta sebaran geografis program CSR perusahaan (provinsi yang sudah terjangkau vs yang belum pernah dijangkau), lalu merekomendasikan inisiatif program CSR baru di wilayah belum terjangkau berdasarkan urgensi daerah dan ketersediaan mitra lokal terverifikasi.",
      schema: getCompanyGeographicFootprintInputSchema,
    }
  );

  return [
    searchOpportunities,
    getOpportunityDetail,
    getMyProposals,
    getProposalDetail,
    getMyProgramsOverview,
    getProgramMilestonesProgress,
    getMyOrganizationProfile,
    getCsrSdgsBenchmark,
    getCompanyGeographicFootprint,
  ];
}
