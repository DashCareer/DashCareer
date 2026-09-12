"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, BrainCircuit, ChevronRight, CircleHelp, Clock3, GraduationCap, LayoutDashboard, Map, Menu, Moon, Rocket, Search, ShieldCheck, Sparkles, Star, Sun, Users } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { subjects } from "@/lib/subjects";
import { useEffect, useState, useSyncExternalStore } from "react";

const primary = [
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learning-hub", label: "Learning hub", icon: GraduationCap },
  { href: "/tutor", label: "DashAI", icon: BrainCircuit },
  { href: "/community", label: "Community", icon: Users },
];

const more = [
  { href: "/coverage", label: "Exam-board coverage", icon: Map },
  { href: "/study-tools", label: "Study tools", icon: Clock3 },
  { href: "/faq", label: "Help & FAQ", icon: CircleHelp },
  { href: "/reviews", label: "Student reviews", icon: Star },
  { href: "/pricing", label: "Upgrade to Pro", icon: Sparkles },
  { href: "/launch", label: "Launch readiness", icon: Rocket },
  { href: "/admin", label: "Owner overview", icon: ShieldCheck },
];

function subscribeTheme(callback: () => void) { window.addEventListener("storage", callback); window.addEventListener("dashcareer-theme", callback); return () => { window.removeEventListener("storage", callback); window.removeEventListener("dashcareer-theme", callback); }; }
function themeSnapshot() { return localStorage.getItem("dashcareer-theme") || "light"; }

export function NavigationTools() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const theme = useSyncExternalStore(subscribeTheme, themeSnapshot, () => "light");
  const dark = theme === "dark" || theme === "midnight";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function toggleTheme() {
    const next = dark ? "light" : "dark";
    localStorage.setItem("dashcareer-theme", next);
    window.dispatchEvent(new Event("dashcareer-theme"));
  }

  function go(href: string) { setSearchOpen(false); router.push(href); }

  return <>
    <nav className="main-nav" aria-label="Main navigation">
      {primary.map(({ href, label, icon: Icon }) => <Link className={pathname.startsWith(href) ? "active" : ""} href={href} key={href}><Icon size={16} /> {label}</Link>)}
      <Link href="/pricing" className="nav-price"><Sparkles size={15} /> Go Pro</Link>
    </nav>
    <div className="nav-actions">
      <button className="global-search-trigger" type="button" onClick={() => setSearchOpen(true)}><Search size={17} /><span>Search</span><kbd>⌘K</kbd></button>
      <button className="header-theme-toggle" type="button" onClick={toggleTheme} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>{dark ? <Sun size={19} /> : <Moon size={19} />}</button>
      <Sheet>
        <SheetTrigger asChild><button className="nav-menu-trigger" type="button" aria-label="Open navigation"><Menu size={20} /></button></SheetTrigger>
        <SheetContent side="left" className="navigation-sheet">
          <SheetHeader><SheetTitle>Explore DashCareer</SheetTitle><SheetDescription>Subjects, study tools and support in one place.</SheetDescription></SheetHeader>
          <div className="navigation-sheet-links">
            {[...primary, ...more].map(({ href, label, icon: Icon }) => <SheetClose asChild key={href}><Link href={href} className={pathname.startsWith(href) ? "active" : ""}><Icon size={19} /><span>{label}</span><ChevronRight size={16} /></Link></SheetClose>)}
          </div>
          <div className="navigation-sheet-subjects"><b>Popular subjects</b>{subjects.slice(0, 6).map((subject) => <SheetClose asChild key={subject.slug}><Link href={`/subjects/${subject.slug}`}><span style={{ background: subject.accent }}>{subject.short}</span>{subject.name}</Link></SheetClose>)}</div>
        </SheetContent>
      </Sheet>
    </div>
    <CommandDialog open={searchOpen} onOpenChange={setSearchOpen} title="Search DashCareer" description="Search subjects and study tools">
      <CommandInput placeholder="Search subjects, DashAI, community…" />
      <CommandList>
        <CommandEmpty>No matching subject or tool.</CommandEmpty>
        <CommandGroup heading="Subjects">{subjects.map((subject) => <CommandItem key={subject.slug} value={`${subject.name} ${subject.topics.map((topic) => topic.title).join(" ")}`} onSelect={() => go(`/subjects/${subject.slug}`)}><span className="command-subject-icon" style={{ background: subject.accent }}>{subject.short}</span><span>{subject.name}</span><small>{subject.topics.length} topics</small></CommandItem>)}</CommandGroup>
        <CommandGroup heading="Tools">{[...primary.slice(1), ...more].map(({ href, label, icon: Icon }) => <CommandItem key={href} value={label} onSelect={() => go(href)}><Icon /><span>{label}</span></CommandItem>)}</CommandGroup>
      </CommandList>
    </CommandDialog>
  </>;
}

const routeLabels: Record<string, string> = { subjects: "Subjects", dashboard: "Dashboard", "learning-hub": "Learning hub", tutor: "DashAI", community: "Community", coverage: "Coverage", faq: "FAQ", reviews: "Reviews", pricing: "Pricing", "study-tools": "Study tools", launch: "Launch readiness", admin: "Owner overview", legal: "Legal" };

export function BreadcrumbTrail() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  const parts = pathname.split("/").filter(Boolean);
  return <nav className="breadcrumb-shell" aria-label="Breadcrumb"><Link href="/">Home</Link>{parts.map((part, index) => {
    const href = `/${parts.slice(0, index + 1).join("/")}`;
    const subject = subjects.find((item) => item.slug === part);
    const label = subject?.name ?? routeLabels[part] ?? part.replace(/-/g, " ");
    const current = index === parts.length - 1;
    return <span key={href}><ChevronRight size={14} />{current ? <b aria-current="page">{label}</b> : <Link href={href}>{label}</Link>}</span>;
  })}</nav>;
}
