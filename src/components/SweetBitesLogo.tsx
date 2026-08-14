import Image from "next/image";

type SweetBitesLogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: 120,
  md: 170,
  lg: 220,
};

export function SweetBitesLogo({ size = "md", className = "" }: SweetBitesLogoProps) {
  const px = sizeMap[size];

  return (
    <Image
      src="/brand/sweet-bites-logo-circle.png"
      alt="Sweet Bites"
      width={px}
      height={px}
      className={`mx-auto shrink-0 ${className}`}
      sizes={`${px}px`}
      priority
    />
  );
}
