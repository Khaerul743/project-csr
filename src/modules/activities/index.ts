import { ActivityRepository } from "./activity.repository";
import { ActivityService } from "./activity.service";
import { ActivityController } from "./activity.controller";
import { programRepository } from "../programs";
import { financeRepository } from "../finances";

export const activityRepository = new ActivityRepository();
export const activityService = new ActivityService(
  activityRepository,
  programRepository,
  financeRepository
);
export const activityController = new ActivityController(activityService);

export * from "./activity.interface";
export * from "./activity.validation";
