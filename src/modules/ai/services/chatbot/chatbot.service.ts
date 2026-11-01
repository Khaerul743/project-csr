import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  ToolMessage,
  BaseMessage,
} from "@langchain/core/messages";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { companies } from "@/db/schema/companies";
import { partners } from "@/db/schema/partners";
import { AuthUser } from "@/common/guards/auth.guard";
import { AppLogger } from "@/common/logger/app-logger";
import { getOpenAIChatModel } from "../../config/openai.config";
import { ChatMessageDTO } from "./chatbot.schema";
import { buildSystemPrompt } from "./chatbot.prompt";
import { createChatbotTools, ToolExecutionEvent } from "./chatbot.tools";

export interface ChatbotResponse {
  reply: string;
  cards?: any[];
  toolCallsMade?: string[];
  suggestedPrompts?: string[];
}

export class ChatbotService {
  private readonly logger = new AppLogger("ChatbotService");

  async handleChat(params: {
    user: AuthUser;
    messages: ChatMessageDTO[];
    context?: {
      currentPage?: string;
      selectedOpportunityId?: string;
      selectedProgramId?: string;
    };
  }): Promise<ChatbotResponse> {
    const { user, messages, context } = params;

    // 1. Fetch user & organization details for personalized context
    const userOrgInfo = await this.getUserOrganizationInfo(user);

    // 2. Prepare LangChain Tools & Track events for interactive cards
    const executedEvents: ToolExecutionEvent[] = [];
    const tools = createChatbotTools(user, (event) => {
      executedEvents.push(event);
    });
    const toolsMap = new Map<string, any>(tools.map((t) => [t.name, t]));

    // 3. Check OpenAI Model availability
    const model = getOpenAIChatModel("gpt-4o-mini", 0.3);

    if (!model) {
      this.logger.warn("OpenAI API Key tidak tersedia, menggunakan fallback heuristic chat");
      return this.handleFallbackChat(user, messages, userOrgInfo, toolsMap);
    }

    try {
      // 4. Build System Prompt & Messages History
      const systemPrompt = buildSystemPrompt({
        role: user.role,
        userName: userOrgInfo.userName || user.email,
        organizationName: userOrgInfo.organizationName,
        organizationType: userOrgInfo.organizationType,
        focusArea: userOrgInfo.focusArea,
        pageContext: context?.currentPage,
      });

      const langChainMessages: BaseMessage[] = [new SystemMessage(systemPrompt)];

      // Convert prior messages (limit to last 10 messages for token efficiency)
      const recentMessages = messages.slice(-10);
      for (const msg of recentMessages) {
        if (msg.role === "user") {
          langChainMessages.push(new HumanMessage(msg.content));
        } else if (msg.role === "assistant") {
          langChainMessages.push(new AIMessage(msg.content));
        }
      }

      // 5. Tool Calling Agentic Loop (max 4 turns)
      const modelWithTools = model.bindTools(tools);
      let currentMessages = [...langChainMessages];
      let iterations = 0;
      const maxIterations = 4;
      let finalReply = "";

      while (iterations < maxIterations) {
        iterations++;
        const aiResponse = await modelWithTools.invoke(currentMessages);

        // If LLM wants to call tools
        if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
          currentMessages.push(aiResponse);

          for (const call of aiResponse.tool_calls) {
            const selectedTool = toolsMap.get(call.name);
            let toolOutputStr = "";

            if (selectedTool) {
              try {
                this.logger.info(`Chatbot executing tool: ${call.name}`);
                const toolResult = await (selectedTool as any).invoke(call.args);
                toolOutputStr =
                  typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult);
              } catch (toolErr: any) {
                toolOutputStr = JSON.stringify({ error: `Tool execution failed: ${toolErr.message}` });
              }
            } else {
              toolOutputStr = JSON.stringify({ error: `Tool ${call.name} not found` });
            }

            currentMessages.push(
              new ToolMessage({
                tool_call_id: call.id || call.name,
                name: call.name,
                content: toolOutputStr,
              })
            );
          }
        } else {
          // LLM provided direct response
          finalReply =
            typeof aiResponse.content === "string"
              ? aiResponse.content
              : JSON.stringify(aiResponse.content);
          break;
        }
      }

