"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AnalysisDisplay from "@/components/AnalysisDisplay";
import Header from "@/components/Header";
import { LogoIcon } from "@/components/Icons";
import { useAuth } from "@/context/AuthContext";
import type { StoredAnalysis } from "@/types";

export default function AnalysisPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<StoredAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    const stored = sessionStorage.getItem("currentAnalysis");
    if (stored) {
      try {
        setAnalysis(JSON.parse(stored));
      } catch {
        router.replace("/dashboard");
      }
    } else {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user || !analysis) return null;

  return (
    <div className="min-h-screen font-sans">
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-7xl">
        <AnalysisDisplay
          analysisResult={analysis.analysisResult}
          documentText={analysis.documentText}
          onError={setError}
          onBackToDashboard={() => router.push("/dashboard")}
        />
      </main>
      <footer className="text-center py-8 text-sm text-gray-500">
        <div className="flex items-center justify-center space-x-2">
          <LogoIcon className="h-6 w-6 text-indigo-500" />
          <p>UnBind: AI Legal Contract Analyzer</p>
        </div>
      </footer>
    </div>
  );
}
