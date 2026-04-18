import { useState, useEffect } from 'react'
import { api } from '../api'
import { Link } from 'react-router-dom'

export default function Classes() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [form, setForm] = useState({ name: '', category: 'preschool' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [expandedClass, setExpandedClass] = useState(null)
  const [classStudents, setClassStudents] = useState(null)
  const [loadingStudents, setLoadingStudents] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = () => {
    api.get('/classes').then(res => setClasses(res.data)).finally(() => setLoading(false))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingClass) {
        const res = await api.put(`/classes/${editingClass.id}`, form)
        setClasses(classes.map(c => c.id === editingClass.id ? res.data : c))
      } else {
        const res = await api.post('/classes', form)
        setClasses([...classes, res.data])
      }
      closeForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (cls) => {
    setEditingClass(cls)
    setForm({ name: cls.name, category: cls.category })
    setShowForm(true)
  }

  const handleDelete = async (cls) => {
    if (!confirm(`Supprimer "${cls.name}" ? Les élèves de cette classe seront désassignés.`)) return
    try {
      await api.del(`/classes/${cls.id}`)
      setClasses(classes.filter(c => c.id !== cls.id))
      if (expandedClass === cls.id) setExpandedClass(null)
    } catch (err) {
      alert(err.message)
    }
  }

  const toggleStudents = async (cls) => {
    if (expandedClass === cls.id) {
      setExpandedClass(null)
      setClassStudents(null)
      return
    }
    setExpandedClass(cls.id)
    setLoadingStudents(true)
    try {
      const res = await api.get(`/classes/${cls.id}/students`)
      setClassStudents(res.data)
    } catch {
      setClassStudents({ class: cls, students: [] })
    } finally {
      setLoadingStudents(false)
    }
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingClass(null)
    setForm({ name: '', category: 'preschool' })
    setError('')
  }

  const preschool = classes.filter(c => c.category === 'preschool')
  const elementary = classes.filter(c => c.category === 'elementary')
  const totalStudents = classes.reduce((sum, c) => sum + (parseInt(c.student_count) || 0), 0)

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-48" />
      <div className="grid md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Classes</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{classes.length} classes · {totalStudents} élèves inscrits</p>
        </div>
        <button
          onClick={() => { closeForm(); setShowForm(true) }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Ajouter une classe
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-violet-50 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total classes</p>
              <p className="text-xl font-bold text-violet-700">{classes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-pink-50 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Préscolaire</p>
              <p className="text-xl font-bold text-pink-700">{preschool.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">E</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Primaire</p>
              <p className="text-xl font-bold text-blue-700">{elementary.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeForm}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editingClass ? 'Modifier la classe' : 'Nouvelle classe'}</h3>
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Catégorie</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="preschool">Préscolaire</option>
                  <option value="elementary">Primaire</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nom de la classe</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder={form.category === 'preschool' ? 'ex: Maternelle 1' : 'ex: 1ère Année'}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition disabled:opacity-50">
                  {saving ? 'Enregistrement...' : editingClass ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preschool Section */}
      <ClassSection
        title="Préscolaire"
        badge="bg-pink-100 text-pink-700"
        color="border-l-pink-500"
        classes={preschool}
        expandedClass={expandedClass}
        classStudents={classStudents}
        loadingStudents={loadingStudents}
        onToggle={toggleStudents}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Elementary Section */}
      <ClassSection
        title="Primaire"
        badge="bg-blue-100 text-blue-700"
        color="border-l-blue-500"
        classes={elementary}
        expandedClass={expandedClass}
        classStudents={classStudents}
        loadingStudents={loadingStudents}
        onToggle={toggleStudents}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}

function ClassSection({ title, badge, color, classes, expandedClass, classStudents, loadingStudents, onToggle, onEdit, onDelete }) {
  if (classes.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badge}`}>{classes.length}</span>
      </div>
      <div className="space-y-3">
        {classes.map(cls => (
          <div key={cls.id}>
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 ${color} overflow-hidden`}>
              <div className="flex items-center justify-between p-4">
                <button onClick={() => onToggle(cls)} className="flex items-center gap-4 flex-1 text-left">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{cls.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {parseInt(cls.student_count) || 0} élève{parseInt(cls.student_count) !== 1 ? 's' : ''} inscrit{parseInt(cls.student_count) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggle(cls)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-400 hover:text-gray-600"
                    title="View students"
                  >
                    <svg className={`w-4 h-4 transition-transform ${expandedClass === cls.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <button onClick={() => onEdit(cls)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-400 hover:text-blue-600" title="Modifier">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button onClick={() => onDelete(cls)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-400 hover:text-red-600" title="Supprimer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded student list */}
              {expandedClass === cls.id && (
                <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 px-4 py-3">
                  {loadingStudents ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                    </div>
                  ) : classStudents?.students?.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-400 text-sm">Aucun élève dans cette classe.</p>
                      <Link to="/students/new" className="text-primary-600 text-sm font-medium hover:underline mt-1 inline-block">Assigner un élève →</Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {classStudents?.students?.map(s => (
                        <Link
                          key={s.id}
                          to={`/students/${s.id}`}
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-sm transition group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {s.first_name[0]}{s.last_name[0]}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition">{s.first_name} {s.last_name}</span>
                              <span className="text-xs text-gray-400 ml-2">Niveau {s.grade}</span>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-emerald-600">{parseFloat(s.total_paid).toLocaleString()} FBU</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
