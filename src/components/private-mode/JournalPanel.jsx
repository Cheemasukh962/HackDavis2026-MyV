import { useEffect, useRef, useState } from 'react';
import { Camera, Download, FileText, Lock, Mic, Search, Shuffle, Square, Trash2, Type, Volume2, VolumeX, X } from 'lucide-react';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import styles from '../../styles/private-mode/journalpanel.module.css';

export default function JournalPanel() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textName, setTextName] = useState('');
  const [textNote, setTextNote] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [sortDirToggled, setSortDirToggled] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const textInputAreaRef = useRef(null);
  const { transcript, listening, startListening, stopListening, clearTranscript } = useSpeechToText();

  useEffect(() => {
    if (!transcript) return;
    setTextNote((prev) => prev + (prev ? ' ' : '') + transcript);
    clearTranscript();
  }, [transcript, clearTranscript]);

  useEffect(() => {
    if (!showTextInput) return;
    const handler = (e) => {
      if (textInputAreaRef.current && !textInputAreaRef.current.contains(e.target)) {
        setShowTextInput(false);
        setTextName('');
        setTextNote('');
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [showTextInput]);

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/journal');
      if (res.ok) {
        const data = await res.json();
        console.debug('[Journal] Fetched entries:', data.entries?.length);
        setEntries(data.entries || []);
      } else {
        setError('Unable to load entries.');
      }
    } catch (err) {
      console.error('[Journal] Fetch error:', err);
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      await uploadFile(file);
    }
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Dynamically find supported type
      const types = ['audio/mp4', 'audio/webm', 'audio/ogg'];
      const supportedType = types.find(type => MediaRecorder.isTypeSupported(type)) || '';
      
      mediaRecorder.current = new MediaRecorder(stream, supportedType ? { mimeType: supportedType } : {});
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const actualType = mediaRecorder.current.mimeType || supportedType || 'audio/webm';
        const audioBlob = new Blob(audioChunks.current, { type: actualType });
        
        // Extract extension from mimeType (e.g. audio/mp4;codecs=avc1 -> mp4)
        const extension = actualType.split('/')[1]?.split(';')[0] || 'webm';
        const file = new File([audioBlob], `recording-${Date.now()}.${extension}`, { type: actualType });
        
        await uploadFile(file);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording failed:', err);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textNote.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textNote,
          title: textName,
          incidentDate: new Date(),
        }),
      });

      if (res.ok) {
        const { entry } = await res.json();
        setEntries((current) => [entry, ...current]);
        setTextName('');
        setTextNote('');
        setShowTextInput(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const getEntryType = (entry) => {
    if (!entry.mediaType) return 'text';
    const mime = entry.mediaType;
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const uploadFile = async (file) => {
    const MAX_BYTES = 14 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setError('Upload failed: file too large (max ~14 MB)');
      return;
    }
    setLoading(true);
    try {
      console.log('[Journal] Converting to Base64:', file.name);
      const base64Data = await fileToBase64(file);

      console.log('[Journal] Creating entry with media...');
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: file.name,
          title: '',
          incidentDate: new Date(),
          mediaData: base64Data,
          mediaType: file.type,
          mediaName: file.name,
        }),
      });

      if (res.ok) {
        const { entry } = await res.json();
        console.log('[Journal] Entry created instantly:', entry._id);
        setEntries((current) => [entry, ...current]);
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }
    } catch (err) {
      console.error('[Journal] Upload error:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (id, updates) => {
    try {
      const res = await fetch(`/api/journal/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const { entry } = await res.json();
        setEntries((current) => current.map((e) => (e._id === id ? entry : e)));
        setEditingEntry(null);
      }
    } catch (err) {
      console.error('Edit failed:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      const res = await fetch(`/api/journal/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEntries((current) => current.filter((e) => e._id !== id));
        setSelectedEntry(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className={styles.container} aria-busy={loading}>
      <div className={styles.securityNotice}>
        <Lock className={styles.lockIcon} />
        <span>Entries are uploaded to encrypted backup. Nothing is saved on this device.</span>
      </div>

      {error && (
        <div className={styles.errorMessage} onClick={() => setError(null)}>
          <X className={styles.tinyIcon} />
          {error}
        </div>
      )}

      <div ref={textInputAreaRef}>
      <div className={styles.buttonGrid}>
        <UploadButton
          label="Media"
          hint="Photo or video"
          accept="image/*,video/*"
          onChange={handleMediaUpload}
          icon={<Camera className={styles.icon} />}
        />
        <RecordButton
          isRecording={isRecording}
          onStart={startRecording}
          onStop={stopRecording}
        />
        <button
          type="button"
          className={`${styles.uploadButton} ${styles.uploadBtnBase} ${showTextInput ? styles.uploadBtnActive : ''}`}
          onClick={() => setShowTextInput((v) => !v)}
        >
          <div className={styles.uploadIcon}><Type className={styles.icon} /></div>
          <span className={styles.uploadLabel}>Text</span>
          <span className={styles.uploadHint}>Write a note</span>
        </button>
      </div>

      {showTextInput && (
        <div className={styles.textForm}>
          <input
            type="text"
            value={textName}
            onChange={(e) => setTextName(e.target.value)}
            placeholder="Name (optional)"
            className={styles.editInput}
          />
          <textarea
            value={textNote}
            onChange={(e) => setTextNote(e.target.value)}
            placeholder="Write your note..."
            className={`${styles.textInput} ${styles.editTextarea}`}
            autoFocus
          />
          <div className={styles.textActions}>
            <button
              type="button"
              className={`${styles.noteMicButton} ${listening ? styles.noteMicButtonActive : ''}`}
              onClick={listening ? stopListening : startListening}
              aria-label={listening ? 'Stop listening' : 'Start voice input'}
            >
              <Mic className={styles.noteMicIcon} aria-hidden="true" />
            </button>
            <div className={styles.textActionEnd}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => { setShowTextInput(false); setTextName(''); setTextNote(''); }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleTextSubmit}
                disabled={loading || !textNote.trim()}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      <label className={styles.searchField}>
        <Search className={styles.searchFieldIcon} aria-hidden="true" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entries..."
          className={styles.searchInput}
          aria-label="Search journal entries"
        />
        {searchQuery && (
          <button
            type="button"
            className={styles.searchClear}
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <X className={styles.tinyIcon} />
          </button>
        )}
      </label>

      <div className={styles.recentHeader}>
        <div className={styles.recentTitleGroup}>
          <span className={styles.recentTitle}>Recent entries</span>
          <button type="button" className={styles.refreshBtn} onClick={fetchEntries} title="Refresh entries">
            <Shuffle className={styles.tinyIcon} />
          </button>
        </div>
        <span className={styles.recentCount}>{entries.length} saved</span>
      </div>

      <div className={styles.filterBar} role="group" aria-label="Filter by type">
        <span className={styles.sortLabel}>Type</span>
        {['all', 'text', 'image', 'video', 'audio', 'file'].map((f) => (
          <button
            key={f}
            type="button"
            className={`${styles.filterChip} ${filter === f ? styles.filterChipActive : ''}`}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
          >
            {f === 'all' ? 'All' : f === 'image' ? 'Photo' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.sortBar} role="group" aria-label="Sort entries">
        <span className={styles.sortLabel}>Sort</span>
        {[
          { field: 'date', label: 'Date', defaultDir: 'desc' },
          { field: 'name', label: 'Name', defaultDir: 'asc' },
          { field: 'type', label: 'Type', defaultDir: 'asc' },
          { field: 'size', label: 'Size', defaultDir: 'desc' },
        ].map(({ field, label, defaultDir }) => {
          const active = sortField === field;
          return (
            <button
              key={field}
              type="button"
              className={`${styles.filterChip} ${active ? styles.filterChipActive : ''}`}
              aria-pressed={active}
              onClick={() => {
                if (active) {
                  if (!sortDirToggled) {
                    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                    setSortDirToggled(true);
                  } else {
                    setSortField(null);
                    setSortDirToggled(false);
                  }
                } else {
                  setSortField(field);
                  setSortDir(defaultDir);
                  setSortDirToggled(false);
                }
              }}
            >
              {label}{active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
            </button>
          );
        })}
      </div>

      <div className={styles.entryList}>
        {(() => {
          const q = searchQuery.trim().toLowerCase();
          const filtered = entries.filter((e) => {
            if (filter !== 'all' && getEntryType(e) !== filter) return false;
            if (!q) return true;
            return (
              (e.title || '').toLowerCase().includes(q) ||
              (e.content || '').toLowerCase().includes(q) ||
              (e.mediaName || '').toLowerCase().includes(q)
            );
          });
          if (loading && entries.length === 0) {
            return <p className={styles.emptyState}>Loading your journal...</p>;
          }
          if (filtered.length === 0) {
            const msg = entries.length === 0
              ? 'No entries yet. Start documenting when ready.'
              : q
                ? `No entries match "${searchQuery}".`
                : `No ${filter === 'image' ? 'photo' : filter} entries yet.`;
            return <p className={styles.emptyState}>{msg}</p>;
          }
          const sorted = sortField
            ? [...filtered].sort((a, b) => {
                let cmp = 0;
                if (sortField === 'date') cmp = new Date(a.createdAt) - new Date(b.createdAt);
                else if (sortField === 'name') cmp = (a.mediaName || a.content || '').localeCompare(b.mediaName || b.content || '');
                else if (sortField === 'type') cmp = getEntryType(a).localeCompare(getEntryType(b));
                else if (sortField === 'size') cmp = (a.mediaData?.length ?? 0) - (b.mediaData?.length ?? 0);
                return sortDir === 'asc' ? cmp : -cmp;
              })
            : filtered;
          return sorted.map((entry) => (
            <EntryCard
              key={entry._id}
              entry={entry}
              type={getEntryType(entry)}
              onClick={() => setSelectedEntry(entry)}
              onLongPress={() => setEditingEntry(entry)}
            />
          ));
        })()}
      </div>

      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          type={getEntryType(editingEntry)}
          onClose={() => setEditingEntry(null)}
          onSave={(updates) => handleSaveEdit(editingEntry._id, updates)}
        />
      )}

      {selectedEntry && (
        <EntryPreview
          entry={selectedEntry}
          type={getEntryType(selectedEntry)}
          onClose={() => setSelectedEntry(null)}
          onDelete={() => handleDelete(selectedEntry._id)}
        />
      )}
    </div>
  );
}

function EntryPreview({ entry, type, onClose, onDelete }) {
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const audioRef = useRef(null);

  const handleTts = async () => {
    if (ttsPlaying) {
      audioRef.current?.pause();
      audioRef.current = null;
      setTtsPlaying(false);
      return;
    }
    setTtsLoading(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: entry.content }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setTtsPlaying(false); URL.revokeObjectURL(url); };
      audio.play();
      setTtsPlaying(true);
    } catch {
      setTtsPlaying(false);
    } finally {
      setTtsLoading(false);
    }
  };

  // Stop audio when modal closes
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  return (
    <div className={styles.previewBackdrop} onClick={onClose}>
      <div className={styles.previewContent} onClick={(e) => e.stopPropagation()}>
        <header className={styles.previewHeader}>
          <div className={styles.previewTitle}>
            <strong>{type.toUpperCase()}</strong>
            <span>{new Date(entry.createdAt).toLocaleString()}</span>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close">
            <X className={styles.icon} />
          </button>
        </header>

        <div className={styles.previewBody}>
          {type === 'text' && <p className={styles.previewText}>{entry.content}</p>}
          {type === 'image' && (
            <div className={styles.mediaContainer}>
              <img 
                src={entry.mediaData} 
                alt={entry.mediaName} 
                className={styles.previewMedia} 
              />
            </div>
          )}
          {type === 'video' && (
            <div className={styles.mediaContainer}>
              <video 
                controls 
                src={entry.mediaData} 
                className={styles.previewMedia}
              />
            </div>
          )}
          {type === 'audio' && (
            <div className={styles.audioWrapper}>
              <audio 
                controls 
                src={entry.mediaData} 
                className={styles.audioPlayer} 
                autoPlay 
              />
            </div>
          )}
          {type === 'file' && (
            <div className={styles.fileDownloadBox}>
              <p>{entry.mediaName}</p>
              <a href={entry.mediaData} download={entry.mediaName} className={styles.downloadBtn}>
                <Download className={styles.tinyIcon} />
                Download File
              </a>
            </div>
          )}
        </div>

        <footer className={styles.previewFooter}>
          {type === 'text' && (
            <button
              type="button"
              className={`${styles.ttsButton} ${ttsPlaying ? styles.ttsButtonActive : ''}`}
              onClick={handleTts}
              disabled={ttsLoading}
              aria-label={ttsPlaying ? 'Stop reading' : 'Read note aloud'}
            >
              {ttsPlaying
                ? <VolumeX className={styles.tinyIcon} aria-hidden="true" />
                : <Volume2 className={styles.tinyIcon} aria-hidden="true" />}
              {ttsLoading ? 'Loading...' : ttsPlaying ? 'Stop' : 'Read aloud'}
            </button>
          )}
          <button type="button" onClick={onDelete} className={styles.deleteBtn}>
            <Trash2 className={styles.tinyIcon} />
            Delete Entry
          </button>
        </footer>
      </div>
    </div>
  );
}

function UploadButton({ label, hint, accept, onChange, icon }) {
  return (
    <label className={`${styles.uploadButton} ${styles.uploadBtnBase}`}>
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        className={styles.fileInput}
        multiple
      />
      <div className={styles.uploadIcon}>{icon}</div>
      <span className={styles.uploadLabel}>{label}</span>
      <span className={styles.uploadHint}>{hint}</span>
    </label>
  );
}

function RecordButton({ isRecording, onStart, onStop }) {
  return (
    <button
      type="button"
      onClick={isRecording ? onStop : onStart}
      className={`${styles.uploadButton} ${styles.uploadBtnBase} ${isRecording ? styles.recording : ''}`}
    >
      <div className={styles.uploadIcon}>
        {isRecording ? <Square className={styles.icon} /> : <Mic className={styles.icon} />}
      </div>
      <span className={styles.uploadLabel}>{isRecording ? 'Stop' : 'Audio'}</span>
      <span className={styles.uploadHint}>{isRecording ? 'Recording...' : 'Record now'}</span>
    </button>
  );
}


function EntryCard({ entry, type, onClick, onLongPress }) {
  const timerRef = useRef(null);
  const didLongPressRef = useRef(false);

  const startPress = () => {
    didLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      onLongPress?.();
    }, 500);
  };

  const cancelPress = () => clearTimeout(timerRef.current);

  const handleClick = () => {
    if (didLongPressRef.current) return;
    onClick?.();
  };

  const formatTime = (date) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Just now';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Just now';
    }
  };

  const TypeIcon = type === 'text' ? FileText : type === 'audio' ? Mic : Camera;
  const labels = { text: 'Note', audio: 'Audio', image: 'Photo', video: 'Video', media: 'Media', file: 'File' };

  return (
    <div
      className={styles.entryCard}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchCancel={cancelPress}
    >
      <div className={styles.entryIcon}>
        <TypeIcon className={styles.entryTypeIcon} />
      </div>
      <div className={styles.entryContent}>
        <div className={styles.entryMeta}>
          <span className={styles.entryType}>{labels[type] || 'Entry'}</span>
          <span className={styles.entryDot}>-</span>
          <span className={styles.entryTime}>{formatTime(entry.createdAt)}</span>
        </div>
        <div className={styles.entryText}>{entry.title || entry.content || 'No content'}</div>
      </div>
    </div>
  );
}

