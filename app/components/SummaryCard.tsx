export default function SummaryCard({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <h3 className="text-sm font-medium text-[var(--muted)] mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-base leading-relaxed flex gap-2" style={{ opacity: 0.8 }}>
            <span className="select-none" style={{ opacity: 0.3 }}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
