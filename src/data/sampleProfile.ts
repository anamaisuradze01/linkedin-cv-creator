import { ProfileData } from "@/types/cv";

export const sampleProfileData: ProfileData = {
  fullName: "Alexandra Chen",
  title: "Senior Product Designer",
  email: "alexandra.chen@email.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  summary: "Creative and detail-oriented Product Designer with 7+ years of experience crafting user-centered digital experiences. Passionate about solving complex problems through elegant design solutions. Proven track record of leading design initiatives that increased user engagement by 40% and reduced customer support tickets by 25%.",
  skills: [
    "UI/UX Design",
    "Figma",
    "Design Systems",
    "User Research",
    "Prototyping",
    "HTML/CSS",
    "React",
    "Accessibility",
    "Design Thinking",
    "Agile/Scrum"
  ],
  education: [
    {
      school: "Stanford University",
      degree: "Master of Arts in Design",
      years: "2014 - 2016"
    },
    {
      school: "University of California, Berkeley",
      degree: "Bachelor of Science in Cognitive Science",
      years: "2010 - 2014"
    }
  ],
  experience: [
    {
      title: "Senior Product Designer",
      company: "Stripe",
      years: "2021 - Present",
      description: "Lead design for the Payments Dashboard team, overseeing the end-to-end design process for features used by millions of businesses. Mentored 3 junior designers and established design critique processes that improved team output quality."
    },
    {
      title: "Product Designer",
      company: "Airbnb",
      years: "2018 - 2021",
      description: "Designed key features for the host experience platform, including the redesigned listing creation flow that increased completion rates by 35%. Collaborated with engineering and PM to ship 12 major features."
    },
    {
      title: "UX Designer",
      company: "IDEO",
      years: "2016 - 2018",
      description: "Worked on diverse client projects spanning healthcare, fintech, and consumer products. Led user research initiatives and translated insights into actionable design recommendations."
    }
  ],
  projects: [
    {
      name: "Design System Framework",
      description: "Created an open-source design system used by 500+ companies"
    },
    {
      name: "Accessibility Audit Tool",
      description: "Built a Figma plugin for automated accessibility checking"
    }
  ],
  languages: ["English (Native)", "Mandarin (Fluent)", "Spanish (Conversational)"]
};
