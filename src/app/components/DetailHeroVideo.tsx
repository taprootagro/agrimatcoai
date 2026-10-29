import { useState } from "react";
import { buildEmbedPlaybackSrc, resolveLiveStreamEmbedUrl } from "../utils/videoEmbedFromUrl";
import { useCmsMediaUrl } from "../hooks/useCmsMediaUrl";

const EMBED_IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen";

const DEFAULT_WRAP =
  "absolute inset-0 flex items-center justify-center bg-gray-100 min-h-0";

type Props = {
  videoUrl: string;
  /** 用作 poster / 加载失败时回退 */
  posterUrl?: string;
  alt?: string;
  /** 外层容器（居中 letterbox，不裁切视频） */
  className?: string;
};

/**
 * 详情页顶部：可选视频 + poster；平台分享链接走 iframe，直链走 video；失败时回退为图片。
 * 媒体按原始宽高比 contained 播放，不铺满裁切。
 */
export function DetailHeroVideo({
  videoUrl,
  posterUrl,
  alt = "",
  className = DEFAULT_WRAP,
}: Props) {
  const [failed, setFailed] = useState(false);
  const { resolve } = useCmsMediaUrl();
  const v = videoUrl.trim();
  if (!v) return null;

  const embedUrl = resolveLiveStreamEmbedUrl(v);
  const resolvedPoster = posterUrl ? resolve(posterUrl) : undefined;
  const resolvedVideo = embedUrl ? v : resolve(v);

  if (embedUrl) {
    return (
      <div className={className}>
        <iframe
          src={buildEmbedPlaybackSrc(embedUrl, false)}
          title={alt || "Video"}
          className="w-full max-w-full aspect-video max-h-full border-0 bg-black z-[1]"
          allow={EMBED_IFRAME_ALLOW}
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  if (failed) {
    if (resolvedPoster) {
      return (
        <div className={className}>
          <img
            src={resolvedPoster}
            alt={alt}
            className="max-w-full max-h-full w-auto h-auto object-contain bg-gray-100"
          />
        </div>
      );
    }
    return (
      <div
        className={`${className} text-gray-400 text-xs`}
      />
    );
  }

  return (
    <div className={className}>
      <video
        src={resolvedVideo}
        poster={resolvedPoster || undefined}
        controls
        playsInline
        preload="metadata"
        className="max-w-full max-h-full w-auto h-auto object-contain bg-black"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
