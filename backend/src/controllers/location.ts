import axios from 'axios'
import { type RequestHandler } from 'express'
import Geocode from 'react-geocode'

Geocode.setApiKey(process.env.GOOGLE_MAPS_API_KEY)

interface Coordinates {
  latitude: string
  longitude: string
}

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

  const response = await Geocode.fromLatLng(latitude, longitude)
  const address = response.results[0].formatted_address
  res.send({ address })
}
