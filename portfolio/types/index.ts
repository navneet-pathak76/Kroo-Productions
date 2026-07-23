export interface WorkItem {
  id: string;
  title: string;
  category: string;
  index: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export interface ServiceItem {
  index: string;
  title: string;
  description: string;
}

export interface TimelineItem {
  order: string;
  title: string;
  description: string;
}

export interface StatItem {
  label: string;
  value: number;
  suffix?: string;
}

export interface ProcessStep {
  order: string;
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
  company?: string;
}

export interface ContactApiResponse {
  success: boolean;
  message: string;
}
