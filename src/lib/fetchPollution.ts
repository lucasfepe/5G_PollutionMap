export async function getPollutionData() {
    try {
      const response = await fetch("/api/pollution"); // Calls our Next.js API
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching pollution data:", error);
      return [];
    }
  }
  