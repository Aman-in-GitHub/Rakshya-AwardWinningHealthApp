import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';

const registerLocationUpdates = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const geolocationOptions = {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 1000,
        fastestInterval: 10000,
        showLocationDialog: true,
      };

      const watchId = Geolocation.watchPosition(
        async position => {
          const {latitude, longitude} = position.coords;

          try {
            const locationData = JSON.stringify({latitude, longitude});

            await AsyncStorage.setItem('storedLocation', locationData);
          } catch (error) {
            console.error('Error storing location data:', error);
          }
        },

        error => {
          console.error('Location Error:', error);
        },
        geolocationOptions,
      );

      resolve(watchId);
    } catch (error) {
      reject(error);
    }
  });
};

const registerBackgroundService = async () => {
  try {
    const watchId = await registerLocationUpdates();
  } catch (error) {
    console.error('Background Service Error:', error);
  }
};

export default registerBackgroundService;
