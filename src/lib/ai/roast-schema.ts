import { z } from "zod";

const roastOutputSchema = z.object({
  score: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Code quality score from 0 (terrible) to 100 (perfect)"),
  verdict: z
    .enum([
      "needs_serious_help",
      "try_harder",
      "not_terrible",
      "almost_decent",
      "mass_respect",
    ])
    .describe("Overall verdict based on score range"),
  roastComment: z
    .string()
    .describe("A memorable one-liner summarizing the code quality"),
  issues: z
    .array(
      z.object({
        severity: z.enum(["critical", "warning", "good"]),
        title: z.string().describe("Short issue title in lowercase"),
        description: z
          .string()
          .describe("Detailed explanation of the issue and how to fix it"),
      }),
    )
    .min(3)
    .max(6)
    .describe("List of issues found in the code"),
  suggestedCode: z
    .string()
    .describe("The improved version of the submitted code with fixes applied"),
});

type RoastOutput = z.infer<typeof roastOutputSchema>;

export { roastOutputSchema, type RoastOutput };
