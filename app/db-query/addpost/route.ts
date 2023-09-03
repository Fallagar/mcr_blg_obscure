import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'


//@ts-ignore
import type { Database } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    const res = NextResponse.next()
  const requestUrl = new URL(req.url)
    const data = await req.json()
    const supabase = createMiddlewareClient<Database>({ req, res })
    const {
    data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'You a not authorized!' }, { status: 401 })
    }
     let { data: queryData, error, status } = await supabase
        .from("profiles")
        .select(`user_email, role`)
        .eq("id", user?.id)
        .single();
  if (queryData?.role !== "author") {
        return NextResponse.json({ error: 'You a not the author!' }, { status: 403 })
  }
  if (queryData?.role === "author") {
    try {
      const updatedData = {
        content: data,
        author_id: user?.id,
        author_name: queryData?.user_email
      };
      let { error } = await supabase
        .from("post")
        .upsert(updatedData)
      if (error) throw error;
      return NextResponse.json({ result: 'Post Added' }, { status: 200 })
    } catch (error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    } finally {
    }
  }
}