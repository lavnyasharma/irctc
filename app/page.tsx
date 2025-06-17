"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileSpreadsheet,
  TrendingUp,
  AlertTriangle,
  Download,
  BarChart3,
  Users,
  Target,
  Activity,
  MapPin,
  Zap,
  Brain,
  Database,
  CheckCircle2,
} from "lucide-react"
import * as XLSX from "xlsx"


import { BookingFunnel } from "@/components/booking-funnel"
import { SuccessMetrics } from "@/components/success-metrics"
import { ChannelPerformance } from "@/components/channel-performance"
import { TicketAnalysis } from "@/components/ticket-analysis"
import { GeographicInsights } from "@/components/geographic-insights"
import { AnomalyDetection } from "@/components/anomaly-detection"
import { InsightGenerator } from "@/components/insight-generator"
import { DataTable } from "@/components/data-table"
import { processBookingData, type ProcessedData } from "@/lib/data-processor"
import { Navbar } from "@/components/ui/navbar"

export default function BookingDashboard() {
  const [data, setData] = useState<ProcessedData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)
    setFileName(file.name)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

      // Process the raw data
      const processedData = processBookingData(jsonData)
      setData(processedData)
    } catch (err) {
      setError("Failed to process the Excel file. Please check the format.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const downloadInsights = () => {
    if (!data) return

    // Create a simple text report
    const insights = [
      `Booking Analytics Report - ${fileName}`,
      `Generated on: ${new Date().toLocaleString()}`,
      ``,
      `Summary Statistics:`,
      `- Total Attempts: ${data.summary.totalAttempts.toLocaleString()}`,
      `- Total Settled: ${data.summary.totalSettled.toLocaleString()}`,
      `- Total Bookings: ${data.summary.totalBookings.toLocaleString()}`,
      `- Overall Success Rate: ${data.summary.overallSuccessRate.toFixed(2)}%`,
      `- Booking Conversion: ${data.summary.bookingConversion.toFixed(2)}%`,
      ``,
      `Top Performing Channels:`,
      ...data.summary.channelBreakdown.map(
        (channel) => `- ${channel.name}: ${channel.value.toLocaleString()} (${channel.percentage.toFixed(1)}%)`,
      ),
      ``,
      `Geographic Distribution:`,
      ...data.summary.cityBreakdown.map((city) => `- ${city.name}: ${city.value.toLocaleString()} bookings`),
    ].join("\n")

    const blob = new Blob([insights], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `booking-insights-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navbar */}
      <Navbar/>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden bg-white border-b border-slate-200">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
          <div className="relative px-6 py-12 sm:px-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                <BarChart3 className="h-4 w-4" />
                Railway Analytics Platform
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
                Booking Analytics Dashboard
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Transform your booking data into actionable insights with comprehensive analytics and visualizations
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-8 space-y-8">
          {!data && (
            <>
              {/* File Upload */}
              <Card className="border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all duration-200 hover:shadow-lg bg-white/50 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-semibold text-slate-900">Upload Your Data</CardTitle>
                  <CardDescription className="text-base text-slate-600">
                    Upload your Excel file containing minute-level booking transaction data to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50/50 hover:bg-slate-100/50 transition-colors group"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileSpreadsheet className="w-12 h-12 mb-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <p className="mb-2 text-base text-slate-600 font-medium">
                          <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-slate-500">Excel files (.xlsx) up to 50MB</p>
                      </div>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </Label>
                  </div>

                  {fileName && (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900">{fileName}</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                        Ready to Process
                      </Badge>
                    </div>
                  )}

                  {loading && (
                    <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-base font-medium text-blue-900">Processing your data...</span>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-5 w-5" />
                      <AlertDescription className="text-base">{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Features Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Performance Metrics</h3>
                    </div>
                    <p className="text-sm text-slate-600">
                      Track success rates, conversion metrics, and booking trends
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Channel Analysis</h3>
                    </div>
                    <p className="text-sm text-slate-600">Analyze performance across different booking channels</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Geographic Insights</h3>
                    </div>
                    <p className="text-sm text-slate-600">Understand booking patterns by location and region</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Anomaly Detection</h3>
                    </div>
                    <p className="text-sm text-slate-600">Identify unusual patterns and potential issues</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Dashboard Content */}
          {data && (
            <div className="space-y-8">
              {/* Header with Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h2>
                  <p className="text-slate-600 mt-1">
                    Data from: <span className="font-medium">{fileName}</span>
                  </p>
                </div>
                <Button onClick={downloadInsights} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-blue-900">Total Attempts</CardTitle>
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-900">
                      {data.summary.totalAttempts.toLocaleString()}
                    </div>
                    <p className="text-xs text-blue-700 mt-1">Booking attempts recorded</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-green-900">Total Bookings</CardTitle>
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-900">
                      {data.summary.totalBookings.toLocaleString()}
                    </div>
                    <p className="text-xs text-green-700 mt-1">Successful bookings</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-purple-900">Success Rate</CardTitle>
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-900">
                      {data.summary.overallSuccessRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-purple-700 mt-1">Overall success rate</p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-orange-900">Conversion Rate</CardTitle>
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-900">
                      {data.summary.bookingConversion.toFixed(1)}%
                    </div>
                    <p className="text-xs text-orange-700 mt-1">Booking conversion</p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Dashboard Tabs */}
              <Card className="border-slate-200 shadow-sm">
                <Tabs defaultValue="overview" className="w-full">
                  <CardHeader className="pb-4">
                    <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1 bg-slate-100">
                      <TabsTrigger
                        value="overview"
                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Overview</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="funnel"
                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        <Target className="h-4 w-4" />
                        <span className="hidden sm:inline">Funnel</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="channels"
                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Channels</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="tickets"
                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span className="hidden sm:inline">Tickets</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="geography"
                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        <MapPin className="h-4 w-4" />
                        <span className="hidden sm:inline">Geography</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="anomalies"
                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        <Zap className="h-4 w-4" />
                        <span className="hidden sm:inline">Anomalies</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="insights"
                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        <Brain className="h-4 w-4" />
                        <span className="hidden sm:inline">Insights</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="data"
                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        <Database className="h-4 w-4" />
                        <span className="hidden sm:inline">Data</span>
                      </TabsTrigger>
                    </TabsList>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <TabsContent value="overview" className="space-y-6 mt-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SuccessMetrics data={data.timeSeriesData} />
                        <BookingFunnel data={data.summary} />
                      </div>
                    </TabsContent>

                    <TabsContent value="funnel" className="mt-0">
                      <BookingFunnel data={data.summary} />
                    </TabsContent>

                    <TabsContent value="channels" className="mt-0">
                      <ChannelPerformance data={data} />
                    </TabsContent>

                    <TabsContent value="tickets" className="mt-0">
                      <TicketAnalysis data={data} />
                    </TabsContent>

                    <TabsContent value="geography" className="mt-0">
                      <GeographicInsights data={data} />
                    </TabsContent>

                    <TabsContent value="anomalies" className="mt-0">
                      <AnomalyDetection data={data.timeSeriesData} />
                    </TabsContent>

                    <TabsContent value="insights" className="mt-0">
                      <InsightGenerator data={data} />
                    </TabsContent>

                    <TabsContent value="data" className="mt-0">
                      <DataTable data={data.timeSeriesData} />
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
