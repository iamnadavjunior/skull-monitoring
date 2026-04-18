import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function Students() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchStudents = () => {
    setLoading(true)
    const params = new URLSearchParams({ page, search })
    api.get(`/students?${params}`).then(res => {
      setStudents(res.data.students)
      setTotal(res.data.total)
      setPages(res.data.pages)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchStudents() }, [page, search])

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h2 className="text-xl font-bold dark:text-white">Élèves <span className="text-gray-400 dark:text-gray-500 text-sm font-normal">({total})</span></h2>
        <Link to="/students/new" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition">
          + Nouvel élève
        </Link>
      </div>

      <input type="text" placeholder="Rechercher par nom ou téléphone..." value={search}
        onChange={e => { setSearch(e.target.value); setPage(1) }}
        className="w-full max-w-sm mb-4 px-4 py-2 border dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500" />

      {loading ? (
        <div className="text-center py-8 text-gray-400">Chargement...</div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Aucun élève trouvé.</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {students.map(s => (
              <Link to={`/students/${s.id}`} key={s.id} className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold dark:text-white">{s.first_name} {s.last_name}</p>
                    <p className="text-xs text-gray-500">{s.grade} · {s.school_year}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Niveau</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Année</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Parent</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <Link to={`/students/${s.id}`} className="text-primary-600 hover:underline font-medium">
                        {s.first_name} {s.last_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 dark:text-gray-300">{s.grade}</td>
                    <td className="px-4 py-3 dark:text-gray-300">{s.school_year}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{s.parent_name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {s.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: pages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded text-sm ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white border hover:bg-gray-50'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
