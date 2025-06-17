"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { BookingData } from "@/lib/data-processor"
import { TrendingUp, AlertTriangle } from "lucide-react"
import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration, registerables } from "chart.js"

Chart.register(...registerables)

interface SuccessMetricsProps {
  data: BookingData[]
}

export function SuccessMetrics({ data }: SuccessMetricsProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  const avgPgSuccess = data.reduce((sum, row) => sum + row.pgSuccessRate, 0) / data.length
  const avgBookingRate = data.reduce((sum, row) => sum + row.bookingVsAttempt, 0) / data.length

  const lowPgSuccessCount = data.filter((row) => row.pgSuccessRate < 50).length
  const criticalMinutes = data.filter((row) => row.pgSuccessRate < 30)


  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const config: ChartConfiguration = {
      type: "line",
      data: {
        labels: data.map((row) => row.minute),
        datasets: [
          {
            label: "PG Success Rate (%)",
            data: data.map((row) => row.pgSuccessRate),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.1,
            fill: false,
          },
          {
            label: "Booking vs Attempt (%)",
            data: data.map((row) => row.bookingVsAttempt),
            borderColor: "rgb(16, 185, 129)",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.1,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Success Rate Trends Over Time",
          },
          legend: {
            position: "top",
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Time (Minutes)",
            },
            ticks: {
              maxTicksLimit: 10,
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Percentage (%)",
            },
            min: 0,
            max: 100,
          },
        },
        elements: {
          point: {
            radius: 2,
            hoverRadius: 5,
          },
        },
        annotation: {
          annotations: {
            line1: {
              type: "line",
              yMin: 50,
              yMax: 50,
              borderColor: "rgb(239, 68, 68)",
              borderWidth: 2,
              borderDash: [5, 5],
              label: {
                content: "Critical Threshold (50%)",
                enabled: true,
                position: "end",
              },
            },
          },
        },
      },
    }

    chartInstance.current = new Chart(ctx, config)

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Success Rate Trends
          </CardTitle>
          <CardDescription>Payment gateway success and booking conversion rates over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <canvas ref={chartRef}></canvas>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{avgPgSuccess.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average PG Success Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{avgBookingRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average Booking Rate</p>
          </CardContent>
        </Card>

        <Card>
          {/* <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              {lowPgSuccessCount > 0 && <AlertTriangle className="h-4 w-4 text-red-500" />}
              <div className="text-2xl font-bold text-red-600">{lowPgSuccessCount}</div>
            </div>
            <p className="text-xs text-muted-foreground">Minutes Below 50% PG Success</p>
          </CardContent> */}
        </Card>
      </div>

      {/* {criticalMinutes.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Critical Performance Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-2">{criticalMinutes.length} minutes with PG success rate below 30%:</p>
            <div className="flex flex-wrap gap-2">
              {criticalMinutes.slice(0, 10).map((minute) => (
                <span key={minute.minute} className="px-2 py-1 bg-red-200 text-red-800 rounded text-sm">
                  {minute.minute} ({minute.pgSuccessRate}%)
                </span>
              ))}
              {criticalMinutes.length > 10 && (
                <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-sm">
                  +{criticalMinutes.length - 10} more
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  )
}
