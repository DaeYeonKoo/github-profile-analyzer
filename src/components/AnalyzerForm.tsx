"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { AnalyzeResponseBody, ApiErrorResponse } from "@/types";
import PersonaCard from "./PersonaCard";
import SkeletonCard from "./SkeletonCard";

type Status = "idle" | "loading" | "success" | "error";

interface AnalyzerFormProps {
  initialUsername?: string;
}

export default function AnalyzerForm({ initialUsername }: AnalyzerFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<AnalyzeResponseBody | null>(null);
  const [copyLabel, setCopyLabel] = useState("결과 링크 복사");
  const hasAutoRun = useRef(false);

  const runAnalysis = useCallback(
    async (targetUsername: string) => {
      const trimmedUsername = targetUsername.trim();
      if (!trimmedUsername) {
        setStatus("error");
        setErrorMessage("GitHub 사용자명을 입력해주세요.");
        return;
      }

      setStatus("loading");
      setErrorMessage("");
      setResult(null);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: trimmedUsername }),
        });

        const data = (await response.json()) as AnalyzeResponseBody | ApiErrorResponse;

        if (!response.ok) {
          throw new Error((data as ApiErrorResponse).error ?? "분석에 실패했습니다.");
        }

        setResult(data as AnalyzeResponseBody);
        setStatus("success");
        router.replace(`/?user=${encodeURIComponent(trimmedUsername)}`, { scroll: false });
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "예기치 못한 오류가 발생했습니다.",
        );
      }
    },
    [router],
  );

  useEffect(() => {
    if (hasAutoRun.current || !initialUsername) return;
    hasAutoRun.current = true;
    void runAnalysis(initialUsername);
  }, [initialUsername, runAnalysis]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runAnalysis(username);
  }

  async function handleCopyShareLink() {
    if (!result) return;
    const shareUrl = `${window.location.origin}/?user=${encodeURIComponent(result.profile.user.login)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyLabel("링크 복사됨!");
    } catch {
      setCopyLabel("복사 실패");
    } finally {
      setTimeout(() => setCopyLabel("결과 링크 복사"), 2000);
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="GitHub 사용자명을 입력하세요 (예: octocat)"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "분석 중..." : "분석하기"}
        </button>
      </form>

      {status === "error" && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {errorMessage}
        </p>
      )}

      {status === "loading" && (
        <div className="mt-6">
          <p className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">
            GitHub 프로필을 가져오고 AI가 분석하는 중입니다...
          </p>
          <SkeletonCard />
        </div>
      )}

      {status === "success" && result && (
        <div className="mt-6 space-y-4">
          <PersonaCard result={result} />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {copyLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
