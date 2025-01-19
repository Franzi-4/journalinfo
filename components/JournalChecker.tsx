'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoCircledIcon } from "@radix-ui/react-icons"

type JournalResult = {
    name: string;
    sjr: number;
    category: string;
    bestQuartile: string;
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

  const getQuartileColor = (quartile: string) => {
    if (quartile.includes('Q1')) return 'text-green-600'
    if (quartile.includes('Q2')) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatJournalName = (name: string) => {
    if (name.toLowerCase().startsWith('npj ')) {
      return (
        <span>
          <span className="font-medium text-gray-600">npj</span>
          {name.slice(3)}
        </span>
      )
    }
    return name
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
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              {formatJournalName(result.name)}
            </h2>
            
            <div className="flex items-center space-x-2">
              <p className={getSJRColor(result.sjr)}>
                SJR Score: {(result.sjr ?? 0).toFixed(3)}
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoCircledIcon className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[250px] text-sm">
                      SJR (SCImago Journal Rank) measures scientific influence. 
                      Scores above 5 are excellent (green), 
                      above 2 are good (yellow), 
                      below 2 may need additional quality checks (red).
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center space-x-2">
              <p className={getQuartileColor(result.bestQuartile)}>
                Best Quartile: {result.bestQuartile}
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoCircledIcon className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[250px] text-sm">
                      Quartile rankings show journal standing: 
                      Q1 (green) = top 25%, 
                      Q2 (yellow) = top 25-50%, 
                      Q3/Q4 (red) = bottom 50%.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center space-x-2">
              <p>Category: {result.category || 'N/A'}</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoCircledIcon className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[250px] text-sm">
                      The journal's primary research field where it achieved its highest ranking. 
                      Journals may be ranked differently across multiple categories.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

