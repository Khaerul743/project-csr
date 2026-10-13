import { ProgramRepository } from "./program.repository";
import { ProgramService } from "./program.service";
import { ProgramController } from "./program.controller";

export const programRepository = new ProgramRepository();
export const programService = new ProgramService(programRepository);
export const programController = new ProgramController(programService);

export * from "./program.interface";
export * from "./program.validation";
