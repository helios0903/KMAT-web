import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang, glossary } = await request.json();

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: "Missing text or targetLang" },
        { status: 400 }
      );
    }

    let glossaryBlock = "";
    if (glossary && Array.isArray(glossary) && glossary.length > 0) {
      const mappings = glossary
        .map((g: { korean: string; translation: string }) => `${g.korean} → ${g.translation}`)
        .join("\n");
      glossaryBlock = `Use these term mappings as reference:\nKorean → Translation\n${mappings}\n\n`;
    }

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `${glossaryBlock}Translate the following Korean text to ${targetLang}. Return ONLY the translation, nothing else. No quotes, no explanation.\n\n${text}`,
        },
      ],
    });

    const translation =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ translation });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}
