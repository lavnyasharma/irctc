export interface BookingData {
  minute: string
  attempts: number
  settled: number
  totalBooking: number
  websiteBooking: number
  appBooking: number
  agentsBooking: number
  swaRailAppBooking: number
  iTkts: number
  eTkts: number
  tatkal: number
  pgSuccessRate: number
  bookingVsAttempt: number
  delhi: number
  chennai: number
  kolkata: number
  mumbai: number
}

export interface ProcessedData {
  timeSeriesData: BookingData[]
  summary: {
    totalAttempts: number
    totalSettled: number
    totalBookings: number
    overallSuccessRate: number
    bookingConversion: number
    channelBreakdown: Array<{ name: string; value: number; percentage: number }>
    ticketBreakdown: Array<{ name: string; value: number; percentage: number }>
    cityBreakdown: Array<{ name: string; value: number }>
  }
  anomalies: Array<{
    minute: string
    type: string
    value: number
    threshold: number
    severity: "low" | "medium" | "high"
  }>
}

export function processBookingData(rawData: any[][]): ProcessedData {
  // Skip the header row and total row
  const headers = rawData[0]
  const dataRows = rawData.slice(2) // Skip header and total row

  const timeSeriesData: BookingData[] = dataRows.map((row) => ({
    minute: row[0] || "",
    attempts: Number(row[1]) || 0,
    settled: Number(row[2]) || 0,
    totalBooking: Number(row[3]) || 0,
    websiteBooking: Number(row[4]) || 0,
    appBooking: Number(row[5]) || 0,
    agentsBooking: Number(row[6]) || 0,
    swaRailAppBooking: Number(row[7]) || 0,
    iTkts: Number(row[8]) || 0,
    eTkts: Number(row[9]) || 0,
    tatkal: Number(row[10]) || 0,
    pgSuccessRate: Number(parseFloat(row[11])) || 0,
    bookingVsAttempt: Number(parseFloat(row[12])) || 0,
    delhi: Number(row[13]) || 0,
    chennai: Number(row[14]) || 0,
    kolkata: Number(row[15]) || 0,
    mumbai: Number(row[16]) || 0,
  }))

  // Calculate summary statistics
  const totalAttempts = timeSeriesData.reduce((sum, row) => sum + row.attempts, 0)
  const totalSettled = timeSeriesData.reduce((sum, row) => sum + row.settled, 0)
  const totalBookings = timeSeriesData.reduce((sum, row) => sum + row.totalBooking, 0)

  const overallSuccessRate = totalAttempts > 0 ? (totalSettled / totalAttempts) * 100 : 0
  const bookingConversion = totalSettled > 0 ? (totalBookings / totalSettled) * 100 : 0

  // Channel breakdown
  const totalWebsite = timeSeriesData.reduce((sum, row) => sum + row.websiteBooking, 0)
  const totalApp = timeSeriesData.reduce((sum, row) => sum + row.appBooking, 0)
  const totalAgents = timeSeriesData.reduce((sum, row) => sum + row.agentsBooking, 0)
  const totalSwaRail = timeSeriesData.reduce((sum, row) => sum + row.swaRailAppBooking, 0)

  const channelBreakdown = [
    { name: "Website", value: totalWebsite, percentage: (totalWebsite / totalBookings) * 100 },
    { name: "App", value: totalApp, percentage: (totalApp / totalBookings) * 100 },
    { name: "Agents", value: totalAgents, percentage: (totalAgents / totalBookings) * 100 },
    { name: "SwaRail", value: totalSwaRail, percentage: (totalSwaRail / totalBookings) * 100 },
  ].sort((a, b) => b.value - a.value)

  // Ticket breakdown
  const totalITkts = timeSeriesData.reduce((sum, row) => sum + row.iTkts, 0)
  const totalETkts = timeSeriesData.reduce((sum, row) => sum + row.eTkts, 0)
  const totalTatkal = timeSeriesData.reduce((sum, row) => sum + row.tatkal, 0)

  const ticketBreakdown = [
    { name: "I-Tickets", value: totalITkts, percentage: (totalITkts / totalBookings) * 100 },
    { name: "E-Tickets", value: totalETkts, percentage: (totalETkts / totalBookings) * 100 },
    { name: "Tatkal", value: totalTatkal, percentage: (totalTatkal / totalBookings) * 100 },
  ].sort((a, b) => b.value - a.value)

  // City breakdown
  const cityBreakdown = [
    { name: "Delhi", value: timeSeriesData.reduce((sum, row) => sum + row.delhi, 0) },
    { name: "Chennai", value: timeSeriesData.reduce((sum, row) => sum + row.chennai, 0) },
    { name: "Kolkata", value: timeSeriesData.reduce((sum, row) => sum + row.kolkata, 0) },
    { name: "Mumbai", value: timeSeriesData.reduce((sum, row) => sum + row.mumbai, 0) },
  ].sort((a, b) => b.value - a.value)

  // Anomaly detection
  const anomalies = detectAnomalies(timeSeriesData)

  return {
    timeSeriesData,
    summary: {
      totalAttempts,
      totalSettled,
      totalBookings,
      overallSuccessRate,
      bookingConversion,
      channelBreakdown,
      ticketBreakdown,
      cityBreakdown,
    },
    anomalies,
  }
}

function detectAnomalies(data: BookingData[]) {
  const anomalies: ProcessedData["anomalies"] = []

  // Calculate z-scores for key metrics
  const metrics = ["attempts", "pgSuccessRate", "bookingVsAttempt"] as const

  metrics.forEach((metric) => {
    const values = data.map((row) => row[metric])
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length)

    data.forEach((row) => {
      const zScore = Math.abs((row[metric] - mean) / stdDev)
      if (zScore > 2) {
        anomalies.push({
          minute: row.minute,
          type: metric,
          value: row[metric],
          threshold: mean + 2 * stdDev,
          severity: zScore > 3 ? "high" : zScore > 2.5 ? "medium" : "low",
        })
      }
    })
  })

  return anomalies.sort((a, b) => b.value - a.value)
}
