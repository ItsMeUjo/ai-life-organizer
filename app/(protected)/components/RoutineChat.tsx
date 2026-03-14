'use client'

import { useState } from 'react'

type RoutineData = {
  routine: {
    id: string
    name: string
    schedule_items: Array<{
      id: string
      title: string
      time: string
      day_of_week: number
      duration_minutes: number
      priority: string
    }>
  }
}

export default function RoutineChat() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [routine, setRoutine] = useState<RoutineData | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/organize-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao organizar rotina')
        setLoading(false)
        return
      }

      setRoutine(data)
      setMessage('')
    } catch (err) {
      setError('Erro ao conectar com a IA')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🤖 Organize com IA</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ex: 'Quero exercício, trabalho e estudo distribuídos'"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
          >
            {loading ? 'Organizando...' : 'Organizar'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {routine && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📅 {routine.routine.name}</h3>

          <div className="space-y-4">
            {routine.routine.schedule_items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{item.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.priority === 'high' ? 'bg-red-100 text-red-700' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>📅 {daysOfWeek[item.day_of_week]}</span>
                  <span>🕐 {item.time}</span>
                  <span>⏱️ {item.duration_minutes}min</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setRoutine(null)}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2 text-sm transition-colors"
          >
            ✓ Rotina Salva! Organizar outra?
          </button>
        </div>
      )}
    </div>
  )
}