import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "GitHub Profile Analyzer",
  description: "GitHub 유저명을 입력하면 AI가 기여 패턴, 기술 스택, 개발자 페르소나를 분석합니다.",
  openGraph: {
    title: "GitHub Profile Analyzer",
    description: "GitHub 유저명을 입력하면 AI가 기여 패턴, 기술 스택, 개발자 페르소나를 분석합니다.",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
