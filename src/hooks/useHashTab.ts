"use client";
import { useCallback, useEffect, useState } from "react";

/** Pestaña activa guardada en el #hash de la URL (así el botón "atrás" y los links funcionan). */
export function useHashTab(valid: string[], fallback: string) {
  const [tab, setTabState] = useState(fallback);
  useEffect(() => {
    const read = () => {
      const h = window.location.hash.slice(1);
      setTabState(valid.includes(h) ? h : fallback);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const setTab = useCallback((t: string) => {
    setTabState(t);
    history.replaceState(null, "", `#${t}`);
  }, []);
  return [tab, setTab] as const;
}
