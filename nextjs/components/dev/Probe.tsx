// components/dev/Probe.tsx
"use client";
export default function Probe({ cfgView, urlView }:{
  cfgView?: string|null; urlView?: string|null;
}) {
  console.log("[Probe] cfg.display_mode:", cfgView);
  console.log("[Probe] searchParams.view:", urlView);
  return null; // nothing rendered; logs go to browser console
}
