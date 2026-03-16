// src/__tests__/settings.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { readSettings, writeSettings } from "@/lib/settings";

const TEST_DATA_DIR = path.resolve(process.cwd(), "data");
const TEST_SETTINGS_PATH = path.resolve(TEST_DATA_DIR, "settings.json");

describe("Settings", () => {
  beforeEach(() => {
    // Ensure clean state
    if (fs.existsSync(TEST_SETTINGS_PATH)) {
      fs.unlinkSync(TEST_SETTINGS_PATH);
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_SETTINGS_PATH)) {
      fs.unlinkSync(TEST_SETTINGS_PATH);
    }
  });

  describe("readSettings", () => {
    it("returns defaults when settings file does not exist", () => {
      const settings = readSettings();
      expect(settings.selectedModel).toBe("claude-sonnet");
    });

    it("reads persisted settings from file", () => {
      if (!fs.existsSync(TEST_DATA_DIR)) {
        fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(
        TEST_SETTINGS_PATH,
        JSON.stringify({ selectedModel: "gpt-4o" }),
        "utf-8"
      );
      const settings = readSettings();
      expect(settings.selectedModel).toBe("gpt-4o");
    });

    it("returns defaults when file contains invalid JSON", () => {
      if (!fs.existsSync(TEST_DATA_DIR)) {
        fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(TEST_SETTINGS_PATH, "not-json", "utf-8");
      const settings = readSettings();
      expect(settings.selectedModel).toBe("claude-sonnet");
    });

    it("returns default selectedModel when field is missing", () => {
      if (!fs.existsSync(TEST_DATA_DIR)) {
        fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(TEST_SETTINGS_PATH, JSON.stringify({}), "utf-8");
      const settings = readSettings();
      expect(settings.selectedModel).toBe("claude-sonnet");
    });
  });

  describe("writeSettings", () => {
    it("writes settings to file and returns updated settings", () => {
      const result = writeSettings({ selectedModel: "claude-opus" });
      expect(result.selectedModel).toBe("claude-opus");
      const raw = fs.readFileSync(TEST_SETTINGS_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      expect(parsed.selectedModel).toBe("claude-opus");
    });

    it("creates data directory if it does not exist", () => {
      if (fs.existsSync(TEST_DATA_DIR)) {
        fs.rmSync(TEST_DATA_DIR, { recursive: true });
      }
      const result = writeSettings({ selectedModel: "gpt-4o" });
      expect(result.selectedModel).toBe("gpt-4o");
      expect(fs.existsSync(TEST_SETTINGS_PATH)).toBe(true);
    });

    it("preserves existing fields when updating partially", () => {
      writeSettings({ selectedModel: "claude-opus" });
      const result = writeSettings({});
      expect(result.selectedModel).toBe("claude-opus");
    });
  });
});
