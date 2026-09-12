import type { Metadata } from "next";
import { requireUser } from "@/app/auth-session";
import { listApprovedCommunityPosts } from "@/db/queries";
import { CommunityHub } from "@/components/community-hub";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Community", description: "Join private study rooms and share moderated A-Level revision notes.", robots: { index: false, follow: false } };
export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireUser("/community");
  const [{ status }, posts] = await Promise.all([searchParams, listApprovedCommunityPosts().catch(() => [])]);
  return <main className="shell page-space"><div className="page-intro"><p className="eyebrow">Community</p><h1>Study alongside others.</h1><p>Quiet rooms, moderated peer notes and subject discussions—with privacy built in.</p></div>{status === "submitted" && <div className="notice success">Your contribution is saved and waiting for moderation.</div>}{status === "invalid" && <div className="notice error">Keep posts study-focused and remove links, contact details or long numbers.</div>}<CommunityHub posts={posts} /></main>;
}
