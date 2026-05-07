import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/http.js";
import { packageResponse } from "../domain/mappers.js";
import { hasCloudinaryConfig, cloudinary } from "../lib/cloudinary.js";
import { hasMailConfig, mailer } from "../lib/mailer.js";
import { env } from "../config/env.js";
import { packageTypeMeta, transportationMeta } from "../domain/constants.js";
function startOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}
function upcomingDateFilter() {
    return {
        OR: [{ startDate: null }, { startDate: { gte: startOfToday() } }],
    };
}
function parseIndexedStringArray(body, fieldName) {
    const direct = body[fieldName];
    if (Array.isArray(direct)) {
        return direct
            .map((value) => String(value).trim())
            .filter((value) => value.length > 0);
    }
    if (typeof direct === "string" && direct.trim().length > 0) {
        return [direct.trim()];
    }
    const indexedEntries = Object.entries(body)
        .filter(([key]) => key.startsWith(`${fieldName}[`))
        .map(([key, value]) => {
        const match = key.match(/\[(\d+)\]/);
        return {
            index: match ? Number(match[1]) : Number.MAX_SAFE_INTEGER,
            value: String(value).trim(),
        };
    })
        .filter((entry) => entry.value.length > 0)
        .sort((a, b) => a.index - b.index);
    return indexedEntries.map((entry) => entry.value);
}
function whereForFilters(filters) {
    const where = {
        status: "ACTIVE",
        ...upcomingDateFilter(),
    };
    if (filters.transportation)
        where.transportation = filters.transportation;
    if (filters.featured !== undefined)
        where.featured = filters.featured;
    if (filters.days !== undefined) {
        where.durationDays = filters.days;
    }
    else if (filters.minDays !== undefined || filters.maxDays !== undefined) {
        where.durationDays = {
            gte: filters.minDays ?? 1,
            lte: filters.maxDays ?? 99999,
        };
    }
    return where;
}
function applyEffectivePriceFilter(rows, filters) {
    if (filters.minPrice === undefined && filters.maxPrice === undefined) {
        return rows;
    }
    const minPrice = filters.minPrice ?? 0;
    const maxPrice = filters.maxPrice ?? Number.MAX_SAFE_INTEGER;
    return rows.filter((row) => {
        const effectivePrice = row.discountedPrice ?? row.price;
        return effectivePrice >= minPrice && effectivePrice <= maxPrice;
    });
}
function parseDate(value) {
    if (typeof value !== "string" || !value.trim())
        return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}
