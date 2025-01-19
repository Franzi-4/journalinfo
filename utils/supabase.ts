import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export type Journal = {
    name: string
    sjr: number
    category: string
    bestQuartile: string
}

export async function fetchJournalData(searchTitle: string): Promise<Journal[]> {
    console.log('Searching for title:', searchTitle)
    
    const { data, error } = await supabase
        .from('JournalRanking')
        .select('Title, "SJR-index", "Best Categories", "Best Quartile"')
        .ilike('Title', `%${searchTitle}%`)
        .limit(1000)

    if (error) {
        console.error('Search error:', error)
        return []
    }

    const journals = (data || []).map(journal => ({
        name: journal.Title || '',
        sjr: journal["SJR-index"] ? Number(journal["SJR-index"]) : 0,
        category: journal["Best Categories"] || '',
        bestQuartile: journal["Best Quartile"] || ''
    }))

    return journals.filter(j => j.name && j.sjr !== undefined)
}
