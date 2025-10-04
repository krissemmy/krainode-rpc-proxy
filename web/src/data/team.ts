export interface SocialLink {
  label: string;
  url: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatarUrl?: string;
  socials: SocialLink[];
}

export const teamMembers: TeamMember[] = [
  {
    name: "Emmanuel Christopher",
    role: "Founder & Node Infrastructure Engineer",
    bio: "Operator of high-availability RPC, data, and observability stacks across multiple chains.",
    socials: [
      { label: "GitHub", url: "https://github.com/krissemmy" },
      { label: "LinkedIn", url: "https://linkedin.com/in/emmanuel-christopher" },
      { label: "Email", url: "mailto:contact@krissemmy.com" },
    ],
  },
];
