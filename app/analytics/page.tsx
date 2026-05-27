"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Loader2, ShieldAlert, AlertCircle, MousePointer2, ExternalLink, CheckCircle2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageEventCard } from "@/components/MessageEventCard"

const chartConfig = {
  threatCount: {
    label: "Threats Blocked:",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function AnalyticsPage() {
  const [data, setData] = useState([])
  const [recentDelivered, setRecentDelivered] = useState<any[]>([])
  const [recentClicks, setRecentClicks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("7d")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      let startDate = ""
      const now = new Date()
      
      switch (dateRange) {
        case "1h":
          startDate = new Date(now.getTime() - 60 * 60 * 1000).toISOString()
          break
        case "8h":
          startDate = new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString()
          break
        case "24h":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
          break
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
          break
        case "all":
        default:
          startDate = ""
      }

      let topClientsUrl = "/api/analytics/top-clients?limit=10"
      let deliveredUrl = "/api/analytics/recent-events?collection=messagesDelivered&limit=20"
      let clicksUrl = "/api/analytics/recent-events?collection=clicksPermitted&limit=20"
      
      if (startDate) {
        topClientsUrl += `&startDate=${startDate}`
        deliveredUrl += `&startDate=${startDate}`
        clicksUrl += `&startDate=${startDate}`
      }

      try {
        const [topClientsRes, deliveredRes, clicksRes] = await Promise.all([
          fetch(topClientsUrl),
          fetch(deliveredUrl),
          fetch(clicksUrl)
        ])

        const [topClientsJson, deliveredJson, clicksJson] = await Promise.all([
          topClientsRes.json(),
          deliveredRes.json(),
          clicksRes.json()
        ])

        if (topClientsJson.success) setData(topClientsJson.records)
        if (deliveredJson.success) setRecentDelivered(deliveredJson.records)
        if (clicksJson.success) setRecentClicks(clicksJson.records)
      } catch (e) {
        console.error("Failed to fetch analytics", e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor your threat landscape and client exposure.
            </p>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="8h">Last 8 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bar Chart Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Most Targeted Clients
            </CardTitle>
            <CardDescription>
              Top 10 clients by volume of blocked threats
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-[300px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : data.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available for this timeframe.
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="customerName" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10} 
                    interval={0}
                    height={60}
                    tick={{ textAnchor: 'middle', fontSize: 11 }}
                    tickFormatter={(value) => value && value.length > 13 + Math.abs(data.length - 10) * 2 ? value.substring(0, 13 + Math.abs(data.length - 10) * 2) + '...' : value}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10} 
                  />
                  <ChartTooltip 
                    cursor={false} 
                    content={<ChartTooltipContent hideLabel />} 
                  />
                  <Bar 
                    dataKey="threatCount" 
                    fill="var(--color-threatCount)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Events Section */}
        <div className="grid gap-4 grid-cols-1">
          {/* Permitted Clicks Card */}
          <Card className={`flex flex-col ${(!loading && recentClicks.length === 0) ? '' : 'h-[500px]'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <MousePointer2 className="h-5 w-5" />
                Permitted Clicks
              </CardTitle>
              <CardDescription>
                Users who recently clicked malicious links and were allowed through
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                {loading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : recentClicks.length === 0 ? (
                  <div className="flex flex-col h-32 items-center justify-center text-sm text-muted-foreground text-center space-y-3">
                    <CheckCircle2 className="h-8 w-8 text-green-500/70" />
                    <p>No permitted malicious clicks in this timeframe.</p>
                  </div>
                ) : (
                  <div className="space-y-3 pb-6">
                    {recentClicks.map((item, i) => (
                      <div key={i} className="flex flex-col space-y-2 rounded-lg border bg-card p-3 shadow-sm transition-colors hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm truncate mr-2" title={item.customerName}>
                            {item.customerName}
                          </span>
                          <Badge variant="outline" className="text-xs shrink-0 bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900">
                            Clicked
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex justify-between gap-4">
                          <span className="truncate" title={item.recipient || item.sender}>{item.recipient || item.sender || "Unknown User"}</span>
                          <span className="shrink-0">{new Date(item.timeLogged).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        {item.url && (
                          <div className="flex items-center gap-1.5 pt-1">
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                            <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate" title={item.url}>
                              {item.url}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Delivered Threats Card */}
          <Card className={`flex flex-col ${(!loading && recentDelivered.length === 0) ? '' : 'h-[500px]'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                Recent Escapes (Delivered)
              </CardTitle>
              <CardDescription>
                Malicious messages that bypassed the filter and were delivered
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                {loading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : recentDelivered.length === 0 ? (
                  <div className="flex flex-col h-32 items-center justify-center text-sm text-muted-foreground text-center space-y-3">
                    <CheckCircle2 className="h-8 w-8 text-green-500/70" />
                    <p>No malicious messages delivered in this timeframe. Excellent!</p>
                  </div>
                ) : (
                  <div className="space-y-3 pb-6">
                    {recentDelivered.map((item, i) => (
                      <MessageEventCard key={item.GUID || i} event={item} />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
