import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Journal = {
  id: number
  name: string
  sjr: number
  category: string
}

export async function fetchJournalData(): Promise<Journal[]> {
  const { data, error } = await supabase
    .from('journals')
    .select('*')

  if (error) {
    console.error('Error fetching journal data:', error)
    return []
  }

  return data
}

