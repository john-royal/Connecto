import axios from 'axios'
import { type RequestHandler } from 'express'
import getAddressFromCoordinates, { type Coordinates } from '../lib/geocode'

type CoordinatesRequestHandler = RequestHandler<any, any, any, Coordinates>

export const map: CoordinatesRequestHandler = async (req, res) => {
  const { latitude, longitude } = req.query

  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=16&size=200x200&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
    {
      responseType: 'stream'
    }
  )
  res.setHeader('Content-Type', response.headers['content-type'])
  response.data.pipe(res)
}

export const geocode: CoordinatesRequestHandler = async (req, res) => {
  const { latitude, longitude } = req.query
  const address = await getAddressFromCoordinates({ latitude, longitude })
  res.send({ address })
}
