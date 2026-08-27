import { Icons } from "@/components/icons";
import {
  House,
  Workflow,
  Network,
  Database,
  Sparkles,
  Bot,
  Cloud,
  Server,
  BrainCircuit,
  BookOpen,
  Mail,
} from "lucide-react";
import { ReactLight } from "@/components/ui/svgs/reactLight";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { Typescript } from "@/components/ui/svgs/typescript";
import { Nodejs } from "@/components/ui/svgs/nodejs";
import { Python } from "@/components/ui/svgs/python";
import { Postgresql } from "@/components/ui/svgs/postgresql";
import { Docker } from "@/components/ui/svgs/docker";

export const DATA = {
  name: "Brian Moir",
  initials: "BM",
  url: "https://portfolio.brianmoir.dev",
  location: "Knoxville, TN (Remote, US)",
  locationLink: "https://www.google.com/maps/place/knoxville+tn",
  description:
    "AI Solutions Architect specializing in multi-agent systems, RAG pipelines, and enterprise AI orchestration.",
  summary:
    "I'm the CTO & Principal AI Architect at [Liink'd](/#work), where I designed the Syncc Executive Agent OS — a production multi-agent platform built on LangChain orchestration, the MCP protocol, n8n agentic workflows, and vector database retrieval. I bring [10+ years of technical leadership across SaaS and enterprise platforms](/#work), owning product strategy, delivery execution, and cross-functional roadmap alignment from discovery to launch. I specialize in [LLM platform design, multi-agent orchestration, and enterprise AI operating models](/#skills), including evaluation frameworks, governance controls, observability, and scale-ready cloud deployment across GCP and Vertex AI.",
  avatarUrl: "/brian-moir.png",
  resumeUrl:
    "https://docs.google.com/document/d/1b1bkDDj_6spetyCchz22X0rbsx7bbKB1bb2YbwD3JYI/edit?usp=sharing",
  ogImage: "/og_image.png",
  sections: {
    githubActivity: {
    order: 5, enabled: true,
      label: "Coding Activity",
      heading: "GitHub Activity Graph",
      text: "My contribution graph over the last year. Flip on Game Mode to blast through it retro-space-shooter style.",
    },
    about: { order: 2, enabled: true, heading: "About" },
    work: { order: 3, enabled: true, heading: "Work Experience", presentLabel: "Present" },
    education: { order: 4, enabled: true, heading: "Education & Certifications" },
  skills: { order: 6, enabled: true, heading: "Skills" },
    projects: {
    order: 7, enabled: true,
      label: "My Work",
      heading: "Things I've architected & shipped",
      text: "A selection of AI platforms and pipelines I've designed and built — from multi-agent orchestration systems to production RAG and data-extraction infrastructure.",
    },
    blog: {
    order: 8, enabled: true,
      label: "Writing",
      heading: "From the Blog",
      text: "Notes, deep dives, and lessons from building AI platforms, agentic systems, and developer infrastructure.",
    },
    hackathons: {
    order: 10, enabled: false,
      label: "Hackathons",
      heading: "I like building things",
      text: "",
    },
    photos: {
    order: 9, enabled: false,
      heading: "My Recent Travels",
    },
    contact: {
    order: 11, enabled: true,
      label: "Contact",
      heading: "Get in Touch",
      text: "Open to AI architecture, agentic systems, and AI engineering roles. Connect with me on LinkedIn or email me directly and I'll get back to you.",
    },
  },
  photos: [],
  skills: [
    { name: "Python", icon: Python },
    { name: "TypeScript", icon: Typescript },
    { name: "Next.js", icon: NextjsIconDark },
    { name: "React", icon: ReactLight },
    { name: "Node.js", icon: Nodejs },
    { name: "PostgreSQL", icon: Postgresql },
    { name: "LangChain", icon: Workflow },
    { name: "LangGraph", icon: Network },
    { name: "n8n", icon: Workflow },
    { name: "MCP Protocol", icon: Network },
    { name: "RAG Pipelines", icon: Database },
    { name: "Vector Databases", icon: Database },
    { name: "OpenAI", icon: Sparkles },
    { name: "Anthropic Claude", icon: Bot },
    { name: "AWS Lambda", icon: Cloud },
    { name: "Terraform", icon: Server },
    { name: "Cloudflare Workers", icon: Cloud },
    { name: "Supabase", icon: Database },
    { name: "Vertex AI", icon: BrainCircuit },
    { name: "Docker", icon: Docker },
  ],
  navbar: [
    { href: "/", icon: House, label: "Home" },
    {
      href: "/blog",
      icon: BookOpen,
      label: "Blog",
      hoverBg: "#ec4899",
      hoverFg: "#ffffff",
      hoverBgDark: "#f43f5e",
      hoverFgDark: "#ffffff",
    },
    {
      href: "/contact",
      icon: Mail,
      label: "Contact",
      hoverBg: "#10b981",
      hoverFg: "#ffffff",
      hoverBgDark: "#34d399",
      hoverFgDark: "#052e1f",
    },
  ],
  contact: {
    email: "bmoirdev@gmail.com",
    tel: "",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/bmoir23",
        icon: Icons.github,
        navbar: true,
        hoverBg: "#000000",
        hoverFg: "#ffffff",
        hoverBgDark: "#ffffff",
        hoverFgDark: "#000000",
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://linkedin.com/in/brian-moir",
        icon: Icons.linkedin,
        navbar: true,
        hoverBg: "#0a66c2",
        hoverFg: "#ffffff",
        hoverBgDark: "#0a66c2",
        hoverFgDark: "#ffffff",
      },
      email: {
        name: "Send Email",
        url: "mailto:bmoirdev@gmail.com",
        icon: Icons.email,
        navbar: true,
        hoverBg: "#10b981",
        hoverFg: "#ffffff",
        hoverBgDark: "#34d399",
        hoverFgDark: "#052e1f",
      },
    },
  },

  work: [
    {
      company: "Liink'd",
      href: "https://get.liinkd.xyz",
      badges: ["CTO"],
      location: "Knoxville, TN (Remote)",
      title: "CTO & Principal AI Architect",
      logoUrl: "https://www.google.com/s2/favicons?domain=liinkd.xyz&sz=128",
      start: "January 2025",
      end: undefined,
      description:
        "Lead all technical strategy, AI architecture, and platform engineering for a creator-infrastructure startup building agentic AI tooling. Architected the Syncc Executive Agent OS — a production multi-agent AI platform integrating LangChain orchestration, MCP servers, n8n automation, and vector retrieval with configurable human-in-the-loop oversight and behavioral governance. Designed RAG document Q&A pipelines with DeepEval-based evaluation, a Terraform/AWS Lambda structured data-extraction pipeline, and advanced prompt-engineering frameworks across GPT-4, Claude, and open-source models. Established MLOps standards with AI Gateway routing for cost governance, observability, and latency optimization across cloud providers.",
    },
    {
      company: "Benzinga",
      href: "https://www.benzinga.com",
      badges: [],
      location: "Detroit Lakes, MN (Remote)",
      title: "Customer Success & Technical Solutions Manager",
      logoUrl: "https://www.google.com/s2/favicons?domain=benzinga.com&sz=128",
      start: "January 2020",
      end: "May 2023",
      description:
        "Served as the primary technical bridge between enterprise customers and core engineering teams for a leading financial data and trading SaaS platform. Ran end-to-end technical discovery with enterprise clients, translating complex trading and data requirements into integration roadmaps that drove churn reduction and expansion revenue. Architected an in-house customer-facing ticketing and feedback system for feature tracking, real-time bug triage, and CX analytics. Led CXO-level technical pursuits as the SME during sales cycles, and expanded the Web3/blockchain vertical to 100K+ subscribers and 1M+ views.",
    },
    {
      company: "Storetasker / Ask Lorem",
      href: "https://www.storetasker.com",
      badges: [],
      location: "New York, NY (Remote)",
      title: "Customer Success Manager & Project Manager",
      logoUrl: "https://www.google.com/s2/favicons?domain=storetasker.com&sz=128",
      start: "August 2018",
      end: "January 2020",
      description:
        "Managed technical project scoping and expert-client matching on a Shopify development marketplace, overseeing end-to-end delivery of web development and e-commerce integration engagements across a network of 200+ developers. Resolved complex platform escalations, defined SOPs for technical quality review, and partnered with the Director of Operations on workflow optimization and capacity planning.",
    },
    {
      company: "Freelance Contractor / Upwork",
      href: "https://www.upwork.com",
      badges: ["Freelance"],
      location: "Remote",
      title: "Full-Stack Developer | Digital Marketing Consultant | AI/ ML Enablement Consultant and Engineer| Automation and Sytem Flows Engineer",
      logoUrl: "https://www.google.com/s2/favicons?domain=upwork.com&sz=128",
      start: "January 2015",
      end: "Ongoing",
      description:
        "Built custom WordPress/ Shopify/ Wix/ Webflow themes and client websites, built RESTful API integrations, built and updated client-side JavaScript/React applications. Managed Google Ads campaigns, digital marketing campaigns, project management, SEO strategy, and PPC optimization across multiple client accounts.",
    },
  ],
  education: [
    {
      school: "University of Maryland",
      href: "https://www.umd.edu",
      degree: "B.S. Computer Science — AI Engineering",
      logoUrl: "https://www.google.com/s2/favicons?domain=umd.edu&sz=128",
      start: "2023",
      end: "May 2026",
    },
    {
      school: "Coursera",
      href: "https://www.credly.com/users/bmoir",
      degree: "Google AI Professional Certificate",
      logoUrl: "https://www.google.com/s2/favicons?domain=coursera.org&sz=128",
      start: "",
      end: "",
    },
    {
      school: "Coursera",
      href: "https://www.credly.com/users/bmoir",
      degree: "Google DeepMind for Developers Certification",
      logoUrl: "https://www.google.com/s2/favicons?domain=coursera.org&sz=128",
      start: "",
      end: "",
    },
    {
      school: "Coursera",
      href: "https://www.credly.com/users/bmoir",
      degree: "Microsoft AI / ML Certification",
      logoUrl: "https://www.google.com/s2/favicons?domain=coursera.org&sz=128",
      start: "",
      end: "",
    },
    {
      school: "Coursera",
      href: "https://www.credly.com/users/bmoir",
      degree: "Google Project Management Certificate",
      logoUrl: "https://www.google.com/s2/favicons?domain=coursera.org&sz=128",
      start: "",
      end: "",
    },
    {
      school: "SkillShare / University of the People",
      href: "https://www.credly.com/users/bmoir",
      degree: "IBM Cybersecurity Certification",
      logoUrl: "https://www.google.com/s2/favicons?domain=ibm.com&sz=128",
      start: "",
      end: "",
    },
  ],
  // Projects are now managed in Sanity (see sanity/schemas/project.ts and
  // sanity/seed/projects.ndjson). The homepage grid and /projects pages fetch
  // them at runtime via src/lib/sanity.ts.
  hackathons: [],
} as const;
