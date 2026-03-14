import { createClient } from '@/lib/supabaseServer'
import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
    try{
        // 1. Pegar user_id autenticado
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if(!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }
        
        // 2. Pegar mensagem do body
        const { message } = await request.json()

        if(!message) {
            return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 })
        }

        // 3. Chamar OpenAI
        const prompt = `Você é um assistente especialista em organização de rotinas e produtividade.
        
        O usuário pediu "${message}"
        
        Por favor, organize uma rotina ideal com:
        - Nome da rotina
        - Dias da semana ideais (segunda=1, terça=2, quarta=3, quinta=4, sexta=5, sábado=6, domingo=0)
        - Horários (formato HH:MM)
        - Duração em minutos para cada atividade
        - Prioridade (low, medium, high)
        
        Responda EXATAMENTE neste formato JSON (sem markdown):
        {
            "routineName": "Nome da rotina",
            "schedule_items": [
                {
                    "title": "Nome da atividade",
                    "time": "07:00",
                    "day_of_week": 1,
                    "duration_minutes": 30,
                    "priority": "high"
                }
            ]
        }
        
        Crie pelo menos 5 atividades distribuídas ao longo do dia.`

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'user',
                    content: prompt
                },
            ],
            temperature: 0.7,
        })

        const aiMessage = response.choices[0].message.content

        if (!aiMessage) {
            return NextResponse.json({ error: 'Sem resposta da IA' }, { status: 500 })
        }

        // 4. Parserar resposta JSON
        const jsonMatch = aiMessage.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json({ error: 'Formato inválido da IA' }, { status: 500 })
        }

        const routineData = JSON.parse(jsonMatch[0])

        // 5. Criar rotina no banco
        const { data: routine, error: routineError } = await supabase
            .from('routines')
            .insert([
                {
                    user_id: user.id,
                    name: routineData.routineName,
                    description: `Rotina sugerida por IA: ${message}`,
                },
        ])
            .select()
            .single()

        if (routineError || !routine) {
            return NextResponse.json({ error: routineError?.message || 'Erro ao criar rotina' }, { status: 500 })
        }

        // 6. Criar schedule items
        const scheduleItems = routineData.schedule_items.map((item: any) => ({
            routine_id: routine.id,
            title: item.title,
            time: item.time,
            day_of_week: item.day_of_week,
            duration_minutes: item.duration_minutes,
            priority: item.priority || 'medium',
        }))

        const { data: items, error: itemsError } = await supabase
            .from('schedule_items')
            .insert(scheduleItems)
            .select()

        if (itemsError || !items) {
            return NextResponse.json({ error: itemsError?.message || 'Erro ao criar itens de agenda' }, { status: 500 })
        }

        //7. Retornar resultado
        return NextResponse.json({
            success: true,
            routine: {
                ...routine,
                schedule_items: items,
            },
            message: aiMessage,
        })
    } catch (error) {
        console.error('Erro:', error)
        return NextResponse.json(
            { error: 'Erro ao processar' },
            { status: 500 }    
        )
    }
}