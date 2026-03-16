// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readSettings, writeSettings } from "@/lib/settings";
import { getModelConfig } from "@/lib/ai/types";

export async function GET() {
  const settings = readSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.selectedModel !== undefined) {
      if (typeof body.selectedModel !== "string") {
        return NextResponse.json(
          { error: "selectedModel must be a string" },
          { status: 400 }
        );
      }
      const config = getModelConfig(body.selectedModel);
      if (!config) {
        return NextResponse.json(
          { error: `Unknown model: ${body.selectedModel}. Valid models: claude-sonnet, claude-opus, gpt-4o` },
          { status: 400 }
        );
      }
    }

    const updated = writeSettings(body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}
