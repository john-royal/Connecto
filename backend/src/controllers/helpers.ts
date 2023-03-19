import { type RequestHandler } from 'express'
import multer from 'multer'
import multerS3 from 'multer-s3'
import Geocode from 'react-geocode'
import { s3 } from '../lib/aws'

Geocode.setApiKey(process.env.GOOGLE_API_KEY)

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

export const geocode: RequestHandler = async (req, res) => {
  try {
    const lat = req.query.lat as string | undefined
    const lng = req.query.lng as string | undefined

    if (lat && lng) {
      const response = await Geocode.fromLatLng(String(lat), String(lng))
      const address = response.results[0].formatted_address
      res.send({ address })
    } else {
      res.status(400).send({ error: 'Missing latitude or longitude parameter' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).send({ error: 'Server error' })
  }
}

export const upload: RequestHandler[] = [
  uploader.single('file'),
  (req, res) => {
    res.status(201).send({
      attachmentUrl: (req.file as Express.MulterS3.File).location
    })
  }
]
