import { createHash } from 'crypto'
import { type RequestHandler } from 'express'
import multer from 'multer'
import multerS3 from 'multer-s3'
import { s3 } from '../lib/aws'
import prisma from '../lib/prisma'

const uploader = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname })
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + '-' + file.originalname)
    }
  })
})

export const avatar: RequestHandler = async (req, res) => {
  const id = Number(req.params.id)
  const { email } = await prisma.user.findUniqueOrThrow({ where: { id } })
  const hash = createHash('md5').update(email).digest('hex')
  res.redirect(`https://www.gravatar.com/avatar/${hash}?d=404`)
}

export const upload: RequestHandler[] = [
  uploader.single('file'),
  (req, res) => {
    res.status(201).send({
      attachmentUrl: (req.file as Express.MulterS3.File).location
    })
  }
]
