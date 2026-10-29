import { useEffect, useRef, useState } from "react";
import { chatService } from "../../../services/ChatProxyService";

export type CommunityRoleMode = "farmer" | "distributor";

const ROLE_SWITCH_DEBOUNCE_MS = 200;

/**
 * Smooth farmer ↔ distributor shell swap: leave chat resources, debounce, then mount new shell.
 * chatReady gates heavy hooks until profile role is stable for one frame.
 */
export function useCommunityRoleTransition(
  targetMode: CommunityRoleMode,
  enabled: boolean,
  userId: string | null,
): {
  displayMode: CommunityRoleMode;
  transitioning: boolean;
  chatReady: boolean;
} {
  const [displayMode, setDisplayMode] = useState(targetMode);
  const [transitioning, setTransitioning] = useState(false);
  /** 同角色首屏直接可渲染，避免切 Tab 时空一帧 */
  const [chatReady, setChatReady] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayModeRef = useRef(targetMode);
  const enabledRef = useRef(enabled);
  const prevUserIdRef = useRef<string | null>(userId);
  enabledRef.current = enabled;

  useEffect(() => {
    displayModeRef.current = displayMode;
  }, [displayMode]);

  useEffect(() => {
    if (prevUserIdRef.current === userId) return;
    prevUserIdRef.current = userId;
    setDisplayMode(targetMode);
    displayModeRef.current = targetMode;
    setTransitioning(false);
    setChatReady(false);
  }, [userId, targetMode]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!enabled) {
      setChatReady(false);
      setTransitioning(false);
      setDisplayMode(targetMode);
      displayModeRef.current = targetMode;
      return;
    }

    if (targetMode === displayModeRef.current) {
      setTransitioning(false);
      setChatReady(true);
      return;
    }

    setTransitioning(true);
    setChatReady(false);
    chatService.leaveChannel();

    timerRef.current = setTimeout(() => {
      void chatService.waitForChannelSwitch().then(() => {
        if (!enabledRef.current) return;
        setDisplayMode(targetMode);
        displayModeRef.current = targetMode;
        setTransitioning(false);
        requestAnimationFrame(() => setChatReady(true));
      });
      timerRef.current = null;
    }, ROLE_SWITCH_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [targetMode, enabled]);

  return {
    displayMode,
    transitioning,
    chatReady: enabled && chatReady && !transitioning,
  };
}