function EditEntryModal({ entry, type, onClose, onSave }) {
  const isText = type === 'text';
  const [name, setName] = useState(entry.title || (isText ? '' : entry.mediaName || entry.content || ''));
  const [note, setNote] = useState(entry.content || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const updates = { title: name };
    if (isText) updates.content = note;
    await onSave(updates);
    setSaving(false);
  };

  return (
    <div className={styles.previewBackdrop} onClick={onClose}>
      <div className={styles.previewContent} onClick={(e) => e.stopPropagation()}>
        <header className={styles.previewHeader}>
          <div className={styles.previewTitle}>
            <strong>EDIT ENTRY</strong>
            <span>{new Date(entry.createdAt).toLocaleString()}</span>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close">
            <X className={styles.icon} />
          </button>
        </header>

        <div className={styles.previewBody}>
          <div className={styles.editField}>
            <label className={styles.editLabel}>{isText ? 'Name' : 'File name'}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.editInput}
              placeholder={isText ? 'Entry name...' : 'File name...'}
            />
          </div>
          {isText && (
            <div className={styles.editField}>
              <label className={styles.editLabel}>Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={`${styles.textInput} ${styles.editTextarea}`}
                placeholder="Write your note..."
              />
            </div>
          )}
        </div>

        <footer className={styles.editFooter}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={styles.submitBtn}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </footer>
      </div>
    </div>
  );
}
