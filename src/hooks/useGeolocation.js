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

const INITIAL_GEOLOCATION_OPTIONS = {
  enableHighAccuracy: false,
  maximumAge: 60 * 1000,
  timeout: 12 * 1000,
};

const WATCH_GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 30 * 1000,
  timeout: 20 * 1000,
};

async function parseError(response) {
  try {
    const body = await response.json();
    return body?.error || 'Unable to save location.';
  } catch {
    return 'Unable to save location.';
  }
}

async function saveLocationSharingPreference(enabled) {
  try {
    await fetch('/api/users/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationSharingEnabled: enabled }),
    });
  } catch {
    // Location sharing should still toggle locally if preference persistence fails.
  }
}

function serializeBrowserPosition(position) {
  const { coords, timestamp } = position;
  const capturedAt = new Date(timestamp).toISOString();

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    altitude: coords.altitude,
    altitudeAccuracy: coords.altitudeAccuracy,
    heading: coords.heading,
    speed: coords.speed,
    capturedAt,
    updatedAt: capturedAt,
  };
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
  const hasLivePositionRef = useRef(false);
  const startLiveLocationRef = useRef(null);

  const storePosition = useCallback(async (position) => {
    const localLocation = serializeBrowserPosition(position);
    setLocation(localLocation);

    const response = await fetch('/api/geolocation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: localLocation.latitude,
        longitude: localLocation.longitude,
        accuracy: localLocation.accuracy,
        altitude: localLocation.altitude,
        altitudeAccuracy: localLocation.altitudeAccuracy,
        heading: localLocation.heading,
        speed: localLocation.speed,
        capturedAt: localLocation.capturedAt,
      }),
    });

    if (!response.ok) {
      setError(await parseError(response));
      return localLocation;
    }

    const body = await response.json();
    const savedLocation = body.location || localLocation;
    setLocation(savedLocation);
    return savedLocation;
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
    saveLocationSharingPreference(true);

    const handlePosition = async (position) => {
      try {
        hasLivePositionRef.current = true;
        setStatus('saving');
        await storePosition(position);
        setStatus('live');
      } catch (err) {
        setStatus('error');
        setError(err.message || 'Unable to save live location.');
      }
    };

    const stopAfterPositionError = (err) => {
      setStatus('error');
      setError(err.message || 'Unable to access live location.');
      setIsWatching(false);
      if (watcherIdRef.current !== null) {
        navigator.geolocation.clearWatch(watcherIdRef.current);
      }
      watcherIdRef.current = null;
    };

    const handleInitialPositionError = (err) => {
      if (watcherIdRef.current !== null) {
        setError(err.message || 'Still waiting for live location.');
        return;
      }

      stopAfterPositionError(err);
    };

    const handleWatchPositionError = (err) => {
      if (err.code === err.TIMEOUT && hasLivePositionRef.current) {
        setError(err.message || 'Live location update timed out.');
        setStatus('live');
        return;
      }

      stopAfterPositionError(err);
    };

    navigator.geolocation.getCurrentPosition(
      handlePosition,
      handleInitialPositionError,
      INITIAL_GEOLOCATION_OPTIONS
    );

    watcherIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      (err) => {
        handleWatchPositionError(err);
      },
      WATCH_GEOLOCATION_OPTIONS
    );

    return true;
  }, [storePosition]);

  useEffect(() => {
    startLiveLocationRef.current = startLiveLocation;
  }, [startLiveLocation]);

  /** Clears the watchPosition listener and sets status back to 'saved' if was 'live'. */
  const stopLiveLocation = useCallback(({ persistPreference = true } = {}) => {
    if (watcherIdRef.current !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(watcherIdRef.current);
      watcherIdRef.current = null;
    }

    setIsWatching(false);
    hasLivePositionRef.current = false;
    if (persistPreference) {
      saveLocationSharingPreference(false);
    }
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

  useEffect(() => () => stopLiveLocation({ persistPreference: false }), [stopLiveLocation]);

  useEffect(() => {
    let cancelled = false;

    async function loadLocationSharingPreference() {
      try {
        const response = await fetch('/api/users/preferences');
        if (!response.ok) return;

        const body = await response.json();
        if (!cancelled && body.preferences?.locationSharingEnabled) {
          startLiveLocationRef.current?.();
        }
      } catch {
        // Keep location sharing off if preferences cannot be loaded.
      }
    }

    loadLocationSharingPreference();

    return () => {
      cancelled = true;
    };
  }, []);

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
