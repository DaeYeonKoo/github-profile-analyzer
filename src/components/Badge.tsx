interface BadgeProps {
  label: string;
  tone?: "purple" | "cyan";
}

export default function Badge({ label, tone = "purple" }: BadgeProps) {
  const toneClasses =
    tone === "cyan"
      ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
      : "border-purple-500/40 bg-purple-500/10 text-purple-300";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${toneClasses}`}>
      {label}
    </span>
  );
}
