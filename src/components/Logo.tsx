import { Link } from "react-router";

export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <Link to="/" aria-label="متجر بَنان — الرئيسية" className={`inline-block shrink-0 ${className}`}>
      <img
        src={light ? "/logo-light.png" : "/logo-600.png"}
        alt="بَنان Banan Store"
        width={600}
        height={356}
        className="h-full w-auto select-none"
        draggable={false}
      />
    </Link>
  );
}
