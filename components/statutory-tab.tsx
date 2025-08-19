"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download } from "lucide-react"
import type { StatutoryReturn } from "../types/payroll"

interface StatutoryTabProps {
  statutoryReturns: StatutoryReturn[]
  formatCurrency: (amount: number) => string
  generateStatutoryReturn: (id: string) => void
}

export function StatutoryTab({ 
  statutoryReturns, 
  formatCurrency, 
  generateStatutoryReturn 
}: StatutoryTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statutoryReturns.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-600">Due: {item.dueDate}</p>
                </div>
              </div>
              <Badge
                variant={
                  item.status === "generated"
                    ? "default"
                    : item.status === "overdue"
                      ? "destructive"
                      : "secondary"
                }
              >
                {item.status}
              </Badge>
            </div>
            {item.amount && (
              <div className="text-lg font-semibold text-gray-900 mb-4">
                {formatCurrency(item.amount)}
              </div>
            )}
            <Button
              className="w-full"
              variant="outline"
              size="sm"
              onClick={() => generateStatutoryReturn(item.id)}
              disabled={item.status === "generated"}
            >
              <Download className="h-4 w-4 mr-2" />
              {item.status === "generated" ? "Generated" : "Generate"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
