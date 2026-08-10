import Image from "next/image";

export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <Image
      src="/mediconnect-me--logo.png"
      alt="MedConnectMe"
      width={512}
      height={512}
      className={className}
    />
  );
}
