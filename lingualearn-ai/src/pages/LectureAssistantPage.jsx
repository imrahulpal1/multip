import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import StudySidebar from '../components/ui/StudySidebar'
import { Mic, Upload, RefreshCw, X, FileText, BookOpen, Languages, AlignLeft, History, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppStore } from '../hooks/useAppStore'
import { langCodeToName } from '../utils/i18n'
import { aiApi } from '../services/api'
import { useUser } from '@clerk/clerk-react'

const DEMO_RESULT_EN = {
  title: 'Cloud Computing — Overview',
  translation: `What is Cloud Computing?
Cloud computing is the on-demand delivery of IT resources over the internet with pay-as-you-go pricing. Instead of buying, owning, and maintaining physical data centers and servers, you can access technology services, such as computing power, storage, and databases, from cloud providers like Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP).

2. Key Characteristics
On-demand self-service: Provision resources automatically without human interaction with service providers.
Broad network access: Capabilities are available over the network and accessed through standard mechanisms (mobile phones, tablets, laptops).
Resource pooling: The provider's computing resources are pooled to serve multiple consumers using a multi-tenant model.
Rapid elasticity: Resources can be elastically provisioned and scale rapidly outward and inward commensurate with demand.
Measured service: Cloud systems automatically control and optimize resource use by leveraging a metering capability.

3. Cloud Service Models
Infrastructure as a Service (IaaS)
Contains the basic building blocks for cloud IT. It typically provides access to networking features, computers (virtual or on dedicated hardware), and data storage space.

Platform as a Service (PaaS)
Removes the need for organizations to manage the underlying infrastructure (usually hardware and operating systems) and allows you to focus on the deployment and management of your applications.

Software as a Service (SaaS)
Provides you with a completed product that is run and managed by the service provider (e.g., Gmail, Salesforce, Microsoft 365).`,
  explanation: `Cloud Computing is basically renting someone else's powerful computers over the internet instead of buying your own.

How it works: You pay only for what you use (like a utility bill). It scales up or down instantly based on your needs.

The 3 Main Types:
• IaaS: You rent the raw "digital land" and hardware.
• PaaS: You get a "ready-to-build" platform for your apps.
• SaaS: You just log in and use a finished app (like Gmail).`,
  keyTerms: [
    { term: 'IaaS', meaningInLang: 'Infrastructure as a Service — raw computing resources rented over the cloud', meaningInExample: 'Infraestructura como Servicio — recursos informáticos básicos en la nube', altMeaning: '', examplesInLang: ['AWS EC2 is an IaaS product that lets you rent virtual servers.', 'With IaaS you control the OS and runtime yourself.'], examplesInExampleLang: ['AWS EC2 es un producto IaaS que permite alquilar servidores virtuales.', 'Con IaaS tú controlas el sistema operativo.'] },
    { term: 'PaaS', meaningInLang: 'Platform as a Service — a managed environment to deploy applications', meaningInExample: 'Plataforma como Servicio — entorno gestionado para desplegar aplicaciones', altMeaning: '', examplesInLang: ['Heroku is a PaaS that handles servers so you only write code.', 'PaaS removes infrastructure management from developers.'], examplesInExampleLang: ['Heroku es un PaaS que gestiona servidores para que solo escribas código.', 'PaaS elimina la gestión de infraestructura.'] },
    { term: 'SaaS', meaningInLang: 'Software as a Service — fully managed apps accessed via browser', meaningInExample: 'Software como Servicio — aplicaciones completamente gestionadas', altMeaning: '', examplesInLang: ['Gmail is a SaaS — you just open a browser and use it.', 'Salesforce is a SaaS CRM used by millions of businesses.'], examplesInExampleLang: ['Gmail es un SaaS — solo abres el navegador y lo usas.', 'Salesforce es un CRM SaaS usado por millones de empresas.'] },
  ],
}

