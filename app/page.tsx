'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {

  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState<any[]>([])

  async function addTask() {

    if (!task) return

    const { error } = await supabase
    .from('tasks')
    .insert([{ title: task }])
    
    if (!error) {
      setTask('')
      fetchTasks()
    }
  }

  async function completeTask(id: string) {

    await supabase
      .from('tasks')
      .update({ status: 'done' })
      .eq('id', id)
    
      fetchTasks()
  }

  async function deleteTask(id: string) {

    await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
      fetchTasks()
  }

  async function fetchTasks() {

    const { data } = await supabase
      .from('tasks')
      .select('*')

    console.log("TAREFAS", data)
    console.log("ERRO:", data)

    setTasks(data || [])
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <div style={{ padding: 40 }}>

      <h1>Organizador de Tarefas</h1>

      <input
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Digite uma tarefa"
      />

      <button onClick={addTask}>
        adicionar
      </button>

      <ul>

        {tasks.map((t) => (
          <li key={t.id}>

            {t.title} - {t.status}

            <button onClick={() => completeTask(t.id)}>
              concluir
            </button>

            <button onClick={() => deleteTask(t.id)}>
              remover
            </button>

          </li>
        ))}

      </ul>
    </div>
  )
}