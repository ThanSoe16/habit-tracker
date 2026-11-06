import { z } from 'zod';
import { currencyCodeSchema } from '@/features/budget/types';

const dateSchema = z.string().date('Enter a valid date.');
const priceSchema = z.coerce.number().finite().positive('Enter a price greater than zero.');

export const goldFormSchema = z
  .object({
    kyat: z.coerce
      .number()
      .int()
      .min(0)
      .max(Number.MAX_SAFE_INTEGER / 128),
    pae: z.coerce.number().int().min(0).max(15),
    yway: z.coerce.number().int().min(0).max(7),
    buyPrice: priceSchema,
    currency: currencyCodeSchema,
    purchaseDate: dateSchema,
    note: z.string().trim(),
    status: z.enum(['holding', 'sold']),
    sellPrice: priceSchema.optional(),
    soldDate: dateSchema.optional(),
  })
  .superRefine((values, context) => {
    if (values.kyat * 128 + values.pae * 8 + values.yway <= 0) {
      context.addIssue({
        code: 'custom',
        path: ['kyat'],
        message: 'Enter a gold weight greater than zero.',
      });
    }
    if (values.status === 'sold') {
      if (values.sellPrice === undefined) {
        context.addIssue({
          code: 'custom',
          path: ['sellPrice'],
          message: 'Enter the selling price.',
        });
      }
      if (!values.soldDate || values.soldDate < values.purchaseDate) {
        context.addIssue({
          code: 'custom',
          path: ['soldDate'],
          message: 'Sale date must be on or after the purchase date.',
        });
      }
    }
  });

export type GoldFormValues = z.infer<typeof goldFormSchema>;
