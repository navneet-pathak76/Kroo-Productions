"use client";

import {
  Cookie,
  Globe,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Settings,
  ShieldCheck,
  UserCog,
} from "lucide-react";

import {
  LegalPageLayout,
  type LegalContactDetail,
  type LegalSection,
} from "@/components/legal/legal-page-layout";

const sections: LegalSection[] = [
  {
    number: "01",
    title: "What Are Cookies?",
    icon: Cookie,
    paragraphs: [
      "Cookies are small text files stored on your device when you visit a website.",
      "They help websites remember your preferences, improve functionality, analyze visitor behaviour and provide a better browsing experience.",
      "Cookies generally do not contain personally identifiable information unless you voluntarily provide such information.",
    ],
  },

  {
    number: "02",
    title: "How We Use Cookies",
    icon: Settings,
    paragraphs: [
      "Kroo Production uses cookies to improve your browsing experience and website performance.",
    ],
    lists: [
      {
        heading: "Cookies help us:",
        items: [
          "Improve website performance.",
          "Remember user preferences.",
          "Measure website traffic.",
          "Understand visitor behaviour.",
          "Improve website security.",
          "Enhance overall user experience.",
        ],
      },
    ],
  },

  {
    number: "03",
    title: "Types of Cookies We Use",
    icon: ShieldCheck,
    lists: [
      {
        heading: "Essential Cookies",
        items: [
          "Required for website functionality.",
          "Enable navigation and security.",
        ],
      },
      {
        heading: "Performance & Analytics Cookies",
        items: [
          "Measure visitor traffic.",
          "Monitor website performance.",
          "Understand visitor interaction.",
        ],
      },
      {
        heading: "Functional Cookies",
        items: [
          "Remember language preferences.",
          "Store browser settings.",
          "Remember user preferences.",
        ],
      },
      {
        heading: "Third-Party Cookies",
        items: [
          "Google Analytics",
          "Google Tag Manager",
          "Cloudflare",
          "Embedded Social Platforms",
        ],
      },
    ],
  },

  {
    number: "04",
    title: "Managing Cookies",
    icon: UserCog,
    paragraphs: [
      "Most modern browsers allow you to view, manage, block or delete cookies at any time.",
      "Disabling cookies may affect certain website functionality.",
    ],
  },
    {
    number: "05",
    title: "Cookie Consent",
    icon: Cookie,
    paragraphs: [
      "By continuing to browse and use this website, you consent to the use of cookies as described in this Cookie Policy.",
      "Where required by applicable law, we will request your consent before placing non-essential cookies on your device.",
    ],
  },

  {
    number: "06",
    title: "Third-Party Services",
    icon: Globe,
    paragraphs: [
      "Some cookies on our website are placed by trusted third-party providers that help us operate, monitor and improve our services.",
    ],
    lists: [
      {
        heading: "These services may include:",
        items: [
          "Google Analytics",
          "Google Tag Manager",
          "Cloudflare",
          "AWS (Amazon Web Services)",
          "Embedded YouTube videos",
          "Instagram and other social media integrations",
        ],
      },
    ],
  },

  {
    number: "07",
    title: "Policy Updates",
    icon: RefreshCcw,
    paragraphs: [
      "We may update this Cookie Policy from time to time to reflect legal, technical or operational changes.",
      "The latest version will always be published on this page together with the updated Effective Date.",
    ],
  },
];

const contactDetails: LegalContactDetail[] = [
  {
    label: "Website",
    value: "krooproduction.in",
    href: "https://krooproduction.in",
    icon: Globe,
  },
  {
    label: "Email",
    value: "team@krooproduction.in",
    href: "mailto:team@krooproduction.in",
    icon: Mail,
  },
  {
    label: "Phone",
    value: "+91 70030 87985",
    href: "tel:+917003087985",
    icon: Phone,
  },
  {
    label: "Location",
    value: "Kolkata, West Bengal, India",
    icon: MapPin,
  },
];
export default function CookiePolicyContent() {
  return (
    <LegalPageLayout
      breadcrumbLabel="Cookie Policy"
      heading="Cookie Policy"
      effectiveDate="08 July 2026"
      intro="This Cookie Policy explains how Kroo Production ('we', 'our', or 'us') uses cookies and similar technologies when you visit https://krooproduction.in. By continuing to use our website, you agree to the use of cookies as described in this policy."
      sections={sections}
      contactNumber="08"
      contactTitle="Contact Us"
      contactDetails={contactDetails}
      contactNote="If you have any questions about our use of cookies or this Cookie Policy, please contact us using the information below."
    />
  );
}