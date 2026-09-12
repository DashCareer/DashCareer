import { notFound } from "next/navigation";
import { Activity, ExternalLink, Link2, ShieldCheck } from "lucide-react";
import { requireUser } from "@/app/auth-session";
import { CopyEndpointButton } from "@/components/copy-endpoint-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment connection" };

export default async function PaymentSetupPage() {
  const user = await requireUser("/setup/payments");
  const owner = process.env.DASHCAREER_ADMIN_EMAIL?.trim().toLowerCase();
  const endpoint = process.env.GUMROAD_WEBHOOK_URL?.trim();
  if (!owner || user.email.toLowerCase() !== owner || !endpoint) notFound();
  return (
    <main className="shell page-space payment-setup">
      <div className="page-intro">
        <p className="eyebrow"><Link2 size={14} /> Owner setup</p><h1>Connect Gumroad once.</h1>
        <p>DashCareer now links every checkout to the signed-in account and falls back to the verified purchase email. No student enters a licence key.</p>
      </div>
      <section className="setup-card">
        <div className="setup-ready"><Activity size={24} /><div><b>DashCareer&apos;s receiver is ready</b><span>Your founder account has Pro access while you finish testing customer payments.</span></div></div>
        <ol>
          <li><span>1</span><div><b>Open Gumroad settings</b><p>Open Advanced settings and find the Ping notification address.</p><a href="https://app.gumroad.com/settings/advanced" target="_blank" rel="noreferrer">Open Gumroad Advanced settings <ExternalLink size={15} /></a></div></li>
          <li><span>2</span><div><b>Replace the Ping address with this exact one</b><label>Private Gumroad notification address<input value={endpoint} readOnly aria-label="Gumroad notification address" /></label><CopyEndpointButton value={endpoint} /></div></li>
          <li><span>3</span><div><b>Save and send a test ping</b><p>Gumroad should report a successful test. Reload this page; the status above will change as soon as DashCareer receives it.</p></div></li>
          <li><span>4</span><div><b>Run one real checkout</b><p>Start from DashCareer while signed in. A unique checkout reference and the account email are attached automatically, so the matching account unlocks immediately when the notification arrives.</p></div></li>
        </ol>
        <div className="setup-security"><ShieldCheck size={18} /><p>Keep this address private. It contains the secret that rejects fake upgrade requests.</p></div>
      </section>
    </main>
  );
}
