import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { fetchJournalData } from '@/utils/kaggle'

export async function POST(request: Request) {
  try {
    // Verify secret to prevent unauthorized revalidation
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      )
    }

    // Fetch fresh data
    const journals = await fetchJournalData()
    const journalMap = new Map(
      journals.map(journal => [
        journal.name.toLowerCase(),
        journal
      ])
    )
    
    // Update KV store
    await kv.set('journals-data', Object.fromEntries(journalMap))
    
    return NextResponse.json({ revalidated: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}

