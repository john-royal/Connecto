import 'express'
import 'express-session'
import type { User } from '@prisma/client'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number
      SESSION_SECRET: string
      JWT_SECRET: string
      CLIENT_URL: string
      TEXTBELT_API_KEY: string
      AWS_ACCESS_KEY_ID: string
      AWS_SECRET_ACCESS_KEY: string
      AWS_REGION: string
      AWS_SES_SENDER: string
      ADMIN_EMAIL: string
    }
  }

  namespace Express {
    interface Request {
      user: User | null
      logIn: (user: User) => Promise<void>
      logOut: () => Promise<void>
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userId: number
  }
}

export {}
