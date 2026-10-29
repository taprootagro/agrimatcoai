import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DetailHeroVideo } from "../DetailHeroVideo";

vi.mock("../../utils/videoEmbedFromUrl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../utils/videoEmbedFromUrl")>();
  return {
    ...actual,
    resolveLiveStreamEmbedUrl: vi.fn((url: string) => {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        return "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ";
      }
      if (url.includes("vimeo.com")) {
        return "https://player.vimeo.com/video/123456789";
      }
      if (url.includes("bilibili.com")) {
        return "https://player.bilibili.com/player.html?bvid=BV1xx411c7mD";
      }
      return null;
    }),
  };
});

describe("DetailHeroVideo", () => {
  it("renders iframe for YouTube share URL", () => {
    render(
      <DetailHeroVideo
        videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        alt="Demo"
      />,
    );
    const iframe = screen.getByTitle("Demo");
    expect(iframe.tagName).toBe("IFRAME");
    const src = iframe.getAttribute("src") ?? "";
    expect(src.startsWith("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ")).toBe(true);
    expect(new URL(src).searchParams.get("modestbranding")).toBe("1");
  });

  it("renders iframe for Vimeo share URL", () => {
    render(<DetailHeroVideo videoUrl="https://vimeo.com/123456789" alt="Vimeo" />);
    const vimeoSrc = screen.getByTitle("Vimeo").getAttribute("src") ?? "";
    expect(vimeoSrc.startsWith("https://player.vimeo.com/video/123456789")).toBe(true);
  });

  it("renders iframe for Bilibili share URL", () => {
    render(
      <DetailHeroVideo
        videoUrl="https://www.bilibili.com/video/BV1xx411c7mD"
        alt="Bilibili"
      />,
    );
    expect(screen.getByTitle("Bilibili")).toHaveAttribute(
      "src",
      "https://player.bilibili.com/player.html?bvid=BV1xx411c7mD",
    );
  });

  it("renders video element for direct MP4 URL", () => {
    render(
      <DetailHeroVideo
        videoUrl="https://cdn.example.com/demo.mp4"
        posterUrl="https://cdn.example.com/poster.jpg"
      />,
    );
    const video = document.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("src", "https://cdn.example.com/demo.mp4");
    expect(screen.queryByTitle("Video")).not.toBeInTheDocument();
  });

  it("embed iframe is letterboxed inside wrapper when posterUrl provided", () => {
    render(
      <DetailHeroVideo
        videoUrl="https://youtu.be/dQw4w9WgXcQ"
        posterUrl="https://cdn.example.com/poster.jpg"
        alt="With poster"
      />,
    );
    const iframe = screen.getByTitle("With poster");
    expect(iframe).toBeInTheDocument();
    expect(iframe.className).toContain("aspect-video");
    expect(iframe.className).toContain("max-h-full");
  });
});
