import Link from "next/link";
export default function NotFound() { return <main className="shell page-space empty-state"><p className="eyebrow">404</p><h1>That page isn&apos;t in the study plan.</h1><p>Return to the subject library and choose another route.</p><Link href="/subjects">Browse subjects</Link></main>; }
