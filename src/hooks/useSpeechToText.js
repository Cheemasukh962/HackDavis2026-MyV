import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useSpeechToText — MediaRecorder-based audio capture with ElevenLabs transcription.
 *
 * Records audio via the browser MediaRecorder API, POSTs the blob to /api/stt,
 * and returns the transcript string. Works across Chrome, Safari, and mobile browsers.
 * Falls back gracefully — check `supported` before rendering the mic button.
 *
 * @returns {{
 *   transcript: string,
 *   listening: boolean,
 *   supported: boolean,
 *   loading: boolean,
 *   startListening: function,
 *   stopListening: function,
 *   clearTranscript: function,
 * }}
 */
export function useSpeechToText() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening]   = useState(false);
  const [supported, setSupported]   = useState(false);
  const [loading, setLoading]       = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);

  useEffect(() => {
    // Check for MediaRecorder support
    setSupported(!!(window.MediaRecorder && navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
  }, []);

  /** Requests mic access, starts recording, and clears the previous transcript. */
  const startListening = useCallback(async () => {
    if (!supported) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setListening(true);
      setTranscript(''); // Clear previous transcript
    } catch (err) {
      console.error('[STT] Could not start recording:', err);
      setListening(false);
    }
  }, [supported]);

  /** Stops the MediaRecorder, which triggers the onstop handler to send audio for transcription. */
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setListening(false);
  }, []);

  /** POSTs the recorded audio blob to /api/stt and sets the transcript on success. */
  const transcribeAudio = async (blob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'recording.wav');

      const res = await fetch('/api/stt', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.transcript) {
        setTranscript(data.transcript);
      } else {
        console.error('[STT] Transcription failed:', data.error);
      }
    } catch (err) {
      console.error('[STT] API error:', err);
    } finally {
      setLoading(false);
    }
  };

  /** Resets the transcript to an empty string without stopping recording. */
  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return { 
    transcript, 
    listening, 
    supported, 
    loading, // New state for transcription in progress
    startListening, 
    stopListening, 
    clearTranscript 
  };
}
