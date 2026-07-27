import { ImageResponse } from "next/og";
import { fetchGitHubProfile, GitHubApiError } from "@/lib/github";

export const runtime = "edge";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const FONT_FAMILY = "Noto Sans KR";

async function loadKoreanFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const cssResponse = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(text)}`,
    );
    if (!cssResponse.ok) return null;

    const css = await cssResponse.text();
    const fontUrl = css.match(/src: url\(([^)]+)\)/)?.[1];
    if (!fontUrl) return null;

    const fontResponse = await fetch(fontUrl);
    if (!fontResponse.ok) return null;

    return await fontResponse.arrayBuffer();
  } catch {
    // 폰트 로딩 실패는 이미지 생성 자체를 막지 않는다 (기본 폰트로 대체).
    return null;
  }
}

function GenericBrandCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        color: "white",
      }}
    >
      <div style={{ fontSize: 56, fontWeight: 700 }}>GitHub Profile Analyzer</div>
      <div style={{ marginTop: 16, fontSize: 24, color: "#a5b4fc" }}>
        AI가 분석하는 나의 GitHub 개발자 페르소나
      </div>
    </div>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("user")?.trim();

  if (!username) {
    return new ImageResponse(<GenericBrandCard />, { width: OG_WIDTH, height: OG_HEIGHT });
  }

  try {
    const profile = await fetchGitHubProfile(username);
    const { user, totalStars, topLanguages } = profile;
    const displayName = user.name ?? user.login;

    const quickStats = [
      { label: "Repos", value: user.public_repos },
      { label: "Followers", value: user.followers },
      { label: "Stars", value: totalStars },
    ];

    // 이미지에 실제로 렌더링되는 모든 텍스트를 모아 폰트 서브셋 요청에 사용한다.
    // 일부 문자만 요청하면 나머지 글자가 폴백 폰트로 렌더링되어 굵기가 뒤섞여 보인다.
    const visibleText = [
      displayName,
      `@${user.login}`,
      ...quickStats.flatMap((stat) => [stat.value.toLocaleString(), stat.label]),
      ...topLanguages,
      "GitHub Profile Analyzer",
    ].join(" ");
    const fontData = await loadKoreanFont(visibleText);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: 64,
            background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
            color: "white",
            fontFamily: fontData ? FONT_FAMILY : "sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar_url}
              width={110}
              height={110}
              style={{ borderRadius: "50%", border: "3px solid rgba(167,139,250,0.6)" }}
              alt=""
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 44, fontWeight: 700 }}>{displayName}</div>
              <div style={{ fontSize: 24, color: "#a5b4fc" }}>{`@${user.login}`}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, marginTop: 48 }}>
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  padding: "18px 28px",
                }}
              >
                <div style={{ fontSize: 34, fontWeight: 700 }}>{stat.value.toLocaleString()}</div>
                <div style={{ fontSize: 16, color: "#cbd5e1" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {topLanguages.length > 0 && (
            <div style={{ display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap" }}>
              {topLanguages.map((language) => (
                <div
                  key={language}
                  style={{
                    fontSize: 20,
                    padding: "10px 24px",
                    borderRadius: 999,
                    background: "rgba(6,182,212,0.18)",
                    border: "1px solid rgba(6,182,212,0.5)",
                    color: "#67e8f9",
                  }}
                >
                  {language}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", marginTop: "auto", fontSize: 22, color: "#94a3b8" }}>
            GitHub Profile Analyzer
          </div>
        </div>
      ),
      {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        fonts: fontData ? [{ name: FONT_FAMILY, data: fontData, weight: 700 }] : undefined,
      },
    );
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return new ImageResponse(<GenericBrandCard />, {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        status: error.status,
      });
    }
    return new ImageResponse(<GenericBrandCard />, {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      status: 500,
    });
  }
}
