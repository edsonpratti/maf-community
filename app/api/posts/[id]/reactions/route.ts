import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type } = await request.json()
    const { id: postId } = await params

    // Check if reaction already exists
    const { data: existing } = await supabase
      .from('reactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .eq('type', type)
      .single()

    if (existing) {
      // Remove reaction
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existing.id)

      if (error) throw error

      return NextResponse.json({ removed: true })
    } else {
      // Add reaction
      const { data, error } = await supabase
        .from('reactions')
        .insert({
          post_id: postId,
          user_id: user.id,
          type,
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ added: true, data })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: postId } = await params

    const { data, error } = await supabase
      .from('reactions')
      .select('type, user_id')
      .eq('post_id', postId)

    if (error) throw error

    // Group by type and count
    const grouped = data.reduce((acc: any, reaction: any) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      reactions: grouped,
      userReactions: data.filter((r: any) => r.user_id === user.id).map((r: any) => r.type),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
