"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ProcessedData } from "@/lib/data-processor"
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, Target, Clock } from "lucide-react"

interface InsightGeneratorProps {
  data: ProcessedData
}

export function InsightGenerator({ data }: InsightGeneratorProps) {
  const generateInsights = () => {
    const insights = []

    // Peak performance insights
    const peakTatkalMinute = data.timeSeriesData.reduce((max, row) => (row.tatkal > max.tatkal ? row : max))

    if (peakTatkalMinute.tatkal > 0) {
      insights.push({
        type: "peak",
        icon: <Clock className="h-4 w-4" />,
        title: "Peak Tatkal Activity",
        description: `Tatkal bookings peaked at ${peakTatkalMinute.minute} with ${peakTatkalMinute.tatkal.toLocaleString()} tickets.`,
        severity: "info",
      })
    }

    // Channel performance insights
    const topChannel = data.summary.channelBreakdown[0]
    const swaRailChannel = data.summary.channelBreakdown.find((c) => c.name === "SwaRail")

    insights.push({
      type: "channel",
      icon: <TrendingUp className="h-4 w-4" />,
      title: "Channel Leadership",
      description: `${topChannel.name} leads with ${topChannel.percentage.toFixed(1)}% market share (${topChannel.value.toLocaleString()} bookings).`,
      severity: "success",
    })

    if (swaRailChannel && swaRailChannel.percentage > 10) {
      const swaRailGrowth =
        data.timeSeriesData.length > 1
          ? ((data.timeSeriesData[data.timeSeriesData.length - 1].swaRailAppBooking -
              data.timeSeriesData[0].swaRailAppBooking) /
              data.timeSeriesData[0].swaRailAppBooking) *
            100
          : 0

      insights.push({
        type: "growth",
        icon: <TrendingUp className="h-4 w-4" />,
        title: "SwaRail App Growth",
        description: `SwaRail usage ${swaRailGrowth > 0 ? "rose" : "declined"} ${Math.abs(swaRailGrowth).toFixed(1)}% over the observed period.`,
        severity: swaRailGrowth > 0 ? "success" : "warning",
      })
    }

    // Geographic insights
    const topCity = data.summary.cityBreakdown[0]
    const cityShare = (topCity.value / data.summary.totalBookings) * 100

    insights.push({
      type: "geography",
      icon: <Target className="h-4 w-4" />,
      title: "Geographic Concentration",
      description: `${topCity.name} had the highest share of bookings (${cityShare.toFixed(1)}%) with ${topCity.value.toLocaleString()} total bookings.`,
      severity: "info",
    })

    // Performance issues
    const lowSuccessMinutes = data.timeSeriesData.filter((row) => row.pgSuccessRate < 50)
    if (lowSuccessMinutes.length > 0) {
      const criticalMinute = lowSuccessMinutes.reduce((min, row) => (row.pgSuccessRate < min.pgSuccessRate ? row : min))

      insights.push({
        type: "performance",
        icon: <AlertCircle className="h-4 w-4" />,
        title: "Performance Alert",
        description: `Booking success rate dropped below 50% for ${lowSuccessMinutes.length} minutes. Lowest was ${criticalMinute.pgSuccessRate.toFixed(1)}% at ${criticalMinute.minute}.`,
        severity: "error",
      })
    }

    // Conversion insights
    if (data.summary.bookingConversion < 80) {
      insights.push({
        type: "conversion",
        icon: <TrendingDown className="h-4 w-4" />,
        title: "Conversion Opportunity",
        description: `Overall booking conversion rate is ${data.summary.bookingConversion.toFixed(1)}%. There's room for improvement in converting settled transactions to bookings.`,
        severity: "warning",
      })
    }

    // High volume insights
    const peakAttemptMinute = data.timeSeriesData.reduce((max, row) => (row.attempts > max.attempts ? row : max))

    insights.push({
      type: "volume",
      icon: <TrendingUp className="h-4 w-4" />,
      title: "Peak Traffic",
      description: `Highest traffic occurred at ${peakAttemptMinute.minute} with ${peakAttemptMinute.attempts.toLocaleString()} booking attempts.`,
      severity: "info",
    })

    // Ticket type insights
    const dominantTicketType = data.summary.ticketBreakdown[0]
    insights.push({
      type: "tickets",
      icon: <Target className="h-4 w-4" />,
      title: "Ticket Preference",
      description: `${dominantTicketType.name} dominated with ${dominantTicketType.percentage.toFixed(1)}% of all bookings (${dominantTicketType.value.toLocaleString()} tickets).`,
      severity: "info",
    })

    return insights
  }

  const insights = generateInsights()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "success":
        return "bg-green-50 border-green-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "success":
        return "default"
      case "warning":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Automated Insights
          </CardTitle>
          <CardDescription>AI-generated insights based on your booking data patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-1">{insight.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge variant={getSeverityBadge(insight.severity)} className="text-xs">
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {((data.summary.totalBookings / data.summary.totalAttempts) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-blue-600">Overall Success Rate</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{data.timeSeriesData.length}</div>
              <div className="text-sm text-green-600">Active Minutes</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {Math.round(data.summary.totalAttempts / data.timeSeriesData.length).toLocaleString()}
              </div>
              <div className="text-sm text-purple-600">Avg Attempts/Minute</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">{data.summary.channelBreakdown.length}</div>
              <div className="text-sm text-orange-600">Active Channels</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
