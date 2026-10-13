import { ProposalRepository } from "./proposal.repository";
import { ProposalService } from "./proposal.service";
import { ProposalController } from "./proposal.controller";

export const proposalRepository = new ProposalRepository();
export const proposalService = new ProposalService(proposalRepository);
export const proposalController = new ProposalController(proposalService);

export * from "./proposal.interface";
export * from "./proposal.validation";
export * from "./proposal.repository";
export * from "./proposal.service";
export * from "./proposal.controller";
