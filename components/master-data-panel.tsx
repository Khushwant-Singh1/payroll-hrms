"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Building, IndianRupee, FileText, BanknoteIcon as BankIcon, MapPin, Plus, Search, Edit } from 'lucide-react'
import { Employee } from '../types/erp-payroll'

interface MasterDataPanelProps {
  employees: Employee[]
  onAddEmployee: () => void
  onEditEmployee: (employee: Employee) => void
}

export function MasterDataPanel({ employees, onAddEmployee, onEditEmployee }: MasterDataPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const masterDataStats = [
    {
      icon: Users,
      title: "Employee Master",
      count: employees.length,
      description: "Active employees",
      color: "bg-blue-100 text-blue-800"
    },
    {
      icon: Building,
      title: "Companies",
      count: new Set(employees.map(e => e.company)).size,
      description: "Active companies",
      color: "bg-green-100 text-green-800"
    },
    {
      icon: IndianRupee,
      title: "Avg. Basic Salary",
      count: Math.round(employees.reduce((sum, e) => sum + e.basicSalary, 0) / employees.length),
      description: "Monthly average",
      color: "bg-purple-100 text-purple-800",
      format: "currency"
    },
    {
      icon: FileText,
      title: "PAN Compliance",
      count: Math.round((employees.filter(e => e.pan).length / employees.length) * 100),
      description: "% completed",
      color: "bg-orange-100 text-orange-800",
      format: "percentage"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {masterDataStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {stat.format === 'currency' ? formatCurrency(stat.count) :
                     stat.format === 'percentage' ? `${stat.count}%` : stat.count}
                  </div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Master Data Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Master Data Management</CardTitle>
              <CardDescription>Manage employee master data and organizational information</CardDescription>
            </div>
            <Button onClick={onAddEmployee}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="employees" className="space-y-4">
            <TabsList>
              <TabsTrigger value="employees">Employee Master</TabsTrigger>
              <TabsTrigger value="compensation">Compensation</TabsTrigger>
              <TabsTrigger value="statutory">Statutory Info</TabsTrigger>
              <TabsTrigger value="banking">Banking Details</TabsTrigger>
            </TabsList>

            <TabsContent value="employees" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.employeeId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{employee.company}</TableCell>
                        <TableCell>{employee.designation}</TableCell>
                        <TableCell>{employee.location}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{employee.grade}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => onEditEmployee(employee)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="compensation">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmployees.map((employee) => (
                  <Card key={employee.id}>
                    <CardContent className="p-4">
                      <div className="font-medium mb-2">{employee.name}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Basic:</span>
                          <span>{formatCurrency(employee.basicSalary)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>HRA:</span>
                          <span>{formatCurrency(employee.hra)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Allowances:</span>
                          <span>{formatCurrency(employee.allowances)}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total:</span>
                          <span>{formatCurrency(employee.basicSalary + employee.hra + employee.allowances)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="statutory">
              <div className="space-y-4">
                {filteredEmployees.map((employee) => (
                  <Card key={employee.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-medium">{employee.name}</div>
                        <Badge variant="outline">{employee.employeeId}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">PAN</div>
                          <div className="font-medium">{employee.pan || 'Not provided'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Aadhaar</div>
                          <div className="font-medium">{employee.aadhaar || 'Not provided'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">UAN</div>
                          <div className="font-medium">{employee.uan || 'Not provided'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">ESIC</div>
                          <div className="font-medium">{employee.esicNumber || 'Not applicable'}</div>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-4">
                        <Badge variant={employee.pfOptIn ? 'default' : 'secondary'}>
                          PF: {employee.pfOptIn ? 'Opted In' : 'Opted Out'}
                        </Badge>
                        <Badge variant={employee.esiApplicable ? 'default' : 'secondary'}>
                          ESI: {employee.esiApplicable ? 'Applicable' : 'Not Applicable'}
                        </Badge>
                        <Badge variant="outline">
                          LWF: {employee.lwfState}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="banking">
              <div className="space-y-4">
                {filteredEmployees.map((employee) => (
                  <Card key={employee.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4 mb-4">
                        <BankIcon className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.employeeId}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Account Number</div>
                          <div className="font-medium">{employee.bankAccount}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">IFSC Code</div>
                          <div className="font-medium">{employee.ifsc}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Branch</div>
                          <div className="font-medium">{employee.branch}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
