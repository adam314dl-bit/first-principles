// src/lib/settings.ts
import fs from "fs";
import path from "path";

export interface AppSettings {
  selectedModel: string;
}

const DEFAULTS: AppSettings = {
  selectedModel: "claude-sonnet",
};

function getSettingsPath(): string {
  return path.resolve(process.cwd(), "data", "settings.json");
}

export function readSettings(): AppSettings {
  const filePath = getSettingsPath();
  try {
    if (!fs.existsSync(filePath)) {
      return { ...DEFAULTS };
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      selectedModel: typeof parsed.selectedModel === "string"
        ? parsed.selectedModel
        : DEFAULTS.selectedModel,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function writeSettings(settings: Partial<AppSettings>): AppSettings {
  const filePath = getSettingsPath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const current = readSettings();
  const updated: AppSettings = {
    selectedModel: settings.selectedModel ?? current.selectedModel,
  };
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}
