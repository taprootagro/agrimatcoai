import { useMemo } from "react";
import { useConfigContext } from "./ConfigProvider";
import { useAuthFlag } from "./useAuthFlag";
import { normalizeCountryIso } from "../utils/profileCountry";

/** Logged-in user's profile country (ISO-2); empty when logged out or unset. */
export function useEffectiveCountry(): string {
  const loggedIn = useAuthFlag();
  const { config } = useConfigContext();
  return useMemo(() => {
    if (!loggedIn) return "";
    return normalizeCountryIso(config?.userProfile?.country ?? "");
  }, [loggedIn, config?.userProfile?.country]);
}
