"use client";

import {
  AlertCircle,
  Ban,
  Briefcase,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  Gavel,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Shield,
} from "lucide-react";

import {
  LegalPageLayout,
  type LegalContactDetail,
  type LegalSection,
} from "@/components/legal/legal-page-layout";

const sections: LegalSection[] = [
  {
    number: "01",
    title: "About Us",
    icon: Briefcase,
    paragraphs: [
      "Kroo Production is a creative production house providing professional creative services including commercial films, brand films, corporate videos, motion graphics, photography, post-production, social media content, drone cinematography, and related creative solutions.",
    ],
  },

  {
    number: "02",
    title: "Website Usage",
    icon: Globe,
    paragraphs: [
      "By accessing this website you agree to use it only for lawful purposes.",
    ],
    lists: [
      {
        heading: "You must not:",
        items: [
          "Copy website content without permission.",
          "Attempt unauthorized access.",
          "Upload malware or malicious files.",
          "Disrupt website performance.",
          "Use the website for illegal purposes.",
        ],
      },
    ],
  },

  {
    number: "03",
    title: "Intellectual Property",
    icon: Shield,
    paragraphs: [
      "Unless otherwise stated, all content including videos, photographs, graphics, branding, website design, logos, motion graphics, illustrations and text remain the exclusive intellectual property of Kroo Production.",
      "No material may be copied, reproduced, modified or distributed without prior written permission.",
    ],
  },

  {
    number: "04",
    title: "Project Quotations & Payments",
    icon: CreditCard,
    paragraphs: [
      "Project quotations remain valid only for the period specified in the proposal.",
      "Projects begin only after quotation approval, receipt of advance payment (where applicable), and all required project assets.",
    ],
  },
    {
    number: "05",
    title: "Project Delivery",
    icon: FileText,
    paragraphs: [
      "Delivery timelines depend on project complexity, client communication, and availability of project assets.",
      "Delays resulting from late approvals, incomplete information, or delayed client feedback may extend delivery schedules.",
    ],
  },

  {
    number: "06",
    title: "Client Responsibilities",
    icon: Briefcase,
    paragraphs: [
      "Clients are responsible for providing complete and accurate information required for successful project execution.",
    ],
    lists: [
      {
        heading: "Clients should provide:",
        items: [
          "Accurate project requirements.",
          "Required media and assets.",
          "Timely approvals.",
          "Constructive feedback.",
          "Authorized brand materials.",
        ],
      },
    ],
  },

  {
    number: "07",
    title: "Revisions",
    icon: RefreshCcw,
    paragraphs: [
      "Revision limits, if applicable, are communicated during project confirmation.",
      "Additional revisions outside the agreed scope may incur additional charges.",
    ],
  },

  {
    number: "08",
    title: "Cancellation",
    icon: Ban,
    paragraphs: [
      "Projects cancelled after commencement may be billed according to work completed.",
      "Advance payments already allocated toward project execution may be non-refundable.",
    ],
  },

  {
    number: "09",
    title: "Limitation of Liability",
    icon: AlertCircle,
    paragraphs: [
      "Kroo Production shall not be liable for indirect, incidental, special, or consequential damages arising from the use of this website or our services.",
      "Our maximum liability shall never exceed the amount paid by the client for the specific project in question.",
    ],
  },

  {
    number: "10",
    title: "Third-Party Platforms",
    icon: ExternalLink,
    paragraphs: [
      "Our website may contain links to third-party platforms including Instagram, YouTube, LinkedIn, Google, AWS, and other external services.",
      "Kroo Production is not responsible for the availability, content, or privacy practices of external websites.",
    ],
  },

  {
    number: "11",
    title: "Changes to These Terms",
    icon: RefreshCcw,
    paragraphs: [
      "We reserve the right to modify these Terms of Service at any time.",
      "The latest version will always be published on this page together with the updated effective date.",
    ],
  },

  {
    number: "12",
    title: "Governing Law",
    icon: Gavel,
    paragraphs: [
      "These Terms of Service shall be governed by the laws of India.",
      "Any dispute arising from these terms or the use of our services shall fall under the exclusive jurisdiction of the competent courts located in Kolkata, West Bengal.",
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
export default function TermsOfServiceContent() {
  return (
    <LegalPageLayout
      breadcrumbLabel="Terms of Service"
      heading="Terms of Service"
      effectiveDate="08 July 2026"
      intro="Welcome to Kroo Production. By accessing or using our website or engaging with our creative services, you agree to these Terms of Service. Please read them carefully before using our website or working with us."
      sections={sections}
      contactNumber="13"
      contactTitle="Contact Us"
      contactDetails={contactDetails}
      contactNote="If you have any questions regarding these Terms of Service, please contact us using the information below."
    />
  );
}