import { NextResponse } from 'next/server'
import { fetchJournalData, type Journal } from '@/utils/supabase'
import { kv } from '@vercel/kv'

let journalsCache: Map<string, Journal> | null = null
let lastFetchTime = 0
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

async function getJournals(): Promise<Map<string, Journal>> {
  const now = Date.now()
  
  if (journalsCache && (now - lastFetchTime) < CACHE_DURATION) {
    return journalsCache
  }

  try {
    const journals = await fetchJournalData()
    journalsCache = new Map(
      journals.map(journal => [
        journal.name.toLowerCase(),
        journal
      ])
    )
    
    lastFetchTime = now
    return journalsCache
  } catch (error) {
    console.error('Error fetching journal data:', error)
    throw new Error('Failed to fetch journal data')
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')

  if (!name) {
    return NextResponse.json(
      { error: 'Journal name is required' },
      { status: 400 }
    )
  }

  try {
    const journals = await getJournals()
    const journal = journals.get(name.toLowerCase())

    if (!journal) {
      return NextResponse.json(
        { error: 'Journal not in list - try again' },
        { status: 404 }
      )
    }

    // Track search analytics
    await kv.incr(`search:${name.toLowerCase()}`)
    
    return NextResponse.json(journal)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check journal. Please try again later.' },
      { status: 500 }
    )
  }
}

