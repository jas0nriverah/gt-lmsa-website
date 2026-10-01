import Image from "next/image";
import { boardMembers } from "@/lib/site-data";
import { Section } from "@/components/Section";

export function BoardGrid({
  id,
  eyebrow,
  title,
  description,
  className,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <Section
      id={id}
      eyebrow={eyebrow}
      title={title}
      description={description}
      className={className}
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-7">
        {boardMembers.map((member) => (
          <article key={`${member.role}-${member.name}`} className="board-person min-w-0">
            <div className="board-portrait relative aspect-[4/5] overflow-hidden rounded-md border border-gt-gold/35 bg-gt-cream">
              {member.image ? (
                <Image
                  src={member.image.src}
                  alt={member.image.alt}
                  fill
                  sizes="(max-width: 639px) 46vw, (max-width: 1023px) 46vw, 23vw"
                  className={member.image.fit === "contain" ? "object-contain p-8" : "object-cover"}
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-full items-center justify-center bg-gt-navy text-3xl font-black text-white"
                >
                  {member.initials}
                </div>
              )}
            </div>
            <p className="mt-4 text-xs font-bold uppercase leading-5 tracking-[0.1em] text-gt-dark-gold sm:text-sm">
              {member.role}
            </p>
            <h3 className="mt-1 text-lg font-bold leading-snug text-gt-navy sm:text-xl">
              {member.name}
            </h3>
          </article>
        ))}
      </div>
    </Section>
  );
}
