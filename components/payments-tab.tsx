"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BanknoteIcon as BankIcon, Receipt, FileText } from "lucide-react"
import type { PayrollCalculation } from "../types/payroll"

interface PaymentsTabProps {
  payrollCalculations: PayrollCalculation[]
  formatCurrency: (amount: number) => string
  getTotalNetPay: () => number
}

export function PaymentsTab({ 
  payrollCalculations, 
  formatCurrency, 
  getTotalNetPay 
}: PaymentsTabProps) {
  const paymentCards = [
    {
      icon: BankIcon,
      title: "Bank Transfer",
      value: formatCurrency(getTotalNetPay()),
      description: "Ready for transfer",
      buttonText: "Generate Bank File",
      color: "green",
    },
    {
      icon: Receipt,
      title: "Payslips",
      value: payrollCalculations.length.toString(),
      description: "Payslips generated",
      buttonText: "Download All",
      color: "blue",
    },
    {
      icon: FileText,
      title: "GL Posting",
      value: payrollCalculations.length > 0 ? "Ready" : "Pending",
      description: "Accounting entries",
      buttonText: "Export to ERP",
      color: "purple",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {paymentCards.map((card, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <card.icon className="h-5 w-5" />
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-${card.color}-600`}>
              {card.value}
            </div>
            <p className="text-sm text-gray-600 mt-1">{card.description}</p>
            <Button 
              className="w-full mt-4" 
              variant={card.title === "Bank Transfer" ? "default" : "outline"}
              disabled={payrollCalculations.length === 0}
            >
              {card.buttonText}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
