import { redirect } from "next/navigation";

export default function ProfitAndLossPage() {
  // Keep old bookmarks working while the only report UI lives at /reports.
  redirect("/reports");
}
