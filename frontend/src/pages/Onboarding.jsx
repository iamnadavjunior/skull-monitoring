import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const slides = [
  {
    badge: 'Bienvenue',
    title: 'Gérez votre école en toute simplicité',
    description:
      'OpenSchool est une plateforme complète de gestion scolaire. Suivez les inscriptions, les frais de scolarité, les paiements et générez des cartes d\'identité — le tout depuis un seul tableau de bord.',
    features: [
      {
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
        ),
        label: 'Gestion des élèves',
        desc: 'Inscriptions, fiches complètes et suivi par classe',
      },
      {
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
          </svg>
        ),
        label: 'Suivi des paiements',
        desc: 'Inscription, T1, T2 & T3 avec grâces et rapports',
      },
      {
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
          </svg>
        ),
        label: 'Cartes d\'identité',
        desc: 'Cartes PVC avec QR code, impression directe',
      },
    ],
    visual: (
      <div className="relative w-full max-w-sm mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-3xl blur-2xl" />
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-700/60 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" /></svg>
            </div>
            <div>
              <div className="h-2.5 w-28 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-2 w-20 bg-gray-100 dark:bg-gray-700/50 rounded-full mt-1.5" />
            </div>
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold shrink-0">{['AK', 'MN', 'JD'][i - 1]}</div>
              <div className="flex-1 space-y-1.5">
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full w-3/4" />
                <div className="h-1.5 bg-gray-100 dark:bg-gray-600/50 rounded-full w-1/2" />
              </div>
              <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${i === 1 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : i === 2 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'}`}>
                {i === 1 ? 'Payé' : i === 2 ? 'Partiel' : 'Impayé'}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    badge: 'Guide rapide',
    title: 'Prêt en 3 étapes',
    description:
      'Commencez à utiliser OpenSchool immédiatement. Aucune configuration complexe n\'est nécessaire.',
    steps: [
      {
        num: '1',
        title: 'Définir les frais',
        desc: 'Allez dans « Frais de scolarité » pour configurer les montants par classe : inscription, T1, T2 et T3.',
        color: 'emerald',
      },
      {
        num: '2',
        title: 'Inscrire les élèves',
        desc: 'Ajoutez vos élèves via « Nouvelle inscription ». Le paiement d\'inscription est enregistré automatiquement.',
        color: 'blue',
      },
      {
        num: '3',
        title: 'Suivre & rapporter',
        desc: 'Consultez le tableau de bord pour le suivi en temps réel. Exportez les rapports et imprimez les cartes PVC.',
        color: 'violet',
      },
    ],
    visual: (
      <div className="relative w-full max-w-sm mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-violet-500/20 rounded-3xl blur-2xl" />
        <div className="relative space-y-3">
          {[
            { icon: '⚙️', label: 'Frais de scolarité', sub: '4 types configurés', pct: 100 },
            { icon: '👩‍🎓', label: 'Inscription élèves', sub: 'Fiches & photos', pct: 75 },
            { icon: '📊', label: 'Rapports & cartes', sub: 'Export & impression', pct: 50 },
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-4 flex items-center gap-4">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
                <div className="mt-1.5 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

const colorMap = {
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-400', ring: 'ring-emerald-200 dark:ring-emerald-800' },
  blue:    { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-400', ring: 'ring-blue-200 dark:ring-blue-800' },
  violet:  { bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-400', ring: 'ring-violet-200 dark:ring-violet-800' },
}

export default function Onboarding() {
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()
  const slide = slides[current]

  const finish = () => {
    localStorage.setItem('onboarding_done', '1')
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-5xl">
        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === current ? 'w-10 bg-emerald-500' : 'w-4 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Content card */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left — Text */}
            <div className="p-8 sm:p-12 flex flex-col justify-center">
              <span className="inline-flex items-center self-start px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 mb-4 tracking-wide uppercase">
                {slide.badge}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                {slide.title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                {slide.description}
              </p>

              {/* Slide 1: feature cards */}
              {slide.features && (
                <div className="space-y-3 mb-8">
                  {slide.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        {f.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{f.label}</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Slide 2: numbered steps */}
              {slide.steps && (
                <div className="space-y-4 mb-8">
                  {slide.steps.map((step, i) => {
                    const c = colorMap[step.color]
                    return (
                      <div key={i} className="flex items-start gap-4">
                        <div className={`w-9 h-9 rounded-full ${c.bg} ${c.text} ring-2 ${c.ring} flex items-center justify-center font-bold text-sm shrink-0`}>
                          {step.num}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{step.title}</p>
                          <p className="text-gray-400 dark:text-gray-500 text-sm">{step.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center gap-3 mt-auto">
                {current > 0 && (
                  <button
                    onClick={() => setCurrent(current - 1)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Retour
                  </button>
                )}
                {current < slides.length - 1 ? (
                  <button
                    onClick={() => setCurrent(current + 1)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                  >
                    Continuer
                  </button>
                ) : (
                  <button
                    onClick={finish}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center gap-2"
                  >
                    Commencer
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                  </button>
                )}
                {current < slides.length - 1 && (
                  <button onClick={finish} className="ml-auto text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    Passer l'introduction
                  </button>
                )}
              </div>
            </div>

            {/* Right — Visual */}
            <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-10 border-l border-gray-200/50 dark:border-gray-800/50">
              {slide.visual}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          OpenSchool · Designed by <span className="font-semibold">FLEXO STUDIO</span>
        </p>
      </div>
    </div>
  )
}
