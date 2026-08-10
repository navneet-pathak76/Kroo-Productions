import { SESv2Client } from "@aws-sdk/client-sesv2";

type SesRuntimeConfig = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  fromEmail: string;
  toEmail: string;
};

export function getSesRuntimeConfig(): SesRuntimeConfig | null {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const fromEmail = process.env.SES_FROM_EMAIL;
  const toEmail = process.env.SES_TO_EMAIL;

  if (!region || !accessKeyId || !secretAccessKey || !fromEmail || !toEmail) {
    return null;
  }

  return {
    region,
    accessKeyId,
    secretAccessKey,
    fromEmail,
    toEmail,
  };
}

let cachedClient: SESv2Client | null = null;

export function getSesClient(): SESv2Client | null {
  const config = getSesRuntimeConfig();
  if (!config) return null;

  if (!cachedClient) {
    cachedClient = new SESv2Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return cachedClient;
}
