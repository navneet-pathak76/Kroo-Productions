"use client";

import {
  AlertTriangle,
  ExternalLink,
  FileWarning,
  Globe,
  Gavel,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Scale,
} from "lucide-react";

import {
  LegalPageLayout,
  type LegalContactDetail,
  type LegalSection,
} from "@/components/legal/legal-page-layout";

const sections: LegalSection[] = [
  {
    number: "01",
    title: "General Information",
    icon: FileWarning,
    paragraphs: [
      "The information available on this website is provided for general informational and promotional purposes only.",
      "While Kroo Production makes reasonable efforts to ensure the accuracy of all information, we do not guarantee that all content will always remain complete, accurate, current or error-free.",
    ],
  },

  {
    number: "02",
    title: "No Professional Advice",
    icon: Scale,
    paragraphs: [
      "Nothing published on this website should be considered legal, financial, business, tax, investment or professional advice.",
      "Visitors should consult appropriate professionals before making decisions based upon information available on this website.",
    ],
  },

  {
    number: "03",
    title: "Portfolio & Creative Work",
    icon: Gavel,
    paragraphs: [
      "Videos, photographs, graphics, motion graphics and creative assets displayed on this website represent projects completed by Kroo Production or published with appropriate permission.",
      "Unauthorized copying, redistribution or commercial use of any creative work is prohibited.",
    ],
  },

    {
    number: "04",
    title: "Third-Party Links",
    icon: ExternalLink,
    paragraphs: [
      "Our website may contain links to third-party websites and social media platforms.",
      "Kroo Production is not responsible for the content, availability or privacy practices of external websites.",
    ],
  },

  {
    number: "05",
    title: "Service Availability",
    icon: Globe,
    paragraphs: [
      "Our services may change, expand, or be discontinued without prior notice.",
      "Availability of specific services depends on project requirements, scheduling, resource availability, and mutual agreement between Kroo Production and the client.",
    ],
  },

  {
    number: "06",
    title: "Limitation of Liability",
    icon: AlertTriangle,
    paragraphs: [
      "Kroo Production shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from the use of this website or reliance on any information provided herein.",
      "Use of this website is entirely at the visitor's own risk.",
    ],
  },

  {
    number: "07",
    title: "Copyright Notice",
    icon: Gavel,
    paragraphs: [
      "All website content including text, branding, logos, graphics, illustrations, photographs, videos, motion graphics, website design, icons and other creative assets are the intellectual property of Kroo Production unless otherwise stated.",
      "Any unauthorized reproduction, redistribution, modification, commercial use, republication or creation of derivative works is strictly prohibited without prior written permission.",
    ],
  },

  {
    number: "08",
    title: "Changes to This Disclaimer",
    icon: RefreshCcw,
    paragraphs: [
      "Kroo Production reserves the right to update or modify this Disclaimer at any time without prior notice.",
      "The latest version will always be available on this page together with the revised Effective Date.",
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
export default function DisclaimerContent() {
  return (
    <LegalPageLayout
      breadcrumbLabel="Disclaimer"
      heading="Disclaimer"
      effectiveDate="08 July 2026"
      intro="Welcome to Kroo Production. The information available on this website is provided for general informational and promotional purposes only. By accessing or using this website, you acknowledge and agree to the terms outlined in this Disclaimer."
      sections={sections}
      contactNumber="09"
      contactTitle="Contact Us"
      contactDetails={contactDetails}
      contactNote="If you have any questions regarding this Disclaimer or the information presented on this website, please contact Kroo Production using the details below."
    />
  );
}