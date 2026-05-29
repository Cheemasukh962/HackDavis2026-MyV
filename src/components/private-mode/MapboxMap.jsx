/**
 * MapboxMap — Interactive location map.
 *
 * Displays:
 *  - Current user location marker
 *  - Mapbox-powered interactive map
 *  - Support for live location updates
 *  - Centered on Sacramento, CA by default
 *  - Used in SOS and AidPanel for location context
 */

import { useEffect, useRef } from 'react';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const DEFAULT_CENTER = [-121.4944, 38.5816];

function hasValidCoords(latitude, longitude) {
  return Number.isFinite(latitude) && Number.isFinite(longitude);
}

/**
 * makeMarkerEl - Creates styled DOM element for map marker.
 * Returns circular colored element with white border for visual prominence.
 * @param {string} color - CSS color for marker background
 * @returns {HTMLElement} Styled marker element ready for map placement
 */
function makeMarkerEl(color) {
  const el = document.createElement('div');
  Object.assign(el.style, {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: color,
    border: '3px solid white',
    boxShadow: '0 1px 6px rgba(0,0,0,0.3)',
    cursor: 'default',
  });
  return el;
}

export default function MapboxMap({ latitude, longitude, selectedResource, active = true }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const resourceMarkerRef = useRef(null);
  const hasInitialCenterRef = useRef(false);
  const activeRef = useRef(active);
  const selectedResourceRef = useRef(selectedResource);
  const coordsRef = useRef({ latitude, longitude });

  activeRef.current = active;
  selectedResourceRef.current = selectedResource;
  coordsRef.current = { latitude, longitude };

  const resizeAndCenter = () => {
    const map = mapRef.current;
    if (!map) return;

    map.resize();

    const resource = selectedResourceRef.current;
    if (hasValidCoords(resource?.latitude, resource?.longitude)) return;

    const { latitude: lat, longitude: lng } = coordsRef.current;
    if (hasValidCoords(lat, lng)) {
      map.flyTo({ center: [lng, lat], zoom: 14, duration: 400 });
    }
  };

  // Init map once
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
        const { latitude: lat, longitude: lng } = coordsRef.current;
        if (hasValidCoords(lat, lng)) {
          map.setCenter([lng, lat]);
          userMarkerRef.current = new mapboxgl.Marker({ element: makeMarkerEl('#1A73E8') })
            .setLngLat([lng, lat])
            .addTo(map);
        }
        mapRef.current = map;
        if (activeRef.current) {
          requestAnimationFrame(resizeAndCenter);
        }
      });

      const observer = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.resize();
          const { latitude: lat, longitude: lng } = coordsRef.current;
          if (hasValidCoords(lat, lng)) mapRef.current.setCenter([lng, lat]);
        }
      });
      observer.observe(containerRef.current);
      containerRef.current._mapObserver = observer;
    }

    init();

    return () => {
      cancelled = true;
      if (containerRef.current?._mapObserver) {
        containerRef.current._mapObserver.disconnect();
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      userMarkerRef.current = null;
      resourceMarkerRef.current = null;
      hasInitialCenterRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update user pin when location changes
  useEffect(() => {
    if (!mapRef.current || !hasValidCoords(latitude, longitude)) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([longitude, latitude]);
    } else {
      import('mapbox-gl').then(({ default: mapboxgl }) => {
        if (!mapRef.current) return;
        userMarkerRef.current = new mapboxgl.Marker({ element: makeMarkerEl('#1A73E8') })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current);
      });
    }

    // Only fly to center the first time we get a location; after that just update the marker
    if (!resourceMarkerRef.current && !hasInitialCenterRef.current) {
      hasInitialCenterRef.current = true;
      mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14, duration: 800 });
    }
  }, [latitude, longitude]);

  // The Aid tab is mounted while hidden. Resize and recenter when it becomes
  // visible so Mapbox renders tiles and markers at the correct dimensions.
  useEffect(() => {
    if (!active || !mapRef.current) return;
    requestAnimationFrame(resizeAndCenter);
  }, [active, latitude, longitude, selectedResource]);

  // Show/hide red resource pin and fit bounds
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove previous resource marker
    if (resourceMarkerRef.current) {
      resourceMarkerRef.current.remove();
      resourceMarkerRef.current = null;
    }

    if (!selectedResource?.latitude || !selectedResource?.longitude) {
      // Deselected — fly back to user
      const { latitude: lat, longitude: lng } = coordsRef.current;
      if (hasValidCoords(lat, lng)) {
        mapRef.current.flyTo({ center: [lng, lat], zoom: 14, duration: 600 });
      }
      return;
    }

    import('mapbox-gl').then(({ default: mapboxgl }) => {
      if (!mapRef.current) return;

      resourceMarkerRef.current = new mapboxgl.Marker({ color: '#E53935' })
        .setLngLat([selectedResource.longitude, selectedResource.latitude])
        .addTo(mapRef.current);

      const { latitude: userLat, longitude: userLng } = coordsRef.current;
      if (hasValidCoords(userLat, userLng)) {
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([userLng, userLat]);
        bounds.extend([selectedResource.longitude, selectedResource.latitude]);
        mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 800 });
      } else {
        mapRef.current.flyTo({
          center: [selectedResource.longitude, selectedResource.latitude],
          zoom: 14,
          duration: 800,
        });
      }
    });
  }, [selectedResource]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
