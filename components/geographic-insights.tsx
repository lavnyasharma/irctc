"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProcessedData } from "@/lib/data-processor"
import { MapPin, TrendingUp } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Chart, type ChartConfiguration, registerables } from "chart.js"

Chart.register(...registerables)

interface GeographicInsightsProps {
  data: ProcessedData
}

export function GeographicInsights({ data }: GeographicInsightsProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const barChartRef = useRef<HTMLCanvasElement>(null)
  const lineChartRef = useRef<HTMLCanvasElement>(null)
  const barChartInstance = useRef<Chart | null>(null)
  const lineChartInstance = useRef<Chart | null>(null)

  const cityColors = {
    Delhi: "#ef4444",
    Chennai: "#3b82f6",
    Kolkata: "#10b981",
    Mumbai: "#f59e0b",
  }

  useEffect(() => {
    // Bar Chart
    if (barChartRef.current) {
      if (barChartInstance.current) {
        barChartInstance.current.destroy()
      }

      const ctx = barChartRef.current.getContext("2d")
      if (ctx) {
        const config: ChartConfiguration = {
          type: "bar",
          data: {
            labels: data.summary.cityBreakdown.map((city) => city.name),
            datasets: [
              {
                label: "Total Bookings",
                data: data.summary.cityBreakdown.map((city) => city.value),
                backgroundColor: Object.values(cityColors),
                borderColor: Object.values(cityColors),
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            plugins: {
              title: {
                display: true,
                text: "Total Bookings by City",
              },
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Number of Bookings",
                },
                ticks: {
                  callback: (value) => (typeof value === "number" ? value.toLocaleString() : value),
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Cities",
                },
              },
            },
          },
        }

        barChartInstance.current = new Chart(ctx, config)
      }
    }

    // Line Chart
    if (lineChartRef.current) {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy()
      }

      const ctx = lineChartRef.current.getContext("2d")
      if (ctx) {
        const datasets = selectedCity
          ? [
              {
                label: selectedCity,
                data: data.timeSeriesData.map((row) => row[selectedCity.toLowerCase() as keyof typeof row] as number),
                borderColor: cityColors[selectedCity as keyof typeof cityColors],
                backgroundColor: cityColors[selectedCity as keyof typeof cityColors] + "20",
                tension: 0.1,
                fill: false,
                borderWidth: 3,
              },
            ]
          : Object.keys(cityColors).map((city) => ({
              label: city,
              data: data.timeSeriesData.map((row) => row[city.toLowerCase() as keyof typeof row] as number),
              borderColor: cityColors[city as keyof typeof cityColors],
              backgroundColor: cityColors[city as keyof typeof cityColors] + "20",
              tension: 0.1,
              fill: false,
              borderWidth: 2,
            }))

        const config: ChartConfiguration = {
          type: "line",
          data: {
            labels: data.timeSeriesData.map((row) => row.minute),
            datasets,
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: selectedCity ? `${selectedCity} Booking Trends` : "City Booking Trends Over Time",
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
                  text: "Number of Bookings",
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

    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy()
      }
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy()
      }
    }
  }, [data, selectedCity])

  return (
    <div className="space-y-6">
      {/* City Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.summary.cityBreakdown.map((city, index) => (
          <Card key={city.name} className={selectedCity === city.name ? "ring-2 ring-blue-500" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{city.name}</p>
                  <p className="text-2xl font-bold">{city.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {((city.value / data.summary.totalBookings) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* City Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant={selectedCity === null ? "default" : "outline"} onClick={() => setSelectedCity(null)} size="sm">
          All Cities
        </Button>
        {data.summary.cityBreakdown.map((city) => (
          <Button
            key={city.name}
            variant={selectedCity === city.name ? "default" : "outline"}
            onClick={() => setSelectedCity(city.name)}
            size="sm"
          >
            {city.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Total Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Total Bookings by City</CardTitle>
            <CardDescription>Comparison of booking volumes across major cities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <canvas ref={barChartRef}></canvas>
            </div>
          </CardContent>
        </Card>

        {/* Line Chart - Trends Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>{selectedCity ? `${selectedCity} Booking Trends` : "City Booking Trends Over Time"}</CardTitle>
            <CardDescription>
              {selectedCity
                ? `Detailed view of ${selectedCity} bookings`
                : "Booking patterns by city throughout the day"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <canvas ref={lineChartRef}></canvas>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing City Highlight */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performing City
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-700">{data.summary.cityBreakdown[0].name}</div>
              <p className="text-sm text-green-600">Highest Volume City</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">
                {data.summary.cityBreakdown[0].value.toLocaleString()}
              </div>
              <p className="text-sm text-green-600">Total Bookings</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">
                {((data.summary.cityBreakdown[0].value / data.summary.totalBookings) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-green-600">Market Share</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
