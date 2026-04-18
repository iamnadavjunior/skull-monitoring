import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/payments').then(res => setPayments(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12">Chargement...</div>

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 dark:text-white">Tous les paiements</h2>

      {payments.length === 0 ? (
        <p className="text-gray-400 text-center py-12">Aucun paiement enregistré.</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* Mobile */}
          <div className="md:hidden divide-y dark:divide-gray-700">
            {payments.map(p => (
              <div key={p.id} className="p-4">
                <div className="flex justify-between">
                  <span className="font-medium dark:text-white">{p.first_name} {p.last_name}</span>
                  <span className="text-green-600 font-medium">{parseFloat(p.amount).toLocaleString()} FBU</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{({'registration':'Inscription','quarter_1':'T1','quarter_2':'T2','quarter_3':'T3'})[p.fee_type] || p.fee_type} · {p.payment_method} · {new Date(p.paid_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <table className="hidden md:table w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left px-4 py-3 dark:text-gray-300">Élève</th>
                <th className="text-left px-4 py-3 dark:text-gray-300">Niveau</th>
                <th className="text-left px-4 py-3 dark:text-gray-300">Type</th>
                <th className="text-left px-4 py-3 dark:text-gray-300">Montant</th>
                <th className="text-left px-4 py-3 dark:text-gray-300">Méthode</th>
                <th className="text-left px-4 py-3 dark:text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 font-medium dark:text-white">{p.first_name} {p.last_name}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{p.grade}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{({'registration':'Inscription','quarter_1':'T1','quarter_2':'T2','quarter_3':'T3'})[p.fee_type] || p.fee_type}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{parseFloat(p.amount).toLocaleString()} FBU</td>
                  <td className="px-4 py-3 dark:text-gray-300">{p.payment_method}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(p.paid_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
