import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { signInPath, signOutPath, getCurrentUser } from "@/app/auth-session";
import { NavigationTools } from "@/components/navigation-tools";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="DashCareer home">
        <span className="brand-mark">D</span><span>DashCareer</span>
      </Link>
      <NavigationTools />
      {user ? (
        <a className="account-link" href={signOutPath("/")} target="_top"><LogOut size={16} /> Sign out</a>
      ) : (
        <a className="account-link" href={signInPath("/dashboard")} target="_top"><LogIn size={16} /> Sign in</a>
      )}
    </header>
  );
}
