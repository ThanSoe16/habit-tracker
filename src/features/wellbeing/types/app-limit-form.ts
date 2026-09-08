import { z } from 'zod';

export const CUSTOM_APP_OPTION = '__custom_app__';

export const appLimitFormSchema = z
  .object({
    appIdentifier: z.string().min(1, 'Choose an app.'),
    customAppName: z.string().trim().max(80, 'Use 80 characters or fewer.'),
    dailyLimitSeconds: z.number().int().min(900).max(14400),
    warningBeforeSeconds: z.number().refine((value) => [300, 600, 900].includes(value), {
      message: 'Choose a warning time.',
    }),
  })
  .superRefine((values, context) => {
    if (values.appIdentifier === CUSTOM_APP_OPTION && !values.customAppName) {
      context.addIssue({ code: 'custom', path: ['customAppName'], message: 'Enter an app name.' });
    }
  });

export type AppLimitFormValues = z.infer<typeof appLimitFormSchema>;
