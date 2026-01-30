import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is ACTIVE
    const { data: profile } = await supabase
      .from('profiles')
      .select('status_access')
      .eq('id', user.id)
      .single()

    if (profile?.status_access !== 'ACTIVE') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { content, media } = await request.json()

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content,
        media: media || null,
        status: 'PUBLISHED',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url,
          verified_badge
        ),
        comments (count),
        reactions (count)
      `)
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (cursor) {
      query = query.lt('created_at', cursor)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({
      posts: data,
      nextCursor: data.length === limit ? data[data.length - 1].created_at : null,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
