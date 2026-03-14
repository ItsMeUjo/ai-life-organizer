import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabaseServer'
import { SCHEDULE_ITEM_DEFAULTS } from '../constants'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { data, error } = await supabase
    .from('schedule_items')
    .select('*, routines!inner(user_id)')
    .eq('id', id)
    .eq('routines.user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Schedule item not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { task_id, title, description, time, day_of_week, duration_minutes, priority } = body

  if (!title || !time || day_of_week === undefined) {
    return NextResponse.json(
      { error: 'title, time and day_of_week are required' },
      { status: 400 }
    )
  }

  const { data: existing, error: existingError } = await supabase
    .from('schedule_items')
    .select('id, routines!inner(user_id)')
    .eq('id', id)
    .eq('routines.user_id', user.id)
    .single()

  if (existingError || !existing) {
    return NextResponse.json({ error: 'Schedule item not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('schedule_items')
    .update({
      task_id: task_id ?? null,
      title,
      description: description ?? null,
      time,
      day_of_week,
      duration_minutes: duration_minutes ?? SCHEDULE_ITEM_DEFAULTS.DURATION_MINUTES,
      priority: priority ?? SCHEDULE_ITEM_DEFAULTS.PRIORITY,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { data: existing, error: existingError } = await supabase
    .from('schedule_items')
    .select('id, routines!inner(user_id)')
    .eq('id', id)
    .eq('routines.user_id', user.id)
    .single()

  if (existingError || !existing) {
    return NextResponse.json({ error: 'Schedule item not found' }, { status: 404 })
  }

  const { error } = await supabase.from('schedule_items').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Schedule item deleted successfully' })
}
