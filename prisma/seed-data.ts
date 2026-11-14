// Only supplied facts belong here. Unknown dates, tags, and contributions stay unknown.
export const seedData = {
  slug: 'nikita-makeev',
  name: 'Nikita Makeev',
  description:
    'Web developer. I design and build distinctive websites, web platforms and practical automations — one person to work with, from the first idea to the working product. Based in Estonia, working remotely.',
  location: 'Estonia / Remote',
  languages: ['Russian', 'English', 'Estonian'],
  links: [
    { type: 'GITHUB', url: 'https://github.com/NikitaMakeev' },
    {
      type: 'LINKEDIN',
      url: 'https://www.linkedin.com/in/nikita-makeev-b89400331',
    },
    { type: 'TELEGRAM', url: 'https://t.me/daymonru' },
    { type: 'WEBSITE', url: 'https://nikitamakeev.github.io/' },
    { type: 'EMAIL', url: 'mailto:nikita.makeev.dev@gmail.com' },
  ],
  skillGroups: [
    {
      category: 'Frontend',
      names: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS'],
    },
    {
      category: 'Motion & 3D',
      names: ['Three.js', 'WebGL', 'Framer Motion', 'GSAP'],
    },
    {
      category: 'Backend & Data',
      names: ['Node.js', 'Go', 'PostgreSQL', 'Supabase', 'REST API'],
    },
    { category: 'Mobile', names: ['Flutter'] },
    {
      category: 'Tools',
      names: ['Git', 'GitHub', 'Vercel', 'Figma', 'Formspree', 'Claude Code'],
    },
    {
      category: 'Quality',
      names: [
        'SEO / JSON-LD',
        'i18n (RU / EN / ET)',
        'Performance',
        'Responsive layout',
      ],
    },
    {
      category: 'AI & Agents',
      names: [
        'Claude Code',
        'Codex',
        'Gemini CLI',
        'OpenCode',
        'Cursor',
        'GitHub Copilot',
        'Skills',
        'MCP',
        'AGENTS.md',
      ],
    },
    {
      category: 'Used in this assignment',
      names: ['NestJS', 'Prisma', 'GraphQL', 'Docker'],
    },
  ],
  experience: [
    {
      company: 'Independent (freelance)',
      position: 'Web Developer',
      startDate: null,
      endDate: null,
      location: 'Estonia / Remote',
      achievements: [
        'Delivered three production projects: ADL, PPF Garage, BIGPLAY.',
        'Received client ratings of 10/10 (PPF Garage) and 9/10 (BIGPLAY).',
        'Built a cross-platform mobile application with Go + Flutter (under NDA).',
        'Delivered multilingual (RU / EN / ET) websites with technical SEO (JSON-LD).',
      ],
    },
  ],
  projects: [
    {
      name: 'ADL',
      url: 'https://adl-yeat.vercel.app/',
      description:
        'Interactive website for the artist YEAT, with a DJ set and music player.',
      contribution: 'interactive website with a DJ set and music player.',
      tags: [],
    },
    {
      name: 'PPF Garage',
      url: 'https://ppf.ee/',
      description: 'Automotive services web platform. Client rating 10/10.',
      contribution:
        'platform development, interactive tint preview, decal configurator, technical SEO structure.',
      tags: [],
    },
    {
      name: 'BIGPLAY',
      url: 'https://bigplay.gg/',
      description: 'Esports / tournament platform. Client rating 9/10.',
      contribution:
        'system architecture from database transactions to the interface and backend services.',
      tags: [],
    },
    {
      name: 'Personal portfolio',
      url: 'https://nikitamakeev.github.io/',
      description: 'Trilingual (EN / RU / ET) developer portfolio.',
      contribution: null,
      tags: [],
    },
    {
      name: 'Digital Business Card API',
      url: 'https://github.com/NikitaMakeev/digital-business-card-api',
      description: 'This very backend: NestJS + Prisma + GraphQL.',
      contribution: null,
      tags: [],
    },
  ],
} as const;
