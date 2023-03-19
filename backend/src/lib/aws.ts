import { S3Client } from '@aws-sdk/client-s3'
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import dotenv from 'dotenv'

dotenv.config()

const configuration = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: process.env.AWS_REGION
}

export const ses = new SESClient(configuration)

export const s3 = new S3Client(configuration)

export async function sendEmail({
  to: destination,
  subject,
  body
}: {
  to: string[]
  subject: string
  body: string
}): Promise<void> {
  const emailParams = {
    Source: process.env.AWS_SES_SENDER,
    Destination: {
      ToAddresses: destination
    },
    Message: {
      Subject: {
        Data: subject
      },
      Body: {
        Text: {
          Data: body
        }
      }
    }
  }
  const command = new SendEmailCommand(emailParams)
  console.dir(emailParams, { depth: null })
  const data = await ses.send(command)
  console.dir(data, { depth: null })
}
