export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubEvent {
  type: string;
  created_at: string;
  repo: {
    name: string;
  };
}

export interface LanguageStats {
  [language: string]: number;
}

export interface GitHubProfileData {
  user: GitHubUser;
  repos: GitHubRepo[];
  events: GitHubEvent[];
  languageStats: LanguageStats;
  topLanguages: string[];
  totalStars: number;
}
