export interface TeluguQuote {
  id: string;
  category: 'love' | 'memories' | 'longing' | 'life';
  romanTelugu: string;
  teluguScript: string;
  englishTranslation: string;
  speaker: string;
  tag: string;
  suggestedVoice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  suggestedStyle: string;
  filmMood: string;
}

export const TELUGU_QUOTES: TeluguQuote[] = [
  {
    id: 'hero-quote',
    category: 'love',
    romanTelugu: 'Appudu aame naaku oka ammayi maatrame… kaani oka roju naa life lo entha important avuthundo naake teliyadu.',
    teluguScript: 'అప్పుడు ఆమె నాకు ఒక అమ్మాయి మాత్రమే… కానీ ఒక రోజు నా లైఫ్ లో ఎంత ఇంపార్టెంట్ అవుతుందో నాకే తెలియదు.',
    englishTranslation: 'Back then she was just a girl to me… but I had no idea how important she would become in my life one day.',
    speaker: 'Protagonist',
    tag: 'Featured Quote',
    suggestedVoice: 'Puck',
    suggestedStyle: 'Soft, heartfelt, nostalgic Telugu film monologue with a gentle pause',
    filmMood: 'Nostalgic Romance (Ye Maaye Chesave / Oye! Vibe)',
  },
  {
    id: 'memories-linger',
    category: 'memories',
    romanTelugu: 'Kshanala kante gnapakaalu ekkuva migilipoye vela... <breath> prathi chinna maata kooda oka paata la maaruthundi.',
    teluguScript: 'క్షణాల కంటే జ్ఞాపకాలు ఎక్కువ మిగిలిపోయే వేళ... ప్రతి చిన్న మాట కూడా ఒక పాట లా మారుతుంది.',
    englishTranslation: 'When memories linger longer than passing moments... every little whisper turns into an endless melody.',
    speaker: 'Narrator',
    tag: 'Poetic Memory',
    suggestedVoice: 'Zephyr',
    suggestedStyle: 'Deep, reflective, contemplative cinematic voice',
    filmMood: 'Rainy Night Train Monologue',
  },
  {
    id: 'longing-whisper',
    category: 'longing',
    romanTelugu: 'Ninnu kalusukunna roju kaalam aagipoyindi anukunna... <breath> Kaani kaalam parigeduthundi, naa manasulo nee gnapakam maatrame aagipoyindi.',
    teluguScript: 'నిన్ను కలుసుకున్న రోజు కాలం ఆగిపోయింది అనుకున్నా... కానీ కాలం పరిగెడుతుంది, నా మనసులో నీ జ్ఞాపకం మాత్రమే ఆగిపోయింది.',
    englishTranslation: 'The day I met you, I thought time froze... Time kept running, but in my heart, only your memory remained still.',
    speaker: 'Lover',
    tag: 'Heartbreak & Longing',
    suggestedVoice: 'Kore',
    suggestedStyle: 'Tender, intimate, soft female whisper with melancholic grace',
    filmMood: 'Midnight Longing',
  },
  {
    id: 'life-philosophy',
    category: 'life',
    romanTelugu: 'Oka chinna navvu tho modhalaina katha... jeevithamantha gurthundipoye oka adbhuthamaina gnapakam ga maaruthundi.',
    teluguScript: 'ఒక చిన్న నవ్వు తో మొదలైన కథ... జీవితమంతా గుర్తుండిపోయే ఒక అద్భుతమైన జ్ఞాపకం గా మారుతుంది.',
    englishTranslation: 'A story that began with a quiet smile... turns into a wondrous memory that stays for a lifetime.',
    speaker: 'Storyteller',
    tag: 'Life & Hope',
    suggestedVoice: 'Fenrir',
    suggestedStyle: 'Warm, resonant, inspiring theatrical storytelling',
    filmMood: 'Golden Hour Sunset',
  },
  {
    id: 'she-whispers',
    category: 'love',
    romanTelugu: 'Nuvvu nannu chusina aa kshanam... naa lokame maaripoyindi. Eppatiki marchipolenu.',
    teluguScript: 'నువ్వు నన్ను చూసిన ఆ క్షణం... నా లోకమే మారిపోయింది. ఎప్పటికీ మర్చిపోలేను.',
    englishTranslation: 'The exact second you looked into my eyes... my whole universe changed. I can never forget it.',
    speaker: 'Ananya',
    tag: 'Soulmate',
    suggestedVoice: 'Charon',
    suggestedStyle: 'Soft, gentle, whisper-like romantic declaration',
    filmMood: 'Coffee Shop Evening',
  },
];

export const VOICE_OPTIONS = [
  {
    id: 'Puck',
    name: 'Puck (కిరణ్ / Kiran)',
    gender: 'Male',
    tone: 'Nostalgic, warm & emotional',
    idealFor: 'Monologues, youthful memories, Telugu cinema hero style',
  },
  {
    id: 'Kore',
    name: 'Kore (అనన్య / Ananya)',
    gender: 'Female',
    tone: 'Soft, tender, deeply poignant',
    idealFor: 'Poetic verses, romantic reflections, heartfelt confessions',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr (రాఘవ / Raghava)',
    gender: 'Male',
    tone: 'Deep, philosophical, velvety',
    idealFor: 'Trailer narration, midnight thoughts, deep contemplation',
  },
  {
    id: 'Charon',
    name: 'Charon (సిరి / Siri)',
    gender: 'Female',
    tone: 'Gentle, whispering, intimate',
    idealFor: 'Soft diary entries, quiet nostalgia, delicate poems',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir (విక్రమ్ / Vikram)',
    gender: 'Male',
    tone: 'Resonant, cinematic, intense',
    idealFor: 'Dramatic climaxes, powerful dialogues, expressive delivery',
  },
];

export const STYLE_PRESETS = [
  {
    label: 'Cinematic Monologue',
    value: 'Deeply emotional, soft-spoken, cinematic Telugu monologue with heartfelt pauses',
    icon: 'Film',
  },
  {
    label: 'Late Night Whisper',
    value: 'Intimate, quiet romantic whisper in Telugu, tender tone with subtle <breath> pauses',
    icon: 'Moon',
  },
  {
    label: 'Poetic Storyteller',
    value: 'Warm, melodic Telugu voice narration, gentle rhythm like an audio story',
    icon: 'Sparkles',
  },
  {
    label: 'Dramatic Film Monologue',
    value: 'Passionate and moving Telugu movie scene delivery, expressive and touching',
    icon: 'Flame',
  },
];
