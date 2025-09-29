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
  {
    name: "Mairo Gospel",
    role: "Co-founder and Software/Data Engineer",
    bio: "Focused on building scalable data pipelines, cloud-native infrastructure, and AI-driven applications for blockchain and beyond.",
    socials: [
      { label: "GitHub", url: "https://github.com/Gospelmairo" },
      { label: "LinkedIn", url: "https://www.linkedin.com/in/oghenemairo-gospel/" },
      { label: "Email", url: "mailto:gospelmairo@gmail.com" },
    ],
  },
];
