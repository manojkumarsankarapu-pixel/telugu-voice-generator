import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  CloudRain,
  Train,
  Music,
  Coffee,
  Languages,
  Check,
  Share2,
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { soundscape, AMBIENT_PRESETS } from '../utils/audioEngine';

interface Props {
  audioUrl: string | null;
  text: string;
  teluguScript?: string;
  englishTranslation?: string;
  speakerName: string;
  voiceName: string;
  styleDescription: string;
  duration?: number;
  onReGenerate?: () => void;
}

export const AudioPlayerCard: React.FC<Props> = ({
  audioUrl,
  text,
  teluguScript,
  englishTranslation,
  speakerName,
  voiceName,
  styleDescription,
  onReGenerate,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [ambientTrack, setAmbientTrack] = useState<string | null>(null);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.2);
  const [displayMode, setDisplayMode] = useState<'roman' | 'telugu' | 'english'>('roman');
  const [copied, setCopied] = useState<boolean>(false);

  // Sync ambient soundscape with narration playback
  useEffect(() => {
    soundscape.setVolume(ambientVolume);
    if (isPlaying && ambientTrack) {
      soundscape.playAmbient(ambientTrack);
    } else {
      soundscape.stopAmbient();
    }
  }, [isPlaying, ambientTrack, ambientVolume]);

  useEffect(() => {
    return () => {
      soundscape.stopAmbient();
    };
  }, []);

  const handleAmbientChange = (trackId: string | null) => {
    if (ambientTrack === trackId) {
      setAmbientTrack(null);
      soundscape.stopAmbient();
    } else {
      setAmbientTrack(trackId);
      if (trackId && isPlaying) {
        soundscape.playAmbient(trackId);
      }
    }
  };

  const handleAmbientVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    soundscape.setVolume(vol);
  };

  // Audio handling
  useEffect(() => {
    if (!audioUrl) return;
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = audioUrl;
    audio.load();
    setCurrentTime(0);

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    // Auto-play when generated
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Auto-play blocked by browser policy until interaction
          setIsPlaying(false);
        });
    }

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleReplay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().then(() => setIsPlaying(true)).catch(console.error);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleVolumeToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.muted = false;
      setIsMuted(false);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyQuote = () => {
    const quoteToCopy =
      displayMode === 'telugu' && teluguScript
        ? teluguScript
        : displayMode === 'english' && englishTranslation
        ? englishTranslation
        : text;
    navigator.clipboard.writeText(quoteToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ambientIcons: Record<string, any> = {
    rain: CloudRain,
    train: Train,
    chords: Music,
    cafe: Coffee,
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-[#141824]/90 to-[#0d101a]/95 p-6 backdrop-blur-xl shadow-2xl transition-all duration-300">
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Decorative ambient background blur */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      {/* Top Header & Meta */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            {isPlaying && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isPlaying ? 'bg-amber-500' : 'bg-slate-600'
              }`}
            />
          </span>
          <div>
            <h3 className="font-cinzel text-xs tracking-widest uppercase text-amber-300/90 font-semibold">
              Gemini 3.8 Flash TTS • Master Audio
            </h3>
            <p className="text-xs text-slate-400">
              Voice: <span className="text-slate-200 font-medium">{voiceName}</span> • Speaker: {speakerName}
            </p>
          </div>
        </div>

        {/* Script script view toggles */}
        <div className="flex items-center gap-1 rounded-lg bg-black/40 p-1 border border-white/5">
          <button
            onClick={() => setDisplayMode('roman')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              displayMode === 'roman'
                ? 'bg-amber-500/20 text-amber-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Roman
          </button>
          <button
            onClick={() => setDisplayMode('telugu')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              displayMode === 'telugu'
                ? 'bg-amber-500/20 text-amber-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            తెలుగు
          </button>
          <button
            onClick={() => setDisplayMode('english')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              displayMode === 'english'
                ? 'bg-amber-500/20 text-amber-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Cinematic Quote Display */}
      <div className="relative z-10 my-5 rounded-xl bg-black/30 p-5 border border-white/5">
        <blockquote className="text-lg md:text-xl leading-relaxed text-amber-100/95 italic font-serif">
          {displayMode === 'telugu' && teluguScript
            ? `“${teluguScript}”`
            : displayMode === 'english' && englishTranslation
            ? `“${englishTranslation}”`
            : `“${text}”`}
        </blockquote>

        {displayMode !== 'english' && englishTranslation && (
          <p className="mt-3 text-xs text-slate-400 border-t border-white/5 pt-2 italic">
            Meaning: "{englishTranslation}"
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-amber-400/70">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <Sparkles className="h-3 w-3 text-amber-400" />
            Style: {styleDescription}
          </span>
          <button
            onClick={handleCopyQuote}
            className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Waveform Visualizer */}
      <AudioVisualizer isPlaying={isPlaying} accentColor="#f59e0b" />

      {/* Main Seek & Progress Bar */}
      <div className="relative z-10 mt-3 space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.05}
          value={currentTime}
          onChange={handleSeek}
          disabled={!audioUrl}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 disabled:opacity-40 transition-all"
        />
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Player Controls Bar */}
      <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Replay */}
          <button
            onClick={handleReplay}
            disabled={!audioUrl}
            title="Replay from start"
            className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Big Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={!audioUrl}
            className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100"
          >
            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
          </button>

          {/* Volume Mute */}
          <button
            onClick={handleVolumeToggle}
            className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Playback Speed selector */}
          <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1 border border-white/5 text-[11px]">
            {[0.8, 1.0, 1.2].map((rate) => (
              <button
                key={rate}
                onClick={() => handleRateChange(rate)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  playbackRate === rate ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons: Download & Regenerate */}
        <div className="flex items-center gap-2">
          {audioUrl && (
            <a
              href={audioUrl}
              download="gnapakam_telugu_voice.wav"
              className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl bg-white/5 hover:bg-white/10 text-amber-200 border border-white/10 transition-colors shadow-sm"
              title="Download high-fidelity 24kHz WAV"
            >
              <Download className="h-3.5 w-3.5 text-amber-400" />
              <span>Download WAV</span>
            </a>
          )}
          {onReGenerate && (
            <button
              onClick={onReGenerate}
              className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Regenerate Voice</span>
            </button>
          )}
        </div>
      </div>

      {/* Cinematic Ambient Soundscape Mixer Section */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Music className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Cinematic Ambient Soundscapes (Mix with Narration)
            </span>
          </div>
          {ambientTrack && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Ambient Mix:</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={ambientVolume}
                onChange={(e) => handleAmbientVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] font-mono text-slate-400 w-6">
                {Math.round(ambientVolume * 100)}%
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AMBIENT_PRESETS.map((track) => {
            const Icon = ambientIcons[track.type] || Music;
            const isActive = ambientTrack === track.id;
            return (
              <button
                key={track.id}
                onClick={() => handleAmbientChange(track.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-amber-500/60 bg-amber-500/15 text-amber-200 shadow-md shadow-amber-500/10'
                    : 'border-white/5 bg-black/20 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-medium truncate">{track.name}</div>
                  <div className="text-[10px] text-slate-400 font-telugu truncate">{track.teluguName}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
