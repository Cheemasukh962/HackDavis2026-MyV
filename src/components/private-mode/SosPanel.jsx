/**
 * SosPanel — Emergency SOS and trusted contacts.
 *
 * Enables:
 *  - Emergency alert trigger with location
 *  - Trusted contact management
 *  - Location sharing options
 *  - Emergency response status tracking
 *  - Real-time map display
 */

import { useEffect, useState } from 'react';
import { AlertTriangle, Check, Clock, Cloud, MapPin, Shield, Users } from 'lucide-react';
import MapboxMap from './MapboxMap';
import styles from '../../styles/private-mode/sos.module.css';

export default function SosPanel({ enabled }) {
  const [status, setStatus] = useState('ready');
  const [locationOn, setLocationOn] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);
  const [error, setError] = useState('');
  const [sentCount, setSentCount] = useState(0);
  const [lastLocation, setLastLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [trustedCount, setTrustedCount] = useState(null);

  useEffect(() => {
    fetch('/api/trusted-contacts')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        setTrustedCount((data.trustedContacts || []).length);
      })
      .catch(() => {});
  }, []);

  /**
   * requestCurrentLocation - Gets current user location via Geolocation API.
   * @returns {Promise} Resolves with position object containing coords and timestamp
   * @throws Error if geolocation is unavailable
   */
  const requestCurrentLocation = () => new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Location is not available in this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 0,
    });
  });

  useEffect(() => {
    if (!enabled) return undefined;
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Location is not available in this browser.');
      return undefined;
    }

    const watcherId = navigator.geolocation.watchPosition(
      ({ coords, timestamp }) => {
        setLocationOn(true);
        setLocationError('');
        setLastLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          capturedAt: new Date(timestamp).toISOString(),
        });
      },
      (err) => {
        setLocationOn(false);
        setLocationError(err.message || 'Unable to access live location.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watcherId);
  }, [enabled]);

  /**
   * handleSend - Sends SOS alert to all trusted contacts.
   * Optionally includes current location if shareLocation is enabled.
   * Manages location requesting, UI state transitions, and error handling.
   */
  const handleSend = async () => {
    if (!enabled || status === 'requesting' || status === 'sending') return;

    setError('');

    try {
      let location = null;

      if (shareLocation) {
        setStatus('requesting');
        location = lastLocation;

        if (!location || Date.now() - new Date(location.capturedAt).getTime() > 60 * 1000) {
          const position = await requestCurrentLocation();
          const { coords, timestamp } = position;
          location = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            capturedAt: new Date(timestamp).toISOString(),
          };
        }

        setLocationOn(true);
        setLastLocation(location);
      }

      setStatus('sending');

      const response = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location ?? {}),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || 'Unable to send SOS.');
      }

      setSentCount(body.sentCount || 0);
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Unable to send SOS.');
    }
  };

  const heroLabel = status === 'sent'
    ? 'Alert Sent'
    : status === 'requesting'
      ? 'Getting your location...'
    : status === 'sending'
      ? 'Sending alert...'
      : status === 'error'
        ? 'Unable to send. Try again.'
        : !enabled
          ? 'SOS is unavailable'
        : 'Ready to alert your contacts';

  const heroText = status === 'sent'
    ? `Your trusted contacts were alerted${shareLocation ? ' and received your location' : ''}.`
    : enabled
      ? shareLocation
        ? 'One tap alerts your trusted contacts and shares your current location with them.'
        : 'One tap alerts your trusted contacts. Your location will not be shared with them.'
      : 'The SOS feature is currently disabled.';

  return (
    <div className={styles.sosPanel}>
      <div className={styles.heroCard}>
        <div className={styles.heroKicker}>
          <Shield className={styles.smallIcon} aria-hidden="true" />
          <span>Emergency Alert</span>
        </div>
        <h1 className={styles.heroTitle}>{heroLabel}</h1>
        <p className={styles.heroText}>{heroText}</p>
        {error && <p className={styles.heroText}>{error}</p>}
        {locationError && <p className={styles.heroText}>{locationError}</p>}
      </div>

      <button
        type="button"
        className={`${styles.sosButton} ${status === 'sent' ? styles.sosButtonSent : ''}`}
        disabled={!enabled || status === 'requesting' || status === 'sending'}
        onClick={handleSend}
      >
        {status === 'sent' && <Check className={styles.buttonIcon} aria-hidden="true" />}
        <span>
          {status === 'sent'
            ? 'SOS Sent'
            : status === 'requesting'
              ? 'Getting location...'
            : status === 'sending'
              ? 'Sending...'
              : 'Send SOS'}
        </span>
      </button>

      <div className={styles.statusGrid}>
        <StatusCard
          icon={<Users className={styles.smallIcon} aria-hidden="true" />}
          label="Trusted Contacts"
          value={trustedCount === null ? '—' : `${trustedCount} contact${trustedCount === 1 ? '' : 's'}`}
        />
        <LocationCard on={shareLocation} onToggle={() => setShareLocation((v) => !v)} />
        <StatusCard
          icon={<Cloud className={styles.smallIcon} aria-hidden="true" />}
          label="Evidence Backup"
          value="Not started"
        />
        <StatusCard
          icon={<Clock className={styles.smallIcon} aria-hidden="true" />}
          label="Last Safety Check"
          value={status === 'sent' ? 'Just now' : 'Never'}
        />
      </div>

      {enabled && shareLocation && <LocationPreview sent={status === 'sent'} location={lastLocation} />}

      <div className={styles.notice}>
        <AlertTriangle className={styles.noticeIcon} aria-hidden="true" />
        <span>Alerts are sent without the app name. Your contacts will not see SafeHaven anywhere in the message.</span>
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value }) {
  return (
    <div className={styles.statusCard}>
      <div className={styles.statusLabel}>
        {icon}
        <span>{label}</span>
      </div>
      <div className={styles.statusValue}>{value}</div>
    </div>
  );
}

