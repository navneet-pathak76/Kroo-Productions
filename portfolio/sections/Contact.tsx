"use client";

import { ArrowUpRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Reveal } from "@/components/Reveal";
import { useMagnetic } from "@/hooks/useMagnetic";
import { contactFormSchema } from "@/lib/validation";
import type { ContactApiResponse } from "@/types";

type Status = "idle" | "submitting" | "success" | "error";

const CONTACT_LINKS = [
  { label: "WhatsApp", href: "https://wa.me/910000000000" },
  { label: "Instagram", href: "https://instagram.com/" },
  { label: "Email", href: "mailto:hello@navneetpathak.com" },
];

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState<string>("");
  const buttonRef = useMagnetic<HTMLButtonElement>();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const values = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
      company: String(formData.get("company") ?? ""), // honeypot
    };

    const parsed = contactFormSchema.safeParse(values);
    if (!parsed.success) {
      setStatus("error");
      setFeedback(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    setStatus("submitting");
    setFeedback("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data: ContactApiResponse = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setFeedback(data.message || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setFeedback(data.message);
      e.currentTarget.reset();
    } catch {
      setStatus("error");
      setFeedback("Network error. Please try again.");
    }
  }

  return (
    <section id="contact" className="section-pad text-center">
      <div className="wrap">
        <p className="eyebrow justify-center">Contact</p>
        <Reveal>
          <h2 className="font-display text-[clamp(38px,6vw,90px)] max-w-[900px] mx-auto mt-4">
            Let&rsquo;s create something
            <br />
            exceptional.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-muted max-w-[480px] mx-auto mt-6">
            Tell me about the project, the platform, and the deadline —
            I&rsquo;ll reply within a day with next steps.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <form
            onSubmit={handleSubmit}
            className="max-w-[640px] mx-auto mt-14 text-left flex flex-col gap-4"
            noValidate
          >
            {/* Honeypot — hidden from real visitors via CSS, not display:none, so bots that
                skip hidden fields still fill it. Any value here silently short-circuits the API. */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="company">Company</label>
              <input type="text" id="company" name="company" tabIndex={-1} autoComplete="off" />
            </div>

            <label className="sr-only" htmlFor="name">Your name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              required
              className="w-full bg-transparent border-0 border-b border-line py-4 px-1 text-[15px] placeholder:text-muted focus:outline-none focus:border-accent"
            />

            <label className="sr-only" htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              required
              className="w-full bg-transparent border-0 border-b border-line py-4 px-1 text-[15px] placeholder:text-muted focus:outline-none focus:border-accent"
            />

            <label className="sr-only" htmlFor="message">Tell me about your project</label>
            <textarea
              id="message"
              name="message"
              rows={3}
              placeholder="Tell me about your project"
              required
              className="w-full bg-transparent border-0 border-b border-line py-4 px-1 text-[15px] placeholder:text-muted focus:outline-none focus:border-accent resize-none"
            />

            <button
              ref={buttonRef}
              type="submit"
              disabled={status === "submitting"}
              className="btn btn-solid self-start mt-3.5 disabled:opacity-60"
            >
              {status === "submitting" ? "Sending..." : "Send Message"}
              <ArrowUpRight size={16} />
            </button>

            <p
              role="status"
              aria-live="polite"
              className={
                status === "error"
                  ? "text-sm text-red-400"
                  : status === "success"
                    ? "text-sm text-accent"
                    : "text-sm text-transparent"
              }
            >
              {feedback || "placeholder"}
            </p>
          </form>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="flex justify-center gap-9 mt-6 flex-wrap">
            {CONTACT_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px] text-muted tracking-wide hover:text-accent transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
