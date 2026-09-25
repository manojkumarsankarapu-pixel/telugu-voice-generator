/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  Mic,
  Users,
  Compass,
  Headphones,
  Moon,
  Sun,
  CloudRain,
  Star,
  Film,
  Bookmark,
  Share2,
  History,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { TELUGU_QUOTES, TeluguQuote, VOICE_OPTIONS, STYLE_PRESETS } from './data/quotes';
import { VisualThemeBackdrop, BackdropTheme } from './components/VisualThemeBackdrop';
import { AudioPlayerCard } from './components/AudioPlayerCard';
import { VoiceStudio } from './components/VoiceStudio';
import { DialogueStudio, DialogueLine } from './components/DialogueStudio';
import { ScriptEnhancerModal } from './components/ScriptEnhancerModal';

interface GeneratedMemory {
  id: string;
  text: string;
  teluguScript?: string;
  englishTranslation?: string;
  speaker: string;
  voiceName: string;
  style: string;
  audioUrl: string;
  timestamp: number;
}

export default function App() {
  const initialQuote = TELUGU_QUOTES[0];

  // Core Studio State
  const [text, setText] = useState<string>(initialQuote.romanTelugu);
  const [teluguScript, setTeluguScript] = useState<string>(initialQuote.teluguScript);
  const [englishTranslation, setEnglishTranslation] = useState<string>(initialQuote.englishTranslation);
  const [voiceName, setVoiceName] = useState<string>(initialQuote.suggestedVoice);
  const [stylePrompt, setStylePrompt] = useState<string>(initialQuote.suggestedStyle);
  const [speakerName, setSpeakerName] = useState<string>('Protagonist');

  // Mode: Monologue vs Screenplay
  const [mode, setMode] = useState<'monologue' | 'screenplay'>('monologue');

  // Backdrop Theme
  const [theme, setTheme] = useState<BackdropTheme>('monsoon');

  // Generation status & Audio
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Enhancer Modal
  const [isEnhancerOpen, setIsEnhancerOpen] = useState(false);
  const [enhancerAction, setEnhancerAction] = useState<
    'transliterate_and_translate' | 'expand_monologue' | 'create_dialogue'
  >('transliterate_and_translate');

  // Saved / Generated History
  const [history, setHistory] = useState<GeneratedMemory[]>([]);

  // Automatically generate speech on first visit or trigger on user action
  const handleGenerateTTS = async (customText?: string, customVoice?: string, customStyle?: string) => {
    const speechText = customText || text;
    if (!speechText.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: speechText,
          voiceName: customVoice || voiceName,
          style: customStyle || stylePrompt,
          isMultiSpeaker: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to synthesize speech.');
      }

      setAudioUrl(data.audioUrl);

      // Save to recent memory creations
      const newMemory: GeneratedMemory = {
        id: Date.now().toString(),
        text: speechText,
        teluguScript: teluguScript,
        englishTranslation: englishTranslation,
        speaker: speakerName,
        voiceName: customVoice || voiceName,
        style: customStyle || stylePrompt,
        audioUrl: data.audioUrl,
        timestamp: Date.now(),
      };
      setHistory((prev) => [newMemory, ...prev.slice(0, 9)]);
    } catch (err: any) {
      console.error('Error generating audio:', err);
      setErrorMsg(err?.message || 'Could not generate speech. Please check server logs or API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDialogueTTS = async (
    dialogueParts: DialogueLine[],
    speaker1: { name: string; voice: string; style: string },
    speaker2: { name: string; voice: string; style: string }
  ) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isMultiSpeaker: true,
          dialogueParts: dialogueParts,
          speaker1,
          speaker2,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to synthesize multi-speaker dialogue.');
      }

      setAudioUrl(data.audioUrl);
      const combinedText = dialogueParts.map((d) => `${d.speaker}: ${d.text}`).join('\n');

      const newMemory: GeneratedMemory = {
        id: Date.now().toString(),
        text: combinedText,
        speaker: `${speaker1.name} & ${speaker2.name}`,
        voiceName: `${speaker1.voice} + ${speaker2.voice}`,
        style: 'Dual-Speaker Telugu Screenplay',
        audioUrl: data.audioUrl,
        timestamp: Date.now(),
      };
      setHistory((prev) => [newMemory, ...prev.slice(0, 9)]);
    } catch (err: any) {
      console.error('Error generating dialogue audio:', err);
      setErrorMsg(err?.message || 'Could not generate screenplay speech.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuote = (quote: TeluguQuote) => {
    setText(quote.romanTelugu);
    setTeluguScript(quote.teluguScript);
    setEnglishTranslation(quote.englishTranslation);
    setVoiceName(quote.suggestedVoice);
    setStylePrompt(quote.suggestedStyle);
    setSpeakerName(quote.speaker);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyEnhancedScript = (
    newText: string,
    suggestedVoice?: string,
    suggestedStyle?: string
  ) => {
    setText(newText);
    if (suggestedVoice) setVoiceName(suggestedVoice);
    if (suggestedStyle) setStylePrompt(suggestedStyle);
  };

  const openEnhancer = (action: 'transliterate_and_translate' | 'expand_monologue' | 'create_dialogue') => {
    setEnhancerAction(action);
    setIsEnhancerOpen(true);
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Visual Atmosphere */}
      <VisualThemeBackdrop theme={theme} isPlaying={Boolean(audioUrl)} />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <span className="font-telugu text-lg">జ్ఞా</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel text-base md:text-lg font-bold tracking-wider text-amber-200">
                  GNAPAKAM
                </h1>
                <span className="font-telugu text-xs text-amber-400/80 font-normal">జ్ఞాపకం</span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  gemini-3.8-flash-tts
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Cinematic Telugu Voice & Memory Studio</p>
            </div>
          </div>

          {/* Mode Switcher & Theme Selector */}
          <div className="flex items-center gap-2">
            {/* Monologue / Screenplay Tab */}
            <div className="flex items-center rounded-xl bg-black/40 p-1 border border-white/10">
              <button
                onClick={() => setMode('monologue')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                  mode === 'monologue'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="h-3.5 w-3.5" />
                <span>Monologue</span>
              </button>
              <button
                onClick={() => setMode('screenplay')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                  mode === 'screenplay'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Screenplay (2-Speaker)</span>
              </button>
            </div>

            {/* Atmosphere theme selector */}
            <div className="flex items-center gap-1 rounded-xl bg-black/40 p-1 border border-white/10">
              {[
                { id: 'monsoon', label: 'Rain', icon: CloudRain },
                { id: 'golden', label: 'Sunset', icon: Sun },
                { id: 'starry', label: 'Night', icon: Star },
                { id: 'midnight', label: 'Slate', icon: Moon },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as BackdropTheme)}
                    title={`Theme: ${t.label}`}
                    className={`p-1.5 rounded-lg transition-colors ${
                      theme === t.id
                        ? 'bg-white/15 text-amber-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Error Notification */}
        {errorMsg && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3 text-xs text-red-200 backdrop-blur-md">
            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1 space-y-1">
              <div>
                <span className="font-semibold text-red-300">Notice: </span>
                {errorMsg}
              </div>
              {errorMsg.toLowerCase().includes('quota') && (
                <p className="text-[11px] text-amber-300/90">
                  Tip: Gemini free tier allows up to 10 TTS requests per minute. If you reach this limit, wait a few seconds before generating another audio take, or select a billing-enabled API key in the AI Studio Secrets panel.
                </p>
              )}
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-400 hover:text-red-200 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Audio Player Card (Active or Ready) */}
        {audioUrl ? (
          <AudioPlayerCard
            audioUrl={audioUrl}
            text={text}
            teluguScript={teluguScript}
            englishTranslation={englishTranslation}
            speakerName={speakerName}
            voiceName={voiceName}
            styleDescription={stylePrompt}
            onReGenerate={() => handleGenerateTTS()}
          />
        ) : (
          /* Empty / Initial State Prompt Banner */
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-black/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                <Sparkles className="h-3 w-3" />
                Featured Telugu Voice Monologue
              </span>
              <h2 className="text-xl md:text-2xl font-serif italic text-amber-100 font-medium">
                “Appudu aame naaku oka ammayi maatrame… kaani oka roju naa life lo entha important avuthundo naake teliyadu.”
              </h2>
              <p className="text-xs text-slate-400 font-telugu">
                అప్పుడు ఆమె నాకు ఒక అమ్మాయి మాత్రమే… కానీ ఒక రోజు నా లైఫ్ లో ఎంత ఇంపార్టెంట్ అవుతుందో నాకే తెలియదు.
              </p>
              <p className="text-xs text-slate-400 italic">
                “Back then she was just a girl to me… but I had no idea how important she would become in my life one day.”
              </p>
            </div>

            <button
              onClick={() => handleGenerateTTS()}
              disabled={isLoading}
              className="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                  <span>Synthesizing Voice…</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                  <span>Listen in Telugu (Gemini TTS)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Studio Workspace depending on mode */}
        {mode === 'monologue' ? (
          <VoiceStudio
            text={text}
            setText={setText}
            voiceName={voiceName}
            setVoiceName={setVoiceName}
            stylePrompt={stylePrompt}
            setStylePrompt={setStylePrompt}
            onGenerate={() => handleGenerateTTS()}
            isLoading={isLoading}
            onOpenEnhancer={openEnhancer}
            onSelectQuote={handleSelectQuote}
            quotesList={TELUGU_QUOTES}
          />
        ) : (
          <DialogueStudio
            onGenerateDialogue={handleGenerateDialogueTTS}
            isLoading={isLoading}
            onGenerateSceneWithAI={() => openEnhancer('create_dialogue')}
          />
        )}

        {/* History / Previous Takes */}
        {history.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 md:p-6 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-200">
                  Recent Generated Voice Takes
                </h3>
              </div>
              <span className="text-xs text-slate-400">{history.length} takes saved</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/5 bg-black/30 p-3.5 hover:border-amber-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-amber-300">{item.voiceName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 line-clamp-2 italic font-serif">
                      “{item.text}”
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
                    <button
                      onClick={() => {
                        setAudioUrl(item.audioUrl);
                        setText(item.text);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Replay Take</span>
                    </button>

                    <a
                      href={item.audioUrl}
                      download={`gnapakam_${item.voiceName.toLowerCase()}.wav`}
                      className="text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      Save .WAV
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Script Enhancer Modal */}
      <ScriptEnhancerModal
        isOpen={isEnhancerOpen}
        onClose={() => setIsEnhancerOpen(false)}
        action={enhancerAction}
        currentText={text}
        onApply={handleApplyEnhancedScript}
      />

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-xs text-slate-400 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-amber-300 font-semibold">GNAPAKAM (జ్ఞాపకం)</span>
            <span>•</span>
            <span>High-Fidelity Telugu Voice & Dialogue Studio</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Model: gemini-3.8-flash-tts</span>
            <span>•</span>
            <span>24,000 Hz Master PCM/WAV</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
