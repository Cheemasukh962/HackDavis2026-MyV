import { useEffect, useRef } from 'react';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const DEFAULT_CENTER = [-121.4944, 38.5816];

export default function MapboxMap({ latitude, longitude }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let map = null;
    let cancelled = false;

    async function init() {
      const mapboxgl = (await import('mapbox-gl')).default;
      if (cancelled || !containerRef.current) return;

      mapboxgl.accessToken = TOKEN;

      const center = latitude && longitude ? [longitude, latitude] : DEFAULT_CENTER;

      map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center,
        zoom: 14,
        scrollZoom: false,
        attributionControl: false,
      });

      if (latitude && longitude) {
        const el = document.createElement('div');
        Object.assign(el.style, {
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: 'oklch(0.4 0.08 45)',
          border: '2px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.16)',
        });
        markerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(map);
      }

      mapRef.current = map;
    }

    init();

    return () => {
      cancelled = true;
      if (map) map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return;

    mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14, duration: 800 });

    if (markerRef.current) {
      markerRef.current.setLngLat([longitude, latitude]);
    } else {
      // location resolved after map init — create the marker now
      import('mapbox-gl').then(({ default: mapboxgl }) => {
        if (!mapRef.current) return;
        const el = document.createElement('div');
        Object.assign(el.style, {
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: 'oklch(0.4 0.08 45)',
          border: '2px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.16)',
        });
        markerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current);
      });
    }
  }, [latitude, longitude]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
