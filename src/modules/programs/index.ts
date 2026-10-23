import { ProgramRepository } from "./program.repository";
import { ProgramService } from "./program.service";
import { ProgramController } from "./program.controller";
import { ProgramStageRepository } from "./program-stage.repository";
import { ProgramStageService } from "./program-stage.service";
import { ProgramStageController } from "./program-stage.controller";

export const programRepository = new ProgramRepository();
export const programService = new ProgramService(programRepository);
export const programController = new ProgramController(programService);

export const programStageRepository = new ProgramStageRepository();
export const programStageService = new ProgramStageService(
  programRepository,
  programStageRepository
);
export const programStageController = new ProgramStageController(programStageService);

export * from "./program.interface";
export * from "./program.validation";
export * from "./program-stage.repository";
export * from "./program-stage.validation";

