import type { HTMLAttributes } from "react";
import { ArrowUpRight } from "lucide-react";
import type { TeamMember } from "@/data/team";

interface TeamCardProps extends HTMLAttributes<HTMLElement> {
  member: TeamMember;
}

export function TeamCard({ member, className, ...props }: TeamCardProps) {
  const baseClass = "flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-6";
  const classes = [baseClass, className].filter(Boolean).join(" ");
  return (
    <article className={classes} {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {member.avatarUrl ? (
            <div className="h-16 w-16 overflow-hidden rounded-full">
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold uppercase text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
              {member.name.slice(0, 1)}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">{member.name}</h3>
            <p className="text-sm font-medium text-primary-600 dark:text-primary-300">{member.role}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground sm:text-base">{member.bio}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {member.socials.map((social) => (
          <a
            key={social.url}
            href={social.url}
            target={social.url.startsWith("http") ? "_blank" : undefined}
            rel={social.url.startsWith("http") ? "noreferrer" : undefined}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary-400 hover:text-primary-600 dark:hover:border-primary-500 dark:hover:text-primary-300"
          >
            {social.label}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>
    </article>
  );
}
