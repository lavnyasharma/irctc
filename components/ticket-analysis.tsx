"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProcessedData } from "@/lib/data-processor"
import { Ticket, Zap } from "lucide-react"
import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration, registerables } from "chart.js"

Chart.register(...registerables)

interface TicketAnalysisProps {
  data: ProcessedData
}

const COLORS = ["#3b82f6", "#10b981", "#ef4444"]

export function TicketAnalysis({ data }: TicketAnalysisProps) {
  const lineChartRef = useRef<HTMLCanvasElement>(null)
  const pieChartRef = useRef<HTMLCanvasElement>(null)
  const lineChartInstance = useRef<Chart | null>(null)
  const pieChartInstance = useRef<Chart | null>(null)

  // Find peak Tatkal booking minute
  const peakTatkalMinute = data.timeSeriesData.reduce((max, row) => (row.tatkal > max.tatkal ? row : max))

  // Calculate ticket type insights
  const tatkalShare = data.summary.ticketBreakdown.find((t) => t.name === "Tatkal")?.percentage || 0

  useEffect(() => {
    // Line Chart
    if (lineChartRef.current) {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy()
      }

      const ctx = lineChartRef.current.getContext("2d")
      if (ctx) {
        const config: ChartConfiguration = {
          type: "line",
          data: {
            labels: data.timeSeriesData.map((row) => row.minute),
            datasets: [
              {
                label: "I-Tickets",
                data: data.timeSeriesData.map((row) => row.iTkts),
                borderColor: COLORS[0],
                backgroundColor: COLORS[0] + "20",
                tension: 0.1,
                fill: false,
              },
              {
                label: "E-Tickets",
                data: data.timeSeriesData.map((row) => row.eTkts),
                borderColor: COLORS[1],
                backgroundColor: COLORS[1] + "20",
                tension: 0.1,
                fill: false,
              },
              {
                label: "Tatkal",
                data: data.timeSeriesData.map((row) => row.tatkal),
                borderColor: COLORS[2],
                backgroundColor: COLORS[2] + "20",
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
                text: "Ticket Type Trends Over Time",
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
                  text: "Number of Tickets",
                },
                beginAtZero: true,
              },
            },
            elements: {
              point: {
                radius: 2,
                hoverRadius: 5,
              },
            },
          },
        }

        lineChartInstance.current = new Chart(ctx, config)
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
          type: "doughnut",
          data: {
            labels: data.summary.ticketBreakdown.map((ticket) => ticket.name),
            datasets: [
              {
                data: data.summary.ticketBreakdown.map((ticket) => ticket.value),
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
                text: "Ticket Type Distribution",
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
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy()
      }
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy()
      }
    }
  }, [data])

  return (
    <div className="space-y-6">
      {/* Ticket Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.summary.ticketBreakdown.map((ticket, index) => {
          const icons = { "I-Tickets": Ticket, "E-Tickets": Ticket, Tatkal: Zap }
          const Icon = icons[ticket.name as keyof typeof icons] || Ticket

          return (
            <Card key={ticket.name}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{ticket.name}</p>
                    <p className="text-2xl font-bold">{ticket.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{ticket.percentage.toFixed(1)}% of total</p>
                  </div>
                  <Icon className={`h-8 w-8 ${ticket.name === "Tatkal" ? "text-red-500" : "text-muted-foreground"}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Type Trends</CardTitle>
            <CardDescription>Booking patterns by ticket type over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <canvas ref={lineChartRef}></canvas>
            </div>
          </CardContent>
        </Card>

        {/* Doughnut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Type Distribution</CardTitle>
            <CardDescription>Overall breakdown of ticket types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <canvas ref={pieChartRef}></canvas>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tatkal Insights */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Tatkal Booking Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-red-700">{peakTatkalMinute.minute}</div>
              <p className="text-sm text-red-600">Peak Tatkal Time</p>
              <p className="text-xs text-red-500">{peakTatkalMinute.tatkal.toLocaleString()} bookings</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-700">{tatkalShare.toFixed(1)}%</div>
              <p className="text-sm text-red-600">Tatkal Share</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-700">
                {data.timeSeriesData.filter((row) => row.tatkal > 0).length}
              </div>
              <p className="text-sm text-red-600">Active Tatkal Minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
