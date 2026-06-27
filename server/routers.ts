import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import * as db from "./db";
import { invokeLLM, type InvokeResult } from "./_core/llm";
import { makeRequest } from "./_core/map";
import type { GeocodingResult, DirectionsResult, PlacesSearchResult } from "./_core/map";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return ctx.user;
    }),
    update: protectedProcedure.input(z.object({
      name: z.string().optional(),
      bio: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      await db.updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
  }),

  itinerary: router({
    create: protectedProcedure.input(z.object({
      title: z.string().min(1),
      destination: z.string().min(1),
      country: z.string().optional(),
      description: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      duration: z.number().optional(),
      travelStyle: z.string().optional(),
      currency: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const shareToken = nanoid(16);
      const id = await db.createItinerary({
        ...input,
        userId: ctx.user.id,
        shareToken,
      });
      return { id, shareToken };
    }),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const itinerary = await db.getItineraryById(input.id);
      if (!itinerary) return null;
      const stopsData = await db.getStopsByItinerary(input.id);
      const budget = await db.getBudgetByItinerary(input.id);
      return { ...itinerary, stops: stopsData, budget };
    }),

    getByShareToken: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const itinerary = await db.getItineraryByShareToken(input.token);
      if (!itinerary) return null;
      await db.incrementViewCount(itinerary.id);
      const stopsData = await db.getStopsByItinerary(itinerary.id);
      const budget = await db.getBudgetByItinerary(itinerary.id);
      return { ...itinerary, stops: stopsData, budget };
    }),

    myItineraries: protectedProcedure.query(async ({ ctx }) => {
      return db.getItinerariesByUser(ctx.user.id);
    }),

    discover: publicProcedure.input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
      destination: z.string().optional(),
      travelStyle: z.string().optional(),
      minDuration: z.number().optional(),
      maxDuration: z.number().optional(),
    })).query(async ({ input }) => {
      return db.getPublicItineraries(input.limit, input.offset, {
        destination: input.destination,
        travelStyle: input.travelStyle,
        minDuration: input.minDuration,
        maxDuration: input.maxDuration,
      });
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      destination: z.string().optional(),
      country: z.string().optional(),
      description: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      duration: z.number().optional(),
      travelStyle: z.string().optional(),
      isPublic: z.boolean().optional(),
      totalBudget: z.string().optional(),
      currency: z.string().optional(),
      status: z.enum(["draft", "planning", "active", "completed"]).optional(),
    })).mutation(async ({ ctx, input }) => {
      const itinerary = await db.getItineraryById(input.id);
      if (!itinerary || itinerary.userId !== ctx.user.id) throw new Error("Not authorized");
      const { id, ...data } = input;
      await db.updateItinerary(id, data);
      return { success: true };
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const itinerary = await db.getItineraryById(input.id);
      if (!itinerary || itinerary.userId !== ctx.user.id) throw new Error("Not authorized");
      await db.deleteItinerary(input.id);
      return { success: true };
    }),

    like: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const liked = await db.toggleLike(input.id, ctx.user.id);
      return { liked };
    }),

    hasLiked: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      return db.hasUserLiked(input.id, ctx.user.id);
    }),
  }),

  stop: router({
    create: protectedProcedure.input(z.object({
      itineraryId: z.number(),
      dayNumber: z.number(),
      orderIndex: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      category: z.enum(["must-see", "must-do", "must-try", "must-eat"]),
      address: z.string().optional(),
      lat: z.string().optional(),
      lng: z.string().optional(),
      placeId: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      duration: z.number().optional(),
      cost: z.string().optional(),
      costCategory: z.enum(["accommodation", "transport", "food", "activities", "shopping", "other"]).optional(),
      stopDate: z.string().optional(),
      notes: z.string().optional(),
      tips: z.string().optional(),
      bookingUrl: z.string().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createStop(input);
      return { id };
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      dayNumber: z.number().optional(),
      orderIndex: z.number().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.enum(["must-see", "must-do", "must-try", "must-eat"]).optional(),
      address: z.string().optional(),
      lat: z.string().optional(),
      lng: z.string().optional(),
      placeId: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      duration: z.number().optional(),
      cost: z.string().optional(),
      costCategory: z.enum(["accommodation", "transport", "food", "activities", "shopping", "other"]).optional(),
      stopDate: z.string().optional(),
      travelTimeFromPrev: z.number().optional(),
      travelDistanceFromPrev: z.string().optional(),
      notes: z.string().optional(),
      tips: z.string().optional(),
      bookingUrl: z.string().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateStop(id, data);
      return { success: true };
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteStop(input.id);
      return { success: true };
    }),

    reorder: protectedProcedure.input(z.object({
      itineraryId: z.number(),
      orders: z.array(z.object({ id: z.number(), dayNumber: z.number(), orderIndex: z.number() })),
    })).mutation(async ({ input }) => {
      await db.reorderStops(input.itineraryId, input.orders);
      return { success: true };
    }),

    getByItinerary: publicProcedure.input(z.object({ itineraryId: z.number() })).query(async ({ input }) => {
      return db.getStopsByItinerary(input.itineraryId);
    }),
  }),

  budget: router({
    create: protectedProcedure.input(z.object({
      itineraryId: z.number(),
      category: z.enum(["accommodation", "transport", "food", "activities", "shopping", "other"]),
      title: z.string().min(1),
      amount: z.string(),
      currency: z.string().optional(),
      dayNumber: z.number().optional(),
      notes: z.string().optional(),
      bookingUrl: z.string().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createBudgetItem(input);
      return { id };
    }),

    getByItinerary: publicProcedure.input(z.object({ itineraryId: z.number() })).query(async ({ input }) => {
      return db.getBudgetByItinerary(input.itineraryId);
    }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteBudgetItem(input.id);
      return { success: true };
    }),
  }),

  tips: router({
    create: protectedProcedure.input(z.object({
      stopId: z.number().optional(),
      itineraryId: z.number().optional(),
      content: z.string().min(1),
      tipType: z.enum(["tip", "warning", "recommendation", "hidden-gem"]).optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.createTip({ ...input, userId: ctx.user.id });
      return { id };
    }),

    getByItinerary: publicProcedure.input(z.object({ itineraryId: z.number() })).query(async ({ input }) => {
      return db.getTipsByItinerary(input.itineraryId);
    }),

    getByStop: publicProcedure.input(z.object({ stopId: z.number() })).query(async ({ input }) => {
      return db.getTipsByStop(input.stopId);
    }),
  }),

  maps: router({
    geocode: protectedProcedure.input(z.object({ address: z.string() })).mutation(async ({ input }) => {
      const result = await makeRequest<GeocodingResult>("/maps/api/geocode/json", { address: input.address });
      if (result.status === "OK" && result.results.length > 0) {
        const loc = result.results[0];
        return {
          lat: loc.geometry.location.lat,
          lng: loc.geometry.location.lng,
          formattedAddress: loc.formatted_address,
          placeId: loc.place_id,
        };
      }
      return null;
    }),

    optimizeRoute: protectedProcedure.input(z.object({
      itineraryId: z.number(),
      dayNumber: z.number().optional(),
    })).mutation(async ({ input }) => {
      const allStops = await db.getStopsByItinerary(input.itineraryId);
      const dayStops = input.dayNumber
        ? allStops.filter(s => s.dayNumber === input.dayNumber)
        : allStops;

      if (dayStops.length < 2) return { stops: dayStops, message: "Need at least 2 stops to optimize" };

      const stopsWithCoords = dayStops.filter(s => s.lat && s.lng);
      if (stopsWithCoords.length < 2) return { stops: dayStops, message: "Need geocoded stops to optimize" };

      // Use first stop as origin and last as destination for a loop
      const origin = `${stopsWithCoords[0].lat},${stopsWithCoords[0].lng}`;
      const destination = `${stopsWithCoords[stopsWithCoords.length - 1].lat},${stopsWithCoords[stopsWithCoords.length - 1].lng}`;
      const waypoints = stopsWithCoords.slice(1, -1).map(s => `${s.lat},${s.lng}`).join("|");

      const result = await makeRequest<DirectionsResult>("/maps/api/directions/json", {
        origin,
        destination,
        waypoints: waypoints ? `optimize:true|${waypoints}` : undefined,
        mode: "driving",
      });

      if (result.status === "OK" && result.routes.length > 0) {
        const route = result.routes[0];
        const optimizedOrder = route.waypoint_order;

        // Reorder stops based on optimized order
        const reorderedStops = [stopsWithCoords[0]];
        for (const idx of optimizedOrder) {
          reorderedStops.push(stopsWithCoords[idx + 1]);
        }
        reorderedStops.push(stopsWithCoords[stopsWithCoords.length - 1]);

        // Update travel times between stops
        const updates: { id: number; dayNumber: number; orderIndex: number }[] = [];
        for (let i = 0; i < reorderedStops.length; i++) {
          updates.push({
            id: reorderedStops[i].id,
            dayNumber: reorderedStops[i].dayNumber,
            orderIndex: i,
          });

          if (i > 0 && route.legs[i - 1]) {
            await db.updateStop(reorderedStops[i].id, {
              travelTimeFromPrev: Math.round(route.legs[i - 1].duration.value / 60),
              travelDistanceFromPrev: (route.legs[i - 1].distance.value / 1000).toFixed(2),
            });
          }
        }

        await db.reorderStops(input.itineraryId, updates);

        return {
          stops: reorderedStops,
          totalDistance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0) / 1000,
          totalDuration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0) / 60,
          message: "Route optimized successfully!",
        };
      }

      return { stops: dayStops, message: "Could not optimize route" };
    }),

    nearbyPlaces: protectedProcedure.input(z.object({
      lat: z.number(),
      lng: z.number(),
      type: z.string().optional(),
      keyword: z.string().optional(),
    })).query(async ({ input }) => {
      const result = await makeRequest<PlacesSearchResult>("/maps/api/place/nearbysearch/json", {
        location: `${input.lat},${input.lng}`,
        radius: 2000,
        type: input.type,
        keyword: input.keyword,
      });
      return result.results || [];
    }),

    directions: publicProcedure.input(z.object({
      origin: z.string(),
      destination: z.string(),
      waypoints: z.string().optional(),
      mode: z.string().optional(),
    })).query(async ({ input }) => {
      const result = await makeRequest<DirectionsResult>("/maps/api/directions/json", {
        origin: input.origin,
        destination: input.destination,
        waypoints: input.waypoints,
        mode: input.mode || "driving",
      });
      return result;
    }),
  }),

  ai: router({
    chat: protectedProcedure.input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })),
      itineraryContext: z.string().optional(),
    })).mutation(async ({ input }) => {
      const systemPrompt = `You are WanderWiki's AI travel assistant. You help travelers plan amazing trips by suggesting hidden gems, must-see attractions, must-do activities, must-try experiences, and must-eat restaurants. You provide practical tips about timing, costs, and logistics. You prioritize recent, authentic experiences over generic tourist advice. Always be specific with recommendations and include practical details like addresses, best times to visit, and estimated costs.${input.itineraryContext ? `\n\nCurrent itinerary context:\n${input.itineraryContext}` : ""}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          ...input.messages,
        ],
      });

      const content = response.choices[0]?.message?.content;
      return {
        content: typeof content === "string" ? content : "I couldn't generate a response. Please try again.",
      };
    }),

    suggestStops: protectedProcedure.input(z.object({
      destination: z.string(),
      travelStyle: z.string().optional(),
      duration: z.number().optional(),
      interests: z.string().optional(),
    })).mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a travel expert. Return a JSON array of suggested stops for the given destination. Each stop should have: title, description, category (must-see, must-do, must-try, or must-eat), address, estimatedDuration (in minutes), and tips. Focus on authentic, local experiences and hidden gems that real travelers recommend."
          },
          {
            role: "user",
            content: `Suggest 8-12 stops for a trip to ${input.destination}${input.duration ? ` for ${input.duration} days` : ""}${input.travelStyle ? `, travel style: ${input.travelStyle}` : ""}${input.interests ? `, interests: ${input.interests}` : ""}. Include a mix of must-see, must-do, must-try, and must-eat places.`
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "stop_suggestions",
            strict: true,
            schema: {
              type: "object",
              properties: {
                stops: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      category: { type: "string", enum: ["must-see", "must-do", "must-try", "must-eat"] },
                      address: { type: "string" },
                      estimatedDuration: { type: "number" },
                      tips: { type: "string" },
                    },
                    required: ["title", "description", "category", "address", "estimatedDuration", "tips"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["stops"],
              additionalProperties: false,
            },
          },
        },
      });

      try {
        const content = response.choices[0]?.message?.content;
        const parsed = JSON.parse(typeof content === "string" ? content : "{}");
        return parsed.stops || [];
      } catch {
        return [];
      }
    }),

    generateTips: protectedProcedure.input(z.object({
      destination: z.string(),
      stopTitle: z.string().optional(),
    })).mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a travel expert who aggregates tips from real travelers on Reddit, TikTok, and travel forums. Provide practical, specific, and recent travel tips. Focus on insider knowledge that most tourists miss."
          },
          {
            role: "user",
            content: input.stopTitle
              ? `Give me 5 practical travel tips for visiting "${input.stopTitle}" in ${input.destination}. Include timing advice, cost tips, and what to avoid.`
              : `Give me 8 essential travel tips for ${input.destination}. Include hidden gems, money-saving tips, and common mistakes to avoid.`
          },
        ],
      });

      const tipContent = response.choices[0]?.message?.content;
      return {
        content: typeof tipContent === "string" ? tipContent : "",
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
