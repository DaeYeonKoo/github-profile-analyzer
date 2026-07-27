import Anthropic from "@anthropic-ai/sdk";
import type { DeveloperAnalysis, GitHubProfileData } from "@/types";

const MODEL = "claude-opus-5";
const MAX_REPOS_IN_PROMPT = 30;

export class ClaudeAnalysisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaudeAnalysisError";
  }
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ClaudeAnalysisError(
      "ANTHROPIC_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인해주세요.",
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    persona: {
      type: "string",
      description: "개발자 페르소나를 나타내는 한 줄 타이틀 (예: '오픈소스 수호자', '야행성 버그 헌터')",
    },
    summary: {
      type: "string",
      description: "개발자 프로필에 대한 2~3문장 요약 (한국어)",
    },
    stats: {
      type: "object",
      properties: {
        consistency: {
          type: "integer",
          description:
            "최근 활동(recent_activity)의 빈도와 최신성 기반 꾸준함 점수 0-100. 활동이 거의 없으면 낮게, 최근까지 지속적으로 활동했으면 높게.",
        },
        diversity: {
          type: "integer",
          description:
            "language_distribution과 top_repositories의 topics 다양성 기반 기술 다양성 점수 0-100.",
        },
        impact: {
          type: "integer",
          description:
            "total_stars_received, followers, 레포별 stars 기반 영향력 점수 0-100.",
        },
        collaboration: {
          type: "integer",
          description:
            "recent_activity의 PullRequestEvent/IssuesEvent/IssueCommentEvent 비중 기반 협업 활동 점수 0-100. 관련 이벤트가 없으면 낮게 평가.",
        },
      },
      required: ["consistency", "diversity", "impact", "collaboration"],
      additionalProperties: false,
    },
    badges: {
      type: "array",
      items: { type: "string" },
      description: "데이터로 뒷받침되는 짧은 뱃지/업적 라벨 목록 (2~4개, 예: '야간 코딩러', 'PR 리뷰어')",
    },
    contributionPattern: {
      type: "string",
      description: "기여 패턴 및 활동성에 대한 설명 (한국어)",
    },
    strengths: {
      type: "array",
      items: { type: "string" },
      description: "이 개발자의 강점 목록 (최대 5개)",
    },
    recommendations: {
      type: "array",
      items: { type: "string" },
      description: "성장을 위한 제안 목록 (최대 4개)",
    },
  },
  required: [
    "persona",
    "summary",
    "stats",
    "badges",
    "contributionPattern",
    "strengths",
    "recommendations",
  ],
  additionalProperties: false,
} as const;

function summarizeRecentActivity(events: GitHubProfileData["events"]) {
  const eventTypeCounts: Record<string, number> = {};
  for (const event of events) {
    eventTypeCounts[event.type] = (eventTypeCounts[event.type] ?? 0) + 1;
  }

  return {
    total_recent_events: events.length,
    event_type_counts: eventTypeCounts,
    most_recent_event_at: events[0]?.created_at ?? null,
    oldest_event_in_window_at: events[events.length - 1]?.created_at ?? null,
  };
}

function buildPrompt(profile: GitHubProfileData): string {
  const { user, repos, events, languageStats, topLanguages, totalStars } = profile;

  const topRepos = [...repos]
    .filter((repo) => !repo.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, MAX_REPOS_IN_PROMPT)
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      topics: repo.topics,
      updated_at: repo.updated_at,
    }));

  return JSON.stringify({
    profile: {
      login: user.login,
      name: user.name,
      bio: user.bio,
      company: user.company,
      location: user.location,
      followers: user.followers,
      following: user.following,
      public_repos: user.public_repos,
      account_created_at: user.created_at,
      total_stars_received: totalStars,
    },
    language_distribution: languageStats,
    top_languages: topLanguages,
    top_repositories: topRepos,
    recent_activity: summarizeRecentActivity(events),
  });
}

function toClaudeAnalysisError(error: unknown): ClaudeAnalysisError {
  if (error instanceof Anthropic.AuthenticationError) {
    return new ClaudeAnalysisError(
      "ANTHROPIC_API_KEY가 유효하지 않습니다. 키 값을 다시 확인해주세요.",
    );
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    return new ClaudeAnalysisError("이 API 키로는 해당 모델에 접근할 권한이 없습니다.");
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new ClaudeAnalysisError(
      "Claude API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
    );
  }
  if (error instanceof Anthropic.BadRequestError) {
    const message = error.message ?? "";
    if (message.includes("credit balance")) {
      return new ClaudeAnalysisError(
        "Anthropic 계정의 크레딧 잔액이 부족합니다. console.anthropic.com에서 결제 정보를 확인해주세요.",
      );
    }
    return new ClaudeAnalysisError(`Claude API 요청이 올바르지 않습니다: ${message}`);
  }
  if (error instanceof Anthropic.APIError) {
    return new ClaudeAnalysisError(
      `Claude API 오류가 발생했습니다 (status: ${error.status ?? "unknown"}).`,
    );
  }
  return new ClaudeAnalysisError("AI 분석 중 알 수 없는 오류가 발생했습니다.");
}

export async function analyzeGitHubProfile(
  profile: GitHubProfileData,
): Promise<DeveloperAnalysis> {
  const anthropic = getClient();

  let message;
  try {
    message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system:
        "당신은 GitHub 프로필 데이터를 분석해 개발자의 기여 패턴, 활동 성향, 페르소나를 파악하는 전문 분석가입니다. " +
        "주어진 JSON 데이터만을 근거로 객관적이고 통찰력 있는 분석을 한국어로 작성하세요. " +
        "데이터에 없는 내용은 추측하지 말고, 확인 가능한 사실 위주로 서술하세요. " +
        "stats의 네 항목(consistency, diversity, impact, collaboration)은 각 필드 설명에 명시된 근거 데이터를 기반으로 " +
        "산정하고, 근거가 부족한 항목은 임의로 높게 주지 말고 보수적으로 평가하세요. " +
        "badges는 반드시 실제 데이터로 뒷받침되는 것만 부여하세요.",
      messages: [
        {
          role: "user",
          content: `다음 GitHub 프로필 데이터를 분석해주세요:\n\n${buildPrompt(profile)}`,
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: ANALYSIS_SCHEMA,
        },
      },
    });
  } catch (error) {
    if (error instanceof ClaudeAnalysisError) throw error;
    throw toClaudeAnalysisError(error);
  }

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new ClaudeAnalysisError("AI 분석 결과를 생성하지 못했습니다.");
  }

  try {
    return JSON.parse(textBlock.text) as DeveloperAnalysis;
  } catch {
    throw new ClaudeAnalysisError("AI 분석 결과를 파싱하는 중 오류가 발생했습니다.");
  }
}
