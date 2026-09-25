import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Play,
  Sparkles,
  MessageCircle,
  Wand2,
} from 'lucide-react';
import { VOICE_OPTIONS } from '../data/quotes';

export interface DialogueLine {
  id: string;
  speaker: 'Kiran' | 'Ananya';
  text: string;
  style?: string;
}

interface Props {
  onGenerateDialogue: (
    dialogue: DialogueLine[],
    speaker1: { name: string; voice: string; style: string },
    speaker2: { name: string; voice: string; style: string }
  ) => void;
  isLoading: boolean;
  onGenerateSceneWithAI: () => void;
}

export const DialogueStudio: React.FC<Props> = ({
  onGenerateDialogue,
  isLoading,
  onGenerateSceneWithAI,
}) => {
  const [speaker1, setSpeaker1] = useState({
    name: 'Kiran',
    voice: 'Puck',
    style: 'Deeply emotional, nostalgic Telugu man',
  });

  const [speaker2, setSpeaker2] = useState({
    name: 'Ananya',
    voice: 'Kore',
    style: 'Soft, tender, touching Telugu woman',
  });

  const [lines, setLines] = useState<DialogueLine[]>([
    {
      id: '1',
      speaker: 'Kiran',
      text: 'Appudu nuvvu naaku oka ammayi maatrame Ananya… <breath> kaani ee roju naa life lo entha important avuthundo naake teliyadu.',
      style: 'Nostalgic, gentle Telugu confession',
    },
    {
      id: '2',
      speaker: 'Ananya',
      text: '|mhm| <breath> Nenu kooda eppudu anukoledhu Kiran… mana dhooram kooda mana gnapakaalani chepaleka pothundani.',
      style: 'Softly smiling through quiet tears, whisper tone',
    },
    {
      id: '3',
      speaker: 'Kiran',
      text: 'Kshanala kante mana gnapakaalu eppatiki jeevinchi untaayi.',
      style: 'Warm, heartfelt final assurance',
    },
  ]);

  const addLine = () => {
    const lastSpeaker = lines.length > 0 ? lines[lines.length - 1].speaker : 'Kiran';
    const nextSpeaker = lastSpeaker === 'Kiran' ? 'Ananya' : 'Kiran';
    setLines([
      ...lines,
      {
        id: Date.now().toString(),
        speaker: nextSpeaker,
        text: '',
        style: '',
      },
    ]);
  };

  const updateLineText = (id: string, text: string) => {
    setLines(lines.map((l) => (l.id === id ? { ...l, text } : l)));
  };

  const updateLineSpeaker = (id: string, speaker: 'Kiran' | 'Ananya') => {
    setLines(lines.map((l) => (l.id === id ? { ...l, speaker } : l)));
  };

  const deleteLine = (id: string) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((l) => l.id !== id));
  };

  const handleGenerate = () => {
    const validLines = lines.filter((l) => l.text.trim().length > 0);
    if (validLines.length === 0) return;
    onGenerateDialogue(validLines, speaker1, speaker2);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 md:p-6 backdrop-blur-md shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-amber-400" />
          <div>
            <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-100">
              Dual-Speaker Telugu Screenplay (Gemini 3.8 Flash TTS)
            </h2>
            <p className="text-xs text-slate-400">
              Generate a multi-character romantic or nostalgic scene with natural backchannels
            </p>
          </div>
        </div>

        <button
          onClick={onGenerateSceneWithAI}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/25 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>Generate Telugu Scene with AI</span>
        </button>
      </div>

      {/* Speaker Configuration (Exactly 2 Speakers required by multiSpeakerVoiceConfig) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Speaker 1 */}
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Character 1 (He)
            </span>
            <span className="text-[10px] font-mono text-slate-400">Prebuilt Voice</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400">Character Name</label>
              <input
                type="text"
                value={speaker1.name}
                onChange={(e) => setSpeaker1({ ...speaker1, name: e.target.value })}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Voice</label>
              <select
                value={speaker1.voice}
                onChange={(e) => setSpeaker1({ ...speaker1, voice: e.target.value })}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
              >
                {VOICE_OPTIONS.filter((v) => v.gender === 'Male').map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Speaker 2 */}
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Character 2 (She)
            </span>
            <span className="text-[10px] font-mono text-slate-400">Prebuilt Voice</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400">Character Name</label>
              <input
                type="text"
                value={speaker2.name}
                onChange={(e) => setSpeaker2({ ...speaker2, name: e.target.value })}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Voice</label>
              <select
                value={speaker2.voice}
                onChange={(e) => setSpeaker2({ ...speaker2, voice: e.target.value })}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
              >
                {VOICE_OPTIONS.filter((v) => v.gender === 'Female').map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Script Lines */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Scene Dialogue Turn By Turn
        </label>

        {lines.map((line, idx) => {
          const isSpeaker1 = line.speaker === 'Kiran';
          return (
            <div
              key={line.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isSpeaker1
                  ? 'border-sky-500/30 bg-sky-500/5'
                  : 'border-rose-500/30 bg-rose-500/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">#{idx + 1}</span>
                  <select
                    value={line.speaker}
                    onChange={(e) => updateLineSpeaker(line.id, e.target.value as any)}
                    className="px-2.5 py-1 rounded bg-black/50 border border-white/10 text-xs font-semibold text-slate-200"
                  >
                    <option value="Kiran">{speaker1.name} (He)</option>
                    <option value="Ananya">{speaker2.name} (She)</option>
                  </select>
                </div>

                {lines.length > 2 && (
                  <button
                    onClick={() => deleteLine(line.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <textarea
                value={line.text}
                onChange={(e) => updateLineText(line.id, e.target.value)}
                rows={2}
                placeholder={`Telugu line for ${line.speaker === 'Kiran' ? speaker1.name : speaker2.name}…`}
                className="w-full rounded-lg bg-black/40 border border-white/10 p-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>
          );
        })}

        <button
          type="button"
          onClick={addLine}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-white/15 rounded-xl text-xs text-slate-400 hover:text-amber-300 hover:border-amber-500/40 hover:bg-white/5 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Dialogue Line</span>
        </button>
      </div>

      {/* Action CTA */}
      <div className="pt-2">
        <button
          onClick={handleGenerate}
          disabled={isLoading || lines.every((l) => !l.text.trim())}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/20 active:scale-[0.99] disabled:opacity-40 transition-all"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
              <span>Synthesizing Dual-Speaker Screenplay…</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              <span>Generate Dual-Speaker Scene with Gemini TTS</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
