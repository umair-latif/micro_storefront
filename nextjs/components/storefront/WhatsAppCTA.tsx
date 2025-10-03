"use client";
import Link from "next/link";
export default function WhatsAppCTA({ phone, label, className, accent }: { phone: string, label?: string, className?: string, accent: string }) {
  const url = `https://wa.me/${phone}`;
  return (<Link href={url} className={`${className ?? ""} inline-flex items-center gap-2`} style={{ background: accent, color: "white" }}>
      <span>💬</span><span className="text-sm font-medium">{label ?? "WhatsApp"}</span></Link>);
}
