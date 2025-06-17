"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { BookingData } from "@/lib/data-processor"
import { AlertTriangle, TrendingDown, TrendingUp, Activity } from "lucide-react"
import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration, registerables } from "chart.js"

Chart.register(...registerables)

interface AnomalyDetectionProps {
  data: BookingData[]
}

export function AnomalyDetection({ data }: AnomalyDetectionProps) {
  const scatterChartRef = useRef<HTMLCanvasElement>(null)
  const scatterChartInstance = useRef<Chart | null>(null)

  // Calculate statistical thresholds
  const calculateStats = (values: number[]) => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length)
    return { mean, stdDev }
  }

  const attempts = data.map((row) => row.attempts)
  const pgRates = data.map((row) => row.pgSuccessRate)
  const bookingRates = data.map((row) => row.bookingVsAttempt)

  const attemptsStats = calculateStats(attempts)
  const pgStats = calculateStats(pgRates)
  const bookingStats = calculateStats(bookingRates)

  // Detect anomalies
  const anomalies = data
    .map((row, index) => {
      const anomaliesFound = []

      // Attempts anomalies
      const attemptsZScore = Math.abs((row.attempts - attemptsStats.mean) / attemptsStats.stdDev)
      if (attemptsZScore > 2) {
        anomaliesFound.push({
          type: "attempts",
          severity: attemptsZScore > 3 ? "high" : attemptsZScore > 2.5 ? "medium" : "low",
          value: row.attempts,
          zScore: attemptsZScore,
        })
      }

      // PG Success Rate anomalies
      const pgZScore = Math.abs((row.pgSuccessRate - pgStats.mean) / pgStats.stdDev)
      if (pgZScore > 2 || row.pgSuccessRate < 30) {
        anomaliesFound.push({
          type: "pgSuccessRate",
          severity: row.pgSuccessRate < 20 ? "high" : row.pgSuccessRate < 30 ? "medium" : "low",
          value: row.pgSuccessRate,
          zScore: pgZScore,
        })
      }

      // Booking Rate anomalies
      const bookingZScore = Math.abs((row.bookingVsAttempt - bookingStats.mean) / bookingStats.stdDev)
      if (bookingZScore > 2) {
        anomaliesFound.push({
          type: "bookingVsAttempt",
          severity: bookingZScore > 3 ? "high" : bookingZScore > 2.5 ? "medium" : "low",
          value: row.bookingVsAttempt,
          zScore: bookingZScore,
        })
      }

      return {
        minute: row.minute,
        anomalies: anomaliesFound,
        attempts: row.attempts,
        pgSuccessRate: row.pgSuccessRate,
        bookingVsAttempt: row.bookingVsAttempt,
      }
    })
    .filter((row) => row.anomalies.length > 0)

  const highSeverityAnomalies = anomalies.filter((row) => row.anomalies.some((a) => a.severity === "high"))

  useEffect(() => {
    if (!scatterChartRef.current) return

    if (scatterChartInstance.current) {
      scatterChartInstance.current.destroy()
    }

    const ctx = scatterChartRef.current.getContext("2d")
    if (!ctx) return

    const scatterData = data.map((row, index) => ({
      x: row.attempts,
      y: row.pgSuccessRate,
      minute: row.minute,
      bookingRate: row.bookingVsAttempt,
    }))

    const config: ChartConfiguration = {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Attempts vs PG Success Rate",
            data: scatterData,
            backgroundColor: "rgba(59, 130, 246, 0.6)",
            borderColor: "rgb(59, 130, 246)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Attempts vs PG Success Rate Scatter Plot",
          },
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: (context) => {
                const point = context[0]
                return `Time: ${point.raw.minute}`
              },
              label: (context) => {
                const point = context.raw as any
                return [
                  `Attempts: ${point.x.toLocaleString()}`,
                  `PG Success Rate: ${point.y.toFixed(1)}%`,
                  `Booking Rate: ${point.bookingRate.toFixed(1)}%`,
                ]
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Number of Attempts",
            },
            ticks: {
              callback: (value) => (typeof value === "number" ? value.toLocaleString() : value),
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "PG Success Rate (%)",
            },
            min: 0,
            max: 100,
          },
        },
      },
    }

    scatterChartInstance.current = new Chart(ctx, config)

    return () => {
      if (scatterChartInstance.current) {
        scatterChartInstance.current.destroy()
      }
    }
  }, [data])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />
      case "medium":
        return <TrendingDown className="h-4 w-4" />
      case "low":
        return <Activity className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{highSeverityAnomalies.length}</div>
                <p className="text-xs text-muted-foreground">High Severity Anomalies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{anomalies.length}</div>
                <p className="text-xs text-muted-foreground">Total Anomalies Detected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{((anomalies.length / data.length) * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Anomaly Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scatter Plot */}
      <Card>
        <CardHeader>
          <CardTitle>Attempts vs PG Success Rate</CardTitle>
          <CardDescription>
            Scatter plot showing relationship between booking attempts and success rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <canvas ref={scatterChartRef}></canvas>
          </div>
        </CardContent>
      </Card>

      {/* Anomaly List */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Anomalies</CardTitle>
          <CardDescription>Minutes with unusual patterns requiring attention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {anomalies.length === 0 ? (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                No significant anomalies detected in the data. All metrics are within normal ranges.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {anomalies.slice(0, 10).map((anomaly, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{anomaly.minute}</div>
                    <div className="flex gap-2">
                      {anomaly.anomalies.map((a, i) => (
                        <Badge key={i} variant={getSeverityColor(a.severity)} className="gap-1">
                          {getSeverityIcon(a.severity)}
                          {a.type === "attempts"
                            ? "High Attempts"
                            : a.type === "pgSuccessRate"
                              ? "Low PG Success"
                              : "Booking Rate"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Attempts: {anomaly.attempts.toLocaleString()}</div>
                    <div>PG Success: {anomaly.pgSuccessRate.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
              {anomalies.length > 10 && (
                <div className="text-center text-sm text-muted-foreground">
                  ... and {anomalies.length - 10} more anomalies
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {highSeverityAnomalies.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Performance Issues Detected:</strong>
            <ul className="mt-2 list-disc list-inside">
              {highSeverityAnomalies.slice(0, 3).map((anomaly, index) => (
                <li key={index}>
                  {anomaly.minute}:{" "}
                  {anomaly.anomalies
                    .filter((a) => a.severity === "high")
                    .map((a) => `${a.type} (${a.value})`)
                    .join(", ")}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
