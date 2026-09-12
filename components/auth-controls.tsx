"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

export function PasswordField({ creating = false }: { creating?: boolean }) {
  const [visible, setVisible] = useState(false);
  return <div className="password-field">
    <label htmlFor="account-password"><LockKeyhole size={16}/> Password</label>
    <div className="password-input">
      <input id="account-password" name="password" type={visible ? "text" : "password"} autoComplete={creating ? "new-password" : "current-password"} minLength={creating ? 8 : undefined} required aria-describedby={creating ? "password-help" : undefined}/>
      <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
    </div>
    {creating && <small id="password-help">Use at least 8 characters.</small>}
  </div>;
}

export function AuthSubmit({ children, pendingLabel, className = "button primary" }: { children: React.ReactNode; pendingLabel: string; className?: string }) {
  const { pending } = useFormStatus();
  return <button className={className} type="submit" disabled={pending} aria-busy={pending}>{pending ? pendingLabel : children}</button>;
}
