import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { roastDiffLines, roastIssues, roasts } from "@/db/schema";
import { toDbLanguage } from "@/lib/ai/language-map";
import { generateRoast } from "@/lib/ai/roast-service";
import { baseProcedure, createTRPCRouter } from "../init";

export const roastRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        code: z.string().min(1).max(2000),
        language: z.string(),
        roastMode: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await generateRoast({
        code: input.code,
        language: input.language,
        roastMode: input.roastMode,
      });

      const dbLanguage = toDbLanguage(input.language);
      const lineCount = input.code.split("\n").length;

      const roast = await ctx.db.transaction(async (tx) => {
        const [inserted] = await tx
          .insert(roasts)
          .values({
            code: input.code,
            language: dbLanguage,
            lineCount,
            score: result.score,
            verdict: result.verdict,
            roastComment: result.roastComment,
            suggestedCode: result.suggestedCode,
          })
          .returning({ id: roasts.id });

        if (result.issues.length > 0) {
          await tx.insert(roastIssues).values(
            result.issues.map((issue, index) => ({
              roastId: inserted.id,
              severity: issue.severity,
              title: issue.title,
              description: issue.description,
              sortOrder: index,
            })),
          );
        }

        if (result.diffLines.length > 0) {
          await tx.insert(roastDiffLines).values(
            result.diffLines.map((line, index) => ({
              roastId: inserted.id,
              type: line.type,
              content: line.content,
              sortOrder: index,
            })),
          );
        }

        return inserted;
      });

      return { id: roast.id };
    }),

  getById: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const roast = await ctx.db
        .select()
        .from(roasts)
        .where(eq(roasts.id, input.id))
        .then((rows) => rows[0]);

      if (!roast) return null;

      const issues = await ctx.db
        .select()
        .from(roastIssues)
        .where(eq(roastIssues.roastId, input.id))
        .orderBy(asc(roastIssues.sortOrder));

      const diffLines = await ctx.db
        .select()
        .from(roastDiffLines)
        .where(eq(roastDiffLines.roastId, input.id))
        .orderBy(asc(roastDiffLines.sortOrder));

      return { ...roast, issues, diffLines };
    }),
});
