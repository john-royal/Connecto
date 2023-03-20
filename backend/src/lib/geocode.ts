import 'isomorphic-unfetch'
import Geocode from 'react-geocode'

Geocode.setApiKey(process.env.GOOGLE_MAPS_API_KEY)

export interface Coordinates {
  latitude: string | number
  longitude: string | number
}

export default async function getAddressFromCoordinates({
  latitude,
  longitude
}: Coordinates): Promise<string> {
  const response = await Geocode.fromLatLng(String(latitude), String(longitude))
  return response.results[0].formatted_address
}
