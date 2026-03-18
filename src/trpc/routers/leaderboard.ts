import { asc, desc, sql } from "drizzle-orm";
import { roasts } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "../init";

export const leaderboardRouter = createTRPCRouter({
  stats: baseProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({
        count: sql<number>`count(*)::int`,
        avgScore: sql<number>`round(coalesce(avg(${roasts.score}), 0)::numeric, 1)::float`,
      })
      .from(roasts)
      .then((rows) => rows[0]);

    return {
      totalRoasts: result.count,
      avgScore: result.avgScore,
    };
  }),

  top3: baseProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: roasts.id,
        score: roasts.score,
        code: roasts.code,
        language: roasts.language,
      })
      .from(roasts)
      .orderBy(asc(roasts.score), desc(roasts.createdAt))
      .limit(3);
  }),

  top20: baseProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: roasts.id,
        score: roasts.score,
        code: roasts.code,
        language: roasts.language,
        lineCount: roasts.lineCount,
        verdict: roasts.verdict,
        roastComment: roasts.roastComment,
      })
      .from(roasts)
      .orderBy(asc(roasts.score), desc(roasts.createdAt))
      .limit(20);
  }),
});
