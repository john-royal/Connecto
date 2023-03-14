import AWS from 'aws-sdk'
import dotenv from 'dotenv'

dotenv.config()

AWS.config.update({
  credentials: new AWS.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }),
  region: process.env.AWS_REGION
})

const ses = new AWS.SES()

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
  console.dir(emailParams, { depth: null })
  const data = await new Promise((resolve, reject) => {
    ses.sendEmail(emailParams, (err, data) => {
      if (err != null) reject(err)
      else resolve(data)
    })
  })
  console.dir(data, { depth: null })
}
