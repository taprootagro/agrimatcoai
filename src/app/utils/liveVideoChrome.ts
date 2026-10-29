import {
  applyLiveVideoSystemChrome,
  applyNativeSystemChrome,
  isNative,
} from "./capacitor-bridge";

const DEFAULT_PWA_THEME = "#059669";

/**
 * 首页进入 VideoFeedPage 时调用：PWA 顶/底安全区与 meta theme-color 改为黑色；
 * Capacitor 同步系统栏图标样式。返回 cleanup，在离开直播页时执行。
 */
export function mountLiveVideoChrome(): () => void {
  document.documentElement.setAttribute("data-live-video", "");

  const meta = document.querySelector('meta[name="theme-color"]');
  const prevTheme = meta?.getAttribute("content") ?? DEFAULT_PWA_THEME;
  meta?.setAttribute("content", "#000000");

  if (isNative()) {
    void applyLiveVideoSystemChrome();
  }

  return () => {
    document.documentElement.removeAttribute("data-live-video");
    meta?.setAttribute("content", prevTheme);
    if (isNative()) {
      void applyNativeSystemChrome();
    }
  };
}

/** App 从后台回到前台且仍在直播页时，恢复黑色系统栏 */
export function reapplyLiveVideoChromeIfActive(): void {
  if (!document.documentElement.hasAttribute("data-live-video")) return;
  if (isNative()) {
    void applyLiveVideoSystemChrome();
  }
}
