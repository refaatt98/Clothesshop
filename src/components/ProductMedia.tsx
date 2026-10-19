import type { ArtKind } from "../types";
import { ProductArt } from "./ProductArt";

/** صورة القطعة إذا موجودة، وإلا الرسمة */
export function ProductMedia({
  image,
  art,
  color,
  bg,
  variant = 0,
  className = "",
  alt,
  eager = false,
}: {
  image?: string | null;
  art: ArtKind | null;
  color: string;
  bg?: string;
  variant?: 0 | 1 | 2;
  className?: string;
  alt: string;
  eager?: boolean;
}) {
  if (image) {
    return (
      <img
        src={image}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={`object-cover ${className}`}
        style={variant === 1 ? { transform: "scale(1.6)" } : undefined}
      />
    );
  }
  return <ProductArt kind={art ?? "bag"} color={color} bg={bg} variant={variant} className={className} title={alt} />;
}
