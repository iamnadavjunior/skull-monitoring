import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '../api'

export default function StudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payForm, setPayForm] = useState(null)
  const [graceForm, setGraceForm] = useState(null)
  const [tab, setTab] = useState('overview')
  const cardRef = useRef(null)

  useEffect(() => {
    api.get(`/payments/student/${id}`).then(res => setData(res.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-primary-600"></div>
    </div>
  )
  if (!data) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">🔍</p>
      <p className="text-gray-500">Élève introuvable.</p>
    </div>
  )

  const s = data.student
  const qrUrl = `${window.location.origin}/openschool/s/${s.qr_token}`
  const initials = (s.first_name?.[0] || '') + (s.last_name?.[0] || '')

  const feeTypes = [
    { key: 'registration', label: 'Inscription', fee: s.registration_fee || 200000, icon: '📝' },
    { key: 'quarter_1', label: '1er Trimestre', fee: s.quarter_1_fee || 100000, icon: '1️⃣' },
    { key: 'quarter_2', label: '2ème Trimestre', fee: s.quarter_2_fee || 100000, icon: '2️⃣' },
    { key: 'quarter_3', label: '3ème Trimestre', fee: s.quarter_3_fee || 100000, icon: '3️⃣' },
  ]

  const paidByType = {}
  data.payments.forEach(p => {
    paidByType[p.fee_type] = (paidByType[p.fee_type] || 0) + parseFloat(p.amount)
  })

  const totalDue = feeTypes.reduce((sum, ft) => sum + parseFloat(ft.fee || 0), 0)
  const totalPaid = Object.values(paidByType).reduce((sum, v) => sum + v, 0)
  const totalRemaining = Math.max(0, totalDue - totalPaid)
  const overallPct = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0

  const handlePay = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    fd.append('student_id', id)
    try {
      await api.upload('/payments', fd)
      const res = await api.get(`/payments/student/${id}`)
      setData(res.data)
      setPayForm(null)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleGrace = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    try {
      await api.post('/grace', {
        student_id: parseInt(id),
        fee_type: fd.get('fee_type'),
        message: fd.get('message'),
        deadline: fd.get('deadline') || null,
      })
      const res = await api.get(`/payments/student/${id}`)
      setData(res.data)
      setGraceForm(null)
    } catch (err) {
      alert(err.message)
    }
  }

  /* -------- Print: PVC Card layout (vertical, lanyard style) -------- */
  const printCard = () => {
    const w = window.open('', '_blank', 'width=360,height=600')
    const svg = document.getElementById('qr-svg-main')
    const schoolName = 'OpenSchool'
    w.document.write(`<!DOCTYPE html><html><head><title>Carte Élève</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      @page{size:54mm 86mm;margin:0}
      body{font-family:'Segoe UI',system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#e5e7eb;gap:4mm;flex-wrap:wrap}
      .card{width:54mm;height:86mm;border-radius:3mm;overflow:hidden;position:relative;color:#fff}
      /* ---- FRONT ---- */
      .front{background:linear-gradient(175deg,#065f46 0%,#059669 40%,#34d399 100%)}
      .lanyard{width:8mm;height:3mm;background:#047857;border-radius:0 0 4mm 4mm;margin:0 auto;position:relative}
      .lanyard::after{content:'';width:3mm;height:3mm;border:1mm solid rgba(255,255,255,.5);border-radius:50%;position:absolute;top:0;left:50%;transform:translateX(-50%)}
      .front-top{text-align:center;padding:1.5mm 3mm 0}
      .school-name{font-size:7pt;font-weight:800;letter-spacing:.6px;text-transform:uppercase;text-shadow:0 1px 2px rgba(0,0,0,.2)}
      .school-sub{font-size:4.5pt;opacity:.7;margin-top:.3mm;letter-spacing:.3px}
      .divider{width:12mm;height:.3mm;background:rgba(255,255,255,.4);margin:1.5mm auto}
      .photo-frame{width:20mm;height:24mm;margin:0 auto;border-radius:2mm;overflow:hidden;border:1.5px solid rgba(255,255,255,.5);box-shadow:0 2px 8px rgba(0,0,0,.2)}
      .photo-frame img{width:100%;height:100%;object-fit:cover}
      .avatar-rect{width:100%;height:100%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:16pt;font-weight:700}
      .info-section{text-align:center;padding:1.5mm 3mm 0}
      .student-name{font-size:9pt;font-weight:700;line-height:1.2;text-shadow:0 1px 2px rgba(0,0,0,.15)}
      .student-class{font-size:6pt;opacity:.8;margin-top:.5mm}
      .details-table{margin:1.5mm auto 0;font-size:5.5pt;text-align:left;border-collapse:collapse}
      .details-table td{padding:.4mm 1mm;vertical-align:top}
      .details-table .label{opacity:.6;padding-right:1.5mm;white-space:nowrap}
      .details-table .value{font-weight:600}
      .validity-strip{position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.15);text-align:center;font-size:4.5pt;padding:1mm 0;letter-spacing:.3px;opacity:.8}
      /* ---- BACK ---- */
      .back{background:linear-gradient(175deg,#065f46 0%,#059669 50%,#34d399 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
      .back-title{font-size:6pt;text-transform:uppercase;letter-spacing:1px;opacity:.7;margin-bottom:2mm}
      .qr-box{background:#fff;border-radius:2.5mm;padding:2mm;display:inline-block;box-shadow:0 2px 8px rgba(0,0,0,.15)}
      .qr-box svg{display:block}
      .back-name{font-size:7pt;font-weight:700;margin-top:2mm}
      .back-token{font-size:4pt;opacity:.4;margin-top:1mm;word-break:break-all;max-width:40mm}
      .back-footer{position:absolute;bottom:2mm;font-size:4pt;opacity:.5;letter-spacing:.3px}
      /* decorative */
      .deco-circle{position:absolute;border-radius:50%;border:1.5mm solid rgba(255,255,255,.06)}
      .dc1{width:30mm;height:30mm;top:-8mm;right:-8mm}
      .dc2{width:20mm;height:20mm;bottom:-5mm;left:-5mm}
    </style></head><body>
    <!-- FRONT -->
    <div class="card front">
      <div class="deco-circle dc1"></div>
      <div class="deco-circle dc2"></div>
      <div class="lanyard"></div>
      <div class="front-top">
        <div class="school-name">${schoolName}</div>
        <div class="school-sub">Carte d'identité scolaire</div>
        <div class="divider"></div>
      </div>
      <div class="photo-frame">
        ${s.photo
          ? `<img src="/openschool/uploads/${s.photo}" />`
          : `<div class="avatar-rect">${initials}</div>`
        }
      </div>
      <div class="info-section">
        <div class="student-name">${s.first_name} ${s.last_name}</div>
        ${s.grade ? `<div class="student-class">${s.grade}</div>` : ''}
        <table class="details-table">
          <tr><td class="label">Année</td><td class="value">${s.school_year}</td></tr>
          <tr><td class="label">Parent</td><td class="value">${s.parent_name || '—'}</td></tr>
          <tr><td class="label">Tél</td><td class="value">${s.parent_phone || '—'}</td></tr>
        </table>
      </div>
      <div class="validity-strip">Valide: ${s.validity_start} — ${s.validity_end}</div>
    </div>
    <!-- BACK -->
    <div class="card back">
      <div class="deco-circle dc1"></div>
      <div class="deco-circle dc2"></div>
      <div class="back-title">Scanner pour vérifier</div>
      <div class="qr-box">${svg.outerHTML}</div>
      <div class="back-name">${s.first_name} ${s.last_name}</div>
      <div class="back-token">${s.qr_token}</div>
      <div class="back-footer">${schoolName} · Designed by FLEXO STUDIO</div>
    </div>
    </body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 300)
  }

  /* -------- Print: QR Only -------- */
  const printQR = () => {
    const w = window.open('', '_blank', 'width=300,height=400')
    const svg = document.getElementById('qr-svg-main')
    w.document.write(`<!DOCTYPE html><html><head><title>QR Code</title>
    <style>*{margin:0;padding:0}body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif}
    h2{font-size:16pt;margin-bottom:2px}p{color:#666;font-size:10pt}.id{font-size:7pt;color:#aaa;margin-top:8px}</style></head>
    <body><h2>${s.first_name} ${s.last_name}</h2><p>${s.grade} · ${s.school_year}</p>
    <div style="margin:20px 0">${svg.outerHTML}</div><p class="id">${s.qr_token}</p></body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 250)
  }

  const tabs = [
    { key: 'overview', label: 'Aperçu' },
    { key: 'card', label: 'Carte & QR' },
    { key: 'history', label: 'Paiements' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-400 hover:text-gray-700 transition text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Retour
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Profil de l'élève</h2>
      </div>

      {/* ===== HERO: Profile Header ===== */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-blue-500 rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden">
        {/* background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border-[20px] border-white" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full border-[16px] border-white" />
        </div>
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-5">
          {/* Avatar */}
          {s.photo ? (
            <img src={`/openschool/uploads/${s.photo}`} className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg" alt="" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-white/15 flex items-center justify-center text-3xl font-bold ring-4 ring-white/10">{initials}</div>
          )}
          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{s.first_name} {s.last_name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
              <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">{s.grade}</span>
              <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">{s.school_year}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.is_active == 1 ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-200'}`}>
                {s.is_active == 1 ? 'Actif' : 'Inactif'}
              </span>
            </div>
            {/* Compact details */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-blue-100 justify-center md:justify-start">
              {s.parent_name && <span>👤 {s.parent_name}</span>}
              {s.parent_phone && <span>📱 {s.parent_phone}</span>}
              {s.date_of_birth && <span>🎂 {s.date_of_birth}</span>}
            </div>
          </div>
          {/* Overall payment ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${overallPct * 2.136} 213.6`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">{overallPct}%</span>
            </div>
            <span className="text-xs text-blue-200 mt-1">Payé</span>
          </div>
        </div>
        {/* Quick action buttons */}
        <div className="relative flex flex-wrap gap-2 mt-5">
          <Link to={`/students/${id}/edit`} className="bg-white/15 hover:bg-white/25 backdrop-blur px-4 py-2 rounded-lg text-sm transition">Modifier le profil</Link>
          <button onClick={printCard} className="bg-white/15 hover:bg-white/25 backdrop-blur px-4 py-2 rounded-lg text-sm transition">Imprimer la carte</button>
          <button onClick={printQR} className="bg-white/15 hover:bg-white/25 backdrop-blur px-4 py-2 rounded-lg text-sm transition">Imprimer le QR</button>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${tab === t.key ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-700 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== TAB: OVERVIEW ===== */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Payment summary strip */}
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard label="Total Dû" value={`${totalDue.toLocaleString()} FBU`} sub="Tous frais" className="bg-blue-50 text-blue-700" />
            <SummaryCard label="Total Payé" value={`${totalPaid.toLocaleString()} FBU`} sub={`${overallPct}% terminé`} className="bg-green-50 text-green-700" />
            <SummaryCard label="Solde" value={`${totalRemaining.toLocaleString()} FBU`} sub={totalRemaining <= 0 ? 'Tout réglé' : 'Restant'} className={totalRemaining <= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} />
          </div>

          {/* Fee breakdown cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {feeTypes.map(ft => {
              const due = parseFloat(ft.fee || 0)
              const paid = paidByType[ft.key] || 0
              const remaining = Math.max(0, due - paid)
              const pct = due > 0 ? Math.min(100, Math.round((paid / due) * 100)) : 0
              const status = remaining <= 0 && due > 0 ? 'paid' : paid > 0 ? 'partial' : 'pending'
              const statusConfig = {
                paid: { bg: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700', bar: 'bg-green-500', text: 'Payé' },
                partial: { bg: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-500', text: 'Partiel' },
                pending: { bg: 'bg-gray-50 border-gray-200', badge: 'bg-red-100 text-red-600', bar: 'bg-red-400', text: 'En attente' },
              }
              const sc = statusConfig[status]
              return (
                <div key={ft.key} className={`rounded-xl border p-4 ${sc.bg}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{ft.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{ft.label}</p>
                        <p className="text-xs text-gray-500">Dû : {due.toLocaleString()} FBU</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sc.badge}`}>{sc.text}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-white rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${sc.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{paid.toLocaleString()} FBU payé</span>
                    <span className="text-gray-400">{remaining > 0 ? `${remaining.toLocaleString()} FBU restant` : 'Terminé'}</span>
                  </div>
                  {status !== 'paid' && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => setPayForm(ft.key)} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition font-medium text-primary-600">+ Enregistrer un paiement</button>
                      <button onClick={() => setGraceForm(ft.key)} className="text-xs text-gray-400 hover:text-yellow-600 px-2 py-1.5 transition">Délai de grâce</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Grace periods */}
          {data.grace_periods?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">Périodes de grâce actives</h4>
              <div className="space-y-2">
                {data.grace_periods.map((g, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="mt-0.5">⏳</span>
                    <div>
                      <span className="font-medium capitalize">{g.fee_type.replace('_', ' ')}:</span> {g.message}
                      {g.deadline && <span className="text-xs ml-1 text-amber-500">(deadline: {g.deadline})</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student details card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Détails de l'élève</h3>
            <div className="grid sm:grid-cols-2 gap-y-3 gap-x-8 text-sm">
              <DetailRow icon="👤" label="Nom complet" value={`${s.first_name} ${s.last_name}`} />
              <DetailRow icon="🎂" label="Date de naissance" value={s.date_of_birth} />
              <DetailRow icon="📚" label="Niveau" value={s.grade} />
              <DetailRow icon="📅" label="Année scolaire" value={s.school_year} />
              <DetailRow icon="👨‍👩‍👦" label="Nom du parent" value={s.parent_name} />
              <DetailRow icon="📱" label="Téléphone du parent" value={s.parent_phone} />
              <DetailRow icon="✅" label="Validité" value={`${s.validity_start} → ${s.validity_end}`} />
              <DetailRow icon="🏷️" label="Jeton QR" value={s.qr_token} mono />
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: ID CARD & QR ===== */}
      {tab === 'card' && (
        <div className="space-y-6">
          {/* PVC Card Preview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Aperçu de la carte PVC</h3>
            <div className="flex justify-center gap-6 flex-wrap">
              {/* FRONT */}
              <div className="flex flex-col items-center">
                <p className="text-xs text-gray-400 mb-2 font-medium">Recto</p>
                <div ref={cardRef} className="w-[214px] h-[340px] rounded-2xl bg-gradient-to-b from-emerald-800 via-emerald-600 to-emerald-400 text-white flex flex-col items-center shadow-2xl relative overflow-hidden select-none text-center">
                  {/* Decorative */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border-[10px] border-white/5" />
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full border-[8px] border-white/5" />
                  {/* Lanyard hole */}
                  <div className="w-10 h-3.5 bg-emerald-900/40 rounded-b-xl mx-auto relative">
                    <div className="w-3 h-3 border-2 border-white/40 rounded-full absolute top-0 left-1/2 -translate-x-1/2" />
                  </div>
                  {/* School name */}
                  <p className="text-[10px] font-extrabold uppercase tracking-wider mt-1.5 relative text-shadow">OpenSchool</p>
                  <p className="text-[7px] text-emerald-200 relative">Carte d'identité scolaire</p>
                  <div className="w-10 h-px bg-white/30 my-1.5 relative" />
                  {/* Photo (rectangular) */}
                  <div className="w-[72px] h-[88px] rounded-lg overflow-hidden border-2 border-white/30 shadow-lg relative">
                    {s.photo ? (
                      <img src={`/openschool/uploads/${s.photo}`} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-white/15 flex items-center justify-center font-bold text-2xl">{initials}</div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="relative mt-2 px-3">
                    <p className="font-bold text-[11px] leading-tight">{s.first_name} {s.last_name}</p>
                    {s.grade && <p className="text-[8px] text-emerald-200 mt-0.5">{s.grade}</p>}
                    <div className="mt-1.5 text-left text-[7.5px] space-y-px">
                      <p className="flex"><span className="text-emerald-300 w-10 shrink-0">Année</span><span className="font-semibold">{s.school_year}</span></p>
                      <p className="flex"><span className="text-emerald-300 w-10 shrink-0">Parent</span><span className="font-semibold">{s.parent_name || '—'}</span></p>
                      <p className="flex"><span className="text-emerald-300 w-10 shrink-0">Tél</span><span className="font-semibold">{s.parent_phone || '—'}</span></p>
                    </div>
                  </div>
                  {/* Validity strip */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/15 text-[6.5px] py-1 text-emerald-100 tracking-wide">
                    Valide: {s.validity_start} — {s.validity_end}
                  </div>
                </div>
              </div>
              {/* BACK */}
              <div className="flex flex-col items-center">
                <p className="text-xs text-gray-400 mb-2 font-medium">Verso</p>
                <div className="w-[214px] h-[340px] rounded-2xl bg-gradient-to-b from-emerald-800 via-emerald-600 to-emerald-400 text-white flex flex-col items-center justify-center shadow-2xl relative overflow-hidden select-none text-center">
                  <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border-[10px] border-white/5" />
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full border-[8px] border-white/5" />
                  <p className="text-[8px] uppercase tracking-[2px] text-emerald-200 mb-3 relative">Scanner pour vérifier</p>
                  <div className="bg-white rounded-xl p-2 shadow-lg relative">
                    <QRCodeSVG id="qr-svg-main" value={qrUrl} size={100} level="M" bgColor="#ffffff" fgColor="#065f46" />
                  </div>
                  <p className="font-bold text-xs mt-3 relative">{s.first_name} {s.last_name}</p>
                  <p className="text-[6px] text-emerald-300 mt-1 relative max-w-[160px] break-all">{s.qr_token}</p>
                  <p className="absolute bottom-3 text-[6px] text-emerald-200/50 tracking-wide relative">OpenSchool · Designed by FLEXO STUDIO</p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code standalone */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Code QR</h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-gray-50 rounded-2xl p-6 inline-block">
                <QRCodeSVG value={qrUrl} size={200} level="H" bgColor="#f9fafb" fgColor="#1e293b"
                  imageSettings={{ src: '', width: 0, height: 0 }} />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">URL QR</p>
                  <p className="text-sm text-gray-600 break-all bg-gray-50 rounded-lg px-3 py-2 mt-1 font-mono">{qrUrl}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase">Jeton (permanent)</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mt-1 font-mono">{s.qr_token}</p>
                </div>
                <p className="text-xs text-gray-400">Ce code QR est permanent. Il pointe toujours vers les données actuelles de l'élève. Le scan ouvre un profil en lecture seule adapté aux mobiles.</p>
                <div className="flex gap-2 pt-1">
                  <button onClick={printCard} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition">Imprimer la carte PVC</button>
                  <button onClick={printQR} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">Imprimer le QR</button>
                  <button onClick={() => { navigator.clipboard.writeText(qrUrl); }} className="border border-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">Copier le lien</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: PAYMENT HISTORY ===== */}
      {tab === 'history' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 dark:text-white">Historique des paiements</h3>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full">{data.payments.length} enregistrements</span>
          </div>
          {data.payments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">💰</p>
              <p className="text-gray-400 text-sm">Aucun paiement enregistré.</p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden divide-y">
                {data.payments.map(p => (
                  <div key={p.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded capitalize mb-1">{p.fee_type.replace('_', ' ')}</span>
                        <p className="text-xs text-gray-400">{new Date(p.paid_at).toLocaleDateString()} · {p.payment_method}</p>
                      </div>
                      <span className="font-bold text-green-600">{parseFloat(p.amount).toLocaleString()} FBU</span>
                    </div>
                    {p.notes && <p className="text-xs text-gray-400 mt-1">{p.notes}</p>}
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wider">
                      <th className="text-left px-5 py-3 font-medium">Date</th>
                      <th className="text-left px-5 py-3 font-medium">Type de frais</th>
                      <th className="text-left px-5 py-3 font-medium">Montant</th>
                      <th className="text-left px-5 py-3 font-medium">Méthode</th>
                      <th className="text-left px-5 py-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.payments.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-gray-600">{new Date(p.paid_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3"><span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded capitalize">{p.fee_type.replace('_', ' ')}</span></td>
                        <td className="px-5 py-3 font-semibold text-green-600">{parseFloat(p.amount).toLocaleString()} FBU</td>
                        <td className="px-5 py-3 text-gray-500 capitalize">{p.payment_method.replace('_', ' ')}</td>
                        <td className="px-5 py-3 text-gray-400">{p.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== PAYMENT MODAL ===== */}
      {payForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setPayForm(null)}>
          <form onSubmit={handlePay} onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl" encType="multipart/form-data">
            <h3 className="font-bold text-lg mb-1 dark:text-white">Enregistrer un paiement</h3>
            <p className="text-sm text-gray-400 mb-4 capitalize">{payForm.replace('_', ' ')} — {s.first_name} {s.last_name}</p>
            <input type="hidden" name="fee_type" value={payForm} />
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Montant *</label>
                <input name="amount" type="number" step="0.01" required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Méthode</label>
                <select name="payment_method" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="cash">Espèces</option>
                  <option value="bank_slip">Bordereau bancaire</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Bordereau bancaire (optionnel)</label>
                <input name="bank_slip" type="file" accept="image/*,.pdf" className="w-full text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <input name="notes" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Notes optionnelles..." />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button type="button" onClick={() => setPayForm(null)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50">Annuler</button>
              <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">Enregistrer le paiement</button>
            </div>
          </form>
        </div>
      )}

      {/* ===== GRACE PERIOD MODAL ===== */}
      {graceForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setGraceForm(null)}>
          <form onSubmit={handleGrace} onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-lg mb-1 dark:text-white">Définir un délai de grâce</h3>
            <p className="text-sm text-gray-400 mb-4 capitalize">{graceForm.replace('_', ' ')} — {s.first_name} {s.last_name}</p>
            <input type="hidden" name="fee_type" value={graceForm} />
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Message *</label>
                <textarea name="message" required rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="ex: Délai de grâce accordé, veuillez payer avant..." />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Échéance (optionnelle)</label>
                <input name="deadline" type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button type="button" onClick={() => setGraceForm(null)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50">Annuler</button>
              <button type="submit" className="flex-1 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600">Définir le délai</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, sub, className }) {
  return (
    <div className={`rounded-xl p-4 ${className}`}>
      <p className="text-xs opacity-70 font-medium">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
      <p className="text-xs opacity-60 mt-0.5">{sub}</p>
    </div>
  )
}

function DetailRow({ icon, label, value, mono }) {
  return value ? (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-base">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-gray-800 dark:text-gray-200 font-medium truncate ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
      </div>
    </div>
  ) : null
}
