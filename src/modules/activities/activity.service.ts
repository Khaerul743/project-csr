import { ActivityRepository } from "./activity.repository";
import { ProgramRepository } from "../programs/program.repository";
import {
  CreateActivityDTO,
  ReviewActivityDTO,
  UpdateActivityDTO,
  ActivityWithDetails,
} from "./activity.interface";
import { ProgramActivity } from "@/db/schema/program-activities";
import {
  NotFoundError,
  ForBiddenError,
  BadRequestError,
} from "@/common/errors/app-error";
import { JwtUserPayload } from "@/common/jwt/jwt.interface";

export class ActivityService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly programRepository: ProgramRepository
  ) {}

  async getActivitiesByProgramId(
    programId: string,
    authUser: JwtUserPayload
  ): Promise<ActivityWithDetails[]> {
    const program = await this.programRepository.findById(programId);
    if (!program) {
      throw new NotFoundError("Program pelaksanaan tidak ditemukan");
    }

    // Access authorization check
    if (authUser.role === "PARTNER_ADMIN") {
      if (authUser.partnerId !== program.partnerId) {
        throw new ForBiddenError("Anda tidak memiliki akses ke aktivitas program ini");
      }
    } else {
      if (authUser.companyId !== program.companyId) {
        throw new ForBiddenError("Anda tidak memiliki akses ke aktivitas program ini");
      }
    }

    return this.activityRepository.findByProgramId(programId);
  }

  async createActivity(
    programId: string,
    input: CreateActivityDTO,
    authUser: JwtUserPayload
  ): Promise<ProgramActivity> {
    const program = await this.programRepository.findById(programId);
    if (!program) {
      throw new NotFoundError("Program pelaksanaan tidak ditemukan");
    }

    // Only Partner assigned to this program can post activities
    if (authUser.role !== "PARTNER_ADMIN" || authUser.partnerId !== program.partnerId) {
      throw new ForBiddenError("Hanya mitra pelaksana program yang dapat mengunggah laporan aktivitas");
    }

    // Format media URLs as JSON string
    let mediaUrlsStr: string | null = null;
    if (input.mediaUrls) {
      if (Array.isArray(input.mediaUrls)) {
        mediaUrlsStr = JSON.stringify(input.mediaUrls);
      } else if (typeof input.mediaUrls === "string") {
        mediaUrlsStr = input.mediaUrls;
      }
    }

    // Format funds spent
    const fundsSpentNum = input.fundsSpent ? parseFloat(String(input.fundsSpent)) : 0;
    const safeFundsSpent = isNaN(fundsSpentNum) ? "0" : fundsSpentNum.toFixed(2);

    const activityDate = input.activityDate instanceof Date
      ? input.activityDate
      : new Date(input.activityDate);

    if (isNaN(activityDate.getTime())) {
      throw new BadRequestError("Format tanggal kegiatan tidak valid");
    }

    const created = await this.activityRepository.create({
      programId,
      submittedBy: authUser.sub,
      title: input.title.trim(),
      description: input.description.trim(),
      activityDate,
      location: input.location?.trim() || null,
      beneficiariesReached: input.beneficiariesReached?.trim() || null,
      fundsSpent: safeFundsSpent,
      mediaUrls: mediaUrlsStr,
      documentUrl: input.documentUrl?.trim() || null,
      status: "SUBMITTED",
    });

    // If program was PLANNED, automatically update to IN_PROGRESS upon first activity!
    if (program.status === "PLANNED") {
      await this.programRepository.update(programId, {
        status: "IN_PROGRESS",
      });
    }

    // If funds were reported in this activity, accumulate spentBudget if greater
    if (fundsSpentNum > 0) {
      const currentSpent = program.spentBudget ? parseFloat(program.spentBudget) : 0;
      const newTotalSpent = currentSpent + fundsSpentNum;
      await this.programRepository.update(programId, {
        spentBudget: newTotalSpent.toFixed(2),
      });
    }

    return created;
  }

  async reviewActivity(
    activityId: string,
    input: ReviewActivityDTO,
    authUser: JwtUserPayload
  ): Promise<ProgramActivity> {
    const activity = await this.activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundError("Aktivitas tidak ditemukan");
    }

    const program = await this.programRepository.findById(activity.programId);
    if (!program) {
      throw new NotFoundError("Program pelaksanaan tidak ditemukan");
    }

    // Only Company associated with this program can review
    if (authUser.role === "PARTNER_ADMIN" || authUser.companyId !== program.companyId) {
      throw new ForBiddenError("Hanya perusahaan sponsor yang dapat memverifikasi laporan aktivitas");
    }

    return this.activityRepository.update(activityId, {
      status: input.status,
      companyFeedback: input.companyFeedback?.trim() || null,
      verifiedBy: authUser.sub,
      verifiedAt: new Date(),
    });
  }

  async deleteActivity(
    activityId: string,
    authUser: JwtUserPayload
  ): Promise<void> {
    const activity = await this.activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundError("Aktivitas tidak ditemukan");
    }

    const program = await this.programRepository.findById(activity.programId);
    if (!program) {
      throw new NotFoundError("Program pelaksanaan tidak ditemukan");
    }

    if (authUser.role !== "PARTNER_ADMIN" || authUser.partnerId !== program.partnerId) {
      throw new ForBiddenError("Anda tidak memiliki hak untuk menghapus aktivitas ini");
    }

    if (activity.status === "VERIFIED") {
      throw new BadRequestError("Aktivitas yang telah diverifikasi oleh perusahaan tidak dapat dihapus");
    }

    await this.activityRepository.delete(activityId);
  }
}
