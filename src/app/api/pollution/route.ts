export async function GET() {
    try {
        // Step 1: Get monitoring locations near Calgary
        const locationsResponse = await fetch(
            "https://api.openaq.org/v3/locations?coordinates=51.0447,-114.0719&radius=25000",
            { headers: { "Content-Type": "application/json", "X-API-Key": process.env.NEXT_PUBLIC_OPENAQ_API_KEY || "" } }
        );

        if (!locationsResponse.ok) {
            throw new Error("Failed to fetch locations");
        }

        const locationsData = await locationsResponse.json();
        const stations = locationsData.results;

        // Step 2: Fetch measurements for each station's sensors
        const measurements = await Promise.all(
            stations.map(async (station: any) => {
                if (!station.sensors || station.sensors.length === 0) return null;

                // Fetch measurements for all sensors
                const sensorMeasurements = await Promise.all(
                    station.sensors.map(async (sensor: any) => {
                        const measurementResponse = await fetch(
                            `https://api.openaq.org/v3/sensors/${sensor.id}/measurements?sort=desc&limit=1`,
                            { headers: { "Content-Type": "application/json", "X-API-Key": process.env.NEXT_PUBLIC_OPENAQ_API_KEY || "" } }
                        );

                        if (!measurementResponse.ok) return null;

                        const measurementData = await measurementResponse.json();

                        // Group measurements by parameter and take the latest one for each
                        const latestMeasurementsByParameter: Record<string, any> = {};
                        measurementData.results.forEach((measurement: any) => {
                            const parameter = measurement.parameter;
                            if (
                                !latestMeasurementsByParameter[parameter] ||
                                new Date(measurement.date.utc) > new Date(latestMeasurementsByParameter[parameter].date.utc)
                            ) {
                                latestMeasurementsByParameter[parameter] = measurement;
                            }
                        });

                        return Object.values(latestMeasurementsByParameter);
                    })
                );

                // Flatten the array of sensor measurements and filter out null values
                const validMeasurements = sensorMeasurements.flat().filter((data) => data !== null);
                if (validMeasurements.length === 0) return null;

                return {
                    id: station.id,
                    name: station.name,
                    lat: station.coordinates.latitude,
                    lon: station.coordinates.longitude,
                    measurements: validMeasurements,
                };
            })
        );

        // Filter out null values (stations with no recent data)
        const filteredMeasurements = measurements.filter((data) => data !== null);

        return new Response(JSON.stringify(filteredMeasurements), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch pollution data" }), { status: 500 });
    }
}