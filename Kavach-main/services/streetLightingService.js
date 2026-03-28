// services/streetLightingService.js
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

export async function fetchStreetLightsInArea(bounds) {
    // Validate bounds
    if (!bounds || !bounds.north || !bounds.south || !bounds.east || !bounds.west) {
        console.warn('Invalid bounds provided to fetchStreetLightsInArea');
        return [];
    }

    // Ensure bounds are within valid ranges
    const north = Math.max(-90, Math.min(90, bounds.north));
    const south = Math.max(-90, Math.min(90, bounds.south));
    const east = Math.max(-180, Math.min(180, bounds.east));
    const west = Math.max(-180, Math.min(180, bounds.west));

    // Create a more targeted query for street lighting
    const query = `
[out:json][timeout:25];
(
  node[highway=street_lamp](${south},${west},${north},${east});
  way[highway][lit=yes](${south},${west},${north},${east});
  way[highway][lit=no](${south},${west},${north},${east});
);
out geom;
`;

    try {
        console.log('Fetching street lighting data for bounds:', { north, south, east, west });

        const response = await fetch(OVERPASS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Kavach-App/1.0'
            },
            body: 'data=' + encodeURIComponent(query)
        });

        if (!response.ok) {
            console.error('Overpass API responded with status:', response.status);
            const textResponse = await response.text();
            console.error('Response text:', textResponse.substring(0, 500));
            return [];
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Unexpected content type:', contentType);
            const textResponse = await response.text();
            console.error('Response text:', textResponse.substring(0, 500));
            return [];
        }

        const data = await response.json();
        console.log('Successfully fetched lighting data, elements:', data.elements?.length || 0);
        return processStreetLightData(data);
    } catch (error) {
        console.error('Error fetching street lighting data:', error);
        return [];
    }
}

function processStreetLightData(osmData) {
    if (!osmData || !osmData.elements) {
        console.warn('Invalid OSM data received');
        return [];
    }

    const lights = [];

    try {
        // Process street lamp nodes
        osmData.elements.forEach(element => {
            if (element.type === 'node' && element.tags?.highway === 'street_lamp') {
                lights.push({
                    id: element.id,
                    position: { latitude: element.lat, longitude: element.lon },
                    type: 'street_lamp',
                    tags: element.tags
                });
            }

            // Process road lighting information
            if (element.type === 'way' && element.tags?.highway && element.geometry) {
                const isLit = element.tags.lit === 'yes';
                lights.push({
                    id: element.id,
                    type: 'road_segment',
                    geometry: element.geometry,
                    isLit: isLit,
                    roadType: element.tags.highway
                });
            }
        });

        console.log(`Processed ${lights.length} lighting elements`);
        return lights;
    } catch (error) {
        console.error('Error processing street light data:', error);
        return [];
    }
}

// Fallback function for when API fails
export function generateFallbackLightingData(bounds) {
    console.log('Using fallback lighting data');
    // Create some mock lighting data based on typical urban patterns
    const lights = [];
    const numLamps = Math.min(20, Math.floor((bounds.north - bounds.south) * 100)); // Scale with area

    for (let i = 0; i < numLamps; i++) {
        const lat = bounds.south + (Math.random() * (bounds.north - bounds.south));
        const lon = bounds.west + (Math.random() * (bounds.east - bounds.west));

        lights.push({
            id: `fallback_${i}`,
            position: { latitude: lat, longitude: lon },
            type: 'street_lamp',
            tags: { fallback: true }
        });
    }

    return lights;
}

export function calculateRouteBounds(origin, destination) {
    const margin = 0.01; // ~1km buffer
    return {
        north: Math.max(origin.latitude, destination.latitude) + margin,
        south: Math.min(origin.latitude, destination.latitude) - margin,
        east: Math.max(origin.longitude, destination.longitude) + margin,
        west: Math.min(origin.longitude, destination.longitude) - margin
    };
}

export async function fetchBusinessAndPopulationData(bounds) {
    if (!bounds || !bounds.north || !bounds.south || !bounds.east || !bounds.west) {
        console.warn('Invalid bounds provided to fetchBusinessAndPopulationData');
        return { businessPoints: [], populationWays: [] };
    }

    const north = Math.max(-90, Math.min(90, bounds.north));
    const south = Math.max(-90, Math.min(90, bounds.south));
    const east = Math.max(-180, Math.min(180, bounds.east));
    const west = Math.max(-180, Math.min(180, bounds.west));

    const query = `
[out:json][timeout:30];
(
  node[shop](${south},${west},${north},${east});
  node[amenity~"restaurant|cafe|bar|pub|bank|pharmacy|hotel|clinic|hospital|school|mall"](${south},${west},${north},${east});
  way[shop](${south},${west},${north},${east});
  way[amenity~"restaurant|cafe|bar|pub|bank|pharmacy|hotel|clinic|hospital|school|mall"](${south},${west},${north},${east});
  way[landuse=residential](${south},${west},${north},${east});
  way[landuse=urban](${south},${west},${north},${east});
);
out center;`;

    try {
        const response = await fetch(OVERPASS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Kavach-App/1.0'
            },
            body: 'data=' + encodeURIComponent(query)
        });

        if (!response.ok) {
            console.error('Overpass API responded with status:', response.status);
            return { businessPoints: [], populationWays: [] };
        }

        const data = await response.json();
        const businessPoints = [];
        const populationWays = [];

        (data.elements || []).forEach(el => {
            if (el.type === 'node' && (el.tags?.shop || el.tags?.amenity)) {
                businessPoints.push({ latitude: el.lat, longitude: el.lon });
            }

            if (el.type === 'way' && el.geometry && (el.tags?.landuse === 'residential' || el.tags?.landuse === 'urban')) {
                populationWays.push(el.geometry.map(point => ({ latitude: point.lat, longitude: point.lon })));
            }
        });

        return { businessPoints, populationWays };
    } catch (error) {
        console.error('Error fetching business/population data:', error);
        return { businessPoints: [], populationWays: [] };
    }
}