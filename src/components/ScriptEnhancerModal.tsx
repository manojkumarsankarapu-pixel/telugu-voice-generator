import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Wand2,
  Copy,
  Check,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  action: 'transliterate_and_translate' | 'expand_monologue' | 'create_dialogue';
  currentText: string;
  onApply: (text: string, suggestedVoice?: string, suggestedStyle?: string) => void;
}

export const ScriptEnhancerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  action,
  currentText,
  onApply,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && currentText) {
      handleEnhance();
    } else {
      setResult(null);
      setError(null);
    }
  }, [isOpen, action]);

  const handleEnhance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/enhance-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text: currentText }),
      });

      if (!res.ok) {
        throw new Error('Failed to enhance script from AI.');
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-amber-500/20 bg-slate-950 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white font-cinzel">
                {action === 'transliterate_and_translate'
                  ? 'Telugu Script & Poetic Translation'
                  : action === 'expand_monologue'
                  ? 'Cinematic Monologue Expansion'
                  : 'Screenplay Scene Generator'}
              </h3>
              <p className="text-xs text-slate-400">Powered by Gemini 3.8 Flash</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <p className="text-xs text-amber-200/90 font-medium tracking-wide">
              Analyzing Telugu prose & composing with Gemini…
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Content results */}
        {!loading && result && (
          <div className="space-y-4 text-xs">
            {action === 'transliterate_and_translate' && (
              <>
                {/* Telugu Script */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-amber-400 font-cinzel">
                      తెలుగు లిపి (Telugu Script)
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.teluguScript, 'telugu')}
                      className="flex items-center gap-1 text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'telugu' ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-base text-slate-100 font-telugu leading-relaxed">
                    {result.teluguScript}
                  </p>
                  <button
                    onClick={() => {
                      onApply(result.teluguScript);
                      onClose();
                    }}
                    className="mt-3 flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                  >
                    <span>Use this Telugu script in studio</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Romanized Telugu */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-300">
                      Phonetic Script (Romanized English letters)
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.romanTelugu, 'roman')}
                      className="flex items-center gap-1 text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'roman' ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-serif italic">
                    “{result.romanTelugu}”
                  </p>
                  <button
                    onClick={() => {
                      onApply(result.romanTelugu);
                      onClose();
                    }}
                    className="mt-3 flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                  >
                    <span>Use this phonetic script in studio</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* English Translation */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <span className="font-semibold text-slate-300 block mb-1">
                    English Poetic Translation
                  </span>
                  <p className="text-slate-300 italic">{result.englishTranslation}</p>
                  {result.moodDescription && (
                    <p className="mt-2 text-[11px] text-amber-400/80 border-t border-white/5 pt-1.5">
                      Mood: {result.moodDescription}
                    </p>
                  )}
                </div>
              </>
            )}

            {action === 'expand_monologue' && (
              <>
                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <span className="font-semibold text-amber-400 font-cinzel block mb-2">
                    Extended Telugu Script
                  </span>
                  <p className="text-base text-slate-100 font-telugu leading-relaxed">
                    {result.teluguScript}
                  </p>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <span className="font-semibold text-amber-300 block mb-2">
                    Cinematic Monologue (with Speech Cues)
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed italic font-serif">
                    “{result.romanTelugu}”
                  </p>
                  <div className="mt-3 text-[11px] text-slate-400 border-t border-white/5 pt-2">
                    Translation: {result.englishTranslation}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-amber-400/90">
                    <span>Suggested Voice: {result.suggestedVoice}</span>
                    <span>•</span>
                    <span>Style: {result.suggestedStyle}</span>
                  </div>
                  <button
                    onClick={() => {
                      onApply(result.romanTelugu, result.suggestedVoice, result.suggestedStyle);
                      onClose();
                    }}
                    className="mt-4 w-full py-2.5 rounded-lg bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Load Extended Monologue Into Studio</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}

            {action === 'create_dialogue' && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <h4 className="font-semibold text-purple-300">{result.title}</h4>
                  <p className="text-[11px] text-slate-400">{result.context}</p>
                </div>

                {Array.isArray(result.dialogue) &&
                  result.dialogue.map((item: any, i: number) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${
                        item.speaker === 'Kiran'
                          ? 'border-sky-500/20 bg-sky-500/5'
                          : 'border-rose-500/20 bg-rose-500/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{item.speaker}</span>
                        <span className="text-[10px] text-slate-400">{item.emotion}</span>
                      </div>
                      <p className="text-xs text-slate-200">{item.text}</p>
                    </div>
                  ))}

                <button
                  onClick={() => {
                    const fullText = (result.dialogue || [])
                      .map((d: any) => `${d.speaker}: ${d.text}`)
                      .join('\n');
                    onApply(fullText);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-lg bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition-colors"
                >
                  Load Dialogue Script Into Studio
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