const DEMO_RESULT_FR = {
  title: 'Cloud Computing — Vue d’ensemble',
  translation: `Le Cloud Computing est la fourniture à la demande de ressources informatiques via Internet, avec une tarification au forfait (au fur et à mesure de l’utilisation). Au lieu d’acheter, de posséder et d’entretenir des centres de données et des serveurs physiques, vous pouvez accéder à des services technologiques, tels que la puissance de calcul, le stockage et les bases de données, auprès de fournisseurs de cloud comme Amazon Web Services (AWS), Microsoft Azure et Google Cloud Platform (GCP).

Caractéristiques Clés
Libre-service à la demande : Provisionnez des ressources automatiquement sans interaction humaine avec les fournisseurs de services.
Accès réseau étendu : Les capacités sont disponibles sur le réseau et accessibles via des mécanismes standards (téléphones mobiles, tablettes, ordinateurs portables).
Mise en commun des ressources : Les ressources informatiques du fournisseur sont mutualisées pour servir plusieurs consommateurs à l’aide d’un modèle multi-locataire.
Élasticité rapide : Les ressources peuvent être provisionnées et libérées de manière élastique pour évoluer rapidement, à la hausse ou à la baisse, en fonction de la demande.
Service mesuré : Les systèmes de cloud contrôlent et optimisent automatiquement l’utilisation des ressources en exploitant une capacité de mesure (comptage).

Modèles de Service Cloud
Infrastructure en tant que Service (IaaS)
Contient les blocs de construction fondamentaux de l’informatique en nuage. Il offre généralement un accès aux fonctionnalités réseau, aux ordinateurs (virtuels ou sur du matériel dédié) et à l’espace de stockage de données.

Plateforme en tant que Service (PaaS)
Élimine la nécessité pour les organisations de gérer l’infrastructure sous-jacente (généralement le matériel et les systèmes d’exploitation) et vous permet de vous concentrer sur le déploiement et la gestion de vos applications.`,
  explanation: `Contient les blocs de construction fondamentaux de l’informatique en nuage. Il offre généralement un accès aux fonctionnalités réseau, aux ordinateurs (virtuels ou sur du matériel dédié) et à l’espace de stockage de données.

Plateforme en tant que Service (PaaS)
Élimine la nécessité pour les organisations de gérer l’infrastructure sous-jacente (généralement le matériel et les systèmes d’exploitation) et vous permet de vous concentrer sur le déploiement et la gestion de vos applications.`,
  keyTerms: [
    { term: 'IaaS', meaningInLang: 'Infrastructure en tant que Service — ressources informatiques brutes louées via le cloud', meaningInExample: 'Infrastructure as a Service — raw computing resources rented over the cloud', altMeaning: '', examplesInLang: ['AWS EC2 est un produit IaaS qui permet de louer des serveurs virtuels.', 'Avec IaaS, vous contrôlez vous-même le système d’exploitation.'], examplesInExampleLang: ['AWS EC2 is an IaaS product that lets you rent virtual servers.', 'With IaaS you control the OS yourself.'] },
    { term: 'PaaS', meaningInLang: 'Plateforme en tant que Service — environnement géré pour déployer des applications', meaningInExample: 'Platform as a Service — managed environment to deploy applications', altMeaning: '', examplesInLang: ['Heroku est un PaaS qui gère les serveurs pour que vous n’écriviez que du code.', 'PaaS supprime la gestion de l’infrastructure pour les développeurs.'], examplesInExampleLang: ['Heroku is a PaaS that handles servers so you only write code.', 'PaaS removes infrastructure management from developers.'] },
    { term: 'SaaS', meaningInLang: 'Logiciel en tant que Service — applications entièrement gérées accessibles via un navigateur', meaningInExample: 'Software as a Service — fully managed apps accessed via browser', altMeaning: '', examplesInLang: ['Gmail est un SaaS — vous ouvrez simplement un navigateur et l’utilisez.', 'Salesforce est un CRM SaaS utilisé par des millions d’entreprises.'], examplesInExampleLang: ['Gmail is a SaaS — you just open a browser and use it.', 'Salesforce is a SaaS CRM used by millions of businesses.'] },
  ],
}

const getDemoResult = (lang) => lang === 'French' ? DEMO_RESULT_FR : DEMO_RESULT_EN

