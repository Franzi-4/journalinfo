'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type JournalResult = {
    name: string;
    sjr: number;
    category: string;
}

export default function JournalChecker() {
  const [journalName, setJournalName] = useState('')
  const [result, setResult] = useState<JournalResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setIsLoading(true)
    try {
      const response = await fetch(`/api/check-journal?name=${encodeURIComponent(journalName)}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch journal data')
      }
      const data: JournalResult = await response.json()
      console.log('Received journal data:', data)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while checking the journal')
    } finally {
      setIsLoading(false)
    }
  }

  const getSJRColor = (sjr: number) => {
    if (sjr >= 5) return 'text-green-600'
    if (sjr >= 2) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Check Journal Quality</CardTitle>
        <CardDescription>Enter a journal name to check its quality score</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            type="text"
            value={journalName}
            onChange={(e) => setJournalName(e.target.value)}
            placeholder="Enter journal name"
            className="flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Checking...' : 'Check'}
          </Button>
        </form>
      </CardContent>
      {error && (
        <CardFooter>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardFooter>
      )}
      {result && (
        <CardFooter>
          <div>
            <h2 className="text-xl font-semibold">{result.name}</h2>
            <p className={getSJRColor(result.sjr)}>
              SJR Score: {(result.sjr ?? 0).toFixed(3)}
            </p>
            <p>Category: {result.category || 'N/A'}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

