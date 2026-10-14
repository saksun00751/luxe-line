"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Liff } from "@line/liff";
import { site } from "@/config/site";

type LiffState = {
  ready: boolean;
  enabled: boolean; // ตั้งค่า NEXT_PUBLIC_LIFF_ID แล้วหรือยัง
  inClient: boolean; // เปิดอยู่ในแอป LINE
  loggedIn: boolean;
  profile: { userId: string; displayName: string; pictureUrl?: string } | null;
  idToken: string | null;
  error: string | null;
  liff: Liff | null;
  login: () => void;
  close: () => void;
};

const initial: LiffState = {
  ready: false, enabled: !!site.liffId, inClient: false, loggedIn: false, profile: null, idToken: null, error: null, liff: null,
  login: () => {}, close: () => { window.location.href = site.lineOaUrl; },
};
const Ctx = createContext<LiffState>(initial);

export function LiffProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LiffState>(initial);

  useEffect(() => {
    if (!site.liffId) {
      setState((s) => ({ ...s, ready: true }));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const liff = (await import("@line/liff")).default;
        await liff.init({ liffId: site.liffId });
        const loggedIn = liff.isLoggedIn();
        const profile = loggedIn ? await liff.getProfile().catch(() => null) : null;
        if (cancelled) return;
        setState({
          ready: true,
          enabled: true,
          inClient: liff.isInClient(),
          loggedIn,
          profile: profile ? { userId: profile.userId, displayName: profile.displayName, pictureUrl: profile.pictureUrl } : null,
          idToken: loggedIn ? liff.getIDToken() : null,
          error: null,
          liff,
          login: () => liff.login({ redirectUri: window.location.href }),
          close: () => (liff.isInClient() ? liff.closeWindow() : (window.location.href = site.lineOaUrl)),
        });
      } catch (e) {
        if (!cancelled) setState((s) => ({ ...s, ready: true, error: e instanceof Error ? e.message : "LIFF init failed" }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useLiff = () => useContext(Ctx);
