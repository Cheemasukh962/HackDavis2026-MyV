import { useEffect, useRef } from 'react';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const DEFAULT_CENTER = [-121.4944, 38.5816];

function createMarker(mapboxgl, map, lng, lat) {
  const el = document.createElement('div');
  Object.assign(el.style, {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '#1A73E8',
    border: '3px solid white',
    boxShadow: '0 1px 6px rgba(0,0,0,0.3)',
    cursor: 'default',
  });
  return new mapboxgl.Marker({ element: el })
    .setLngLat([lng, lat])
    .addTo(map);
}

export default function MapboxMap({ latitude, longitude }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);      // only set AFTER map 'load' fires
  const markerRef = useRef(null);
  const coordsRef = useRef({ latitude, longitude });
  coordsRef.current = { latitude, longitude };

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    async function init() {
      const mapboxgl = (await import('mapbox-gl')).default;
      if (cancelled || !containerRef.current) return;

      mapboxgl.accessToken = TOKEN;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: DEFAULT_CENTER,
        zoom: 14,
        scrollZoom: false,
        attributionControl: false,
      });

      map.once('load', () => {
        if (cancelled) return;
        // Read latest coords — may have arrived during the async gap
        const { latitude: lat, longitude: lng } = coordsRef.current;
        if (lat && lng) {
          map.setCenter([lng, lat]);
          markerRef.current = createMarker(mapboxgl, map, lng, lat);
        }
        // Only expose the map ref after it's fully ready
        mapRef.current = map;
      });
    }

    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Runs when location updates after the map is already loaded
  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return;

    mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14, duration: 800 });

    if (markerRef.current) {
      markerRef.current.setLngLat([longitude, latitude]);
    } else {
      import('mapbox-gl').then(({ default: mapboxgl }) => {
        if (!mapRef.current) return;
        markerRef.current = createMarker(mapboxgl, mapRef.current, longitude, latitude);
      });
    }
  }, [latitude, longitude]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