function LocationCard({ on, onToggle }) {
  return (
    <div className={`${styles.statusCard} ${on ? styles.statusCardActive : ''}`}>
      <div className={styles.locationHeader}>
        <div className={styles.statusLabel}>
          <MapPin className={styles.smallIcon} aria-hidden="true" />
          <span>Share Location</span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={on}
          aria-label={on ? 'Stop sharing location with contacts' : 'Share location with contacts'}
          className={`${styles.switch} ${on ? styles.switchOn : ''}`}
        >
          <span aria-hidden="true" />
        </button>
      </div>
      <div className={styles.statusValue}>{on ? 'On' : 'Off'}</div>
      <div className={styles.statusHint}>
        {on ? 'Trusted contacts receive your location when SOS is sent' : 'Trusted contacts alerted without location'}
      </div>
    </div>
  );
}

function LocationPreview({ sent, location }) {
  const contacts = [
    { name: 'Mom', initials: 'MR' },
    { name: 'Sarah', initials: 'SK' },
  ];

  return (
    <div className={styles.locationPreview}>
      <div className={styles.mapPreview}>
        <MapboxMap latitude={location?.latitude} longitude={location?.longitude} />
      </div>

      <div className={styles.locationBody}>
        <div className={styles.locationMeta}>
          <MapPin className={styles.tinyIcon} aria-hidden="true" />
          <span>Current location</span>
          <span className={styles.liveBadge}>
            <span aria-hidden="true" />
            Live
          </span>
        </div>
        <div className={styles.locationAddress}>
          {location
            ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
            : 'Current coordinates'}
        </div>
        <div className={styles.locationDetail}>
          {location?.accuracy
            ? `Accurate to about ${Math.round(location.accuracy)} m`
            : 'Accuracy pending'}
        </div>

        <div className={styles.contactRow}>
          <div className={styles.avatarStack} aria-hidden="true">
            {contacts.map((contact) => (
              <span key={contact.name}>{contact.initials}</span>
            ))}
          </div>
          <div className={styles.contactCopy}>
            {sent
              ? 'Your trusted contacts received this in chat.'
              : 'Your trusted contacts will receive this in chat.'}
          </div>
        </div>
      </div>
    </div>
  );
}
