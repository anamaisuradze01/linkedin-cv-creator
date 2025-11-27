export interface Education {
  school: string;
  degree: string;
  years: string;
}

export interface Experience {
  title: string;
  company: string;
  years: string;
  description: string;
}

export interface Project {
  name: string;
  description: string;
}

export interface ProfileData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  projects?: Project[];
  languages?: string[];
}
