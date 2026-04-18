import { useState, useEffect, useRef } from 'react'
import { api } from '../api'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('payments')
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    api.get('/reports/dashboard')
      .then(res => setData(res.data))
      .finally(() => { setLoading(false); setRefreshing(false) })
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return <Skeleton />
  if (!data) return <p className="text-center py-12 text-gray-400">Impossible de charger le tableau de bord.</p>

  const feeLabels = { registration: 'Inscription', quarter_1: 'T1 Scolarité', quarter_2: 'T2 Scolarité', quarter_3: 'T3 Scolarité' }
  const methodIcons = { cash: '💵', bank_slip: '🏦', mobile_money: '📱' }
  const methodLabels = { cash: 'Espèces', bank_slip: 'Bordereau bancaire', mobile_money: 'Mobile Money' }

  const totalStudents = data.total_students || 0
  const totalRevenue = data.total_revenue || 0
  const maxGradeCount = Math.max(...(data.students_by_grade || []).map(g => g.count), 1)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bonjour'
    if (h < 17) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'à l\'instant'
    if (mins < 60) return `il y a ${mins}min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `il y a ${hrs}h`
    const days = Math.floor(hrs / 24)
    return `il y a ${days}j`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting()}, {user?.name?.split(' ')[0] || 'Admin'} 👋
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Voici ce qui se passe dans votre école aujourd'hui.</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 active:scale-95 transition-all shadow-sm disabled:opacity-50"
        >
          <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedStatCard
          label="Total Élèves"
          value={totalStudents}
          prefix=""
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          }
          gradient="from-blue-500 to-blue-600"
          bgLight="bg-blue-50"
          textColor="text-blue-700"
        />
        <AnimatedStatCard
          label="Revenu Total"
          value={totalRevenue}
          prefix="FBU"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
          }
          gradient="from-emerald-500 to-emerald-600"
          bgLight="bg-emerald-50"
          textColor="text-emerald-700"
        />
        {data.revenue_by_type.slice(0, 2).map(r => (
          <AnimatedStatCard
            key={r.fee_type}
            label={feeLabels[r.fee_type] || r.fee_type}
            value={parseFloat(r.total)}
            prefix="FBU"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
              </svg>
            }
            gradient="from-violet-500 to-violet-600"
            bgLight="bg-violet-50"
            textColor="text-violet-700"
          />
        ))}
      </div>

      {/* Revenue breakdown mini-bars */}
      {data.revenue_by_type.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Répartition des revenus</h3>
          <div className="space-y-3">
            {data.revenue_by_type.map(r => {
              const pct = totalRevenue > 0 ? (parseFloat(r.total) / totalRevenue) * 100 : 0
              const colors = {
                registration: 'bg-blue-500',
                quarter_1: 'bg-emerald-500',
                quarter_2: 'bg-violet-500',
                quarter_3: 'bg-amber-500',
              }
              return (
                <div key={r.fee_type} className="group">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{feeLabels[r.fee_type] || r.fee_type}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 dark:text-gray-500 text-xs">{pct.toFixed(1)}%</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{parseFloat(r.total).toLocaleString()} FBU</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors[r.fee_type] || 'bg-gray-400'} transition-all duration-1000 ease-out group-hover:opacity-80`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Students by Grade — visual bar chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 dark:text-white">Élèves par niveau</h3>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 px-2.5 py-1 rounded-full">{totalStudents} total</span>
          </div>
          <div className="space-y-3">
            {data.students_by_grade.map((g, i) => {
              const pct = (g.count / maxGradeCount) * 100
              const barColors = ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500']
              return (
                <div key={g.grade} className="group cursor-default">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Niveau {g.grade}</span>
                    <span className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition">{g.count}</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColors[i % barColors.length]} transition-all duration-700 ease-out group-hover:brightness-110`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel with tabs */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
              {[
                { key: 'payments', label: 'Paiements récents' },
                { key: 'activity', label: 'Activité' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === tab.key
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Link to="/payments" className="text-xs text-primary-600 hover:text-primary-700 font-medium transition">
              Voir tout →
            </Link>
          </div>

          {activeTab === 'payments' ? (
            <div className="space-y-2">
              {data.recent_payments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">💰</div>
                  <p className="text-gray-400 text-sm">Aucun paiement enregistré.</p>
                  <Link to="/payments" className="text-primary-600 text-sm font-medium hover:underline mt-1 inline-block">Enregistrer le premier paiement →</Link>
                </div>
              ) : data.recent_payments.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-default"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                    {p.first_name[0]}{p.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white text-sm truncate">{p.first_name} {p.last_name}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full flex-shrink-0">{feeLabels[p.fee_type] || p.fee_type}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{methodIcons[p.payment_method]} {methodLabels[p.payment_method] || p.payment_method}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{timeAgo(p.paid_at)}</span>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600 text-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                    +{parseFloat(p.amount).toLocaleString()} FBU
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {data.recent_payments.length === 0 ? (
                <p className="text-center py-12 text-gray-400 text-sm">Aucune activité.</p>
              ) : data.recent_payments.slice(0, 6).map((p, i) => (
                <div key={p.id} className="flex items-start gap-3 relative pl-6">
                  {i < Math.min(data.recent_payments.length, 6) - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-200" />
                  )}
                  <div className="absolute left-0 top-1 w-[22px] h-[22px] rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">{p.first_name} {p.last_name}</span> a payé <span className="font-semibold text-emerald-600">{parseFloat(p.amount).toLocaleString()} FBU</span> pour {feeLabels[p.fee_type] || p.fee_type}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(p.paid_at)} via {methodLabels[p.payment_method] || p.payment_method}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/students/new', label: 'Ajouter un élève', icon: '➕', desc: 'Inscrire un nouvel élève', bg: 'hover:border-blue-300 hover:bg-blue-50/50' },
          { to: '/payments', label: 'Enregistrer un paiement', icon: '💳', desc: 'Nouvelle entrée de paiement', bg: 'hover:border-emerald-300 hover:bg-emerald-50/50' },
          { to: '/reports', label: 'Voir les rapports', icon: '📊', desc: 'Analyses et exports', bg: 'hover:border-violet-300 hover:bg-violet-50/50' },
          { to: '/fees', label: 'Grille tarifaire', icon: '⚙️', desc: 'Gérer les types de frais', bg: 'hover:border-amber-300 hover:bg-amber-50/50' },
        ].map(a => (
          <Link
            key={a.to}
            to={a.to}
            className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 transition-all group active:scale-[0.97] shadow-sm ${a.bg}`}
          >
            <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform inline-block">{a.icon}</span>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{a.label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

function AnimatedStatCard({ label, value, prefix, icon, gradient, bgLight, textColor }) {
  const [displayed, setDisplayed] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const target = typeof value === 'number' ? value : parseFloat(value) || 0
    if (target === 0) { setDisplayed(0); return }

    let start = 0
    const duration = 1200
    const startTime = performance.now()

    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
      else setDisplayed(target)
    }
    requestAnimationFrame(animate)
  }, [value])

  const formatted = prefix === 'FBU'
    ? `${displayed.toLocaleString()} FBU`
    : displayed.toLocaleString()

  return (
    <div ref={ref} className={`${bgLight} dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl p-5 transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 group cursor-default`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <span className="text-white [&>svg]:w-6 [&>svg]:h-6">{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
          <p className={`text-2xl font-bold ${textColor} dark:text-white tabular-nums`}>{formatted}</p>
        </div>
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-2xl" />
        ))}
      </div>
      <div className="h-40 bg-gray-100 rounded-2xl" />
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 h-64 bg-gray-100 rounded-2xl" />
        <div className="lg:col-span-3 h-64 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  )
}
