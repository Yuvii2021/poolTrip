import { Router } from "express";
import { asyncHandler } from "../utils/http.js";
import { requireAuth } from "../middleware/auth.js";
import { bookingCreateSchema, bookingRatingSchema } from "../domain/validators.js";
import * as bookingService from "../services/booking.service.js";

export const bookingRouter = Router();

bookingRouter.use(requireAuth);

bookingRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = bookingCreateSchema.parse(req.body);
    const response = await bookingService.createBooking(req.userPhone!, payload);
    res.json(response);
  }),
);

bookingRouter.post(
  "/:id/approve",
  asyncHandler(async (req, res) => {
    const response = await bookingService.approveBooking(req.userPhone!, Number(req.params.id));
    res.json(response);
  }),
);

bookingRouter.post(
  "/:id/reject",
  asyncHandler(async (req, res) => {
    const response = await bookingService.rejectBooking(req.userPhone!, Number(req.params.id));
    res.json(response);
  }),
);

bookingRouter.post(
  "/:id/cancel",
  asyncHandler(async (req, res) => {
    const response = await bookingService.cancelBooking(req.userPhone!, Number(req.params.id));
    res.json(response);
  }),
);

bookingRouter.get(
  "/my",
  asyncHandler(async (req, res) => {
    res.json(await bookingService.myBookings(req.userPhone!));
  }),
);

bookingRouter.get(
  "/host",
  asyncHandler(async (req, res) => {
    res.json(await bookingService.hostBookings(req.userPhone!));
  }),
);

bookingRouter.get(
  "/host/pending",
  asyncHandler(async (req, res) => {
    res.json(await bookingService.hostBookings(req.userPhone!, true));
  }),
);

bookingRouter.get(
  "/status/:packageId",
  asyncHandler(async (req, res) => {
    res.json(await bookingService.bookingStatus(req.userPhone!, Number(req.params.packageId)));
  }),
);

bookingRouter.post(
  "/:id/rate",
  asyncHandler(async (req, res) => {
    const payload = bookingRatingSchema.parse(req.body);
    res.json(await bookingService.rateBooking(req.userPhone!, Number(req.params.id), payload.rating, payload.review));
  }),
);
