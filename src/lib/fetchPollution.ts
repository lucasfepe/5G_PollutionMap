export async function getPollutionData() {
  try {
      // Cache expiration settings (modifiable)
      const CACHE_DURATION = {
          ONE_MINUTE: 60 * 1000, // 1 minute in milliseconds
          ONE_HOUR: 60 * 60 * 1000, // 1 hour in milliseconds
          ONE_DAY: 24 * 60 * 60 * 1000, // 1 day in milliseconds
          NEVER: Infinity, // Never invalidate
      };

      const cacheExpiration = CACHE_DURATION.ONE_DAY; // Default: 1 day

      // Check if data exists in local storage
      const cachedData = localStorage.getItem('pollutionData');
      if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const now = Date.now();

          // Check if the cached data is still valid
          if (now - timestamp < cacheExpiration) {
              console.log('Using cached data from local storage');
              return data; // Return cached data
          } else {
              console.log('Cached data expired, fetching new data');
          }
      }

      // Fetch data from the API
      const response = await fetch('/api/pollution'); // Calls your Next.js API
      if (!response.ok) {
          throw new Error(`Failed to fetch pollution data: ${response.statusText}`);
      }

      const data = await response.json();

      // Save the data to local storage with a timestamp
      localStorage.setItem(
          'pollutionData',
          JSON.stringify({ data, timestamp: Date.now() })
      );
      console.log('Fetched data from API and saved to local storage');

      return data; // Return the fetched data
  } catch (error) {
      console.error('Error fetching pollution data:', error);
      return []; // Return an empty array in case of an error
  }
}