      if (!finalReply) {
        finalReply =
          "Maaf, proses pemanggilan data membutuhkan waktu lebih lama. Ada yang bisa saya bantu jelaskan kembali?";
      }

      return {
        reply: finalReply,
        cards: executedEvents.map((e) => e.cardData).filter(Boolean),
        toolCallsMade: executedEvents.map((e) => e.toolName),
        suggestedPrompts: this.generateSuggestedPrompts(user.role),
      };
    } catch (error: any) {
      this.logger.error("Error during LangChain chat execution:", error);
      return this.handleFallbackChat(user, messages, userOrgInfo, toolsMap);
    }
  }

  /**
   * Mengambil data organisasi pengguna dari DB untuk personalisasi prompt
   */
  private async getUserOrganizationInfo(authUser: AuthUser) {
    try {
      const userRows = await db
        .select({
          name: users.name,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, authUser.sub))
        .limit(1);

      const userName = userRows[0]?.name || authUser.email;

      if (authUser.partnerId) {
        const partnerRows = await db
          .select({
            name: partners.name,
            organizationType: partners.organizationType,
            focusArea: partners.focusArea,
          })
          .from(partners)
          .where(eq(partners.id, authUser.partnerId))
          .limit(1);

        return {
          userName,
          organizationName: partnerRows[0]?.name,
          organizationType: partnerRows[0]?.organizationType || "Mitra NGO / Yayasan",
          focusArea: partnerRows[0]?.focusArea,
        };
      }

      if (authUser.companyId) {
        const companyRows = await db
          .select({
            name: companies.name,
            industry: companies.industry,
          })
          .from(companies)
          .where(eq(companies.id, authUser.companyId))
          .limit(1);

        return {
          userName,
          organizationName: companyRows[0]?.name,
          organizationType: companyRows[0]?.industry
            ? `Perusahaan (${companyRows[0].industry})`
            : "Perusahaan Korporasi",
          focusArea: undefined,
        };
      }

      return {
        userName,
        organizationName: undefined,
        organizationType: "Pengguna SIPENA",
        focusArea: undefined,
      };
    } catch {
      return {
        userName: authUser.email,
        organizationName: undefined,
        organizationType: undefined,
        focusArea: undefined,
      };
    }
  }

  /**
   * Fallback engine jika API Key OpenAI tidak terkonfigurasi atau error
   */
  private async handleFallbackChat(
    authUser: AuthUser,
    messages: ChatMessageDTO[],
    userOrgInfo: any,
    toolsMap: Map<string, any>
  ): Promise<ChatbotResponse> {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const lower = lastUserMessage.toLowerCase();
    const isPartner = authUser.role === "PARTNER_ADMIN";

    // Scenario 1: Cari / Rekomendasi Peluang CSR
    if (lower.includes("peluang") || lower.includes("opportunity") || lower.includes("cari") || lower.includes("rekomendasi")) {
      const searchTool = toolsMap.get("searchOpportunities");
      let oppsSummary = "";
      let cards: any[] = [];

      if (searchTool) {
        try {
          const raw = await searchTool.invoke({});
          const parsed = JSON.parse(raw);
          if (parsed.opportunities && parsed.opportunities.length > 0) {
            cards = [{ type: "OPPORTUNITIES", items: parsed.opportunities }];
            oppsSummary = parsed.opportunities
              .map(
                (o: any, idx: number) =>
                  `${idx + 1}. **${o.title}** (${o.company})\n   - 🎯 Fokus: \`${o.focusArea}\`\n   - 💰 Estimasi: **${o.budget}** | 📍 Lokasi: ${o.location}\n   - ⏳ Batas Waktu: ${o.deadline}`
              )
              .join("\n\n");
          }
        } catch {}
      }

      const reply = `Halo **${userOrgInfo.userName}**! Berikut adalah daftar peluang program CSR terbuka di platform SIPENA yang dapat Anda eksplorasi:\n\n${
        oppsSummary || "Saat ini belum ada peluang terbuka baru yang sesuai dengan kriteria umum."
      }\n\n💡 **Tips SIPENA**: Anda dapat menyebutkan kota spesifik (contoh: *\"cari peluang di Bandung\"*) atau fokus isu (contoh: *\"peluang bidang pendidikan\"*) agar saya carikan yang paling pas!`;

      return {
        reply,
        cards,
        suggestedPrompts: this.generateSuggestedPrompts(authUser.role),
      };
    }

    // Scenario 2: Proposal status
    if (lower.includes("proposal") || lower.includes("status")) {
      const propTool = toolsMap.get("getMyProposals");
      let propText = "";
      let cards: any[] = [];

      if (propTool) {
        try {
          const raw = await propTool.invoke({});
          const parsed = JSON.parse(raw);
          if (parsed.proposals && parsed.proposals.length > 0) {
            cards = [{ type: "PROPOSALS", items: parsed.proposals }];
            propText = parsed.proposals
              .map(
                (p: any, idx: number) =>
                  `${idx + 1}. **${p.title}**\n   - Peluang: *${p.opportunity}*\n   - Status: \`${p.status}\` | Anggaran: **${p.budget}**\n   - AI Score: **${p.aiScore}**${
                    p.hasFeedback ? `\n   - 💬 *Catatan Revisi*: "${p.feedbackSnippet}"` : ""
                  }`
              )
              .join("\n\n");
          }
        } catch {}
      }

      const reply = `Berikut adalah ringkasan proposal Anda di platform SIPENA:\n\n${
        propText || "Belum ada riwayat proposal yang terdaftar pada akun Anda."
      }\n\n${
        isPartner
          ? "💡 *Ingin merevisi proposal yang diminta revisi atau butuh bantuan brainstorming draf baru? Ketikkan saja detailnya di sini!*"
          : "💡 *Anda dapat menyetujui proposal atau memberikan catatan perbaikan melalui dashboard seleksi proposal.*"
      }`;

      return {
        reply,
        cards,
        suggestedPrompts: this.generateSuggestedPrompts(authUser.role),
      };
    }

    // Scenario 3: Program / Monitoring
    if (lower.includes("program") || lower.includes("progres") || lower.includes("monitoring")) {
      const progTool = toolsMap.get("getMyProgramsOverview");
      let progText = "";

      if (progTool) {
        try {
          const raw = await progTool.invoke({});
          const parsed = JSON.parse(raw);
          if (parsed.programs && parsed.programs.length > 0) {
            progText = parsed.programs
              .map(
                (p: any, idx: number) =>
                  `• **${p.title}** (\`${p.status}\`)\n  - Mitra/Perusahaan: ${p.partner || p.company}\n  - Anggaran Terserap: **${p.spentBudget}** dari total **${p.totalBudget}**\n  - Penerima Manfaat: ${p.actualBeneficiaries} penerima`
              )
              .join("\n\n");
          }
        } catch {}
      }

      return {
        reply: `Berikut adalah ringkasan pemantauan program CSR Anda:\n\n${
          progText || "Tidak ada program aktif yang tercatat saat ini."
        }\n\n💡 *Anda dapat menanyakan progres milestone tertentu dengan mengetik: "Bagaimana tahapan program [Nama Program]?"*`,
        suggestedPrompts: this.generateSuggestedPrompts(authUser.role),
      };
    }

    // Scenario 4: Brainstorming ide CSR / SDGs
    if (lower.includes("brainstorm") || lower.includes("ide") || lower.includes("sdg") || lower.includes("konsep")) {
      return {
        reply: `Tentu! Mari kita rumuskan konsep program CSR berdampak tinggi dengan kerangka kerja standar **POJK 51 & UN SDGs**:\n\n### 📋 Kerangka Brainstorming Program CSR SIPENA:
1. **Identifikasi Masalah Nyata (Needs Assessment)**:
   - Wilayah sasaran spesifik (desa/kelurahan) & kelompok rentan penerima manfaat.
   - Baseline data (misal: tingkat putus sekolah, volume timbulan sampah harian).

2. **Pilar Dampak & SDG Target**:
   - Tentukan pilar ESG (Environment, Social, atau Governance).
   - Tautkan dengan minimal 1 SDG Utama (contoh: *SDG 13 Aksi Iklim* atau *SDG 4 Pendidikan Berkualitas*).

3. **Roadmap 3 Tahapan Eksekusi**:
   - **Tahap 1: Persiapan** (Sosialisasi masyarakat, perizinan, baseline survey).
   - **Tahap 2: Implementasi Inti** (Pelatihan, instalasi alat, pendampingan berkala).
   - **Tahap 3: Evaluasi & Exit Strategy** (Pengukuran SROI, serah terima mandiri ke komunitas).

4. **Alokasi Anggaran Proporsional (RAB)**:
   - Belanja modal & fasilitas fisik: 50–60%
   - Pelatihan & operasional pendampingan: 25–35%
   - Monitoring & evaluasi: 10–15%

Ceritakan tema atau topik apa yang ingin Anda rancang (misalnya: *Pengelolaan Sampah Pesisir*, *Beasiswa Vokasi*, atau *Pemberdayaan UMKM Perempuan*), dan saya akan buatkan draf detailnya!`,
        suggestedPrompts: this.generateSuggestedPrompts(authUser.role),
      };
    }

    // Default Greeting & Assistance
    return {
      reply: `Halo **${userOrgInfo.userName}**! Saya adalah **SIPENA AI Advisor** — asisten cerdas Anda dalam pengelolaan program dan kolaborasi CSR.

Beberapa hal yang dapat saya bantu:
${
  isPartner
    ? `• 🔍 **Mencari Peluang CSR**: Temukan program CSR korporasi yang sedang membuka proposal.
• ✍️ **Brainstorming Proposal**: Buat draf judul, rincian aktivitas, target penerima, dan alokasi RAB.
• 📊 **Status Proposal & Revisi**: Cek catatan reviewer dan rekomendasi perbaikan.
• 🚀 **Monitoring Kegiatan**: Pantau tahapan aktivitas dan verifikasi dampak lapangan.`
    : `• 💡 **Rancang Inisiatif CSR Baru**: Brainstorming program selaras UN SDGs & POJK 51.
• 📈 **Monitoring Portofolio CSR**: Rekap serapan anggaran dan capaian penerima manfaat program berjalan.
• 📑 **Evaluasi Proposal Mitra**: Tips kriteria penilaian proposal dan akuntabilitas anggaran.
• 🌿 **Laporan Keberlanjutan (ESG)**: Rekomendasi indikator terukur untuk pelaporan tahunan.`
}

Silakan ketik pertanyaan Anda atau pilih salah satu topik cepat di bawah!`,
      suggestedPrompts: this.generateSuggestedPrompts(authUser.role),
    };
  }

  private generateSuggestedPrompts(role: string): string[] {
    if (role === "PARTNER_ADMIN") {
      return [
        "Rekomendasikan peluang CSR yang sedang buka",
        "Bantu saya brainstorming draf proposal bidang lingkungan",
        "Bagaimana status pengajuan proposal saya?",
        "Tips agar proposal lolos screening AI dengan skor tinggi",
      ];
    }

    return [
      "Berapa total serapan anggaran program CSR yang aktif?",
      "Ide program CSR ramah lingkungan selaras SDG 13 & 15",
      "Bagaimana progres capaian penerima manfaat program kami?",
      "Panduan indikator keberlanjutan sesuai POJK 51",
    ];
  }
}
