"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyEndpointButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
  return <button className="button primary" type="button" onClick={copy}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? "Copied" : "Copy connection address"}</button>;
}
