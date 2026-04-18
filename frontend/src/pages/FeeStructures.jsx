import { useState, useEffect } from 'react'
import { api } from '../api'

export default function FeeStructures() {
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ academic_year: '2025-2026', registration_fee: '200000', quarter_1_fee: '100000', quarter_2_fee: '100000', quarter_3_fee: '100000' })
  const [saving, setSaving] = useState(false)

  const fetchFees = () => {
    api.get('/fees').then(res => setFees(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchFees() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/fees', form)
      setForm({ ...form, registration_fee: '200000', quarter_1_fee: '100000', quarter_2_fee: '100000', quarter_3_fee: '100000' })
      fetchFees()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 dark:text-white">Grille tarifaire</h2>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-6">
        <h3 className="font-semibold mb-3 dark:text-white">Ajouter / Mettre à jour une grille tarifaire</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input placeholder="Année scolaire" value={form.academic_year} onChange={e => setForm({...form, academic_year: e.target.value})} required
            className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white" />
          <input placeholder="Inscription" type="number" step="1" value={form.registration_fee} onChange={e => setForm({...form, registration_fee: e.target.value})}
            className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white" />
          <input placeholder="T1" type="number" step="1" value={form.quarter_1_fee} onChange={e => setForm({...form, quarter_1_fee: e.target.value})}
            className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white" />
          <input placeholder="T2" type="number" step="1" value={form.quarter_2_fee} onChange={e => setForm({...form, quarter_2_fee: e.target.value})}
            className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white" />
          <input placeholder="T3" type="number" step="1" value={form.quarter_3_fee} onChange={e => setForm({...form, quarter_3_fee: e.target.value})}
            className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white" />
        </div>
        <button type="submit" disabled={saving} className="mt-3 bg-primary-600 text-white px-6 py-2 rounded-lg text-sm disabled:opacity-50">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>

      {loading ? <p className="dark:text-gray-400">Chargement...</p> : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left px-4 py-3 dark:text-gray-300">Année</th>
                <th className="text-right px-4 py-3 dark:text-gray-300">Inscription</th>
                <th className="text-right px-4 py-3 dark:text-gray-300">T1</th>
                <th className="text-right px-4 py-3 dark:text-gray-300">T2</th>
                <th className="text-right px-4 py-3 dark:text-gray-300">T3</th>
                <th className="text-right px-4 py-3 dark:text-gray-300">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {fees.map(f => {
                const total = [f.registration_fee, f.quarter_1_fee, f.quarter_2_fee, f.quarter_3_fee].reduce((a, b) => a + parseFloat(b || 0), 0)
                return (
                  <tr key={f.id} className="dark:text-gray-300">
                    <td className="px-4 py-3">{f.academic_year}</td>
                    <td className="px-4 py-3 text-right">{parseFloat(f.registration_fee).toLocaleString()} FBU</td>
                    <td className="px-4 py-3 text-right">{parseFloat(f.quarter_1_fee).toLocaleString()} FBU</td>
                    <td className="px-4 py-3 text-right">{parseFloat(f.quarter_2_fee).toLocaleString()} FBU</td>
                    <td className="px-4 py-3 text-right">{parseFloat(f.quarter_3_fee).toLocaleString()} FBU</td>
                    <td className="px-4 py-3 text-right font-bold">{total.toLocaleString()} FBU</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
