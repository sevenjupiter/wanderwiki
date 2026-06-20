import { eq, desc, asc, and, sql, like, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, itineraries, stops, budgetItems, communityTips, itineraryLikes } from "../drizzle/schema";
import type { InsertItinerary, InsertStop, InsertBudgetItem, InsertCommunityTip } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER QUERIES ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: { name?: string; bio?: string; avatarUrl?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

// ============ ITINERARY QUERIES ============

export async function createItinerary(data: InsertItinerary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(itineraries).values(data);
  return result[0].insertId;
}

export async function getItineraryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(itineraries).where(eq(itineraries.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getItinerariesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(itineraries).where(eq(itineraries.userId, userId)).orderBy(desc(itineraries.updatedAt));
}

export async function getPublicItineraries(limit = 20, offset = 0, filters?: {
  destination?: string;
  travelStyle?: string;
  minDuration?: number;
  maxDuration?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(itineraries.isPublic, true)];
  if (filters?.destination) {
    conditions.push(like(itineraries.destination, `%${filters.destination}%`));
  }
  if (filters?.travelStyle) {
    conditions.push(eq(itineraries.travelStyle, filters.travelStyle));
  }
  if (filters?.minDuration) {
    conditions.push(gte(itineraries.duration, filters.minDuration));
  }
  if (filters?.maxDuration) {
    conditions.push(lte(itineraries.duration, filters.maxDuration));
  }
  return db.select({
    itinerary: itineraries,
    user: { id: users.id, name: users.name, avatarUrl: users.avatarUrl }
  })
    .from(itineraries)
    .leftJoin(users, eq(itineraries.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(itineraries.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateItinerary(id: number, data: Partial<InsertItinerary>) {
  const db = await getDb();
  if (!db) return;
  await db.update(itineraries).set(data).where(eq(itineraries.id, id));
}

export async function deleteItinerary(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(stops).where(eq(stops.itineraryId, id));
  await db.delete(budgetItems).where(eq(budgetItems.itineraryId, id));
  await db.delete(communityTips).where(eq(communityTips.itineraryId, id));
  await db.delete(itineraryLikes).where(eq(itineraryLikes.itineraryId, id));
  await db.delete(itineraries).where(eq(itineraries.id, id));
}

export async function getItineraryByShareToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(itineraries).where(eq(itineraries.shareToken, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function incrementViewCount(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(itineraries).set({ viewCount: sql`${itineraries.viewCount} + 1` }).where(eq(itineraries.id, id));
}

// ============ STOP QUERIES ============

export async function createStop(data: InsertStop) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(stops).values(data);
  return result[0].insertId;
}

export async function getStopsByItinerary(itineraryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stops).where(eq(stops.itineraryId, itineraryId)).orderBy(asc(stops.dayNumber), asc(stops.orderIndex));
}

export async function updateStop(id: number, data: Partial<InsertStop>) {
  const db = await getDb();
  if (!db) return;
  await db.update(stops).set(data).where(eq(stops.id, id));
}

export async function deleteStop(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(stops).where(eq(stops.id, id));
}

export async function reorderStops(itineraryId: number, stopOrders: { id: number; dayNumber: number; orderIndex: number }[]) {
  const db = await getDb();
  if (!db) return;
  for (const item of stopOrders) {
    await db.update(stops).set({ dayNumber: item.dayNumber, orderIndex: item.orderIndex }).where(eq(stops.id, item.id));
  }
}

// ============ BUDGET QUERIES ============

export async function createBudgetItem(data: InsertBudgetItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(budgetItems).values(data);
  return result[0].insertId;
}

export async function getBudgetByItinerary(itineraryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(budgetItems).where(eq(budgetItems.itineraryId, itineraryId)).orderBy(asc(budgetItems.createdAt));
}

export async function deleteBudgetItem(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(budgetItems).where(eq(budgetItems.id, id));
}

// ============ COMMUNITY TIPS QUERIES ============

export async function createTip(data: InsertCommunityTip) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(communityTips).values(data);
  return result[0].insertId;
}

export async function getTipsByItinerary(itineraryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    tip: communityTips,
    user: { id: users.id, name: users.name, avatarUrl: users.avatarUrl }
  })
    .from(communityTips)
    .leftJoin(users, eq(communityTips.userId, users.id))
    .where(eq(communityTips.itineraryId, itineraryId))
    .orderBy(desc(communityTips.upvotes));
}

export async function getTipsByStop(stopId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    tip: communityTips,
    user: { id: users.id, name: users.name, avatarUrl: users.avatarUrl }
  })
    .from(communityTips)
    .leftJoin(users, eq(communityTips.userId, users.id))
    .where(eq(communityTips.stopId, stopId))
    .orderBy(desc(communityTips.upvotes));
}

// ============ LIKES QUERIES ============

export async function toggleLike(itineraryId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const existing = await db.select().from(itineraryLikes)
    .where(and(eq(itineraryLikes.itineraryId, itineraryId), eq(itineraryLikes.userId, userId)))
    .limit(1);
  if (existing.length > 0) {
    await db.delete(itineraryLikes).where(eq(itineraryLikes.id, existing[0].id));
    await db.update(itineraries).set({ likeCount: sql`${itineraries.likeCount} - 1` }).where(eq(itineraries.id, itineraryId));
    return false;
  } else {
    await db.insert(itineraryLikes).values({ itineraryId, userId });
    await db.update(itineraries).set({ likeCount: sql`${itineraries.likeCount} + 1` }).where(eq(itineraries.id, itineraryId));
    return true;
  }
}

export async function hasUserLiked(itineraryId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(itineraryLikes)
    .where(and(eq(itineraryLikes.itineraryId, itineraryId), eq(itineraryLikes.userId, userId)))
    .limit(1);
  return result.length > 0;
}
