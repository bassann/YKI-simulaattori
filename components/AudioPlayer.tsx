
import React, { useState, useRef } from 'react';
import { generateAudio, decodeAudioData } from '../services/geminiService';

interface AudioPlayerProps {
  text: string;
  variant?: 'button' | 'bar';
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, variant = 'button' }) => {
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
      alert("Virhe äänen toistossa.");
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'bar') {
    return (
      <div className="w-full my-8">
        <div className="relative group bg-slate-50 hover:bg-slate-100 transition-colors p-4 md:p-6 rounded-[2rem] border-2 border-slate-200 flex items-center gap-6 overflow-hidden">
          <button
            onClick={handlePlay}
            disabled={loading}
            className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 ${
              playing ? 'bg-red-500' : 'bg-purple-600 hover:bg-purple-700'
            } disabled:opacity-50`}
          >
            {loading ? (
              <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : playing ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-purple-900 font-black uppercase tracking-widest text-[10px]">Ääniraita</span>
              <span className="text-slate-400 font-bold text-[10px]">
                {playing ? 'Toistetaan...' : loading ? 'Ladataan...' : 'Valmis'}
              </span>
            </div>
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden relative">
              {playing && (
                <div className="absolute inset-0 bg-purple-500/20 animate-pulse"></div>
              )}
              <div 
                className={`h-full bg-purple-600 transition-all duration-300 ${playing ? 'w-full' : 'w-0'}`} 
                style={{ transitionDuration: playing ? '60s' : '0.3s' }}
              ></div>
            </div>
            {loading && (
              <p className="text-[10px] text-purple-600 font-bold animate-pulse">Äänen valmistelu voi kestää hetken...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full my-6 gap-4">
      <button
        onClick={handlePlay}
        disabled={loading}
        className={`flex flex-col items-center justify-center gap-3 w-40 h-40 rounded-full shadow-2xl transition-all border-8 border-white ${
          playing ? 'bg-red-500 scale-105' : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'
        } disabled:opacity-50 active:scale-95`}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : playing ? (
          <>
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            <span className="text-white font-black uppercase tracking-tighter text-[10px]">Pysäytä</span>
          </>
        ) : (
          <>
            <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="text-white font-black uppercase tracking-tighter text-[10px]">Toista</span>
          </>
        )}
      </button>
      {loading && (
        <p className="text-sm text-purple-600 font-bold animate-pulse">Äänen valmistelu voi kestää hetken...</p>
      )}
    </div>
  );
};

export default AudioPlayer;
