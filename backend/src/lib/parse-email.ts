import { simpleParser, type AddressObject, type ParsedMail } from 'mailparser'
import replyParser from 'node-email-reply-parser'

export interface ParseEmailResult {
  sender: string
  recipient: string
  date: Date
  subject: string
  text: string
}

export async function parseEmail(message: string): Promise<ParseEmailResult> {
  const email: ParsedMail = await simpleParser(message)
  return {
    sender: email.from?.value[0].address ?? '',
    recipient: (email.to as AddressObject)?.value[0].address ?? '',
    date: email.date ?? new Date(),
    subject: email.subject ?? '',
    text: replyParser(email.text ?? '', true).trim()
  }
}
