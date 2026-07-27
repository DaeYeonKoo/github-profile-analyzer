import type { Metadata } from "next";
import AnalyzerForm from "@/components/AnalyzerForm";

interface HomeProps {
  searchParams: { user?: string };
}

export function generateMetadata({ searchParams }: HomeProps): Metadata {
  const { user } = searchParams;

  if (!user) {
    return {};
  }

  const title = `${user}님의 GitHub 페르소나 분석 - GitHub Profile Analyzer`;
  const description = `AI가 분석한 @${user}의 기여 패턴, 기술 스택, 개발자 페르소나를 확인해보세요.`;
  const ogImageUrl = `/api/og?user=${encodeURIComponent(user)}`;

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: ogImageUrl, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImageUrl] },
  };
}

export default function Home({ searchParams }: HomeProps) {
  const { user } = searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-16 sm:py-24">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">
          GitHub Profile Analyzer
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
          GitHub 사용자명을 입력하면 AI가 기여 패턴, 기술 스택, 개발자 페르소나를 분석해드립니다.
        </p>
      </div>

      <div className="mt-10 flex w-full justify-center">
        <AnalyzerForm initialUsername={user} />
      </div>
    </main>
  );
}
