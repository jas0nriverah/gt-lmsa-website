import Image from "next/image";

export function MedicalHero() {
  return (
    <div data-testid="medical-hero" className="relative mx-auto flex w-full max-w-sm justify-center py-4 md:py-8">
      <Image
        src="/lmsa-logo.png"
        alt="Latino Medical Student Association PLUS logo"
        width={360}
        height={360}
        sizes="(max-width: 767px) 224px, (max-width: 1023px) 288px, 360px"
        className="h-56 w-56 rounded-full bg-white object-contain shadow-[0_16px_60px_rgba(0,48,87,0.08)] md:h-72 md:w-72 lg:h-[360px] lg:w-[360px]"
        priority
      />
    </div>
  );
}
