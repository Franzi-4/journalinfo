import { NextResponse } from 'next/server'
import { fetchJournalData } from '@/utils/supabase'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    console.log('Received search request for:', name)

    if (!name) {
        return NextResponse.json({ error: 'Journal name is required' }, { status: 400 })
    }

    try {
        const journals = await fetchJournalData(name)
        console.log('Search results:', journals)
        
        if (!journals || journals.length === 0) {
            return NextResponse.json({ 
                message: 'Journal not found',
                searchedFor: name 
            }, { status: 404 })
        }

        return NextResponse.json(journals)
    } catch (error) {
        console.error('Error in check-journal route:', error)
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

