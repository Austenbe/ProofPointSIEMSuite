"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Database, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react"


export default function Dashboard() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [lastTriggerResult, setLastTriggerResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const fetchRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/data")
      const result = await response.json()

      if (result.success) {
        setRecords(result.records)
        setLastUpdated(result.lastUpdated || null)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("Failed to fetch records")
    } finally {
      setLoading(false)
    }
  }

  const triggerUpdate = async () => {
    try {
      setTriggering(true)
      setLastTriggerResult(null)
      const response = await fetch("/api/data/update")
      const result = await response.json()

      setLastTriggerResult({
        success: result.success,
        message: result.success
          ? result.message
          : result.error || "Failed to fetch data",
      })

      if (result.success) {
        await fetchRecords()
      }
    } catch (err) {
      setLastTriggerResult({
        success: false,
        message: "Failed to trigger fetch",
      })
    } finally {
      setTriggering(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            API Data Collector
          </h1>
          <p className="text-muted-foreground">
            Automatically fetches data from your API every hour and stores it in MongoDB Atlas.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Cron Job Status
            </CardTitle>
            <CardDescription>
              {lastUpdated
                ? `Last Updated: ${new Date(lastUpdated).toLocaleString()}`
                : loading ? "Loading last update time..." : "Last Updated: Never"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button onClick={triggerUpdate} disabled={triggering}>
                {triggering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update Data
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={fetchRecords} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Load Data
                  </>
                )}
              </Button>
            </div>

            {lastTriggerResult && (
              <div
                className={`flex items-center gap-2 rounded-lg p-3 ${lastTriggerResult.success
                  ? "bg-green-500/10 text-green-600"
                  : "bg-red-500/10 text-red-600"
                  }`}
              >
                {lastTriggerResult.success ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <span>{lastTriggerResult.message}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Stored Records
            </CardTitle>
            <CardDescription>
              Showing the latest {records.length} records from MongoDB
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-4 text-red-600">
                <XCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : records.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Database className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No records yet. Click &quot;Trigger Manual Fetch&quot; to fetch data.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div
                    key={record.GUID}
                    className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        {new Date(record.messageTime).toLocaleString()}
                      </span>
                      <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {record.GUID}
                      </span>
                    </div>
                    <pre className="overflow-x-auto rounded bg-muted/50 p-3 text-sm">
                      {JSON.stringify(record, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
