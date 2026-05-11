import { apiFetch } from '@/lib/api-client';

export type CreateLeadInput = {
  name: string;
  whatsapp: string;
  email?: string;
  city?: string;
  state?: string;
  desiredQuantity: number;
  message?: string;
  desiredDeadline?: string;
  personalizationType?: string;
  productId?: string;
  consentAccepted: boolean;
  honeypot?: string;
  source?: string;
  pageUrl?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
};

export type CreateLeadResponse = {
  success: boolean;
  leadId: string;
};

export async function createLead(input: CreateLeadInput): Promise<CreateLeadResponse> {
  return apiFetch<CreateLeadResponse>('/public/leads', {
    method: 'POST',
    body: input,
    cache: 'no-store',
  });
}
