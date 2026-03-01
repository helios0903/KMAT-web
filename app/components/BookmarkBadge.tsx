import { BookmarkType } from "../types";

const ICONS: Record<BookmarkType, string> = {
  star: "⭐",
  question: "❓",
  pin: "📌",
};

export default function BookmarkBadge({ type }: { type: BookmarkType }) {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 text-xs" title={type}>
      {ICONS[type]}
    </span>
  );
}
