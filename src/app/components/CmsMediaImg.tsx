import { createContext, useContext, type ImgHTMLAttributes, type ReactNode } from "react";
import { useCmsMediaUrl } from "../hooks/useCmsMediaUrl";
import type { MediaUrlResolveConfig } from "../utils/resolveMediaUrl";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
};

export type CmsMediaDisplayContextValue = {
  mediaConfig?: MediaUrlResolveConfig;
  /** Content Manager previews: eager load + remount on URL change */
  eager?: boolean;
};

export const CmsMediaDisplayContext = createContext<CmsMediaDisplayContextValue | null>(null);

export function CmsMediaDisplayProvider({
  value,
  children,
}: {
  value: CmsMediaDisplayContextValue;
  children: ReactNode;
}) {
  return (
    <CmsMediaDisplayContext.Provider value={value}>{children}</CmsMediaDisplayContext.Provider>
  );
}

/** img with CMS media URL resolution (CDN or Supabase fallback). Lazy by default; pass loading="eager" above the fold. */
export function CmsMediaImg({ src, loading = "lazy", ...rest }: Props) {
  const displayCtx = useContext(CmsMediaDisplayContext);
  const { resolve } = useCmsMediaUrl(displayCtx?.mediaConfig);
  const resolved = resolve(src);
  const effectiveLoading = displayCtx?.eager ? "eager" : loading;

  return (
    <img
      key={displayCtx?.eager ? resolved || src : undefined}
      src={resolved}
      loading={effectiveLoading}
      {...rest}
    />
  );
}
