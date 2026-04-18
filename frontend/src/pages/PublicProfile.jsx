import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'

export default function PublicProfile() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.publicGet(`/public/student/${token}`)
      .then(res => {
        if (res.error) throw new Error(res.error)
        setData(res.data)
      })
      .catch(err => setError(err.message || 'Élève introuvable'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-blue-100 border-t-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-400 mt-4">Chargement du profil...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-xs w-full">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-1">Profil introuvable</h2>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    </div>
  )

  const { student: s, fees, total_due, total_paid, total_remaining, grace_periods } = data
  const overallPct = total_due > 0 ? Math.round((total_paid / total_due) * 100) : 0
  const overallStatus = total_remaining <= 0 ? 'Entièrement payé' : total_paid > 0 ? 'Partiellement payé' : 'En attente'
  const statusConfig = {
    'Entièrement payé': { bg: 'bg-emerald-500', ring: 'ring-emerald-200', icon: '✓' },
    'Partiellement payé': { bg: 'bg-amber-500', ring: 'ring-amber-200', icon: '◐' },
    'En attente': { bg: 'bg-red-500', ring: 'ring-red-200', icon: '!' },
  }
  const sc = statusConfig[overallStatus]
  const initials = (s.first_name?.[0] || '') + (s.last_name?.[0] || '')

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800">
      {/* Top curved section */}
      <div className="relative pb-28 pt-8 px-4">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute top-10 -left-16 w-40 h-40 rounded-full bg-white/5" />
        </div>

        <div className="relative text-center text-white max-w-md mx-auto">
          {/* School name */}
          <p className="text-blue-200 text-xs font-medium tracking-wider uppercase mb-6">{s.school_name}</p>

          {/* Avatar */}
          {s.photo ? (
            <img src={`/openschool/uploads/${s.photo}`} className="w-28 h-28 rounded-3xl mx-auto object-cover ring-4 ring-white/20 shadow-2xl mb-4" alt="" />
          ) : (
            <div className="w-28 h-28 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center text-4xl font-bold mx-auto ring-4 ring-white/10 shadow-2xl mb-4">{initials}</div>
          )}

          <h1 className="text-2xl font-bold tracking-tight">{s.first_name} {s.last_name}</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs">{s.grade}</span>
            <span className="text-blue-300">·</span>
            <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs">{s.school_year}</span>
          </div>
        </div>
      </div>

      {/* Content cards - overlap the blue section */}
      <div className="bg-gray-50 min-h-screen -mt-20 rounded-t-[2rem] relative z-10">
        <div className="max-w-md mx-auto px-4 pt-6 pb-10">

          {/* ===== Status Ring Card ===== */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 -mt-12 relative z-20">
            <div className="flex items-center gap-5">
              {/* Ring */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                  <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" strokeLinecap="round"
                    stroke={overallStatus === 'Fully Paid' ? '#10b981' : overallStatus === 'Partially Paid' ? '#f59e0b' : '#ef4444'}
                    strokeDasharray={`${overallPct * 2.136} 213.6`}
                    className="transition-all duration-700" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800">{overallPct}%</span>
              </div>
              {/* Summary */}
              <div className="flex-1">
                <div className={`inline-flex items-center gap-1 ${sc.bg} text-white text-xs font-semibold px-3 py-1 rounded-full mb-2`}>
                  <span>{sc.icon}</span> {overallStatus}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-gray-400">Total Dû</span>
                  <span className="font-semibold text-right">{total_due.toLocaleString()} FBU</span>
                  <span className="text-gray-400">Payé</span>
                  <span className="font-semibold text-green-600 text-right">{total_paid.toLocaleString()} FBU</span>
                  <span className="text-gray-400">Restant</span>
                  <span className={`font-semibold text-right ${total_remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>{total_remaining.toLocaleString()} FBU</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Fee Breakdown ===== */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Détail des frais</h3>
            <div className="space-y-4">
              {fees.map(f => {
                const pct = f.amount > 0 ? Math.min(100, Math.round((f.paid / f.amount) * 100)) : 0
                const feeStatusConfig = {
                  paid: { color: 'text-emerald-600', bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', label: 'PAYÉ' },
                  partial: { color: 'text-amber-600', bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 ring-amber-200', label: 'PARTIEL' },
                  pending: { color: 'text-red-500', bar: 'bg-red-400', badge: 'bg-red-50 text-red-600 ring-red-200', label: 'EN ATTENTE' },
                }
                const fc = feeStatusConfig[f.status]
                return (
                  <div key={f.type}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-700 capitalize">{({'registration':'Inscription','quarter_1':'1er Trimestre','quarter_2':'2ème Trimestre','quarter_3':'3ème Trimestre'})[f.type] || f.type}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${fc.badge}`}>{fc.label}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                      <div className={`h-full rounded-full ${fc.bar} transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={`font-medium ${fc.color}`}>{f.paid.toLocaleString()} FBU payé</span>
                      <span className="text-gray-400">{f.amount.toLocaleString()} FBU dû</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ===== Grace Periods / Messages ===== */}
          {grace_periods.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-sm">⏳</span>
                </div>
                <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">Messages de l'école</h3>
              </div>
              <div className="space-y-2">
                {grace_periods.map((g, i) => (
                  <div key={i} className="bg-white/70 rounded-xl p-3 text-sm text-amber-800">
                    <span className="font-semibold capitalize">{({'registration':'Inscription','quarter_1':'T1','quarter_2':'T2','quarter_3':'T3'})[g.fee_type] || g.fee_type}:</span> {g.message}
                    {g.deadline && (
                      <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Échéance : {g.deadline}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== Student Info ===== */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Informations de l'élève</h3>
            <div className="space-y-3">
              {s.date_of_birth && (
                <InfoRow icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} label="Date de naissance" value={s.date_of_birth} />
              )}
              {s.parent_name && (
                <InfoRow icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} label="Parent / Tuteur" value={s.parent_name} />
              )}
              {s.parent_phone && (
                <InfoRow icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>} label="Téléphone" value={s.parent_phone} />
              )}
              <InfoRow icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} label="Carte valide jusqu'au" value={s.validity_end} />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-300">Propulsé par <span className="font-semibold text-gray-400">OpenSchool</span></p>
            <p className="text-[10px] text-gray-400 mt-1">Designed by <span className="font-semibold">FLEXO STUDIO</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return value ? (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
      </div>
    </div>
  ) : null
}
