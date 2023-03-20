import { type RequestHandler } from 'express'
import multer from 'multer'
import multerS3 from 'multer-s3'
import { s3 } from '../lib/aws'

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

export const upload: RequestHandler[] = [
  uploader.single('file'),
  (req, res) => {
    res.status(201).send({
      attachmentUrl: (req.file as Express.MulterS3.File).location
    })
  }
]
