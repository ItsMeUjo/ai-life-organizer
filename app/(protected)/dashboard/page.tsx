'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

type Task = {
  id: string
  title: string
  status: string
  created_at: string
}

export default function DashboardPage() {
  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = useMemo(() => createClient(), [])

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
    setTasks(data || [])
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
    })

    supabase.from('tasks').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setTasks(data || [])
    })
  }, [supabase])

  async function addTask() {
    if (!task.trim()) return
    setLoading(true)
    const { error } = await supabase.from('tasks').insert([{ title: task.trim() }])
    if (!error) {
      setTask('')
      await fetchTasks()
    }
    setLoading(false)
  }

  async function completeTask(id: string) {
    await supabase.from('tasks').update({ status: 'done' }).eq('id', id)
    await fetchTasks()
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    await fetchTasks()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const pendingTasks = tasks.filter((t) => t.status !== 'done')
  const doneTasks = tasks.filter((t) => t.status === 'done')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Organizador de Tarefas</h1>
          {userEmail && (
            <p className="text-sm text-gray-500 mt-1">{userEmail}</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Sair
        </button>
      </header>

      <div className="flex gap-2 mb-8">
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Nova tarefa..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTask}
          disabled={loading || !task.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
        >
          {loading ? '...' : 'Adicionar'}
        </button>
      </div>

      {pendingTasks.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Pendentes ({pendingTasks.length})
          </h2>
          <ul className="space-y-2">
            {pendingTasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100"
              >
                <span className="text-gray-800 text-sm">{t.title}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => completeTask(t.id)}
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    Concluir
                  </button>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="text-xs text-red-400 hover:text-red-600 font-medium"
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {doneTasks.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Concluídas ({doneTasks.length})
          </h2>
          <ul className="space-y-2">
            {doneTasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 opacity-60"
              >
                <span className="text-gray-500 text-sm line-through">{t.title}</span>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="text-xs text-red-400 hover:text-red-600 font-medium"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">Nenhuma tarefa ainda. Adicione uma acima!</p>
        </div>
      )}
    </div>
  )
}
