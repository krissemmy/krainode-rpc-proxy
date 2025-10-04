import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { TeamCard } from "@/components/TeamCard";
import { teamMembers } from "@/data/team";
import { Container, Section } from "@/components/layout";

const advisors: typeof teamMembers = [];

export default function Team() {
  return (
    <div className="bg-background text-foreground">
      <Section>
        <Container className="space-y-16">
          <header className="mx-auto max-w-3xl space-y-6 text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-gray-100 px-4 py-2 text-sm font-medium text-muted-foreground dark:bg-gray-900/70">
              <img src="/images/logo_icon.svg" alt="KraiNode" className="h-6 w-auto" />
              <span>Who's behind KraiNode</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Built by developers, for developers</h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              KraiNode started as a simple playground for testing blockchain RPCs and is now growing into an open tool for Web3 onboarding.
            </p>
            <a
              href="mailto:contact@krissemmy.com"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 text-sm font-semibold text-white shadow transition hover:bg-primary-500 sm:text-base"
            >
              <Mail className="h-5 w-5" />
              contact@krissemmy.com
            </a>
          </header>

          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold sm:text-3xl">Founder</h2>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  Grounded in running production RPC, data indexing, and observability stacks.
                </p>
              </div>
              <Link
                to="/playground"
                className="inline-flex items-center text-sm font-semibold text-primary-600 transition hover:text-primary-500 sm:text-base"
              >
                Explore the playground
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member) => (
                <TeamCard key={member.name} member={member} />
              ))}
            </div>
          </section>

          {/* <section className="space-y-6">
            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-2xl font-semibold sm:text-3xl">Advisors &amp; contributors</h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                We collaborate with operators and protocol teams as the platform expands.
              </p>
            </div>
            {advisors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-gray-50/60 px-6 py-16 text-center text-sm text-muted-foreground dark:bg-gray-900/60">
                Looking to help scale KraiNode? Reach out and let&apos;s collaborate.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {advisors.map((member) => (
                  <TeamCard key={member.name} member={member} />
                ))}
              </div>
            )}
          </section> */}
        </Container>
      </Section>
    </div>
  );
}
