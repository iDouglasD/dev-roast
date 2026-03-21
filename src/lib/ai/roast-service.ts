import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { diffLines } from "diff";
import { buildSystemPrompt, buildUserPrompt } from "./roast-prompt";
import { type RoastOutput, roastOutputSchema } from "./roast-schema";

type DiffLine = {
  type: "added" | "removed" | "context";
  content: string;
};

type RoastServiceInput = {
  code: string;
  language: string;
  roastMode: boolean;
};

type RoastServiceOutput = RoastOutput & {
  diffLines: DiffLine[];
};

async function generateRoast(
  input: RoastServiceInput,
): Promise<RoastServiceOutput> {
  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: roastOutputSchema,
    system: buildSystemPrompt(input.roastMode),
    prompt: buildUserPrompt(input.code, input.language),
  });

  const lines = computeDiff(input.code, object.suggestedCode);

  return { ...object, diffLines: lines };
}

function computeDiff(original: string, suggested: string): DiffLine[] {
  const changes = diffLines(original, suggested);
  const result: DiffLine[] = [];

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, "").split("\n");
    const type: DiffLine["type"] = change.added
      ? "added"
      : change.removed
        ? "removed"
        : "context";

    for (const line of lines) {
      result.push({ type, content: line });
    }
  }

  return result;
}

export { generateRoast, type RoastServiceInput, type RoastServiceOutput };
