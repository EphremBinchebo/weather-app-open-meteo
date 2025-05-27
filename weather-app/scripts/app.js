
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('weather-form');
  const cityInput = document.getElementById('city');
  const resultDiv = document.getElementById('result');
  const forecastDiv = document.getElementById('forecast');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cityName = cityInput.value.trim();

    resultDiv.innerHTML = "";
    forecastDiv.innerHTML = "";

    if (!cityName) {
      resultDiv.textContent = "❗ Please enter a city name.";
      return;
    }

    try {
      // Step 1: Get geocoding data
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`);
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        resultDiv.textContent = "❗ City not found.";
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Step 2: Fetch 5-day weather forecast
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,windspeed_10m_max&timezone=auto`
      );
      const weatherData = await weatherResponse.json();

      if (!weatherData.daily || !weatherData.daily.time) {
        resultDiv.textContent = "❗ Weather data unavailable.";
        return;
      }

      resultDiv.innerHTML = `🌤️ <strong>5-Day Forecast for ${name}, ${country}</strong>`;

      const { time, temperature_2m_max, temperature_2m_min, windspeed_10m_max } = weatherData.daily;

      for (let i = 0; i < time.length; i++) {
        const dayCard = document.createElement('div');
        dayCard.className = 'forecast-card';
        dayCard.innerHTML = `
          <strong>${new Date(time[i]).toDateString()}</strong><br/>
          🌡️ Max: ${temperature_2m_max[i]}°C<br/>
          🌡️ Min: ${temperature_2m_min[i]}°C<br/>
          💨 Wind: ${windspeed_10m_max[i]} km/h
        `;
        forecastDiv.appendChild(dayCard);
      }

    } catch (error) {
      console.error("Error:", error);
      resultDiv.textContent = "❗ An error occurred. Please try again.";
    }
  });
});


/**
 * Fetches and displays a 5-day weather forecast using the Open-Meteo API.
 *
 * @param {string} cityName - The name of the city to get the forecast for.
 * @returns {Promise<void>}
 */
async function getFiveDayForecast(cityName) {
  try {
    // Step 1: Geocode the city name
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      console.log("❗ City not found.");
      return;
    }

    const { latitude, longitude, timezone } = geoData.results[0];

    // Step 2: Fetch 5-day forecast
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=${timezone}`
    );
    const weatherData = await weatherResponse.json();

    const days = weatherData.daily.time;
    const maxTemps = weatherData.daily.temperature_2m_max;
    const minTemps = weatherData.daily.temperature_2m_min;
    const codes = weatherData.daily.weathercode;

    // Step 3: Display forecast
    console.log(`📅 5-Day Forecast for ${cityName}:\n`);

    for (let i = 0; i < 5; i++) {
      console.log(
        `🗓️ ${days[i]}:\n🌡️ Max: ${maxTemps[i]}°C, Min: ${minTemps[i]}°C\n🌦️ Code: ${codes[i]}\n`
      );
    }
  } catch (error) {
    console.error("❗ Error fetching forecast:", error);
  }



/**
 * Fetches weather data from Open-Meteo API and caches it for 1 hour.
 *
 * @param {string} cityName - The name of the city to fetch weather data for.
 * @returns {Promise<object>} - A promise that resolves to current weather data or an error object.
 */
async function getWeatherWithCache(cityName) {
  const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  const cacheKey = cityName.toLowerCase();

  // Check cache
  const cached = weatherCache[cacheKey];
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    console.log('Returning cached data for:', cityName);
    return cached.data;
  }

  try {
    // Step 1: Get geolocation
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('City not found.');
    }

    const { latitude, longitude } = geoData.results[0];

    // Step 2: Get weather data
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const weatherData = await weatherResponse.json();

    if (!weatherData.current_weather) {
      throw new Error('Weather data unavailable.');
    }

    // Cache and return result
    const result = {
      city: geoData.results[0].name,
      temperature: weatherData.current_weather.temperature,
      windspeed: weatherData.current_weather.windspeed,
      timestamp: new Date().toISOString()
    };

    weatherCache[cacheKey] = {
      timestamp: now,
      data: result
    };

    return result;

  } catch (error) {
    console.error('Weather fetch error:', error);
    throw error;
  }}};
