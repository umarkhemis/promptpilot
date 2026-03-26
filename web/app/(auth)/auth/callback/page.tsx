
"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Loader2 } from "lucide-react";


function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken } = useStore();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      setToken(token);
      router.replace("/dashboard");
    } else {
      router.replace("/login?error=google_failed");
    }
  }, [searchParams, setToken, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      <p className="text-sm text-slate-500">Signing you in with Google…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-sm text-slate-500">Signing you in with Google…</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}







