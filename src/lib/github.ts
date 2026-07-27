import type {
  GitHubEvent,
  GitHubProfileData,
  GitHubRepo,
  GitHubUser,
  LanguageStats,
} from "@/types";

const GITHUB_API_BASE = "https://api.github.com";
const MAX_REPOS_FOR_ANALYSIS = 100;
const MAX_EVENTS_FOR_ANALYSIS = 100;
const TOP_LANGUAGES_LIMIT = 5;

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

function buildHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function githubFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    headers: buildHeaders(),
    next: { revalidate: 300 },
  });

  if (response.status === 404) {
    throw new GitHubApiError("존재하지 않는 GitHub 사용자입니다.", 404);
  }

  if (response.status === 403) {
    throw new GitHubApiError(
      "GitHub API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
      403,
    );
  }

  if (!response.ok) {
    throw new GitHubApiError(
      `GitHub API 요청에 실패했습니다. (status: ${response.status})`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

function calculateLanguageStats(repos: GitHubRepo[]): LanguageStats {
  const stats: LanguageStats = {};
  for (const repo of repos) {
    if (!repo.language || repo.fork) continue;
    stats[repo.language] = (stats[repo.language] ?? 0) + 1;
  }
  return stats;
}

function computeTopLanguages(stats: LanguageStats, limit = TOP_LANGUAGES_LIMIT): string[] {
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([language]) => language);
}

async function fetchRecentEventsSafely(username: string): Promise<GitHubEvent[]> {
  try {
    return await githubFetch<GitHubEvent[]>(
      `/users/${encodeURIComponent(username)}/events/public?per_page=${MAX_EVENTS_FOR_ANALYSIS}`,
    );
  } catch {
    // 최근 활동 조회는 부가 정보이므로 실패해도 전체 분석을 막지 않는다.
    return [];
  }
}

export async function fetchGitHubProfile(username: string): Promise<GitHubProfileData> {
  const trimmedUsername = username.trim();
  if (!trimmedUsername) {
    throw new GitHubApiError("GitHub 사용자명을 입력해주세요.", 400);
  }

  const [user, repos, events] = await Promise.all([
    githubFetch<GitHubUser>(`/users/${encodeURIComponent(trimmedUsername)}`),
    githubFetch<GitHubRepo[]>(
      `/users/${encodeURIComponent(trimmedUsername)}/repos?per_page=${MAX_REPOS_FOR_ANALYSIS}&sort=updated`,
    ),
    fetchRecentEventsSafely(trimmedUsername),
  ]);

  const languageStats = calculateLanguageStats(repos);
  const topLanguages = computeTopLanguages(languageStats);
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

  return { user, repos, events, languageStats, topLanguages, totalStars };
}
