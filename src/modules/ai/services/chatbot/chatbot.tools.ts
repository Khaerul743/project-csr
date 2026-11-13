import { tool } from "@langchain/core/tools";
import { eq, and, or, like, desc, sql } from "drizzle-orm";
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
} from "./chatbot.schema";

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

  return [
    searchOpportunities,
    getOpportunityDetail,
    getMyProposals,
    getProposalDetail,
    getMyProgramsOverview,
    getProgramMilestonesProgress,
    getMyOrganizationProfile,
    getCsrSdgsBenchmark,
  ];
}
