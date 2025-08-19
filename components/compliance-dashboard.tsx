"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Clock, FileText, Download, Calendar } from "lucide-react"
import type { StatutoryReturn } from "../types/payroll"

interface ComplianceDashboardProps {
  returns?: StatutoryReturn[]
  onGenerateReturn?: (returnId: string) => void
}

export function ComplianceDashboard({ returns = [], onGenerateReturn }: ComplianceDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getComplianceScore = () => {
    if (returns.length === 0) return 0
    const completedReturns = returns.filter((r) => r.status === "generated").length
    return Math.round((completedReturns / returns.length) * 100)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "generated":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "generated":
        return "default"
      case "overdue":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const complianceScore = getComplianceScore()
  const pendingReturns = returns.filter((r) => r.status === "pending").length
  const overdueReturns = returns.filter((r) => r.status === "overdue").length
  const completedReturns = returns.filter((r) => r.status === "generated").length

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{returns.length}</div>
                <div className="text-sm text-gray-600">Total Returns</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{completedReturns}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingReturns}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{overdueReturns}</div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Score</CardTitle>
          <CardDescription>Overall statutory compliance status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-sm text-gray-500">{complianceScore}%</span>
            </div>
            <Progress value={complianceScore} className="h-2" />
            <div className="text-sm text-gray-600">
              {completedReturns} of {returns.length} statutory returns completed
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statutory Returns */}
      <Card>
        <CardHeader>
          <CardTitle>Statutory Returns</CardTitle>
          <CardDescription>Monthly and quarterly compliance requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {returns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No statutory returns available</p>
                <p className="text-sm">Process payroll to generate returns</p>
              </div>
            ) : (
              returns.map((returnItem) => (
                <div key={returnItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(returnItem.status)}
                    <div>
                      <div className="font-medium">{returnItem.title}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Due: {returnItem.dueDate}
                      </div>
                      {returnItem.amount && (
                        <div className="text-sm font-medium text-green-600">{formatCurrency(returnItem.amount)}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(returnItem.status) as any}>{returnItem.status}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onGenerateReturn?.(returnItem.id)}
                      disabled={returnItem.status === "generated"}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {returnItem.status === "generated" ? "Downloaded" : "Generate"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>Important compliance dates to remember</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="font-medium">PF ECR Filing</div>
                  <div className="text-sm text-gray-600">15th of every month</div>
                </div>
              </div>
              <Badge variant="outline">Monthly</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium">ESI Return</div>
                  <div className="text-sm text-gray-600">21st of every month</div>
                </div>
              </div>
              <Badge variant="outline">Monthly</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="font-medium">TDS Return (24Q)</div>
                  <div className="text-sm text-gray-600">31st of quarter end month</div>
                </div>
              </div>
              <Badge variant="outline">Quarterly</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
