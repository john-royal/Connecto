import Geocode from 'react-geocode'
import { type RequestHandler } from 'express'

Geocode.setApiKey(process.env.GOOGLE_API_KEY)

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
