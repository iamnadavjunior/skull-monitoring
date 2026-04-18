import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function StudentForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [form, setForm] = useState({
    first_name: '', last_name: '', date_of_birth: '', school_year: '2025-2026',
    class_id: '', parent_name: '', parent_phone: '',
  })
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/classes').then(res => setClasses(res.data || []))
    if (isEdit) {
      api.get(`/students/${id}`).then(res => {
        const s = res.data
        setForm({
          first_name: s.first_name, last_name: s.last_name,
          date_of_birth: s.date_of_birth || '', school_year: s.school_year,
          class_id: s.class_id || '', parent_name: s.parent_name || '', parent_phone: s.parent_phone || '',
        })
      })
    }
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const fd = new FormData(e.target)
      if (isEdit) {
        await api.put(`/students/${id}`, Object.fromEntries(fd))
      } else {
        await api.upload('/students', fd)
      }
      navigate(isEdit ? `/students/${id}` : '/students')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-6 dark:text-white">{isEdit ? 'Modifier l\'élève' : 'Fiche d\'inscription'}</h2>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4" encType="multipart/form-data">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Prénom" name="first_name" value={form.first_name} onChange={set('first_name')} required />
          <Field label="Nom" name="last_name" value={form.last_name} onChange={set('last_name')} required />
        </div>
        <Field label="Date de naissance" name="date_of_birth" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
        <Field label="Année scolaire" name="school_year" value={form.school_year} onChange={set('school_year')} required />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Classe</label>
          <select
            name="class_id"
            value={form.class_id}
            onChange={set('class_id')}
            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
          >
            <option value="">— Aucune classe assignée —</option>
            {classes.filter(c => c.category === 'preschool').length > 0 && (
              <optgroup label="Préscolaire">
                {classes.filter(c => c.category === 'preschool').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
            )}
            {classes.filter(c => c.category === 'elementary').length > 0 && (
              <optgroup label="Primaire">
                {classes.filter(c => c.category === 'elementary').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
        <Field label="Nom du parent" name="parent_name" value={form.parent_name} onChange={set('parent_name')} />
        <Field label="Téléphone du parent" name="parent_phone" value={form.parent_phone} onChange={set('parent_phone')} />

        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo</label>
            <input name="photo" type="file" accept="image/*" className="w-full text-sm" />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-2.5 border dark:border-gray-600 rounded-lg text-sm dark:text-gray-300">Annuler</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg text-sm disabled:opacity-50">
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, type = 'text', ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input type={type} {...props} className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-gray-700 dark:text-white" />
    </div>
  )
}
