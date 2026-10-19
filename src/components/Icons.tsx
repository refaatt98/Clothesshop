// أيقونات المنصات (غير موجودة في lucide)
import type { SVGProps } from "react";

export function InstagramIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsappIcon(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
      <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.3z" />
      <path d="M9 8.6c0 3.4 2.9 6.4 6.4 6.4l1-1.4-1.9-1-1 .8c-1.1-.5-2-1.4-2.5-2.5l.8-1-1-1.9z" fill="currentColor" stroke="none" />
    </svg>
  );
}
