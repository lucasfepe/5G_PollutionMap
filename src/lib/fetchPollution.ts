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

        // Check if interpolated data exists in local storage
        const cachedInterpolatedData = localStorage.getItem('interpolatedPollutionData');
        if (cachedInterpolatedData) {
            const { data, timestamp } = JSON.parse(cachedInterpolatedData);
            const now = Date.now();

            // Check if the cached interpolated data is still valid
            if (now - timestamp < cacheExpiration) {
                console.log('Using cached interpolated data from local storage');
                return data; // Return cached interpolated data
            } else {
                console.log('Cached interpolated data expired');
            }
        }

        // Check if original data exists in local storage
        const cachedData = localStorage.getItem('pollutionData');
        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            const now = Date.now();

            // Check if the cached data is still valid
            if (now - timestamp < cacheExpiration) {
                console.log('Using cached original data to generate interpolated data');
                const interpolatedData = generateInterpolatedData(data);

                // Save the interpolated data to local storage
                localStorage.setItem(
                    'interpolatedPollutionData',
                    JSON.stringify({ data: interpolatedData, timestamp: Date.now() })
                );

                return interpolatedData; // Return the newly generated interpolated data
            } else {
                console.log('Cached original data expired');
            }
        }

        // Fetch data from the API
        const response = await fetch('/api/pollution'); // Calls your Next.js API
        if (!response.ok) {
            throw new Error(`Failed to fetch pollution data: ${response.statusText}`);
        }

        const data = await response.json();

        // Generate interpolated data
        const interpolatedData = generateInterpolatedData(data);

        // Save the original and interpolated data to local storage
        localStorage.setItem(
            'pollutionData',
            JSON.stringify({ data, timestamp: Date.now() })
        );
        localStorage.setItem(
            'interpolatedPollutionData',
            JSON.stringify({ data: interpolatedData, timestamp: Date.now() })
        );
        console.log('Fetched data from API, generated interpolated data, and saved to local storage');

        return interpolatedData; // Return the interpolated data
    } catch (error) {
        console.error('Error fetching pollution data:', error);
        return []; // Return an empty array in case of an error
    }
}

// Function to generate interpolated data
interface PollutionDataPoint {
    name: string;
    lat: number;
    lon: number;
    pollutant: string;
    value: number;
    unit: string;
}

function generateInterpolatedData(data: PollutionDataPoint[]): PollutionDataPoint[] {
    const interpolatedData: PollutionDataPoint[] = [];

    // Group data by unit and pollutant
    const groupedByUnitAndPollutant: Record<string, PollutionDataPoint[]> = data.reduce((groups, point) => {
        const key = `${point.unit}-${point.pollutant}`;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(point);
        return groups;
    }, {} as Record<string, PollutionDataPoint[]>);

    // Interpolate data for each group
    Object.keys(groupedByUnitAndPollutant).forEach((key) => {
        const groupData = groupedByUnitAndPollutant[key];

        for (let i = 0; i < groupData.length - 1; i++) {
            const currentPoint = groupData[i];
            const nextPoint = groupData[i + 1];

            // Add the current point to the interpolated data
            interpolatedData.push(currentPoint);

            // Generate 9 interpolated points between the current and next point
            for (let j = 1; j <= 9; j++) {
                const fraction = j / 10;
                const interpolatedPoint: PollutionDataPoint = {
                    name: `${currentPoint.name}-interpolated-${j}`,
                    lat: currentPoint.lat + fraction * (nextPoint.lat - currentPoint.lat),
                    lon: currentPoint.lon + fraction * (nextPoint.lon - currentPoint.lon),
                    pollutant: currentPoint.pollutant,
                    value: currentPoint.value + fraction * (nextPoint.value - currentPoint.value),
                    unit: currentPoint.unit,
                };
                interpolatedData.push(interpolatedPoint);
            }
        }

        // Add the last point of the group to the interpolated data
        interpolatedData.push(groupData[groupData.length - 1]);
    });

    return interpolatedData;
}