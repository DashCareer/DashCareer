import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div><strong><span className="footer-brand-mark">D</span> DashCareer</strong><span>Original A-Level revision, organised around you.</span></div>
      <nav aria-label="Help and legal"><Link href="/subjects">Subjects</Link><Link href="/tutor">DashAI</Link><Link href="/community">Community</Link><Link href="/faq">Help & FAQ</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link></nav>
      <p>Past papers remain on official exam-board websites. Check all learning content against your specification.</p>
    </footer>
  );
}
