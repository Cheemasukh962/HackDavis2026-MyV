/**
 * useGeolocation.js — opt-in device location tracking for the private mode SOS feature.
 *
 * Wraps the browser Geolocation API and persists the latest position to
 * /api/geolocation (MongoDB). Only one location record is kept per user —
 * this is not a movement history, just a "last known position."
 *
 * status values: 'idle' | 'requesting' | 'saving' | 'live' | 'saved' | 'loading' | 'clearing' | 'error'
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 0,
};

async function parseError(response) {
  try {
    const body = await response.json();
    return body?.error || 'Unable to save location.';
  } catch {
    return 'Unable to save location.';
  }
}

/**
 * @returns {{
 *   location: Object|null,
 *   status: string,
 *   error: string,
 *   isWatching: boolean,
 *   startLiveLocation: function,
 *   stopLiveLocation: function,
 *   loadStoredLocation: function,
 *   clearStoredLocation: function,
 * }}
 */
export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [isWatching, setIsWatching] = useState(false);
  const watcherIdRef = useRef(null);

  const storePosition = useCallback(async (position) => {
    const { coords, timestamp } = position;
      const response = await fetch('/api/geolocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          altitude: coords.altitude,
          altitudeAccuracy: coords.altitudeAccuracy,
          heading: coords.heading,
          speed: coords.speed,
          capturedAt: new Date(timestamp).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const body = await response.json();
      setLocation(body.location);
    return body.location;
  }, []);

  /** Starts a watchPosition listener and POSTs each new position to /api/geolocation. */
  const startLiveLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('error');
      setError('Location is not available in this browser.');
      return false;
    }

    if (watcherIdRef.current !== null) {
      return true;
    }

    setStatus('requesting');
    setError('');
    setIsWatching(true);

    watcherIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          setStatus('saving');
          await storePosition(position);
          setStatus('live');
        } catch (err) {
          setStatus('error');
          setError(err.message || 'Unable to save live location.');
        }
      },
      (err) => {
        setStatus('error');
        setError(err.message || 'Unable to access live location.');
        setIsWatching(false);
        if (watcherIdRef.current !== null) {
          navigator.geolocation.clearWatch(watcherIdRef.current);
        }
        watcherIdRef.current = null;
      },
      GEOLOCATION_OPTIONS
    );

    return true;
  }, [storePosition]);

  /** Clears the watchPosition listener and sets status back to 'saved' if was 'live'. */
  const stopLiveLocation = useCallback(() => {
    if (watcherIdRef.current !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(watcherIdRef.current);
      watcherIdRef.current = null;
    }

    setIsWatching(false);
    setStatus((currentStatus) => (currentStatus === 'live' ? 'saved' : currentStatus));
  }, []);

  /** Fetches the user's last saved location from /api/geolocation. Returns the location object or null. */
  const loadStoredLocation = useCallback(async () => {
    setStatus('loading');
    setError('');

    try {
      const response = await fetch('/api/geolocation');
      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const body = await response.json();
      setLocation(body.location);
      setStatus(body.location ? 'saved' : 'idle');
      return body.location;
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Unable to load location.');
      return null;
    }
  }, []);

  /** Stops live tracking and deletes the stored location from the database. Returns true on success. */
  const clearStoredLocation = useCallback(async () => {
    stopLiveLocation();
    setStatus('clearing');
    setError('');

    try {
      const response = await fetch('/api/geolocation', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      setLocation(null);
      setStatus('idle');
      return true;
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Unable to clear location.');
      return false;
    }
  }, [stopLiveLocation]);

  useEffect(() => stopLiveLocation, [stopLiveLocation]);

  return {
    location,
    status,
    error,
    isWatching,
    startLiveLocation,
    stopLiveLocation,
    loadStoredLocation,
    clearStoredLocation,
  };
}
