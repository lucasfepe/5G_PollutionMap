import os
import json
from openaq import OpenAQ
import sys

sys.stdout.reconfigure(encoding="utf-8")

def fetch_latest_measurements():
    api_key = os.getenv("NEXT_PUBLIC_OPENAQ_API_KEY")
    if not api_key:
        raise ValueError("API key not found in environment variables")

    api = OpenAQ(api_key=api_key)

    # Step 1: Get all sensors in Calgary
    locations_response = api.locations.list(coordinates=("51.0447,-114.0719"), radius=25_000).json()
    locations_response = json.loads(locations_response)
    locations = locations_response["results"]

    # Step 2: Fetch the latest measurements for each sensor
    pollution_data = []
    for location in locations:
        location_id = location["id"]
        location_name = location["name"]
        coordinates = location["coordinates"]

        # Fetch the latest measurements for this location
        measurements_response = api.locations.latest(location_id).json()
        measurements_response = json.loads(measurements_response)
        measurements = measurements_response["results"]

        # Add the latest measurement to the pollution data
        # Add the latest measurement to the pollution data
        for measurement in measurements:
            # Find the matching sensor in the sensors list
            sensor = next((sensor for sensor in location["sensors"] if sensor["id"] == measurement["sensorsId"]), None)

            if sensor:  # Ensure the sensor exists
                pollution_data.append({
                    "id": location_id,
                    "name": location_name,
                    "lat": coordinates["latitude"],
                    "lon": coordinates["longitude"],
                    "pollutant": sensor["parameter"]["displayName"],  # Access the displayName of the parameter
                    "value": measurement["value"],
                    "unit": sensor["parameter"]["units"],  # Access the units of the parameter
                })

    api.close()
    return pollution_data

if __name__ == "__main__":
    try:
        data = fetch_latest_measurements()

        # Write the data to a new file
        with open("latest_measurements.json", "w", encoding="utf-8") as file:
            json.dump(data, file, indent=2, ensure_ascii=False)

        # Print the data to stdout for the Node.js process
        print(json.dumps(data, indent=2, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)