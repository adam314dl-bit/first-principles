import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("pixi.js", () => {
  function MockApplication() {
    return {
      init: vi.fn().mockResolvedValue(undefined),
      canvas: document.createElement("canvas"),
      stage: { addChild: vi.fn() },
      ticker: { add: vi.fn() },
      screen: { width: 800, height: 600 },
      renderer: { render: vi.fn() },
      destroy: vi.fn(),
    };
  }

  function MockContainer() {
    return {
      addChild: vi.fn(),
      children: [],
      scale: { set: vi.fn() },
      x: 0,
      y: 0,
      alpha: 1,
      eventMode: "auto",
      cursor: "default",
      on: vi.fn(),
    };
  }

  function MockGraphics() {
    const self = {
      circle: vi.fn().mockImplementation(() => self),
      fill: vi.fn().mockImplementation(() => self),
      stroke: vi.fn().mockImplementation(() => self),
      moveTo: vi.fn().mockImplementation(() => self),
      lineTo: vi.fn().mockImplementation(() => self),
      quadraticCurveTo: vi.fn().mockImplementation(() => self),
      rect: vi.fn().mockImplementation(() => self),
      ellipse: vi.fn().mockImplementation(() => self),
      poly: vi.fn().mockImplementation(() => self),
      rotation: 0,
      x: 0,
      y: 0,
      alpha: 1,
      filters: [],
      eventMode: "auto",
      cursor: "default",
      on: vi.fn(),
    };
    return self;
  }

  function MockSprite() {
    return { anchor: { set: vi.fn() }, x: 0, y: 0 };
  }

  function MockBlurFilter() {
    return {};
  }

  return {
    Application: MockApplication,
    Container: MockContainer,
    Graphics: MockGraphics,
    Sprite: MockSprite,
    BlurFilter: MockBlurFilter,
    RenderTexture: { create: vi.fn().mockReturnValue({}) },
    Texture: { from: vi.fn(), WHITE: {} },
  };
});

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({ get: vi.fn(() => null) })),
  useRouter: vi.fn(() => ({ replace: vi.fn(), push: vi.fn() })),
  usePathname: vi.fn(() => "/tree"),
}));

import CosmosTree from "@/components/cosmos/CosmosTree";

describe("CosmosTree", () => {
  it("renders canvas container", () => {
    render(<CosmosTree nodes={[]} edges={[]} />);
    expect(screen.getByTestId("cosmos-canvas")).toBeTruthy();
  });

  it("shows loading state initially", () => {
    render(<CosmosTree nodes={[]} edges={[]} />);
    expect(screen.getByText("CHARTING THE COSMOS...")).toBeTruthy();
  });

  it("shows title", () => {
    render(<CosmosTree nodes={[]} edges={[]} />);
    expect(screen.getByText("THE PHYSICS COSMOS")).toBeTruthy();
  });
});
