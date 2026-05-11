const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999',
  allowedImageHosts: (process.env.NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
  revalidationSecret: process.env.REVALIDATION_SECRET ?? 'change-me-revalidate-secret',
};

export default env;
