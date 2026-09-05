"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MonitorRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard?tab=satellite");
  }, [router]);
  return null;
}
