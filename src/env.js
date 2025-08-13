import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).optional().default('development'),
    RUNTIME: z.enum(['edge', 'nodejs', 'node']).transform(val => val === 'node' ? 'nodejs' : val).optional(),
  },

  client: {
    NEXT_PUBLIC_CONTACT_LINK: z.string().url().optional(),
    NEXT_PUBLIC_REPO_LINK: z.string().url().optional(),
    NEXT_PUBLIC_APP_VERSION: z.string().optional().default('2.0 beta'),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    RUNTIME: process.env.RUNTIME,
    NEXT_PUBLIC_CONTACT_LINK: process.env.NEXT_PUBLIC_CONTACT_LINK,
    NEXT_PUBLIC_REPO_LINK: process.env.NEXT_PUBLIC_REPO_LINK,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '2.0 beta',
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
}) 