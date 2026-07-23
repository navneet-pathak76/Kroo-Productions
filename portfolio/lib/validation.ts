import { z } from "zod";

/**
 * Shared contact form schema. Used by the client form for inline validation
 * and by the API route as the source of truth before anything touches SES.
 *
 * The `company` field is a honeypot: real visitors never see or fill it,
 * so a non-empty value is treated as a bot submission.
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(80, "That name looks too long."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(120, "That email looks too long."),
  message: z
    .string()
    .trim()
    .min(10, "Tell me a little more about the project.")
    .max(2000, "Keep the message under 2000 characters."),
  company: z.string().max(0, "Spam detected.").optional().default(""),
});

export type ContactFormSchema = z.infer<typeof contactFormSchema>;