const DEMO_QUESTIONS = [
  { id: 1, topic: 'Cloud Computing', question: 'What is cloud computing?', options: ['A. On-demand delivery of IT resources over the internet', 'B. Buying and owning physical data centers', 'C. A type of local area network', 'D. A programming language'], correctIndex: 0, explanation: 'Cloud computing is the on-demand delivery of IT resources over the internet with pay-as-you-go pricing.', wrongExplanations: ['Buying physical infrastructure is the traditional model cloud replaces.', 'LANs are local networks, unrelated to cloud.', 'Cloud computing is a delivery model, not a language.'] },
  { id: 2, topic: 'Cloud Computing', question: 'Which pricing model does cloud computing use?', options: ['A. Annual flat fee', 'B. Pay-as-you-go', 'C. One-time purchase', 'D. Free forever'], correctIndex: 1, explanation: 'Cloud computing uses pay-as-you-go pricing — you only pay for what you use.', wrongExplanations: ['Annual flat fees are not the standard cloud model.', 'This is correct.', 'One-time purchase applies to traditional software licenses.', 'Cloud services are not free.'] },
  { id: 3, topic: 'IaaS', question: 'What does IaaS stand for?', options: ['A. Internet as a Service', 'B. Integration as a Service', 'C. Infrastructure as a Service', 'D. Information as a Service'], correctIndex: 2, explanation: 'IaaS stands for Infrastructure as a Service — it provides raw computing resources like servers and storage.', wrongExplanations: ['Internet as a Service is not a cloud model.', 'Integration as a Service is not a standard cloud tier.', 'This is correct.', 'Information as a Service is not a cloud service model.'] },
  { id: 4, topic: 'PaaS', question: 'Which cloud service model removes the need to manage underlying infrastructure?', options: ['A. IaaS', 'B. PaaS', 'C. SaaS', 'D. DaaS'], correctIndex: 1, explanation: 'PaaS removes the need to manage hardware and OS, letting developers focus on application deployment.', wrongExplanations: ['IaaS still requires users to manage OS and above.', 'This is correct.', 'SaaS is a finished product, not a development platform.', 'DaaS is not one of the three main cloud models.'] },
  { id: 5, topic: 'SaaS', question: 'Which of the following is an example of SaaS?', options: ['A. AWS EC2', 'B. Heroku', 'C. Gmail', 'D. Docker'], correctIndex: 2, explanation: 'Gmail is a SaaS product — a fully managed application you access via browser without managing any infrastructure.', wrongExplanations: ['AWS EC2 is an IaaS product.', 'Heroku is a PaaS platform.', 'This is correct.', 'Docker is a containerization tool, not a SaaS product.'] },
  { id: 6, topic: 'Cloud Characteristics', question: 'What does "rapid elasticity" mean in cloud computing?', options: ['A. The ability to stretch physical servers', 'B. Resources that scale up or down based on demand', 'C. A billing feature for large enterprises', 'D. A type of network protocol'], correctIndex: 1, explanation: 'Rapid elasticity means cloud resources can be provisioned and released quickly to match demand.', wrongExplanations: ['Physical servers cannot be stretched.', 'This is correct.', 'Elasticity is not a billing feature.', 'It is not a network protocol.'] },
  { id: 7, topic: 'Cloud Characteristics', question: 'What is "resource pooling" in cloud computing?', options: ['A. Storing data in a swimming pool', 'B. Sharing computing resources among multiple consumers using a multi-tenant model', 'C. Dedicating one server per customer', 'D. Pooling monthly invoices'], correctIndex: 1, explanation: 'Resource pooling means the provider shares computing resources across multiple consumers using a multi-tenant model.', wrongExplanations: ['This is not related to physical pools.', 'This is correct.', 'Dedicated servers per customer is the opposite of pooling.', 'Pooling invoices is a billing concept.'] },
  { id: 8, topic: 'Cloud Providers', question: 'Which cloud providers are mentioned in the lecture?', options: ['A. IBM, Oracle, SAP', 'B. AWS, Azure, GCP', 'C. Salesforce, Shopify, Stripe', 'D. Netflix, Spotify, Uber'], correctIndex: 1, explanation: 'The lecture mentions Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP).', wrongExplanations: ['IBM and Oracle are not mentioned.', 'This is correct.', 'These are SaaS apps, not cloud providers.', 'These are consumer apps, not cloud providers.'] },
  { id: 9, topic: 'Cloud Characteristics', question: 'What does "on-demand self-service" mean in cloud computing?', options: ['A. Calling a helpdesk to provision resources', 'B. Provisioning resources automatically without human interaction with the provider', 'C. Ordering physical hardware online', 'D. A self-checkout system at a store'], correctIndex: 1, explanation: 'On-demand self-service means users can provision resources automatically without contacting the provider.', wrongExplanations: ['Calling a helpdesk contradicts self-service.', 'This is correct.', 'Ordering physical hardware is the traditional model.', 'This analogy does not apply.'] },
  { id: 10, topic: 'Cloud Characteristics', question: 'What does "measured service" mean in cloud computing?', options: ['A. Measuring the physical size of servers', 'B. Automatically controlling and optimizing resource use via metering', 'C. A fixed monthly measurement report', 'D. Measuring internet speed'], correctIndex: 1, explanation: 'Measured service means cloud systems automatically monitor and optimize resource usage, enabling pay-as-you-go billing.', wrongExplanations: ['Physical server size is irrelevant.', 'This is correct.', 'It is dynamic metering, not a fixed report.', 'Internet speed is unrelated.'] },
  { id: 11, topic: 'IaaS', question: 'Which service model gives you the most control over the operating system?', options: ['A. SaaS', 'B. PaaS', 'C. IaaS', 'D. All equally'], correctIndex: 2, explanation: 'IaaS gives users control over the OS, runtime, and applications — only physical hardware is managed by the provider.', wrongExplanations: ['SaaS gives no control over OS.', 'PaaS abstracts the OS away.', 'This is correct.', 'Each model offers different levels of control.'] },
  { id: 12, topic: 'Cloud Characteristics', question: 'What does "broad network access" mean in cloud computing?', options: ['A. Access limited to office networks only', 'B. Capabilities available over the network via standard devices like phones and laptops', 'C. A high-speed fibre connection', 'D. Access only through desktop computers'], correctIndex: 1, explanation: 'Broad network access means cloud services are accessible through standard devices like phones, tablets, and laptops.', wrongExplanations: ['Cloud access is not limited to office networks.', 'This is correct.', 'Broad access is about availability, not speed.', 'Cloud services work on any device.'] },
]

