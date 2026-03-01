import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { TranslationSegment, Bookmark } from "../../types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { segments, bookmarks } = (await request.json()) as {
      segments: TranslationSegment[];
      bookmarks: Bookmark[];
    };

    if (!segments || segments.length === 0) {
      return NextResponse.json(
        { error: "No transcript segments provided" },
        { status: 400 }
      );
    }

    // Build transcript text
    const transcriptLines = segments
      .map(
        (seg) =>
          `[${seg.timestamp}] KO: ${seg.korean} | ZH: ${seg.chinese}`
      )
      .join("\n");

    // Build bookmark info
    const bookmarkLines =
      bookmarks.length > 0
        ? bookmarks
            .map((b) => {
              const seg = segments.find((s) => s.id === b.segmentId);
              return seg
                ? `- [${seg.timestamp}] type=${b.type}: "${seg.chinese}"`
                : null;
            })
            .filter(Boolean)
            .join("\n")
        : "None";

    const prompt = `You are a meeting summarizer. Analyze this Korean-Chinese meeting transcript and produce a structured summary.

## Transcript
${transcriptLines}

## Bookmarked Segments
${bookmarkLines}

## Instructions
Return ONLY valid JSON (no markdown fencing, no explanation) with this exact structure:
{
  "keyPoints": ["point 1", "point 2"],
  "decisions": ["decision 1"],
  "actionItems": ["action 1"],
  "flaggedSegments": [{"segmentId": "id", "reason": "why this was flagged"}]
}

Rules:
- Write all summary content in Chinese (中文).
- keyPoints: 3-7 main discussion points.
- decisions: Any decisions made (can be empty array).
- actionItems: Any action items or follow-ups (can be empty array).
- flaggedSegments: Include bookmarked segments with reasons. Use the actual segment IDs from the transcript. If no bookmarks, return empty array.
- Keep each point concise (1-2 sentences).`;

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Attempt to extract JSON from response if wrapped in markdown
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse summary JSON");
      }
    }

    const summary = {
      keyPoints: parsed.keyPoints || [],
      decisions: parsed.decisions || [],
      actionItems: parsed.actionItems || [],
      flaggedSegments: parsed.flaggedSegments || [],
      generatedAt: new Date().toISOString(),
      rawMarkdown: "", // Generated client-side
    };

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary generation error:", error);
    return NextResponse.json(
      { error: "Summary generation failed" },
      { status: 500 }
    );
  }
}
