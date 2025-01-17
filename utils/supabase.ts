import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export type Journal = {
    name: string    // This will be the Title
    sjr: number    // This will be SJR-index
    category: string // This will be Best Categories
}

export async function fetchJournalData(searchTitle: string): Promise<Journal[]> {
    console.log('Searching for title:', searchTitle)
    
    // Try case-insensitive partial match
    const { data, error } = await supabase
        .from('JournalRanking')
        .select('Title, "SJR-index", "Best Categories"')
        .ilike('Title', `%${searchTitle}%`)
        .limit(1000)

    if (error) {
        console.error('Search error:', error)
        return []
    }

    console.log('Raw data from Supabase:', data)

    // Transform the data to match our expected format with safety checks
    const journals = (data || []).map(journal => {
        const sjrValue = journal["SJR-index"]
        console.log('SJR value for', journal.Title, ':', sjrValue)
        
        return {
            name: journal.Title || '',
            sjr: sjrValue ? Number(sjrValue) : 0, // Default to 0 if undefined
            category: journal["Best Categories"] || ''
        }
    })

    console.log('Transformed journals:', journals)
    return journals.filter(j => j.name && j.sjr !== undefined) // Only return complete entries
}
