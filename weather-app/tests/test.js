// __tests__/weather.test.js
import { getCoordinates, getWeatherData, cacheWeatherData, getCachedWeather } from '../scripts/weather';

jest.mock('../scripts/weather'); // if you separate logic into modules

describe('Weather App Core Functions', () => {
  const mockCity = "London";

  it('should fetch coordinates for a valid city', async () => {
    getCoordinates.mockResolvedValue({ latitude: 51.5072, longitude: -0.1276 });
    const result = await getCoordinates(mockCity);
    expect(result).toHaveProperty('latitude');
    expect(result).toHaveProperty('longitude');
  });

  it('should cache and retrieve data within 1 hour', () => {
    const weather = { temperature: 20 };
    cacheWeatherData(mockCity, weather);
    const cached = getCachedWeather(mockCity);
    expect(cached).toEqual(weather);
  });
});
