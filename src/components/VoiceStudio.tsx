import React, { useState } from 'react';
import {
  Mic,
  Sparkles,
  Sliders,
  Volume2,
  Wand2,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { VOICE_OPTIONS, STYLE_PRESETS, TeluguQuote } from '../data/quotes';

interface Props {
  text: string;
  setText: (t: string) => void;
  voiceName: string;
  setVoiceName: (v: string) => void;
  stylePrompt: string;
  setStylePrompt: (s: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onOpenEnhancer: (action: 'transliterate_and_translate' | 'expand_monologue' | 'create_dialogue') => void;
  onSelectQuote: (q: TeluguQuote) => void;
  quotesList: TeluguQuote[];
}

export const VoiceStudio: React.FC<Props> = ({
  text,
  setText,
  voiceName,
  setVoiceName,
  stylePrompt,
  setStylePrompt,
  onGenerate,
  isLoading,
  onOpenEnhancer,
  onSelectQuote,
  quotesList,
}) => {
  const [showStylePresets, setShowStylePresets] = useState(false);

  const insertTag = (tag: string) => {
    const newText = text + (text.endsWith(' ') || text.length === 0 ? '' : ' ') + tag + ' ';
    setText(newText);
  };

  return (
    <div className="space-y-6">
      {/* Script Input Card */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 md:p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-200">
              Telugu Dialogue / Monologue Script
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenEnhancer('transliterate_and_translate')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-colors"
              title="Convert to Telugu script & get English translation"
            >
              <Wand2 className="h-3 w-3" />
              <span>తెలుగు Script & Meaning</span>
            </button>
            <button
              onClick={() => onOpenEnhancer('expand_monologue')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors"
              title="Expand into a deep 4-line cinematic monologue"
            >
              <Sparkles className="h-3 w-3" />
              <span>Expand Monologue</span>
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Type your Telugu quote in English letters (e.g., Appudu aame naaku oka ammayi maatrame…) or Telugu script…"
            className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans text-base leading-relaxed resize-none transition-all shadow-inner"
          />
        </div>

        {/* Vocal Bursts & Expressive Cues Chips (Supported by gemini-3.8-flash-tts) */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            Vocal cues for Flash-TTS:
          </span>
          {[
            { label: '<breath>', desc: 'Natural emotional breath' },
            { label: '...', desc: 'Reflective pause' },
            { label: '<sigh>', desc: 'Soft melancholic sigh' },
            { label: '<gasp>', desc: 'Subtle gasp' },
            { label: '|yeah|', desc: 'Backchannel agreement' },
            { label: '|mhm|', desc: 'Gentle assent' },
          ].map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => insertTag(tag.label)}
              title={tag.desc}
              className="px-2.5 py-1 text-xs font-mono rounded-lg bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-white/5 transition-colors"
            >
              + {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Selection & Persona */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 md:p-6 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-200">
              Select Voice Persona (gemini-3.8-flash-tts)
            </h2>
          </div>
          <span className="text-[11px] text-amber-400/80 font-mono">24kHz Audio Output</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {VOICE_OPTIONS.map((voice) => {
            const isSelected = voiceName === voice.id;
            return (
              <div
                key={voice.id}
                onClick={() => setVoiceName(voice.id)}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all relative ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                    : 'border-white/5 bg-black/20 hover:bg-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-100">{voice.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      voice.gender === 'Female'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-sky-500/20 text-sky-300'
                    }`}
                  >
                    {voice.gender}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-amber-300/80 font-medium">{voice.tone}</p>
                <p className="mt-1 text-[11px] text-slate-400 leading-snug">{voice.idealFor}</p>
              </div>
            );
          })}
        </div>

        {/* Voice Style & Tone Prompt */}
        <div className="mt-5 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-amber-400" />
              Emotional Tone / Style Prompt
            </label>
            <button
              type="button"
              onClick={() => setShowStylePresets(!showStylePresets)}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              {showStylePresets ? 'Hide presets' : 'Choose presets'}
            </button>
          </div>

          {showStylePresets && (
            <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setStylePrompt(preset.value);
                    setShowStylePresets(false);
                  }}
                  className="flex items-center justify-between p-2 rounded-lg bg-black/30 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 text-left text-xs text-slate-300 transition-all"
                >
                  <span className="font-medium text-amber-200">{preset.label}</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[180px]">{preset.value}</span>
                </button>
              ))}
            </div>
          )}

          <input
            type="text"
            value={stylePrompt}
            onChange={(e) => setStylePrompt(e.target.value)}
            placeholder="e.g. Deeply emotional, soft-spoken, cinematic Telugu monologue with heartfelt pauses"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Generate Audio CTA */}
        <div className="mt-5 pt-2">
          <button
            onClick={onGenerate}
            disabled={isLoading || !text.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                <span>Synthesizing Voice with Gemini 3.8 Flash TTS…</span>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 text-slate-950 fill-current" />
                <span>Convert to Speech (gemini-3.8-flash-tts)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Curated Telugu Quotes Showcase */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-200">
              Curated Telugu Cinematic Quotes & Dialogues
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Click any quote to load</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {quotesList.map((quote) => {
            const isCurrent = text.includes(quote.romanTelugu.slice(0, 30));
            return (
              <div
                key={quote.id}
                onClick={() => onSelectQuote(quote)}
                className={`group cursor-pointer rounded-xl border p-3 transition-all ${
                  isCurrent
                    ? 'border-amber-500/60 bg-amber-500/10'
                    : 'border-white/5 bg-black/20 hover:bg-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-white/5 text-amber-300">
                    {quote.tag}
                  </span>
                  <span className="text-[10px] text-slate-400">{quote.filmMood}</span>
                </div>
                <p className="text-xs text-slate-200 line-clamp-2 italic font-serif group-hover:text-amber-200 transition-colors">
                  “{quote.romanTelugu}”
                </p>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-1 font-telugu">
                  {quote.teluguScript}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
