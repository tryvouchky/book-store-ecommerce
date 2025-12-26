import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  menu: router({
    list: publicProcedure.query(async () => {
      return await db.getAllMenuItems();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getMenuItemById(input.id);
      }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          description: z.string().optional(),
          price: z.number().min(0, "Price must be positive"),
          imageUrl: z.string().url().optional().or(z.literal("")),
          category: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const newItem = await db.createMenuItem({
          name: input.name,
          description: input.description,
          price: input.price,
          imageUrl: input.imageUrl || undefined,
          category: input.category,
        });
        return newItem;
      }),
  }),

  cart: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCartItemsByUserId(ctx.user.id);
    }),
    add: protectedProcedure
      .input(
        z.object({
          menuItemId: z.number(),
          quantity: z.number().min(1).default(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.addToCart(ctx.user.id, input.menuItemId, input.quantity);
        return { success: true };
      }),
    updateQuantity: protectedProcedure
      .input(
        z.object({
          cartItemId: z.number(),
          quantity: z.number().min(0),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.updateCartItemQuantity(input.cartItemId, ctx.user.id, input.quantity);
        return { success: true };
      }),
    remove: protectedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.removeFromCart(input.cartItemId, ctx.user.id);
        return { success: true };
      }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
