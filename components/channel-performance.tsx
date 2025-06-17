"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProcessedData } from "@/lib/data-processor"
import { Smartphone, Globe, Users, Zap } from "lucide-react"
import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration, registerables } from "chart.js"

Chart.register(...registerables)

interface ChannelPerformanceProps {
  data: ProcessedData
}

const channelIcons = {
  Website: Globe,
  App: Smartphone,
  Agents: Users,
  SwaRail: Zap,
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

export function ChannelPerformance({ data }: ChannelPerformanceProps) {
  const areaChartRef = useRef<HTMLCanvasElement>(null)
  const pieChartRef = useRef<HTMLCanvasElement>(null)
  const areaChartInstance = useRef<Chart | null>(null)
  const pieChartInstance = useRef<Chart | null>(null)

  const swaRailGrowth =
    data.timeSeriesData.length > 1
      ? ((data.timeSeriesData[data.timeSeriesData.length - 1].swaRailAppBooking -
          data.timeSeriesData[0].swaRailAppBooking) /
          data.timeSeriesData[0].swaRailAppBooking) *
        100
      : 0

  useEffect(() => {
    // Area Chart
    if (areaChartRef.current) {
      if (areaChartInstance.current) {
        areaChartInstance.current.destroy()
      }

      const ctx = areaChartRef.current.getContext("2d")
      if (ctx) {
        const config: ChartConfiguration = {
          type: "line",
          data: {
            labels: data.timeSeriesData.map((row) => row.minute),
            datasets: [
              {
                label: "Website",
                data: data.timeSeriesData.map((row) => row.websiteBooking),
                borderColor: COLORS[0],
                backgroundColor: COLORS[0] + "20",
                fill: true,
                tension: 0.1,
              },
              {
                label: "App",
                data: data.timeSeriesData.map((row) => row.appBooking),
                borderColor: COLORS[1],
                backgroundColor: COLORS[1] + "20",
                fill: true,
                tension: 0.1,
              },
              {
                label: "Agents",
                data: data.timeSeriesData.map((row) => row.agentsBooking),
                borderColor: COLORS[2],
                backgroundColor: COLORS[2] + "20",
                fill: true,
                tension: 0.1,
              },
              {
                label: "SwaRail",
                data: data.timeSeriesData.map((row) => row.swaRailAppBooking),
                borderColor: COLORS[3],
                backgroundColor: COLORS[3] + "20",
                fill: true,
                tension: 0.1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Channel Performance Over Time",
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
                  text: "Bookings",
                },
                beginAtZero: true,
                stacked: true,
              },
            },
            elements: {
              point: {
                radius: 1,
                hoverRadius: 4,
              },
            },
          },
        }

        areaChartInstance.current = new Chart(ctx, config)
      }
    }

    // Pie Chart
    if (pieChartRef.current) {
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy()
      }

      const ctx = pieChartRef.current.getContext("2d")
      if (ctx) {
        const config: ChartConfiguration = {
          type: "pie",
          data: {
            labels: data.summary.channelBreakdown.map((channel) => channel.name),
            datasets: [
              {
                data: data.summary.channelBreakdown.map((channel) => channel.value),
                backgroundColor: COLORS,
                borderColor: COLORS.map((color) => color),
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
                text: "Channel Distribution",
              },
              legend: {
                position: "bottom",
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || ""
                    const value = context.parsed
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                    const percentage = ((value / total) * 100).toFixed(1)
                    return `${label}: ${value.toLocaleString()} (${percentage}%)`
                  },
                },
              },
            },
          },
        }

        pieChartInstance.current = new Chart(ctx, config)
      }
    }

    return () => {
      if (areaChartInstance.current) {
        areaChartInstance.current.destroy()
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy()
      }
    }
  }, [data])

  return (
    <div className="space-y-6">
      {/* Channel Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.summary.channelBreakdown.map((channel, index) => {
          const Icon = channelIcons[channel.name as keyof typeof channelIcons]
          return (
            <Card key={channel.name}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{channel.name}</p>
                    <p className="text-2xl font-bold">{channel.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{channel.percentage.toFixed(1)}% of total</p>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Performance Over Time</CardTitle>
            <CardDescription>Booking trends by channel throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <canvas ref={areaChartRef}></canvas>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Distribution</CardTitle>
            <CardDescription>Total bookings by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <canvas ref={pieChartRef}></canvas>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SwaRail Growth Highlight */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            SwaRail App Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-700">
                {data.summary.channelBreakdown.find((c) => c.name === "SwaRail")?.value.toLocaleString() || "0"}
              </div>
              <p className="text-sm text-green-600">Total SwaRail Bookings</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">
                {data.summary.channelBreakdown.find((c) => c.name === "SwaRail")?.percentage.toFixed(1) || "0"}%
              </div>
              <p className="text-sm text-green-600">Market Share</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">
                {swaRailGrowth > 0 ? "+" : ""}
                {swaRailGrowth.toFixed(1)}%
              </div>
              <p className="text-sm text-green-600">Growth Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
