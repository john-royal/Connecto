import '../../App.css'
import { useLoaderData } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import MessageContainer from '../../components/MessageContainer'
import Header from '../../components/Header'
import { useEffect, useState } from 'react'

interface UserLocation {
  city?: string;
  address?: string;
}

interface Position {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

function ChatView() {
  const { thread } = useLoaderData() as { thread: { id: number } }
  const [userLocation, setUserLocation] = useState<UserLocation>({});

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        if (navigator.geolocation) {
          const position = await new Promise<Position>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          const { latitude, longitude } = position.coords;

          // Make a request to the API endpoint to get the address based on the latitude and longitude
          const response = await fetch(`/api/location?lat=${latitude}&lng=${longitude}`);
          const { address } = await response.json();

          setUserLocation({ address });
        }
      } catch (error) {
        console.error(error);
      }
    };

    getUserLocation();
  }, []);

  return (
    <>
      <DashboardLayout>
        <Header leaveChat={true} logoLink="/" />
        {/* <div>
          <p>Your address: {userLocation.address}</p>
        </div> */}
        <div className="chatContainer">
          <MessageContainer threadId={thread.id} />
        </div>
      </DashboardLayout>
    </>
  )
}

export default ChatView
