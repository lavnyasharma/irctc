"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { BookingData } from "@/lib/data-processor"
import { useState } from "react"
import { Search, Download } from "lucide-react"

interface DataTableProps {
  data: BookingData[]
}

export function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const filteredData = data.filter((row) => row.minute.toLowerCase().includes(searchTerm.toLowerCase()))

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const exportToCSV = () => {
    const headers = [
      "Minute",
      "Attempts",
      "Settled",
      "Total Booking",
      "Website Booking",
      "App Booking",
      "Agents Booking",
      "SwaRail App Booking",
      "I-Tkts",
      "E-Tkts",
      "Tatkal",
      "PG Success Rate %",
      "Booking Vs Attempt %",
      "Delhi",
      "Chennai",
      "Kolkata",
      "Mumbai",
    ]

    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) =>
        [
          row.minute,
          row.attempts,
          row.settled,
          row.totalBooking,
          row.websiteBooking,
          row.appBooking,
          row.agentsBooking,
          row.swaRailAppBooking,
          row.iTkts,
          row.eTkts,
          row.tatkal,
          row.pgSuccessRate,
          row.bookingVsAttempt,
          row.delhi,
          row.chennai,
          row.kolkata,
          row.mumbai,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `booking-data-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raw Data View</CardTitle>
        <CardDescription>Detailed minute-by-minute booking transaction data</CardDescription>
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by minute..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Minute</TableHead>
                <TableHead className="text-right">Attempts</TableHead>
                <TableHead className="text-right">Settled</TableHead>
                <TableHead className="text-right">Bookings</TableHead>
                <TableHead className="text-right">Website</TableHead>
                <TableHead className="text-right">App</TableHead>
                <TableHead className="text-right">Agents</TableHead>
                <TableHead className="text-right">SwaRail</TableHead>
                <TableHead className="text-right">PG Success %</TableHead>
                <TableHead className="text-right">Conversion %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.minute}</TableCell>
                  <TableCell className="text-right">{row.attempts.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.settled.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.totalBooking.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.websiteBooking.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.appBooking.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.agentsBooking.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.swaRailAppBooking.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={row.pgSuccessRate < 50 ? "text-red-600 font-medium" : ""}>
                      {row.pgSuccessRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{row.bookingVsAttempt.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
