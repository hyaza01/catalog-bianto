'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createLead } from '@/features/leads/services/leads.service';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

const leadFormSchema = z.object({
  name: z.string().min(2, 'Informe seu nome.'),
  whatsapp: z.string().min(10, 'Informe um WhatsApp valido.'),
  email: z.string().email('E-mail invalido.').optional().or(z.literal('')),
  desiredQuantity: z.number().min(1, 'Quantidade minima: 1.'),
  message: z.string().max(1000).optional(),
  consentAccepted: z.boolean().refine((value) => value, 'Voce precisa aceitar os termos.'),
  honeypot: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

type LeadFormProps = {
  productId?: string;
  source?: string;
};

export function LeadForm({ productId, source = 'site' }: LeadFormProps): React.JSX.Element {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      desiredQuantity: 10,
      consentAccepted: false,
      honeypot: '',
    },
  });

  const onSubmit = async (values: LeadFormValues): Promise<void> => {
    try {
      setSubmitError(null);

      await createLead({
        ...values,
        email: values.email || undefined,
        productId,
        source,
        pageUrl: window.location.href,
        referrer: document.referrer,
      });

      router.push('/obrigado');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Nao foi possivel enviar agora.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--neutral-800)]">Nome</label>
        <Input {...register('name')} placeholder="Seu nome" />
        {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--neutral-800)]">WhatsApp</label>
        <Input {...register('whatsapp')} placeholder="(11) 99999-9999" />
        {errors.whatsapp ? (
          <p className="mt-1 text-xs text-rose-600">{errors.whatsapp.message}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--neutral-800)]">E-mail (opcional)</label>
        <Input {...register('email')} type="email" placeholder="voce@empresa.com" />
        {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--neutral-800)]">Quantidade desejada</label>
        <Input {...register('desiredQuantity', { valueAsNumber: true })} type="number" min={1} />
        {errors.desiredQuantity ? (
          <p className="mt-1 text-xs text-rose-600">{errors.desiredQuantity.message}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--neutral-800)]">Observacoes</label>
        <Textarea {...register('message')} placeholder="Conte o que voce precisa personalizar..." />
      </div>

      <div className="sr-only" aria-hidden>
        <Input {...register('honeypot')} tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-2 text-sm text-[var(--neutral-700)]">
        <Checkbox {...register('consentAccepted')} />
        <span>Concordo com o uso dos meus dados para contato comercial e orcamento.</span>
      </label>
      {errors.consentAccepted ? (
        <p className="text-xs text-rose-600">{errors.consentAccepted.message}</p>
      ) : null}

      {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

      <Button type="submit" disabled={isSubmitting} fullWidth>
        {isSubmitting ? 'Enviando...' : 'Solicitar orcamento'}
      </Button>
    </form>
  );
}

