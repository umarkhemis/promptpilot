"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
