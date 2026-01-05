
import React, { useState, useRef } from 'react';
import { generateAudio, decodeAudioData } from '../services/geminiService';

interface AudioPlayerProps {
  text: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text }) => {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const handlePlay = async () => {
    if (playing) {
      sourceNodeRef.current?.stop();
      setPlaying(false);
      return;
    }

    setLoading(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      // Essential for some browsers to allow audio playback after initial interaction
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const audioBytes = await generateAudio(text);
      const buffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => setPlaying(false);
      source.start(0);
      sourceNodeRef.current = source;
      setPlaying(true);
    } catch (err) {
      console.error("Audio playback error:", err);
      alert("Virhe äänen toistossa. Yritä uudelleen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
        playing ? 'bg-red-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
      } disabled:opacity-50 active:scale-95`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Ladataan...
        </span>
      ) : playing ? (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
          Pysäytä
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Kuuntele
        </>
      )}
    </button>
  );
};

export default AudioPlayer;
