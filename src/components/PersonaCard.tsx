import Image from "next/image";
import type { AnalyzeResponseBody } from "@/types";
import StatBar from "./StatBar";
import Badge from "./Badge";

interface PersonaCardProps {
  result: AnalyzeResponseBody;
}

const STAT_LABELS: Record<keyof AnalyzeResponseBody["analysis"]["stats"], string> = {
  consistency: "꾸준함",
  diversity: "다양성",
  impact: "영향력",
  collaboration: "협업",
};

export default function PersonaCard({ result }: PersonaCardProps) {
  const { profile, analysis } = result;
  const { user, totalStars, topLanguages } = profile;

  const quickStats = [
    { label: "Repositories", value: user.public_repos },
    { label: "Followers", value: user.followers },
    { label: "Following", value: user.following },
    { label: "Total Stars", value: totalStars },
  ];

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-500 opacity-40 blur transition duration-500 group-hover:opacity-70" />

      <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Image
            src={user.avatar_url}
            alt={`${user.login} avatar`}
            width={72}
            height={72}
            className="rounded-full ring-2 ring-purple-500/50"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-400">
              {analysis.persona}
            </p>
            <h2 className="truncate text-xl font-bold text-slate-100">
              {user.name ?? user.login}
            </h2>
            <a
              href={user.html_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-cyan-400 hover:underline"
            >
              @{user.login}
            </a>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-300">{analysis.summary}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {quickStats.map((stat) => (
            <div key={stat.label} className="rounded-lg bg-slate-900 p-3 text-center">
              <dt className="text-xs text-slate-500">{stat.label}</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-100">
                {stat.value.toLocaleString()}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 space-y-3">
          {(Object.keys(STAT_LABELS) as Array<keyof typeof STAT_LABELS>).map((key) => (
            <StatBar key={key} label={STAT_LABELS[key]} value={analysis.stats[key]} />
          ))}
        </div>

        {topLanguages.length > 0 && (
          <section className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              주요 언어
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {topLanguages.map((language) => (
                <Badge key={language} label={language} tone="cyan" />
              ))}
            </div>
          </section>
        )}

        {analysis.badges.length > 0 && (
          <section className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">뱃지</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {analysis.badges.map((badge) => (
                <Badge key={badge} label={`🏅 ${badge}`} />
              ))}
            </div>
          </section>
        )}

        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-slate-400 hover:text-slate-200">
            상세 분석 더보기
          </summary>
          <div className="mt-4 space-y-4 text-sm text-slate-300">
            <section>
              <h4 className="font-semibold text-slate-100">기여 패턴</h4>
              <p className="mt-1 leading-relaxed">{analysis.contributionPattern}</p>
            </section>
            <section>
              <h4 className="font-semibold text-slate-100">강점</h4>
              <ul className="mt-1 list-inside list-disc space-y-1">
                {analysis.strengths.map((strength) => (
                  <li key={strength}>{strength}</li>
                ))}
              </ul>
            </section>
            <section>
              <h4 className="font-semibold text-slate-100">성장 제안</h4>
              <ul className="mt-1 list-inside list-disc space-y-1">
                {analysis.recommendations.map((recommendation) => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
            </section>
          </div>
        </details>
      </div>
    </div>
  );
}
