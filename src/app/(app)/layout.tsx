"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/hooks/useApp";
import { Spinner } from "@/components/ui/Bits";
import { AppShell } from "@/components/layout/AppShell";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { session, authReady, couple, coupleReady } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!authReady) return;
    if (!session) router.replace("/");
    else if (coupleReady && !couple) router.replace("/pareja");
  }, [authReady, session, coupleReady, couple, router]);

  if (!authReady || !coupleReady || !session || !couple) return <div className="min-h-dvh"><Spinner /></div>;
  return <AppShell>{children}</AppShell>;
}
