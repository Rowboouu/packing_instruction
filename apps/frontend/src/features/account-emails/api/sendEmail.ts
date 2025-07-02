import { api } from '@/lib/axios-client';
import { MutationConfig } from '@/lib/react-query';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';

export const itemSchema = z.object({
  item_name: z.string(),
  item_id: z.string(),
  item_size: z.number().default(0),
});

export type itemInput = z.infer<typeof itemSchema>;

export const sendEmailSchema = z.object({
  to: z
    .string({ message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  from: z
    .string({ message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  cc: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) return true; // pass validation if cc is not provided
        const emails = value.split(',').map((email) => email.trim());
        return emails.every((email) => /\S+@\S+\.\S+/.test(email));
      },
      {
        message:
          'CC field must contain valid email addresses separated by commas',
      },
    ),
  subject: z.string({ message: 'Subject is required' }),
  body: z.string({ message: 'Message is required' }),
  items: z.array(itemSchema, { message: 'Items are required' }).refine(
    (items) => {
      const totalSizeInMB = items.reduce(
        (total, item) => total + item.item_size,
        0,
      );
      console.log({ totalSizeInMB });
      return totalSizeInMB <= 15;
    },
    { message: 'Total size of items must not exceed 15MB' },
  ),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;

export async function sendEmail(data: SendEmailInput) {
  return api.post('/share-point/email', data);
}

type MutationFnType = typeof sendEmail;

export function useSendEmail(options?: MutationConfig<MutationFnType>) {
  return useMutation({
    ...options,
    onSuccess: () => {
      toast.success('Sending email');
    },
    mutationFn: sendEmail,
  });
}
