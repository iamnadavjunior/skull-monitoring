import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Reports() {
  const [data, setData] = useState([])
  const [feeType, setFeeType] = useState('registration')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/reports/paid-unpaid?fee_type=${feeType}`).then(res => setData(res.data)).finally(() => setLoading(false))
  }, [feeType])

  const paid = data.filter(d => parseFloat(d.paid) >= parseFloat(d.due) && parseFloat(d.due) > 0)
  const partial = data.filter(d => parseFloat(d.paid) > 0 && parseFloat(d.paid) < parseFloat(d.due))
  const unpaid = data.filter(d => parseFloat(d.paid) === 0 && parseFloat(d.due) > 0)

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 dark:text-white">Rapports</h2>

      <div className="flex gap-2 mb-4 flex-wrap">
        {[['registration','Inscription'], ['quarter_1','1er Trimestre'], ['quarter_2','2ème Trimestre'], ['quarter_3','3ème Trimestre']].map(([t, label]) => (
          <button key={t} onClick={() => setFeeType(t)}
            className={`px-4 py-2 rounded-lg text-sm ${feeType === t ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 border dark:border-gray-600 dark:text-gray-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <p className="dark:text-gray-400">Chargement...</p> : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{paid.length}</p>
              <p className="text-xs text-green-600">Entièrement payé</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-700">{partial.length}</p>
              <p className="text-xs text-yellow-600">Partiel</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{unpaid.length}</p>
              <p className="text-xs text-red-600">Impayé</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 dark:text-gray-300">Élève</th>
                  <th className="text-left px-4 py-3 dark:text-gray-300">Niveau</th>
                  <th className="text-right px-4 py-3 dark:text-gray-300">Dû</th>
                  <th className="text-right px-4 py-3 dark:text-gray-300">Payé</th>
                  <th className="text-right px-4 py-3 dark:text-gray-300">Solde</th>
                  <th className="text-left px-4 py-3 dark:text-gray-300">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {data.map(d => {
                  const due = parseFloat(d.due)
                  const p = parseFloat(d.paid)
                  const bal = Math.max(0, due - p)
                  const status = bal <= 0 && due > 0 ? 'paid' : p > 0 ? 'partial' : 'pending'
                  const colors = { paid: 'bg-green-100 text-green-700', partial: 'bg-yellow-100 text-yellow-700', pending: 'bg-red-100 text-red-700' }
                  const labels = { paid: 'payé', partial: 'partiel', pending: 'impayé' }
                  return (
                    <tr key={d.id} className="dark:text-gray-300">
                      <td className="px-4 py-3 font-medium dark:text-white">{d.first_name} {d.last_name}</td>
                      <td className="px-4 py-3">{d.grade}</td>
                      <td className="px-4 py-3 text-right">{due.toLocaleString()} FBU</td>
                      <td className="px-4 py-3 text-right">{p.toLocaleString()} FBU</td>
                      <td className="px-4 py-3 text-right font-medium">{bal.toLocaleString()} FBU</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${colors[status]}`}>{labels[status]}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
