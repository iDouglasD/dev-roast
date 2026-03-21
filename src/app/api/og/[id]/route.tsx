import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "@takumi-rs/image-response";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { roasts } from "@/db/schema";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const fontsDir = join(process.cwd(), "src/assets/fonts");

const fontPromises = {
  regular: readFile(join(fontsDir, "JetBrainsMono-Regular.ttf")),
  medium: readFile(join(fontsDir, "JetBrainsMono-Medium.ttf")),
  bold: readFile(join(fontsDir, "JetBrainsMono-Bold.ttf")),
  extraBold: readFile(join(fontsDir, "JetBrainsMono-ExtraBold.ttf")),
};

const VERDICT_COLORS: Record<string, string> = {
  needs_serious_help: "#ef4444",
  try_harder: "#ef4444",
  not_terrible: "#f59e0b",
  almost_decent: "#f59e0b",
  mass_respect: "#10b981",
};

function truncateQuote(text: string, max = 120): string {
  if (text.length <= max) return `\u201c${text}\u201d`;
  const truncated = text.slice(0, max).replace(/\s+\S*$/, "");
  return `\u201c${truncated}...\u201d`;
}

function formatScore(score: number): string {
  const rounded = Math.round(score * 10) / 10;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
}

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return new Response(null, { status: 404 });
  }

  let roast:
    | {
        score: number;
        verdict: string;
        roastComment: string;
        language: string;
        lineCount: number;
      }
    | undefined;

  try {
    [roast] = await db
      .select({
        score: roasts.score,
        verdict: roasts.verdict,
        roastComment: roasts.roastComment,
        language: roasts.language,
        lineCount: roasts.lineCount,
      })
      .from(roasts)
      .where(eq(roasts.id, id));
  } catch {
    return new Response(null, { status: 500 });
  }

  if (!roast) {
    return new Response(null, { status: 404 });
  }

  const verdictColor = VERDICT_COLORS[roast.verdict] ?? "#f59e0b";
  const scoreDisplay = formatScore(roast.score);
  const quote = truncateQuote(roast.roastComment);

  const [regular, medium, bold, extraBold] = await Promise.all([
    fontPromises.regular,
    fontPromises.medium,
    fontPromises.bold,
    fontPromises.extraBold,
  ]);

  return new ImageResponse(
    <div
      tw="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] border border-[#2a2a2a]"
      style={{ padding: 64, gap: 28 }}
    >
      {/* Logo */}
      <div tw="flex items-center" style={{ gap: 8 }}>
        <span
          tw="text-[24px] font-bold"
          style={{ color: "#10b981", fontFamily: "JetBrains Mono" }}
        >
          {">"}
        </span>
        <span
          tw="text-[20px]"
          style={{
            color: "#fafafa",
            fontFamily: "JetBrains Mono",
            fontWeight: 500,
          }}
        >
          devroast
        </span>
      </div>

      {/* Score */}
      <div tw="flex items-end" style={{ gap: 4 }}>
        <span
          tw="text-[160px]"
          style={{
            color: verdictColor,
            fontFamily: "JetBrains Mono",
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          {scoreDisplay}
        </span>
        <span
          tw="text-[56px]"
          style={{
            color: "#4b5563",
            fontFamily: "JetBrains Mono",
            lineHeight: 1,
          }}
        >
          /100
        </span>
      </div>

      {/* Verdict */}
      <div tw="flex items-center" style={{ gap: 8 }}>
        <div
          tw="rounded-full"
          style={{
            width: 12,
            height: 12,
            backgroundColor: verdictColor,
          }}
        />
        <span
          tw="text-[20px]"
          style={{ color: verdictColor, fontFamily: "JetBrains Mono" }}
        >
          {roast.verdict}
        </span>
      </div>

      {/* Lang info */}
      <span
        tw="text-[16px]"
        style={{ color: "#4b5563", fontFamily: "JetBrains Mono" }}
      >
        {`lang: ${roast.language} \u00b7 ${roast.lineCount} lines`}
      </span>

      {/* Roast quote */}
      <span
        tw="text-[22px] text-center"
        style={{
          color: "#fafafa",
          fontFamily: "JetBrains Mono",
          lineHeight: 1.5,
          maxWidth: "100%",
        }}
      >
        {quote}
      </span>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "JetBrains Mono",
          data: regular,
          weight: 400,
          style: "normal" as const,
        },
        {
          name: "JetBrains Mono",
          data: medium,
          weight: 500,
          style: "normal" as const,
        },
        {
          name: "JetBrains Mono",
          data: bold,
          weight: 700,
          style: "normal" as const,
        },
        {
          name: "JetBrains Mono",
          data: extraBold,
          weight: 800,
          style: "normal" as const,
        },
      ],
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    },
  );
}
