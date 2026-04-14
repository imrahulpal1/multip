const disciplineDictionary = {
  biology: {
    cell: { es: 'celula biologica', fr: 'cellule biologique', de: 'biologische Zelle', hi: 'जैविक कोशिका' },
  },
  physics: {
    cell: { es: 'celda electroquimica', fr: 'cellule electrochimique', de: 'elektrochemische Zelle', hi: 'विद्युत रासायनिक सेल' },
  },
  history: {
    cell: { es: 'celda de prision', fr: 'cellule de prison', de: 'Gefangniszelle', hi: 'कारागार कक्ष' },
  },
}

const languageMap = { spanish: 'es', french: 'fr', german: 'de', hindi: 'hi', english: 'en' }

export const contextAwareTranslate = ({ text, discipline, targetLanguage }) => {
  const lang = languageMap[targetLanguage.toLowerCase()] || 'en'
  let translated = text
  Object.entries(disciplineDictionary[discipline] || {}).forEach(([term, values]) => {
    const termTranslation = values[lang]
    if (termTranslation) {
      translated = translated.replace(new RegExp(`\\b${term}\\b`, 'gi'), termTranslation)
    }
  })
  return translated
}

export const lectureCompanion = ({ text, targetLanguage }) => {
  const chunks = text.split(/[.!?]/).map((line) => line.trim()).filter(Boolean)
  const summary = chunks.slice(0, 2).join('. ') || 'No content provided.'
  const keyTakeaways = chunks.slice(0, 4).map((item) => `- ${item}`)
  const simplified = `In simple ${targetLanguage}: ${summary}`
  return { summary, keyTakeaways, simplified }
}

export const getAdaptivePath = ({ averageScore, courseLevel }) => {
  const normalized = courseLevel.toLowerCase()
  const base = normalized === 'advanced' ? 3 : normalized === 'intermediate' ? 2 : 1
  const difficultyTier = averageScore >= 85 ? base + 1 : averageScore >= 60 ? base : Math.max(1, base - 1)
  const label = difficultyTier >= 4 ? 'Expert' : difficultyTier === 3 ? 'Advanced' : difficultyTier === 2 ? 'Intermediate' : 'Beginner'
  return {
    difficulty: label,
    recommendedReading: difficultyTier >= 3 ? 'Case-study heavy reading modules' : 'Guided concept notes with examples',
    quizMode: difficultyTier >= 3 ? 'Timed scenario quiz' : 'Foundational checkpoint quiz',
  }
}

export const translateForumText = (text, fromLanguage, toLanguage) => {
  if (fromLanguage === toLanguage) return text
  return `[${fromLanguage} -> ${toLanguage}] ${text}`
}