const PROCESSING_STEPS = [
  'Reading your content...',
  'Translating full document (chunked)...',
  'Building dual-language explanations...',
  'Generating word meanings & examples...',
]

const DISCIPLINES = ['General', 'Biology', 'Physics', 'History', 'Mathematics', 'Computer Science', 'Economics', 'Chemistry', 'Literature']
const ALL_LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese', 'Arabic', 'Mandarin Chinese', 'Korean', 'Portuguese']

const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e) => resolve(e.target.result.split(',')[1])
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const readFileAsText = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e) => resolve(e.target.result)
  reader.onerror = reject
  reader.readAsText(file)
})

export default function LectureAssistantPage() {
  const navigate = useNavigate()
  const { language, preferences, lectureHistory, addLectureHistory, clearLectureHistory } = useAppStore()
  const defaultLang = langCodeToName[language] || preferences.targetLanguage || 'English'

  const [studyData, setStudyData] = useState(null)
  const [studyLoading, setStudyLoading] = useState(false)

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showLangModal, setShowLangModal] = useState(false)
  const [pendingText, setPendingText] = useState('')
  const [pendingSource, setPendingSource] = useState('')
  const [pendingBase64, setPendingBase64] = useState(null)
  const [pendingFileType, setPendingFileType] = useState(null)

  const [explainLang, setExplainLang] = useState(defaultLang)
  const [exampleLang, setExampleLang] = useState(preferences.preferredLanguages?.[1] || 'Spanish')
  const [selectedDiscipline, setSelectedDiscipline] = useState(preferences.studyField || 'General')

  const [recording, setRecording] = useState(false)
  const [lmsLoading, setLmsLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [droppedFile, setDroppedFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [rawText, setRawText] = useState('')
  const [expandedHistory, setExpandedHistory] = useState(null)

  const fileInputRef = useRef()
  const stepRef = useRef(null)

  useEffect(() => () => clearInterval(stepRef.current), [])

  const openLangModal = (text, source, base64 = null, fileType = null) => {
    setPendingText(text)
    setPendingSource(source)
    setPendingBase64(base64)
    setPendingFileType(fileType)
    setShowUploadModal(false)
    setShowLangModal(true)
  }

  const runAI = async () => {
    setShowLangModal(false)
    setProcessing(true)
    setStepIndex(0)
    setResult(null)
    setRawText(pendingText)

    let step = 0
    stepRef.current = setInterval(() => {
      step += 1
      if (step < PROCESSING_STEPS.length) setStepIndex(step)
    }, 900)

    try {
      // Show demo result based on chosen language after processing animation
      await new Promise((resolve) => setTimeout(resolve, PROCESSING_STEPS.length * 900))
      clearInterval(stepRef.current)

      const demo = getDemoResult(explainLang)
      const lectureRaw = demo.translation
      addLectureHistory({
        title: demo.title,
        source: pendingSource,
        explainLang,
        exampleLang,
        discipline: selectedDiscipline,
        result: demo,
        rawText: lectureRaw,
      })
      setResult(demo)
      setRawText(lectureRaw)

      // Generate study guide from demo EN translation (always English)
      setStudyLoading(true)
      setStudyData(null)
      try {
        const guide = await aiApi.analyzeLecture({
          transcript: DEMO_RESULT_EN.translation,
          language: 'English',
          discipline: selectedDiscipline,
          sourceTitle: demo.title,
        })
        setStudyData(guide)
      } catch {
        // fallback: derive from demo data locally
        setStudyData({
          executiveSummary: 'Cloud computing delivers IT resources on-demand over the internet with pay-as-you-go pricing, eliminating the need to own physical infrastructure. Providers like AWS, Azure, and GCP offer IaaS, PaaS, and SaaS models with key traits: on-demand access, broad network reach, resource pooling, rapid elasticity, and measured usage.',
          keyPoints: [
            'Cloud computing provides on-demand IT resources over the internet.',
            'Pay-as-you-go pricing replaces upfront infrastructure investment.',
            'IaaS offers raw compute, storage, and networking resources.',
            'PaaS abstracts infrastructure so developers focus on applications.',
            'SaaS delivers fully managed software accessible via browser.',
            'Key traits include elasticity, resource pooling, and measured service.',
          ],
          coreConcepts: [
            { title: 'IaaS (Infrastructure as a Service)', explanation: 'Provides virtualized computing resources — servers, storage, networking — over the internet. Users manage OS and above.', analogy: 'Like renting an empty apartment — you bring your own furniture and decor.' },
            { title: 'PaaS (Platform as a Service)', explanation: 'Delivers a managed platform for building and deploying applications without managing the underlying infrastructure.', analogy: 'Like renting a fully equipped kitchen — you just cook, someone else maintains the appliances.' },
            { title: 'SaaS (Software as a Service)', explanation: 'Provides ready-to-use software applications hosted and managed entirely by the provider, accessed via a web browser.', analogy: 'Like eating at a restaurant — you just enjoy the meal, no cooking or cleaning required.' },
          ],
        })
      } finally {
        setStudyLoading(false)
      }
    } finally {
      clearInterval(stepRef.current)
      setProcessing(false)
    }
  }

  const handleRecord = () => {
    setRecording(true)
    setTimeout(() => {
      setRecording(false)
      openLangModal(
        'Audio lecture: This session covers advanced topics in language acquisition — contextual learning methods, spaced repetition techniques, and immersive practice strategies for achieving fluency in a second language.',
        'Audio Recording'
      )
    }, 2500)
  }

  const handleLmsSync = () => {
    setLmsLoading(true)
    setTimeout(() => {
      setLmsLoading(false)
      openLangModal(
        'LMS Synced — Week 5: Introduction to Morphology and Syntax. Topics: word formation rules, sentence structure analysis, transformational grammar, and practical parsing exercises with real-world text samples.',
        'LMS Sync'
      )
    }, 1800)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) setDroppedFile(f)
  }

  const handleFileChange = (e) => {
    if (e.target.files[0]) setDroppedFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!droppedFile) return
    if (droppedFile.type === 'text/plain') {
      const text = await readFileAsText(droppedFile)
      openLangModal(text, droppedFile.name, null, null)
    } else {
      const base64 = await readFileAsBase64(droppedFile)
      openLangModal('', droppedFile.name, base64, droppedFile.type)
    }
  }

  const handleStartTest = (lectureDiscipline, lectureLang) => {
    const demo = getDemoResult(lectureLang)
    navigate('/lecture-test', {
      state: {
        language: lectureLang,
        discipline: lectureDiscipline,
        lectureText: DEMO_RESULT_EN.translation + '\n\n' + demo.translation,
      },
    })
  }

  const ResultView = ({ res, rText, eLang, exLang, disc }) => (
    <div className="space-y-4">
      <Card title={<span className="flex items-center gap-2"><Languages size={15} /> Translation ({eLang})</span>}>
        <p className="text-sm text-slate-100 leading-relaxed rounded-xl bg-slate-900/40 p-4 whitespace-pre-wrap">{res.translation}</p>
      </Card>

      <Card title={<span className="flex items-center gap-2"><AlignLeft size={15} /> AI Explanation ({eLang})</span>}>
        <p className="text-sm text-slate-100 leading-relaxed rounded-xl bg-slate-900/40 p-4 whitespace-pre-wrap">{res.explanation}</p>
      </Card>

      {(res.keyTerms || []).length > 0 && (
        <Card title={<span className="flex items-center gap-2"><BookOpen size={15} /> Key Terms — {eLang} & {exLang}</span>}>
          <div className="space-y-4">
            {res.keyTerms.map((kt, i) => (
              <div key={i} className="rounded-xl bg-slate-900/40 p-4 space-y-3">
                <p className="text-sm font-bold text-indigo-300">{kt.term}</p>
                {kt.altMeaning && (
                  <span className="inline-block rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-0.5 text-xs text-amber-200">
                    Multiple meanings: {kt.altMeaning}
                  </span>
                )}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-lg bg-indigo-500/10 border border-indigo-400/20 p-3 space-y-1">
                    <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">{eLang}</p>
                    <p className="text-xs text-slate-200">{kt.meaningInLang}</p>
                    {(kt.examplesInLang || []).map((ex, j) => (
                      <p key={j} className="text-xs text-slate-400 pl-2 border-l-2 border-indigo-500/40 mt-1">{ex}</p>
                    ))}
                  </div>
                  <div className="rounded-lg bg-violet-500/10 border border-violet-400/20 p-3 space-y-1">
                    <p className="text-xs font-semibold text-violet-300 uppercase tracking-wide">{exLang}</p>
                    <p className="text-xs text-slate-200">{kt.meaningInExample}</p>
                    {(kt.examplesInExampleLang || []).map((ex, j) => (
                      <p key={j} className="text-xs text-slate-400 pl-2 border-l-2 border-violet-500/40 mt-1">{ex}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Ready to test your knowledge?</p>
            <p className="text-xs text-slate-400 mt-0.5">AI generates 12 questions from this lecture · gamified with lives & score</p>
          </div>
          <Button onClick={() => handleStartTest(disc, eLang)}>
            <span className="flex items-center gap-2"><PlayCircle size={15} /> Take AI Test 🎮</span>
          </Button>
        </div>
      </Card>
    </div>
  )

  return (
    <>
      {/* Processing Overlay */}
      {processing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-8 text-center shadow-2xl w-80">
            <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent mb-4" />
            <p className="text-lg font-semibold text-white">{PROCESSING_STEPS[stepIndex]}</p>
            <p className="text-xs text-indigo-300 mt-1">{explainLang} + {exampleLang}</p>
            <div className="mt-4 flex justify-center gap-1">
              {PROCESSING_STEPS.map((_, i) => (
                <span key={i} className={`h-1.5 w-5 rounded-full transition-all ${i <= stepIndex ? 'bg-indigo-400' : 'bg-slate-700'}`} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add New Lecture</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Subject</p>
              <select value={selectedDiscipline} onChange={(e) => setSelectedDiscipline(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-white">
                {DISCIPLINES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Audio Record</p>
              <button onClick={handleRecord} disabled={recording}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 transition-all ${recording ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-white/10 bg-slate-800/60 text-slate-200 hover:border-indigo-400'}`}>
                {recording && (
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                )}
                <Mic size={16} className={recording ? 'text-red-400' : ''} />
                <span className="text-sm">{recording ? 'Recording...' : 'Start Recording'}</span>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">File / OCR Upload</p>
              <div onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop} onClick={() => fileInputRef.current.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-all ${dragOver ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/20 bg-slate-800/40 hover:border-indigo-400'}`}>
                <Upload size={20} className="mx-auto mb-2 text-slate-400" />
                {droppedFile
                  ? <p className="text-sm text-indigo-300 flex items-center justify-center gap-1"><FileText size={14} />{droppedFile.name}</p>
                  : <p className="text-sm text-slate-400">Drag & drop PDF, image, .txt — or click to browse</p>}
                <input ref={fileInputRef} type="file" accept=".pdf,.txt,image/*" className="hidden" onChange={handleFileChange} />
              </div>
              {droppedFile && <Button className="mt-2 w-full" onClick={handleUpload}>Upload & Process with AI</Button>}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">LMS Sync</p>
              <button onClick={handleLmsSync} disabled={lmsLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-200 hover:border-indigo-400 disabled:opacity-60 transition-all">
                <RefreshCw size={15} className={lmsLoading ? 'animate-spin text-indigo-400' : ''} />
                {lmsLoading ? 'Connecting to Canvas/Moodle...' : 'Sync with College Portal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-white">Choose Languages</h3>
                <p className="text-xs text-slate-400 mt-0.5">AI will explain in both languages with examples</p>
              </div>
              <button onClick={() => setShowLangModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Explanation Language (translate & explain in)</p>
                <select value={explainLang} onChange={(e) => setExplainLang(e.target.value)}
                  className="w-full rounded-xl border border-indigo-400/40 bg-slate-800/60 px-3 py-2 text-sm text-white">
                  {ALL_LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Example Language (parallel examples in)</p>
                <select value={exampleLang} onChange={(e) => setExampleLang(e.target.value)}
                  className="w-full rounded-xl border border-violet-400/40 bg-slate-800/60 px-3 py-2 text-sm text-white">
                  {ALL_LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="rounded-xl bg-slate-800/40 p-3 text-xs text-slate-300">
                Source: <span className="text-indigo-300">{pendingSource}</span> · Subject: <span className="text-indigo-300">{selectedDiscipline}</span>
              </div>
            </div>
            <Button className="mt-5 w-full" onClick={runAI}>Process with AI →</Button>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <Card title="Lecture Assistant" subtitle="Upload content — AI translates, explains in 2 languages, and generates a test">
          <Button onClick={() => setShowUploadModal(true)}>+ Add New Lecture</Button>
        </Card>

        {(result || studyLoading) && (
          <div className="grid lg:grid-cols-3 gap-5">
            {result && (
              <div className="lg:col-span-2">
                <ResultView res={result} rText={rawText} eLang={explainLang} exLang={exampleLang} disc={selectedDiscipline} />
              </div>
            )}
            <div className={result ? 'lg:col-span-1' : 'lg:col-span-3'}>
              <StudySidebar data={studyData} loading={studyLoading} />
            </div>
          </div>
        )}

        {lectureHistory.length > 0 && (
          <Card title={<span className="flex items-center gap-2"><History size={15} /> Lecture History ({lectureHistory.length})</span>} action={<button onClick={clearLectureHistory} className="text-xs text-red-400 hover:text-red-300">Clear All</button>}>
            <div className="space-y-2">
              {lectureHistory.map((lec) => (
                <div key={lec.id} className="rounded-xl bg-slate-900/40 overflow-hidden">
                  <button
                    onClick={() => setExpandedHistory(expandedHistory === lec.id ? null : lec.id)}
                    className="flex w-full items-center justify-between p-3 text-left hover:bg-slate-800/40 transition-all"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{lec.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{lec.explainLang} + {lec.exampleLang} · {lec.discipline} · {new Date(lec.date).toLocaleDateString()}</p>
                    </div>
                    {expandedHistory === lec.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                  {expandedHistory === lec.id && (
                    <div className="px-3 pb-3">
                      <ResultView res={lec.result} rText={lec.rawText} eLang={lec.explainLang} exLang={lec.exampleLang} disc={lec.discipline} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
