import axios from 'axios';

const OPEN_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

const fetchFromOpenMeteo = async (latitude, longitude) => {
  const response = await axios.get(OPEN_METEO_URL, {
    params: {
      latitude,
      longitude,
      current: 'temperature_2m,relative_humidity_2m',
      timezone: 'auto',
    },
  });

  const current = response?.data?.current || {};
  return {
    temperature: current?.temperature_2m ?? null,
    humidity: current?.relative_humidity_2m ?? null,
  };
};

export const fetchWeatherData = async (latitude, longitude) => {
  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    // Fallback provider that requires no API key.
    return fetchFromOpenMeteo(latitude, longitude);
  }

  try {
    const response = await axios.get(OPEN_WEATHER_URL, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: apiKey,
        units: 'metric',
      },
    });

    const { main } = response.data;
    return {
      temperature: main?.temp ?? null,
      humidity: main?.humidity ?? null,
    };
  } catch (error) {
    const statusCode = error?.response?.status;
    if (statusCode === 401) {
      return fetchFromOpenMeteo(latitude, longitude);
    }

    // Final fallback for transient provider outages.
    try {
      return fetchFromOpenMeteo(latitude, longitude);
    } catch {
      throw new Error('Unable to fetch live weather right now. Model predictions can still run from your form inputs.');
    }
  }
};
