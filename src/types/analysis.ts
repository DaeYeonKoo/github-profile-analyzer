export interface DeveloperStats {
  consistency: number;
  diversity: number;
  impact: number;
  collaboration: number;
}

export interface DeveloperAnalysis {
  persona: string;
  summary: string;
  stats: DeveloperStats;
  badges: string[];
  contributionPattern: string;
  strengths: string[];
  recommendations: string[];
}

export interface AnalyzeRequestBody {
  username: string;
}

export interface AnalyzeResponseBody {
  profile: import("./github").GitHubProfileData;
  analysis: DeveloperAnalysis;
}

export interface ApiErrorResponse {
  error: string;
}