async function includeResponse(pkg) {
    const [user, media, itinerary] = await Promise.all([
        prisma.user.findUnique({ where: { id: pkg.userId } }),
        prisma.packageMedia.findMany({ where: { packageId: pkg.id } }),
        prisma.packageItinerary.findMany({ where: { packageId: pkg.id } }),
    ]);
    return packageResponse({ ...pkg, media, itinerary }, user);
}
function sqDistance(aLat, aLng, bLat, bLng) {
    return (aLng - bLng) ** 2 + (aLat - bLat) ** 2;
}
function haversineKm(aLat, aLng, bLat, bLng) {
    const toRad = (value) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const lat1 = toRad(aLat);
    const lat2 = toRad(bLat);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
}
async function geocodeLocation(query) {
    const normalized = query.trim();
    if (!normalized)
        return null;
    try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(normalized)}&lang=en&limit=1`;
        const response = await fetch(url);
        if (!response.ok)
            return null;
        const data = (await response.json());
        const first = data.features?.[0];
        const coords = first?.geometry?.coordinates;
        if (!coords || coords.length < 2)
            return null;
        const [longitude, latitude] = coords;
        if (Number.isNaN(latitude) || Number.isNaN(longitude))
            return null;
        return { latitude, longitude };
    }
    catch {
        return null;
    }
}
export async function listAll(filters) {
    const where = Object.keys(filters).length
        ? whereForFilters(filters)
        : {
            status: "ACTIVE",
            ...upcomingDateFilter(),
        };
    const dbRows = await prisma.travelPackage.findMany({
        where,
        orderBy: { createdAt: "desc" },
    });
    const rows = applyEffectivePriceFilter(dbRows, filters);
    const enriched = await Promise.all(rows.map((r) => includeResponse(r)));
    return enriched.sort((a, b) => {
        const rank = (s) => (s === "ACTIVE" ? 1 : s === "FULL" ? 2 : 3);
        return rank(a.status) - rank(b.status) || (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
}
export async function listFeatured() {
    const rows = await prisma.travelPackage.findMany({
        where: {
            status: "ACTIVE",
            featured: true,
            ...upcomingDateFilter(),
        },
        orderBy: { createdAt: "desc" },
    });
    return Promise.all(rows.map((r) => includeResponse(r)));
}
export async function byId(id) {
    const pkg = await prisma.travelPackage.findUnique({ where: { id: BigInt(id) } });
    if (!pkg)
        throw new ApiError(400, "Package not found");
    return includeResponse(pkg);
}
export async function byType(type, filters) {
    const where = whereForFilters(filters);
    where.packageType = type;
    const dbRows = await prisma.travelPackage.findMany({
        where,
        orderBy: { createdAt: "desc" },
    });
    const rows = applyEffectivePriceFilter(dbRows, filters);
    return Promise.all(rows.map((r) => includeResponse(r)));
}
export async function byTypeAndOrigin(type, originLat, originLong, filters) {
    const where = whereForFilters(filters);
    where.packageType = type;
    const dbRows = await prisma.travelPackage.findMany({ where });
    const rows = applyEffectivePriceFilter(dbRows, filters);
    const maxDistanceSq = 0.124;
    const nearby = rows
        .map((r) => ({ row: r, distance: sqDistance(r.originLatitude, r.originLongitude, originLat, originLong) }))
        .filter((x) => x.distance < maxDistanceSq)
        .sort((a, b) => a.distance - b.distance)
        .map((x) => x.row);
    return Promise.all(nearby.map((r) => includeResponse(r)));
}
export async function byDestination(destinationLat, destinationLong) {
    const rows = await prisma.travelPackage.findMany({
        where: { status: "ACTIVE", ...upcomingDateFilter() },
    });
    const maxDistanceSq = 0.124;
    const nearby = rows
        .map((r) => ({ row: r, distance: sqDistance(r.destinationLatitude, r.destinationLongitude, destinationLat, destinationLong) }))
        .filter((x) => x.distance < maxDistanceSq)
        .sort((a, b) => a.distance - b.distance)
        .map((x) => x.row);
    return Promise.all(nearby.map((r) => includeResponse(r)));
}
export async function searchFromOrigin(origin, radiusKm = 20, selectedOrigin) {
    const originPoint = selectedOrigin ?? (await geocodeLocation(origin));
    if (!originPoint)
        return [];
    const rows = await prisma.travelPackage.findMany({
        where: { status: "ACTIVE", ...upcomingDateFilter() },
    });
    const scored = rows
        .map((row) => {
        const distanceFromUserOrigin = haversineKm(originPoint.latitude, originPoint.longitude, row.originLatitude, row.originLongitude);
        return { row, distanceFromUserOrigin };
    })
        .filter((item) => item.distanceFromUserOrigin <= radiusKm)
        .sort((a, b) => a.distanceFromUserOrigin - b.distanceFromUserOrigin);
    const results = await Promise.all(scored.map(async (item) => ({
        packageInfo: await includeResponse(item.row),
        distanceFromUserOrigin: item.distanceFromUserOrigin,
        originInItinerary: item.distanceFromUserOrigin <= radiusKm,
    })));
    return results;
}
export async function searchNearby(origin, destination, radiusKm = 20, selectedOrigin, selectedDestination) {
    const [fallbackOrigin, fallbackDestination] = await Promise.all([
        selectedOrigin ? Promise.resolve(null) : geocodeLocation(origin),
        selectedDestination ? Promise.resolve(null) : geocodeLocation(destination),
    ]);
    const originPoint = selectedOrigin ?? fallbackOrigin;
    const destinationPoint = selectedDestination ?? fallbackDestination;
    if (!originPoint || !destinationPoint)
        return [];
    const rows = await prisma.travelPackage.findMany({
        where: { status: "ACTIVE", ...upcomingDateFilter() },
    });
    const scored = rows
        .map((row) => {
        const originDistanceKm = haversineKm(originPoint.latitude, originPoint.longitude, row.originLatitude, row.originLongitude);
        const destinationDistanceKm = haversineKm(destinationPoint.latitude, destinationPoint.longitude, row.destinationLatitude, row.destinationLongitude);
        return { row, originDistanceKm, destinationDistanceKm };
    })
        .filter((item) => item.originDistanceKm <= radiusKm &&
        item.destinationDistanceKm <= radiusKm)
        .sort((a, b) => a.originDistanceKm + a.destinationDistanceKm -
        (b.originDistanceKm + b.destinationDistanceKm));
    const results = await Promise.all(scored.map(async (item) => ({
        packageInfo: await includeResponse(item.row),
        distanceFromUserOrigin: item.originDistanceKm,
        originInItinerary: item.originDistanceKm <= radiusKm,
    })));
    return results;
}
export async function myPackages(phone) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user)
        throw new ApiError(400, "User not found");
    const rows = await prisma.travelPackage.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });
    return Promise.all(rows.map((r) => includeResponse(r)));
}
export async function byUserId(userId) {
    const rows = await prisma.travelPackage.findMany({
        where: { userId: BigInt(userId) },
        orderBy: { createdAt: "desc" },
    });
    return Promise.all(rows.map((r) => includeResponse(r)));
}
async function uploadFilesToCloudinary(userKey, files) {
    if (!files.length)
        return [];
    if (!hasCloudinaryConfig())
        throw new ApiError(400, "Cloudinary is not configured");
    const uploads = files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: `poolmytrips/${userKey}/packages`,
            resource_type: "auto",
        });
        return result.secure_url;
    });
    return Promise.all(uploads);
}
async function notifySubscribers(pkg, postedByName) {
    if (!hasMailConfig())
        return;
    const subscribers = await prisma.subscriber.findMany();
    if (!subscribers.length)
        return;
    const subject = `New Trip Alert: ${pkg.title} — ${pkg.destinationName}`;
    const link = `${env.frontendBaseUrl}/package/${pkg.id.toString()}`;
    const text = `A new trip is available!\n\n${pkg.title}\n${pkg.originName} -> ${pkg.destinationName}\nPrice: ${pkg.discountedPrice ?? pkg.price}\nBy: ${postedByName}\n\nView details: ${link}`;
    await Promise.allSettled(subscribers.map((s) => mailer.sendMail({
        from: env.mailFrom,
        to: s.email,
        subject,
        text,
    })));
}
export async function createPackage(phone, body, files) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user)
        throw new ApiError(400, "User not found");
    const existingMediaRaw = body.existingMediaUrls;
    const existingMedia = Array.isArray(existingMediaRaw)
        ? existingMediaRaw.map(String)
        : typeof existingMediaRaw === "string"
            ? [existingMediaRaw]
            : [];
    const uploaded = await uploadFilesToCloudinary(user.phone, files);
    const finalMedia = [...existingMedia, ...uploaded];
    const itineraryValues = parseIndexedStringArray(body, "itinerary");
    const data = {
        title: String(body.title ?? ""),
        user: { connect: { id: user.id } },
        description: body.description ? String(body.description) : null,
        originName: String(body.origin ?? ""),
        originLatitude: Number(body.originLatitude ?? 0),
        originLongitude: Number(body.originLongitude ?? 0),
        destinationName: String(body.destination ?? ""),
        destinationLatitude: Number(body.destinationLatitude ?? 0),
        destinationLongitude: Number(body.destinationLongitude ?? 0),
        price: Number(body.price ?? 0),
        discountedPrice: body.discountedPrice ? Number(body.discountedPrice) : null,
        durationDays: Number(body.durationDays ?? 1),
        durationNights: Number(body.durationNights ?? 0),
        totalSeats: Number(body.totalSeats ?? 1),
        availableSeats: body.availableSeats ? Number(body.availableSeats) : Number(body.totalSeats ?? 1),
        startDate: parseDate(body.startDate),
        inclusions: body.inclusions ? String(body.inclusions) : null,
        exclusions: body.exclusions ? String(body.exclusions) : null,
        transportation: body.transportation ? String(body.transportation) : null,
        termsAndConditions: body.termsAndConditions ? String(body.termsAndConditions) : null,
        cancellationPolicy: body.cancellationPolicy ? String(body.cancellationPolicy) : null,
        packageType: String(body.packageType ?? "ADVENTURE"),
        featured: String(body.featured).toLowerCase() === "true",
        instantBooking: body.instantBooking === undefined ? true : String(body.instantBooking).toLowerCase() === "true",
        status: "ACTIVE",
        media: finalMedia.length ? { createMany: { data: finalMedia.map((mediaUrl) => ({ mediaUrl })) } } : undefined,
        itinerary: itineraryValues.length
            ? { createMany: { data: itineraryValues.map((itineraryItem) => ({ itineraryItem })) } }
            : undefined,
    };
    const pkg = await prisma.travelPackage.create({ data });
    await prisma.user.update({
        where: { id: user.id },
        data: { numberOfTrips: (user.numberOfTrips ?? BigInt(0)) + BigInt(1) },
    });
    await notifySubscribers(pkg, user.fullName).catch(() => undefined);
    return includeResponse(pkg);
}
export async function updatePackage(id, phone, body, files) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user)
        throw new ApiError(400, "User not found");
    const pkg = await prisma.travelPackage.findUnique({ where: { id: BigInt(id) } });
    if (!pkg)
        throw new ApiError(400, "Package not found");
    if (pkg.userId !== user.id)
        throw new ApiError(400, "You can only update your own packages");
    const existingMediaRaw = body.existingMediaUrls;
    const existingMedia = Array.isArray(existingMediaRaw)
        ? existingMediaRaw.map(String)
        : typeof existingMediaRaw === "string"
            ? [existingMediaRaw]
            : [];
    const uploaded = await uploadFilesToCloudinary(user.phone, files);
    const finalMedia = [...existingMedia, ...uploaded];
    const itineraryValues = parseIndexedStringArray(body, "itinerary");
    const updated = await prisma.travelPackage.update({
        where: { id: pkg.id },
        data: {
            title: String(body.title ?? pkg.title),
            description: body.description === undefined ? pkg.description : String(body.description),
            originName: String(body.origin ?? pkg.originName),
            originLatitude: body.originLatitude === undefined ? pkg.originLatitude : Number(body.originLatitude),
            originLongitude: body.originLongitude === undefined ? pkg.originLongitude : Number(body.originLongitude),
            destinationName: String(body.destination ?? pkg.destinationName),
            destinationLatitude: body.destinationLatitude === undefined ? pkg.destinationLatitude : Number(body.destinationLatitude),
            destinationLongitude: body.destinationLongitude === undefined ? pkg.destinationLongitude : Number(body.destinationLongitude),
            price: body.price === undefined ? pkg.price : Number(body.price),
            discountedPrice: body.discountedPrice === undefined ? pkg.discountedPrice : Number(body.discountedPrice),
            durationDays: body.durationDays === undefined ? pkg.durationDays : Number(body.durationDays),
            durationNights: body.durationNights === undefined ? pkg.durationNights : Number(body.durationNights),
            totalSeats: body.totalSeats === undefined ? pkg.totalSeats : Number(body.totalSeats),
            availableSeats: body.availableSeats === undefined ? pkg.availableSeats : Number(body.availableSeats),
            startDate: body.startDate === undefined ? pkg.startDate : parseDate(body.startDate),
            inclusions: body.inclusions === undefined ? pkg.inclusions : String(body.inclusions),
            exclusions: body.exclusions === undefined ? pkg.exclusions : String(body.exclusions),
            transportation: body.transportation === undefined ? pkg.transportation : String(body.transportation),
            termsAndConditions: body.termsAndConditions === undefined ? pkg.termsAndConditions : String(body.termsAndConditions),
            cancellationPolicy: body.cancellationPolicy === undefined ? pkg.cancellationPolicy : String(body.cancellationPolicy),
            packageType: body.packageType === undefined ? pkg.packageType : String(body.packageType),
            featured: body.featured === undefined ? pkg.featured : String(body.featured).toLowerCase() === "true",
            instantBooking: body.instantBooking === undefined ? pkg.instantBooking : String(body.instantBooking).toLowerCase() === "true",
            media: {
                deleteMany: {},
                createMany: { data: finalMedia.map((mediaUrl) => ({ mediaUrl })) },
            },
            itinerary: {
                deleteMany: {},
                createMany: { data: itineraryValues.map((itineraryItem) => ({ itineraryItem })) },
            },
        },
    });
    return includeResponse(updated);
}
export async function deletePackage(id, phone) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user)
        throw new ApiError(400, "User not found");
    const pkg = await prisma.travelPackage.findUnique({ where: { id: BigInt(id) } });
    if (!pkg)
        throw new ApiError(400, "Package not found");
    if (pkg.userId !== user.id)
        throw new ApiError(400, "You can only delete your own packages");
    await prisma.travelPackage.delete({ where: { id: pkg.id } });
    await prisma.user.update({
        where: { id: user.id },
        data: {
            numberOfTrips: user.numberOfTrips > 0 ? user.numberOfTrips - BigInt(1) : BigInt(0),
        },
    });
}
export async function updateStatus(id, phone, status) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user)
        throw new ApiError(400, "User not found");
    const pkg = await prisma.travelPackage.findUnique({ where: { id: BigInt(id) } });
    if (!pkg)
        throw new ApiError(400, "Package not found");
    if (pkg.userId !== user.id)
        throw new ApiError(400, "You can only update your own packages");
    const updated = await prisma.travelPackage.update({
        where: { id: pkg.id },
        data: {
            status: status,
            availableSeats: 0,
        },
    });
    return includeResponse(updated);
}
export async function filterOptions() {
    const rows = await prisma.travelPackage.findMany({
        where: { status: "ACTIVE", ...upcomingDateFilter() },
    });
    const prices = rows.map((r) => r.discountedPrice ?? r.price);
    let min = prices.length ? Math.min(...prices) : 0;
    let max = prices.length ? Math.max(...prices) : 100000;
    if (min === max) {
        const range = Math.max(5000, Math.floor(min * 0.2));
        min = Math.max(0, min - range);
        max = max + range;
    }
    const range = max - min;
    const suggestedRanges = range
        ? [
            { label: `Under Rs${Math.floor(min + range / 4)}`, min, max: Math.floor(min + range / 4) },
            { label: `Rs${Math.floor(min + range / 4)} - Rs${Math.floor(min + range / 2)}`, min: Math.floor(min + range / 4), max: Math.floor(min + range / 2) },
            { label: `Rs${Math.floor(min + range / 2)} - Rs${Math.floor(min + (3 * range) / 4)}`, min: Math.floor(min + range / 2), max: Math.floor(min + (3 * range) / 4) },
            { label: `Above Rs${Math.floor(min + (3 * range) / 4)}`, min: Math.floor(min + (3 * range) / 4), max },
        ]
        : [{ label: "Under Rs5000", min: 0, max: 5000 }];
    const durations = Array.from(new Set([
        ...rows.map((r) => r.durationDays).filter(Boolean),
        1, 2, 3, 4, 5, 6, 7, 10, 14, 21, 30,
    ])).sort((a, b) => a - b);
    return {
        transportationOptions: Object.entries(transportationMeta).map(([value, meta]) => ({
            value,
            label: meta.label,
            icon: meta.icon,
        })),
        priceRange: { min, max, suggestedRanges },
        durationOptions: durations,
        packageTypes: Object.entries(packageTypeMeta).map(([value, meta]) => ({
            value,
            label: meta.label,
            icon: meta.icon,
        })),
    };
}
