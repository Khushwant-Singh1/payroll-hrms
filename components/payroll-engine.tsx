"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { PayrollDashboard } from "./payroll-dashboard"
import { PayrollConfiguration } from "./payroll-configuration"
import { SalaryCalculationScreen } from "./salary-calculation-screen"
import { 
  BarChart3, 
  Settings, 
  Calculator, 
  FileText, 
  Users, 
  Shield,
  TrendingUp,
  Clock,
  Download,
  CheckCircle,
  Eye,
  Mail
} from "lucide-react"

export function PayrollEngine() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)
  const { toast } = useToast()

  // Compliance handlers
  const handleGenerateReturn = async (type: 'pf' | 'esi' | 'tds') => {
    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast({
        title: "Return Generated",
        description: `${type.toUpperCase()} return has been generated successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate return. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadReturn = async (type: 'pf' | 'esi' | 'tds') => {
    toast({
      title: "Download Started",
      description: `Downloading ${type.toUpperCase()} return file...`,
    })
    // Simulate download
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: `${type.toUpperCase()} return file downloaded successfully.`,
      })
    }, 1500)
  }

  // Report handlers
  const handleGenerateReport = async (reportName: string) => {
    setGeneratingReport(reportName)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      toast({
        title: "Report Generated",
        description: `${reportName} has been generated successfully.`,
      })
      
      // Simulate file download
      const link = document.createElement('a')
      link.href = '#'
      link.download = `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGeneratingReport(null)
    }
  }

  const handleEmailReport = async (reportName: string) => {
    toast({
      title: "Email Sent",
      description: `${reportName} has been emailed to configured recipients.`,
    })
  }

  // Workflow handlers
  const handleViewWorkflowDetails = (workflowTitle: string) => {
    toast({
      title: "Opening Workflow",
      description: `Loading details for: ${workflowTitle}`,
    })
    // In a real app, this would navigate to a detailed view
  }

  const handleTakeWorkflowAction = (workflowTitle: string) => {
    toast({
      title: "Action Required",
      description: `Taking action on: ${workflowTitle}`,
    })
    // In a real app, this would open an action modal or navigate to action page
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault()
            setActiveTab('dashboard')
            break
          case '2':
            event.preventDefault()
            setActiveTab('configuration')
            break
          case '3':
            event.preventDefault()
            setActiveTab('calculation')
            break
          case '4':
            event.preventDefault()
            setActiveTab('compliance')
            break
          case '5':
            event.preventDefault()
            setActiveTab('reports')
            break
          case '6':
            event.preventDefault()
            setActiveTab('workflows')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Payroll Engine</h1>
            <p className="text-gray-600">Comprehensive payroll management and processing system</p>
          </div>
          {(isProcessing || generatingReport) && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg">
              <Clock className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">
                {generatingReport ? `Generating ${generatingReport}...` : 'Processing...'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* System Status Notification */}
      {isProcessing && (
        <Alert className="mb-6">
          <Clock className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Processing payroll operations... Please wait.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Tips */}
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          💡 <strong>Pro Tip:</strong> Use keyboard shortcuts (Ctrl+1-6) to quickly navigate between tabs. 
          Click on report cards to generate them instantly.
        </AlertDescription>
      </Alert>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit lg:grid-cols-6">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2"
              title="Ctrl+1 - Dashboard overview and statistics"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="configuration" 
              className="flex items-center gap-2"
              title="Ctrl+2 - Configure payroll settings"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configure</span>
            </TabsTrigger>
            <TabsTrigger 
              value="calculation" 
              className="flex items-center gap-2"
              title="Ctrl+3 - Salary calculations"
            >
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Calculate</span>
            </TabsTrigger>
            <TabsTrigger 
              value="compliance" 
              className="flex items-center gap-2"
              title="Ctrl+4 - Statutory compliance"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Compliance</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center gap-2"
              title="Ctrl+5 - Generate reports"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger 
              value="workflows" 
              className="flex items-center gap-2"
              title="Ctrl+6 - Workflow management"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Workflows</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <PayrollDashboard />
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6">
            <PayrollConfiguration />
          </TabsContent>

          {/* Calculation Tab */}
          <TabsContent value="calculation" className="space-y-6">
            <SalaryCalculationScreen />
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Statutory Compliance
                </CardTitle>
                <CardDescription>
                  Manage statutory returns and compliance requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="border-orange-200 relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">PF Returns</CardTitle>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          Due Soon
                        </Badge>
                      </div>
                      <CardDescription>Provident Fund monthly returns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Due Date:</span>
                          <span className="font-medium">15th Sept 2025</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Employees:</span>
                          <span className="font-medium">135</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Amount:</span>
                          <span className="font-medium">₹12,45,000</span>
                        </div>
                        <div className="pt-3">
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1" 
                              size="sm"
                              onClick={() => handleGenerateReturn('pf')}
                              disabled={isProcessing}
                              variant="outline"
                            >
                              {isProcessing ? (
                                <>
                                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                'Generate'
                              )}
                            </Button>
                            <Button 
                              className="flex-1" 
                              size="sm"
                              onClick={() => handleDownloadReturn('pf')}
                              variant="outline"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">ESI Returns</CardTitle>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          On Track
                        </Badge>
                      </div>
                      <CardDescription>Employee State Insurance returns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Due Date:</span>
                          <span className="font-medium">21st Sept 2025</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Employees:</span>
                          <span className="font-medium">78</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Amount:</span>
                          <span className="font-medium">₹2,34,500</span>
                        </div>
                        <div className="pt-3">
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1" 
                              size="sm"
                              onClick={() => handleGenerateReturn('esi')}
                              disabled={isProcessing}
                              variant="outline"
                            >
                              {isProcessing ? (
                                <>
                                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                'Generate'
                              )}
                            </Button>
                            <Button 
                              className="flex-1" 
                              size="sm"
                              onClick={() => handleDownloadReturn('esi')}
                              variant="outline"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">TDS Returns</CardTitle>
                        <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                          Overdue
                        </Badge>
                      </div>
                      <CardDescription>Tax Deducted at Source returns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Due Date:</span>
                          <span className="font-medium">31st Aug 2025</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Employees:</span>
                          <span className="font-medium">150</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Amount:</span>
                          <span className="font-medium">₹8,75,000</span>
                        </div>
                        <div className="pt-3">
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1" 
                              size="sm"
                              onClick={() => handleGenerateReturn('tds')}
                              disabled={isProcessing}
                              variant="outline"
                            >
                              {isProcessing ? (
                                <>
                                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                'Generate'
                              )}
                            </Button>
                            <Button 
                              className="flex-1" 
                              size="sm"
                              onClick={() => handleDownloadReturn('tds')}
                              variant="outline"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Payroll Reports
                </CardTitle>
                <CardDescription>
                  Generate and download various payroll reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: "Salary Register", description: "Complete salary breakdown for all employees", icon: "📊" },
                    { title: "Bank Transfer Report", description: "Bank-wise employee salary transfer details", icon: "🏦" },
                    { title: "PF Statement", description: "Provident Fund contribution details", icon: "💰" },
                    { title: "ESI Statement", description: "Employee State Insurance details", icon: "🏥" },
                    { title: "Tax Summary", description: "Tax deduction summary by employee", icon: "📋" },
                    { title: "Attendance Report", description: "Monthly attendance summary", icon: "📅" },
                    { title: "Overtime Report", description: "Overtime hours and payments", icon: "⏰" },
                    { title: "Department Wise", description: "Department wise payroll summary", icon: "🏢" },
                    { title: "Year-to-Date", description: "YTD earnings and deductions", icon: "📈" }
                  ].map((report, index) => (
                    <Card 
                      key={index} 
                      className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-blue-200 hover:scale-105"
                      onClick={() => handleGenerateReport(report.title)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-2xl">{report.icon}</span>
                          <span className="hover:text-blue-600 transition-colors">{report.title}</span>
                        </CardTitle>
                        <CardDescription>{report.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1" 
                            size="sm"
                            onClick={() => handleGenerateReport(report.title)}
                            disabled={generatingReport === report.title}
                            variant="outline"
                          >
                            {generatingReport === report.title ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Generate
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleEmailReport(report.title)}
                            variant="outline"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Workflow Management
                </CardTitle>
                <CardDescription>
                  Track and manage payroll approval workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Payroll Approval - August 2025",
                      status: "Pending Manager Approval",
                      assignee: "Priya Sharma (HR Manager)",
                      priority: "High",
                      dueDate: "25th Aug 2025",
                      progress: 75
                    },
                    {
                      title: "Bonus Processing - Q2 2025",
                      status: "In Review",
                      assignee: "Rajesh Kumar (Finance Head)",
                      priority: "Medium",
                      dueDate: "30th Aug 2025",
                      progress: 45
                    },
                    {
                      title: "Salary Revision - Engineering Team",
                      status: "Draft",
                      assignee: "Amit Patel (Engineering Manager)",
                      priority: "Low",
                      dueDate: "15th Sept 2025",
                      progress: 20
                    }
                  ].map((workflow, index) => (
                    <Card 
                      key={index} 
                      className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{workflow.title}</h3>
                            <p className="text-sm text-gray-600">Assigned to: {workflow.assignee}</p>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              workflow.priority === 'High' ? 'bg-red-100 text-red-800' :
                              workflow.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {workflow.priority} Priority
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Due: {workflow.dueDate}</p>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{workflow.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${workflow.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Status: {workflow.status}</span>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewWorkflowDetails(workflow.title)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleTakeWorkflowAction(workflow.title)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Take Action
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  )
}
