import { Router } from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { asyncHandler } from "../utils/http.js";
import { packageQuerySchema } from "../domain/validators.js";
import { requireAuth } from "../middleware/auth.js";
import * as packageService from "../services/package.service.js";
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(currentDir, "../../tmp");
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });
export const packageRouter = Router();
packageRouter.get("/", asyncHandler(async (req, res) => {
    const filters = packageQuerySchema.parse(req.query);
    const rows = await packageService.listAll(filters);
    res.json(rows);
}));
packageRouter.get("/active", asyncHandler(async (_req, res) => {
    const rows = await packageService.listAll({});
    res.json(rows.filter((x) => x.status === "ACTIVE"));
}));
packageRouter.get("/featured", asyncHandler(async (_req, res) => {
    res.json(await packageService.listFeatured());
}));
packageRouter.get("/filter-options", asyncHandler(async (_req, res) => {
    res.json(await packageService.filterOptions());
}));
packageRouter.get("/my-packages", requireAuth, asyncHandler(async (req, res) => {
    res.json(await packageService.myPackages(req.userPhone));
}));
packageRouter.get("/user/:userId", asyncHandler(async (req, res) => {
    res.json(await packageService.byUserId(Number(req.params.userId)));
}));
packageRouter.get("/type/:type/originLat/:originLat/originLong/:originLong", asyncHandler(async (req, res) => {
    const filters = packageQuerySchema.parse(req.query);
    const rows = await packageService.byTypeAndOrigin(req.params.type, Number(req.params.originLat), Number(req.params.originLong), filters);
    res.json(rows);
}));
packageRouter.get("/type/:type", asyncHandler(async (req, res) => {
    const filters = packageQuerySchema.parse(req.query);
    res.json(await packageService.byType(req.params.type, filters));
}));
packageRouter.get("/destination/destinationLat/:destinationLat/destinationLong/:destinationLong", asyncHandler(async (req, res) => {
    res.json(await packageService.byDestination(Number(req.params.destinationLat), Number(req.params.destinationLong)));
}));
packageRouter.get("/search", asyncHandler(async (req, res) => {
    const query = String(req.query.query ?? "").toLowerCase().trim();
    const rows = await packageService.listAll({});
    const filtered = rows.filter((row) => [row.title, row.destination, row.origin, row.description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(query)));
    res.json(filtered);
}));
packageRouter.get("/search-nearby", asyncHandler(async (req, res) => {
    const origin = String(req.query.origin ?? "").trim();
    const destination = String(req.query.destination ?? "").trim();
    const radiusKm = Number(req.query.radiusKm ?? 20);
    const originLat = Number(req.query.originLat);
    const originLong = Number(req.query.originLong);
    const destinationLat = Number(req.query.destinationLat);
    const destinationLong = Number(req.query.destinationLong);
    const selectedOrigin = Number.isFinite(originLat) && Number.isFinite(originLong)
        ? { latitude: originLat, longitude: originLong }
        : null;
    const selectedDestination = Number.isFinite(destinationLat) && Number.isFinite(destinationLong)
        ? { latitude: destinationLat, longitude: destinationLong }
        : null;
    if (!origin || !destination) {
        res.json([]);
        return;
    }
    res.json(await packageService.searchNearby(origin, destination, Number.isNaN(radiusKm) ? 20 : radiusKm, selectedOrigin, selectedDestination));
}));
packageRouter.get("/search-from-origin", asyncHandler(async (req, res) => {
    const origin = String(req.query.origin ?? "").trim();
    const radiusKm = Number(req.query.radiusKm ?? 20);
    const originLat = Number(req.query.originLat);
    const originLong = Number(req.query.originLong);
    const selectedOrigin = Number.isFinite(originLat) && Number.isFinite(originLong)
        ? { latitude: originLat, longitude: originLong }
        : null;
    if (!origin) {
        res.json([]);
        return;
    }
    res.json(await packageService.searchFromOrigin(origin, Number.isNaN(radiusKm) ? 20 : radiusKm, selectedOrigin));
}));
packageRouter.get("/:id", asyncHandler(async (req, res) => {
    res.json(await packageService.byId(Number(req.params.id)));
}));
packageRouter.post("/", requireAuth, upload.array("media"), asyncHandler(async (req, res) => {
    const response = await packageService.createPackage(req.userPhone, req.body, req.files ?? []);
    res.json(response);
}));
packageRouter.put("/:id", requireAuth, upload.array("media"), asyncHandler(async (req, res) => {
    const response = await packageService.updatePackage(Number(req.params.id), req.userPhone, req.body, req.files ?? []);
    res.json(response);
}));
packageRouter.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
    await packageService.deletePackage(Number(req.params.id), req.userPhone);
    res.json({ message: "Package deleted successfully" });
}));
packageRouter.patch("/:id/status", requireAuth, asyncHandler(async (req, res) => {
    const status = String(req.query.status ?? "");
    const response = await packageService.updateStatus(Number(req.params.id), req.userPhone, status);
    res.json(response);
}));
