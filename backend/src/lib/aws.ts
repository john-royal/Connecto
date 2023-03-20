import { LexRuntimeV2Client } from '@aws-sdk/client-lex-runtime-v2'
import { S3Client } from '@aws-sdk/client-s3'
import { SESClient } from '@aws-sdk/client-ses'
import dotenv from 'dotenv'

dotenv.config()

const configuration = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: process.env.AWS_REGION
}

export const lex = new LexRuntimeV2Client(configuration)
export const ses = new SESClient(configuration)
export const s3 = new S3Client(configuration)
