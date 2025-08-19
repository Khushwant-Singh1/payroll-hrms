"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import type { Employee } from "../types/payroll"

interface EmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (employee: Omit<Employee, "id">) => void
  onDelete?: (employeeId: string) => void
  employee?: Employee | null
}

export function EmployeeModal({ isOpen, onClose, onSave, onDelete, employee }: EmployeeModalProps) {
  const [formData, setFormData] = useState<Omit<Employee, "id">>({
    employeeId: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    company: "",
    location: "",
    grade: "",
    status: "active",
    joiningDate: "",
    basicSalary: 0,
    hra: 0,
    allowances: 0,
    salary: 0,
    pan: "",
    aadhaar: "",
    uan: "",
    esicNumber: "",
    pfOptIn: true,
    esiApplicable: true,
    lwfState: "",
    bankAccount: "",
    ifsc: "",
    branch: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (employee) {
      const { id, ...employeeData } = employee
      setFormData(employeeData)
    } else {
      setFormData({
        employeeId: "",
        name: "",
        email: "",
        phone: "",
        department: "",
        designation: "",
        company: "",
        location: "",
        grade: "",
        status: "active",
        joiningDate: "",
        basicSalary: 0,
        hra: 0,
        allowances: 0,
        salary: 0,
        pan: "",
        aadhaar: "",
        uan: "",
        esicNumber: "",
        pfOptIn: true,
        esiApplicable: true,
        lwfState: "",
        bankAccount: "",
        ifsc: "",
        branch: "",
      })
    }
    setErrors({})
  }, [employee, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employeeId.trim()) newErrors.employeeId = "Employee ID is required"
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.department.trim()) newErrors.department = "Department is required"
    if (!formData.designation.trim()) newErrors.designation = "Designation is required"
    if (!formData.company.trim()) newErrors.company = "Company is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.joiningDate) newErrors.joiningDate = "Joining date is required"
    if (formData.basicSalary <= 0) newErrors.basicSalary = "Basic salary must be greater than 0"
    if (!formData.bankAccount.trim()) newErrors.bankAccount = "Bank account is required"
    if (!formData.ifsc.trim()) newErrors.ifsc = "IFSC code is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }

      // Auto-calculate total salary
      if (field === "basicSalary" || field === "hra" || field === "allowances") {
        updated.salary = updated.basicSalary + updated.hra + updated.allowances
      }

      // Auto-calculate HRA as 50% of basic if not manually set
      if (field === "basicSalary" && prev.hra === 0) {
        updated.hra = Math.round(updated.basicSalary * 0.5)
        updated.salary = updated.basicSalary + updated.hra + updated.allowances
      }

      return updated
    })

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
      onClose()
    }
  }

  const handleDelete = () => {
    if (employee && onDelete) {
      onDelete(employee.id)
      setShowDeleteDialog(false)
      onClose()
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{employee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
                <DialogDescription>
                  {employee ? "Update employee information" : "Enter employee details to add to the system"}
                </DialogDescription>
              </div>
              {employee && onDelete && (
                <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="compensation">Compensation</TabsTrigger>
                <TabsTrigger value="statutory">Statutory</TabsTrigger>
                <TabsTrigger value="banking">Banking</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Basic employee details</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID *</Label>
                      <Input
                        id="employeeId"
                        value={formData.employeeId}
                        onChange={(e) => handleInputChange("employeeId", e.target.value)}
                        className={errors.employeeId ? "border-red-500" : ""}
                      />
                      {errors.employeeId && <p className="text-sm text-red-500">{errors.employeeId}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joiningDate">Joining Date *</Label>
                      <Input
                        id="joiningDate"
                        type="date"
                        value={formData.joiningDate}
                        onChange={(e) => handleInputChange("joiningDate", e.target.value)}
                        className={errors.joiningDate ? "border-red-500" : ""}
                      />
                      {errors.joiningDate && <p className="text-sm text-red-500">{errors.joiningDate}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Organization Details</CardTitle>
                    <CardDescription>Department and role information</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        className={errors.company ? "border-red-500" : ""}
                      />
                      {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleInputChange("department", e.target.value)}
                        className={errors.department ? "border-red-500" : ""}
                      />
                      {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation *</Label>
                      <Input
                        id="designation"
                        value={formData.designation}
                        onChange={(e) => handleInputChange("designation", e.target.value)}
                        className={errors.designation ? "border-red-500" : ""}
                      />
                      {errors.designation && <p className="text-sm text-red-500">{errors.designation}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className={errors.location ? "border-red-500" : ""}
                      />
                      {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Input
                        id="grade"
                        value={formData.grade}
                        onChange={(e) => handleInputChange("grade", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compensation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Salary Structure</CardTitle>
                    <CardDescription>Monthly compensation details</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basicSalary">Basic Salary *</Label>
                      <Input
                        id="basicSalary"
                        type="number"
                        value={formData.basicSalary}
                        onChange={(e) => handleInputChange("basicSalary", Number(e.target.value))}
                        className={errors.basicSalary ? "border-red-500" : ""}
                      />
                      {errors.basicSalary && <p className="text-sm text-red-500">{errors.basicSalary}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hra">HRA</Label>
                      <Input
                        id="hra"
                        type="number"
                        value={formData.hra}
                        onChange={(e) => handleInputChange("hra", Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="allowances">Other Allowances</Label>
                      <Input
                        id="allowances"
                        type="number"
                        value={formData.allowances}
                        onChange={(e) => handleInputChange("allowances", Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Total Salary</Label>
                      <Input id="salary" type="number" value={formData.salary} disabled className="bg-gray-50" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="statutory" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Statutory Information</CardTitle>
                    <CardDescription>Government compliance details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pan">PAN Number</Label>
                        <Input
                          id="pan"
                          value={formData.pan}
                          onChange={(e) => handleInputChange("pan", e.target.value.toUpperCase())}
                          placeholder="ABCDE1234F"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="aadhaar">Aadhaar Number</Label>
                        <Input
                          id="aadhaar"
                          value={formData.aadhaar}
                          onChange={(e) => handleInputChange("aadhaar", e.target.value)}
                          placeholder="1234-5678-9012"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="uan">UAN (PF)</Label>
                        <Input
                          id="uan"
                          value={formData.uan}
                          onChange={(e) => handleInputChange("uan", e.target.value)}
                          placeholder="123456789012"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="esicNumber">ESIC Number</Label>
                        <Input
                          id="esicNumber"
                          value={formData.esicNumber}
                          onChange={(e) => handleInputChange("esicNumber", e.target.value)}
                          placeholder="1234567890"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lwfState">LWF State</Label>
                        <Select
                          value={formData.lwfState}
                          onValueChange={(value) => handleInputChange("lwfState", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="Karnataka">Karnataka</SelectItem>
                            <SelectItem value="Delhi">Delhi</SelectItem>
                            <SelectItem value="Gujarat">Gujarat</SelectItem>
                            <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                            <SelectItem value="West Bengal">West Bengal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pfOptIn"
                          checked={formData.pfOptIn}
                          onCheckedChange={(checked) => handleInputChange("pfOptIn", checked)}
                        />
                        <Label htmlFor="pfOptIn">PF Opt-in</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="esiApplicable"
                          checked={formData.esiApplicable}
                          onCheckedChange={(checked) => handleInputChange("esiApplicable", checked)}
                        />
                        <Label htmlFor="esiApplicable">ESI Applicable</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="banking" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Banking Details</CardTitle>
                    <CardDescription>Salary account information</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankAccount">Account Number *</Label>
                      <Input
                        id="bankAccount"
                        value={formData.bankAccount}
                        onChange={(e) => handleInputChange("bankAccount", e.target.value)}
                        className={errors.bankAccount ? "border-red-500" : ""}
                      />
                      {errors.bankAccount && <p className="text-sm text-red-500">{errors.bankAccount}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ifsc">IFSC Code *</Label>
                      <Input
                        id="ifsc"
                        value={formData.ifsc}
                        onChange={(e) => handleInputChange("ifsc", e.target.value.toUpperCase())}
                        className={errors.ifsc ? "border-red-500" : ""}
                      />
                      {errors.ifsc && <p className="text-sm text-red-500">{errors.ifsc}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="branch">Branch Name</Label>
                      <Input
                        id="branch"
                        value={formData.branch}
                        onChange={(e) => handleInputChange("branch", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{employee ? "Update Employee" : "Add Employee"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {employee?.name}? This action cannot be undone and will remove all
              associated payroll data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
