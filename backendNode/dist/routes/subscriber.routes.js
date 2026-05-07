import { Router } from "express";
import { asyncHandler } from "../utils/http.js";
import { subscribeSchema } from "../domain/validators.js";
import { subscribe } from "../services/subscriber.service.js";
export const subscriberRouter = Router();
subscriberRouter.post("/subscribe", asyncHandler(async (req, res) => {
    const payload = subscribeSchema.parse(req.body);
    res.json(await subscribe(payload.email));
}));
