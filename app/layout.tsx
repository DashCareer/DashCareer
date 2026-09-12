import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeBoot } from "@/components/theme-boot";
import { StudyTimerProvider } from "@/components/study-timer-provider";
import { getCurrentUser } from "@/app/auth-session";
import { AmbientEffects } from "@/components/ambient-effects";
import { CommunityPresenceProvider } from "@/components/community-presence-provider";
import { BreadcrumbTrail } from "@/components/navigation-tools";
import { listApprovedCommunityPosts } from "@/db/queries";
import { StudyRoomMode } from "@/components/study-room-mode";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: { default: "DashCareer — A-Level revision that moves", template: "%s | DashCareer" },
  description: "Original A-Level revision notes, practice questions, progress tracking and official past-paper links.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const communityPosts = user ? await listApprovedCommunityPosts().catch(() => []) : [];
  return (
    <html lang="en">
      <body className="antialiased"><ThemeBoot /><PwaRegister /><AnalyticsTracker signedIn={Boolean(user)} /><AmbientEffects /><StudyTimerProvider signedIn={Boolean(user)}><CommunityPresenceProvider signedIn={Boolean(user)} currentUserName={user?.displayName ?? ""} initialPosts={communityPosts}><SiteHeader /><BreadcrumbTrail />{children}<StudyRoomMode /><SiteFooter /></CommunityPresenceProvider></StudyTimerProvider></body>
    </html>
  );
}
