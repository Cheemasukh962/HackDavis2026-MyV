/**
 * AidPanel — Crisis resources and support information.
 *
 * Provides access to:
 *  - National crisis hotlines
 *  - Mental health resources
 *  - Emergency services
 *  - Support group information
 *  - Tap-to-call functionality
 */

import { useState, useEffect, useRef } from 'react';
import { Lock, Phone, Map } from 'lucide-react';
import MapboxMap from './MapboxMap';
import styles from '../../styles/private-mode/aid.module.css';

const FILTERS = [
  { key: 'shelter', label: 'Shelters' },
  { key: 'legal', label: 'Legal Aid' },
  { key: 'financial', label: 'Financial' },
  { key: 'counseling', label: 'Counseling' },
];

const PLACEHOLDER_RESOURCES = {
  shelter: [
    { name: "SafeHaven Women's Shelter", meta: '0.8 mi - Open 24 hours', latitude: 38.5694, longitude: -121.4854 },
    { name: 'Hope House Emergency Refuge', meta: '1.4 mi - Open until 9 PM', latitude: 38.5952, longitude: -121.5024 },
  ],
  legal: [
    { name: 'Community Legal Aid Society', meta: '1.1 mi - Open until 5 PM', latitude: 38.5706, longitude: -121.5066 },
  ],
  financial: [
    { name: 'Emergency Assistance Fund', meta: '0.5 mi - Open until 6 PM', latitude: 38.5772, longitude: -121.4872 },
  ],
  counseling: [
    { name: 'Trauma Recovery Counseling', meta: '1.8 mi - Open until 8 PM', latitude: 38.5638, longitude: -121.5122 },
  ],
};

export default function AidPanel({ location, isWatching }) {
  const [activeFilter, setActiveFilter] = useState('shelter');
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const mapRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const locationRef = useRef(location);
  locationRef.current = location;

  // Clear selection when switching filters
  useEffect(() => {
    setSelectedResource(null);
  }, [activeFilter]);

  // Poll every 5 seconds while location sharing is on. Uses a ref for location
  // to avoid stale closure — the interval always reads the latest coords.
  useEffect(() => {
    hasFetchedRef.current = false;
    setResources(null);
    setError('');

    if (!isWatching) return;

    async function tryFetch() {
      const loc = locationRef.current;
      if (!loc || hasFetchedRef.current) return;
      hasFetchedRef.current = true;
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/resources/nearby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: loc.latitude, longitude: loc.longitude }),
        });
        if (!res.ok) throw new Error('Failed to fetch nearby resources.');
        setResources(await res.json());
      } catch (err) {
        console.error('[AidPanel] Fetch error:', err);
        setError('Could not load local resources. Showing defaults.');
        setResources(PLACEHOLDER_RESOURCES);
      } finally {
        setLoading(false);
      }
    }

    tryFetch();
    const interval = setInterval(tryFetch, 5000);
    return () => clearInterval(interval);
  }, [isWatching]);

  /**
   * handleCall - Initiates phone call to resource phone number.
   * Opens native dialer with cleaned phone number.
   * @param {string} phone - Phone number to call
   */
  const handleCall = (phone) => {
    if (!phone) return;
    window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
  };

  /**
   * handleDirections - Opens Google Maps directions to resource.
   * Prepares origin/destination for navigation.
   * @param {string} address - Resource address to navigate to
   */
  const handleDirections = (address) => {
    if (!address) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleCardClick = async (resource) => {
    // Toggle off if already selected
    if (selectedResource?.name === resource.name) {
      setSelectedResource(null);
      return;
    }

    // Always geocode via Mapbox when address is present — AI coords are unreliable
    if (resource.address) {
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const query = encodeURIComponent(resource.address);
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1`
        );
        const data = await res.json();
        const [lng, lat] = data.features?.[0]?.center || [];
        if (lat && lng) {
          setSelectedResource({ ...resource, latitude: lat, longitude: lng });
          mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return;
        }
      } catch (err) {
        console.error('[AidPanel] Geocode error:', err);
      }
    }

    // Fallback to AI-provided coords if no address or geocoding failed
    if (resource.latitude && resource.longitude) {
      setSelectedResource(resource);
      mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const activeResources = resources ? (resources[activeFilter] || []) : [];

  return (
    <div className={styles.aidPanel}>
      <div className={styles.chatNotice}>
        <Lock className={styles.noticeIcon} aria-hidden="true" />
        <span>Search results are context-aware and not stored on this device.</span>
      </div>

      <div ref={mapRef} className={styles.resourceMap}>
        <MapboxMap
          latitude={location ? Math.round(location.latitude * 10000) / 10000 : undefined}
          longitude={location ? Math.round(location.longitude * 10000) / 10000 : undefined}
          selectedResource={selectedResource}
        />
        <div className={styles.mapCaption}>
          {selectedResource ? selectedResource.name : isWatching && location ? 'Showing resources near you' : isWatching ? 'Finding your location...' : 'Enable location sharing to find nearby help'}
        </div>
      </div>

      <div className={styles.filterScroller} aria-label="Resource filters">
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              className={`${styles.filterButton} ${active ? styles.filterButtonActive : ''}`}
              aria-pressed={active}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {loading && !resources && (
        <div style={{ textAlign: 'center', padding: '20px', opacity: 0.7 }}>
          <p>Consulting secure directory...</p>
        </div>
      )}

      <div className={styles.resourceList}>
        {activeResources.map((resource, idx) => {
          const isSelected = selectedResource?.name === resource.name;
          return (
            <article
              key={`${resource.name}-${idx}`}
              className={`${styles.resourceCard} ${isSelected ? styles.resourceCardSelected : ''} ${resource.latitude || resource.address ? styles.resourceCardClickable : ''}`}
              onClick={() => handleCardClick(resource)}
              role={resource.latitude || resource.address ? 'button' : undefined}
              tabIndex={resource.latitude || resource.address ? 0 : undefined}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(resource)}
            >
              <div className={styles.resourceInfo}>
                <h2>{resource.name}</h2>
                <p className={styles.resourceMeta}>{resource.meta}</p>
                {resource.address && <p className={styles.resourceAddress}>{resource.address}</p>}
              </div>
              <div className={styles.resourceActions}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleCall(resource.phone); }}
                  disabled={!resource.phone}
                >
                  <Phone className={styles.tinyIcon} aria-hidden="true" />
                  Call
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDirections(resource.address); }}
                  disabled={!resource.address}
                >
                  <Map className={styles.tinyIcon} aria-hidden="true" />
                  Directions
                </button>
              </div>
            </article>
          );
        })}
        {activeResources.length === 0 && !loading && (
          <p style={{ textAlign: 'center', padding: '20px', color: 'var(--pm-muted-foreground)' }}>
            No specific resources found in this category.
          </p>
        )}
      </div>

      {error && (
        <p style={{ fontSize: '11px', color: 'var(--pm-muted-foreground)', textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  );
}