// Context-aware explanation templates per language and discipline
const explanationTemplates = {
  English: {
    biology: (q) => `In biology, "${q}" relates to cellular processes and living organisms. For example, photosynthesis is how plants convert sunlight into chemical energy stored in glucose.`,
    physics: (q) => `In physics, "${q}" involves principles of energy, force, and motion. Newton's Second Law states F = ma — force equals mass times acceleration.`,
    history: (q) => `Historically, "${q}" was a pivotal event that shaped civilizations. Understanding the political and social context of the era is key to grasping its significance.`,
    mathematics: (q) => `In mathematics, "${q}" can be proven using fundamental axioms. The Pythagorean theorem (a² + b² = c²) is a classic example of deductive reasoning.`,
    default: (q) => `Great question! "${q}" is best understood through real-world examples. The academic context helps clarify the precise meaning of the concept.`,
  },
  Spanish: {
    biology: (q) => `En biología, "${q}" se refiere a procesos celulares y organismos vivos. Por ejemplo, la fotosíntesis convierte luz solar en energía química dentro de las células vegetales.`,
    physics: (q) => `En física, "${q}" involucra principios de energía, fuerza y movimiento. La segunda ley de Newton establece que F = ma.`,
    history: (q) => `Históricamente, "${q}" fue un evento clave que moldeó civilizaciones. El contexto político y social de la época influyó directamente en su desarrollo.`,
    mathematics: (q) => `En matemáticas, "${q}" se puede demostrar usando axiomas fundamentales. El teorema de Pitágoras establece que a² + b² = c².`,
    default: (q) => `En español, "${q}" se entiende mejor con ejemplos del mundo real. El contexto académico ayuda a comprender el significado preciso del término.`,
  },
  French: {
    biology: (q) => `En biologie, "${q}" concerne les processus cellulaires et les organismes vivants. La mitose est le processus par lequel une cellule se divise en deux cellules identiques.`,
    physics: (q) => `En physique, "${q}" implique des principes d'énergie et de mouvement. La loi de conservation de l'énergie stipule que l'énergie ne peut être ni créée ni détruite.`,
    history: (q) => `Historiquement, "${q}" a façonné les civilisations. La Révolution française illustre comment les idées transforment les sociétés.`,
    mathematics: (q) => `En mathématiques, "${q}" peut être démontré à l'aide d'axiomes fondamentaux. Le théorème de Pythagore en est un exemple classique.`,
    default: (q) => `En français, "${q}" peut être mieux compris avec des exemples concrets. Le contexte académique aide à saisir le sens précis du terme.`,
  },
  German: {
    biology: (q) => `In der Biologie bezieht sich "${q}" auf zelluläre Prozesse und lebende Organismen. Die Zellteilung (Mitose) ist ein grundlegender biologischer Vorgang.`,
    physics: (q) => `In der Physik beschreibt "${q}" Prinzipien von Energie und Bewegung. Newtons Gesetze bilden die Grundlage der klassischen Mechanik.`,
    history: (q) => `Historisch gesehen war "${q}" ein Schlüsselereignis, das Zivilisationen geprägt hat. Der historische Kontext ist entscheidend für das Verständnis.`,
    mathematics: (q) => `In der Mathematik kann "${q}" mit grundlegenden Axiomen bewiesen werden. Der Satz des Pythagoras ist ein klassisches Beispiel.`,
    default: (q) => `Auf Deutsch lässt sich "${q}" am besten mit praktischen Beispielen verstehen. Der akademische Kontext hilft, die genaue Bedeutung zu erfassen.`,
  },
  Hindi: {
    biology: (q) => `जीव विज्ञान में, "${q}" कोशिकीय प्रक्रियाओं से संबंधित है। प्रकाश संश्लेषण में पौधे सूर्य के प्रकाश को ऊर्जा में बदलते हैं।`,
    physics: (q) => `भौतिकी में, "${q}" ऊर्जा और गति के सिद्धांतों से जुड़ा है। न्यूटन का दूसरा नियम: बल = द्रव्यमान × त्वरण।`,
    history: (q) => `ऐतिहासिक दृष्टि से, "${q}" एक महत्वपूर्ण घटना थी। भारतीय स्वतंत्रता संग्राम इसका एक उत्कृष्ट उदाहरण है।`,
    mathematics: (q) => `गणित में, "${q}" को मूल स्वयंसिद्धों से सिद्ध किया जा सकता है। पाइथागोरस प्रमेय: a² + b² = c²।`,
    default: (q) => `हिंदी में, "${q}" को वास्तविक जीवन के उदाहरणों से बेहतर समझा जा सकता है।`,
  },
  Japanese: {
    biology: (q) => `生物学では、「${q}」は細胞プロセスと生物に関連しています。光合成は植物が太陽光をエネルギーに変換するプロセスです。`,
    physics: (q) => `物理学では、「${q}」はエネルギーと運動の原理に関わります。ニュートンの第二法則はF=maで表されます。`,
    default: (q) => `「${q}」は実際の例を使って理解するのが最も効果的です。学術的な文脈が正確な意味の把握に役立ちます。`,
  },
  Arabic: {
    default: (q) => `بالعربية، يمكن فهم "${q}" بشكل أفضل من خلال أمثلة من الحياة الواقعية. السياق الأكاديمي يساعد على استيعاب المعنى الدقيق للمصطلح.`,
  },
  Mandarin: {
    default: (q) => `用中文来说，"${q}"可以通过实际例子更好地理解。学术背景有助于掌握该术语的精确含义。`,
  },
  Korean: {
    default: (q) => `한국어로 "${q}"는 실제 예시를 통해 더 잘 이해할 수 있습니다. 학문적 맥락이 용어의 정확한 의미를 파악하는 데 도움이 됩니다.`,
  },
  Portuguese: {
    default: (q) => `Em português, "${q}" pode ser melhor compreendido com exemplos práticos. O contexto acadêmico ajuda a captar o significado preciso do termo.`,
  },
}

export const contextAwareExplain = ({ question, language = 'English', discipline = 'default' }) => {
  const langTemplates = explanationTemplates[language] || explanationTemplates['English']
  const template = langTemplates[discipline.toLowerCase()] || langTemplates['default']
  return template(question)
}
