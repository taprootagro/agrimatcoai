import { useCallback, useMemo } from "react";
import { useHomeConfig } from "./useHomeConfig";
import { resolveMediaUrl, type MediaUrlResolveConfig } from "../utils/resolveMediaUrl";

/**
 * Resolve CMS storage paths to display URLs.
 * Pass `override` from Content Manager `workingConfig` so previews match unsaved CDN/Supabase settings.
 */
export function useCmsMediaUrl(override?: MediaUrlResolveConfig | null) {
  const { config } = useHomeConfig();
  const mediaConfig: MediaUrlResolveConfig = useMemo(() => {
    if (override) {
      return {
        mediaCdnBaseUrl: override.mediaCdnBaseUrl,
        supabaseUrl: override.supabaseUrl,
      };
    }
    return {
      mediaCdnBaseUrl: config?.backendProxyConfig?.mediaCdnBaseUrl,
      supabaseUrl: config?.backendProxyConfig?.supabaseUrl,
    };
  }, [
    override?.mediaCdnBaseUrl,
    override?.supabaseUrl,
    config?.backendProxyConfig?.mediaCdnBaseUrl,
    config?.backendProxyConfig?.supabaseUrl,
  ]);

  const resolve = useCallback(
    (value: string | null | undefined) => resolveMediaUrl(value, mediaConfig),
    [mediaConfig.mediaCdnBaseUrl, mediaConfig.supabaseUrl],
  );

  return { resolve, mediaConfig };
}
