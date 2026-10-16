import { ReviewRepository } from "./review.repository";
import { ReviewService } from "./review.service";
import { ReviewController } from "./review.controller";
import { programRepository } from "../programs";

export const reviewRepository = new ReviewRepository();
export const reviewService = new ReviewService(reviewRepository, programRepository);
export const reviewController = new ReviewController(reviewService);

export * from "./review.interface";
export * from "./review.validation";
