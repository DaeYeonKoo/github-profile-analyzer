import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubProfile, GitHubApiError } from "@/lib/github";
import { analyzeGitHubProfile, ClaudeAnalysisError } from "@/lib/claude";
import type { AnalyzeRequestBody, AnalyzeResponseBody, ApiErrorResponse } from "@/types";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<AnalyzeResponseBody | ApiErrorResponse>> {
  try {
    const body = (await request.json()) as Partial<AnalyzeRequestBody>;
    const username = body.username?.trim();

    if (!username) {
      return NextResponse.json({ error: "GitHub 사용자명을 입력해주세요." }, { status: 400 });
    }

    const profile = await fetchGitHubProfile(username);
    const analysis = await analyzeGitHubProfile(profile);

    return NextResponse.json({ profile, analysis });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof ClaudeAnalysisError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    console.error("Unexpected error in /api/analyze:", error);
    return NextResponse.json(
      { error: "예기치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }
}
