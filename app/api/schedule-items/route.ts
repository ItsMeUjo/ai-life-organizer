import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabaseServer'
import { SCHEDULE_ITEM_DEFAULTS } from './constants'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const routineId = searchParams.get('routine_id')

  let query = supabase
    .from('schedule_items')
    .select('*, routines!inner(user_id)')
    .eq('routines.user_id', user.id)
    .order('day_of_week', { ascending: true })
    .order('time', { ascending: true })

  if (routineId) {
    query = query.eq('routine_id', routineId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { routine_id, task_id, title, description, time, day_of_week, duration_minutes, priority } = body

  if (!routine_id || !title || !time || day_of_week === undefined) {
    return NextResponse.json(
      { error: 'routine_id, title, time and day_of_week are required' },
      { status: 400 }
    )
  }

  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .select('id')
    .eq('id', routine_id)
    .eq('user_id', user.id)
    .single()

  if (routineError || !routine) {
    return NextResponse.json({ error: 'Routine not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('schedule_items')
    .insert({
      routine_id,
      task_id: task_id ?? null,
      title,
      description: description ?? null,
      time,
      day_of_week,
      duration_minutes: duration_minutes ?? SCHEDULE_ITEM_DEFAULTS.DURATION_MINUTES,
      priority: priority ?? SCHEDULE_ITEM_DEFAULTS.PRIORITY,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
