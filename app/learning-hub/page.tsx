import type { Metadata } from "next";
import { requireUser } from "@/app/auth-session";
import { listDiagnostics, listErrorLog, listTopicMastery } from "@/db/queries";
import { LearningHub } from "@/components/learning-hub";

export const metadata: Metadata = { title: "Learning hub" };
export const dynamic = "force-dynamic";

export default async function LearningHubPage() {
  const user = await requireUser("/learning-hub");
  const [mastery, errors, diagnostics] = await Promise.all([
    listTopicMastery(user.userId).catch(() => []), listErrorLog(user.userId).catch(() => []), listDiagnostics(user.userId).catch(() => []),
  ]);
  return <main className="shell page-space"><LearningHub mastery={mastery} errors={errors} diagnostics={diagnostics} now={new Date().toISOString()} /></main>;
}
