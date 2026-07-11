"use client";

import {
  Cookie,
  Database,
  ExternalLink,
  Eye,
  FileClock,
  Globe,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  ShieldCheck,
  ShieldQuestion,
  UserCog,
  Users,
} from "lucide-react";

import {
  LegalPageLayout,
  type LegalContactDetail,
  type LegalSection,
} from "@/components/legal/legal-page-layout";

const sections: LegalSection[] = [
  {
    number: "01",
    title: "Information We Collect",
    icon: Database,
    lists: [
      {
        heading: "We may collect the following information:",
        items: [
          "Name",
          "Email address",
          "Phone number",
          "Company name",
          "Project details",
          "Budget information",
          "Any information voluntarily submitted through our contact forms or email communication.",
        ],
      },
      {
        heading: "We may also automatically collect:",
        items: [
          "IP address",
          "Browser type",
          "Device information",
          "Operating system",
          "Pages visited",
          "Referral source",
          "Date and time of visit",
        ],
      },
    ],
  },
  {
    number: "02",
    title: "How We Use Your Information",
    icon: Eye,
    lists: [
      {
        heading: "We use your information to:",
        items: [
          "Respond to project inquiries.",
          "Provide quotations.",
          "Deliver our services.",
          "Improve our website.",
          "Communicate regarding ongoing projects.",
          "Send updates related to our services (where permitted).",
          "Prevent fraud and protect our website.",
        ],
      },
    ],
  },
  {
    number: "03",
    title: "Cookies",
    icon: Cookie,
    paragraphs: ["Our website uses cookies and similar technologies to:"],
    lists: [
      {
        items: [
          "Improve website performance.",
          "Remember user preferences.",
          "Measure website traffic.",
          "Analyze visitor behaviour.",
        ],
      },
    ],
  },
  {
    number: "04",
    title: "Third-Party Services",
    icon: Users,
    paragraphs: ["We may use trusted third-party services including:"],
    lists: [
      {
        items: [
          "Google Analytics",
          "Google Fonts",
          "AWS (Amazon Web Services)",
          "Cloudflare",
          "Social media platforms",
        ],
      },
    ],
  },
  {
    number: "05",
    title: "Data Retention",
    icon: FileClock,
    paragraphs: ["We retain your information only for as long as necessary to:"],
    lists: [
      {
        items: [
          "Provide our services.",
          "Comply with legal obligations.",
          "Resolve disputes.",
          "Maintain business records.",
        ],
      },
    ],
  },
  {
    number: "06",
    title: "Data Security",
    icon: ShieldCheck,
    paragraphs: [
      "Kroo Production implements reasonable administrative, technical, and organizational safeguards to protect your information.",
      "However, no method of transmission over the Internet or electronic storage is completely secure.",
    ],
  },
  {
    number: "07",
    title: "Your Rights",
    icon: UserCog,
    paragraphs: ["Depending on applicable laws, you may have the right to:"],
    lists: [
      {
        items: [
          "Request access to your information.",
          "Request correction of inaccurate information.",
          "Request deletion of your information.",
          "Withdraw consent where applicable.",
        ],
      },
    ],
  },
  {
    number: "08",
    title: "External Links",
    icon: ExternalLink,
    paragraphs: [
      "Our website may contain links to third-party websites.",
      "We are not responsible for the privacy practices or content of those external websites.",
    ],
  },
  {
    number: "09",
    title: "Children's Privacy",
    icon: ShieldQuestion,
    paragraphs: [
      "Our services are not intended for individuals under the age of 18.",
      "We do not knowingly collect personal information from children.",
    ],
  },
  {
    number: "10",
    title: "Changes to This Privacy Policy",
    icon: RefreshCcw,
    paragraphs: [
      "We reserve the right to update this Privacy Policy at any time.",
      "Any modifications will be published on this page with the updated Effective Date.",
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

export default function PrivacyPolicyContent() {
  return (
    <LegalPageLayout
      breadcrumbLabel="Privacy Policy"
      heading="Privacy Policy"
      effectiveDate="08 July 2026"
      intro="Welcome to Kroo Production. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and protect your information when you visit krooproduction.in or use our services."
      sections={sections}
      contactNumber="11"
      contactTitle="Contact Us"
      contactDetails={contactDetails}
      contactNote="To exercise any of the rights described above, please reach out using the contact details listed here."
    />
  );
}