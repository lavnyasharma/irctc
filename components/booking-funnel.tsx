"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingDown } from "lucide-react"
import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration, registerables } from "chart.js"

Chart.register(...registerables)

interface BookingFunnelProps {
  data: {
    totalAttempts: number
    totalSettled: number
    totalBookings: number
    overallSuccessRate: number
    bookingConversion: number
  }
}

export function BookingFunnel({ data }: BookingFunnelProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  const settledRate = (data.totalSettled / data.totalAttempts) * 100
  const bookingRate = (data.totalBookings / data.totalSettled) * 100
  const overallConversion = (data.totalBookings / data.totalAttempts) * 100

  const funnelSteps = [
 
    {
      label: "Settled",
      value: data.totalSettled,
      percentage: settledRate,
      color: "bg-green-500",
      dropOff: 100 - settledRate,
    },
    {
      label: "Bookings",
      value: data.totalBookings,
      percentage: (data.totalBookings / data.totalAttempts) * 100,
      color: "bg-purple-500",
      dropOff: settledRate - bookingRate,
    },
  ]

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const config: ChartConfiguration = {
      type: "bar",
      data: {
        labels: ["Attempts", "Settled", "Bookings"],
        datasets: [
          {
            label: "Count",
            data: [data.totalAttempts, data.totalSettled, data.totalBookings],
            backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(16, 185, 129, 0.8)", "rgba(139, 92, 246, 0.8)"],
            borderColor: ["rgb(59, 130, 246)", "rgb(16, 185, 129)", "rgb(139, 92, 246)"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Booking Funnel Visualization",
          },
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y
                const percentage = ((value / data.totalAttempts) * 100).toFixed(1)
                return `${context.label}: ${value.toLocaleString()} (${percentage}%)`
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => (typeof value === "number" ? value.toLocaleString() : value),
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Booking Funnel Analysis
        </CardTitle>
        <CardDescription>Conversion rates and drop-offs through the booking process</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="h-64">
          <canvas ref={chartRef}></canvas>
        </div>

        {/* Progress Bars */}
        {funnelSteps.map((step, index) => (
          <div key={step.label} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{step.label}</span>
              <div className="text-right">
                <div className="font-bold">{step.value.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">{step.percentage.toFixed(1)}%</div>
              </div>
            </div>

            <div className="relative">
              <Progress value={step.percentage} className="h-8" />
              <div className="absolute inset-0 flex items-center justify-center text-white font-medium text-sm">
                {step.percentage.toFixed(1)}%
              </div>
            </div>

            {step.dropOff && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <TrendingDown className="h-4 w-4" />
                <span>{step.dropOff.toFixed(1)}% drop-off</span>
              </div>
            )}
          </div>
        ))}

        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{settledRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Settlement Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{overallConversion.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Overall Conversion</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
