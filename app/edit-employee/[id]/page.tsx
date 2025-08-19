"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { EmployeeForm } from "@/components/EmployeeForm"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import type { Employee } from "@/types/payroll"

interface EmployeeDraft {
  id: string;
  employeeId?: string;
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  company?: string;
  location?: string;
  grade?: string;
  status: "active" | "inactive";
  joiningDate?: string;
  dateOfBirth?: string;
  basicSalary?: number;
  hra?: number;
  allowances?: number;
  pan?: string;
  aadhaar?: string;
  uan?: string;
  esicNumber?: string;
  pfOptIn: boolean;
  esiApplicable: boolean;
  lwfState?: string;
  bankAccount?: string;
  ifsc?: string;
  branch?: string;
  profilePic?: string;
  createdBy?: string;
  lastModified: string;
  createdAt: string;
}

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const employeeId = params.id as string
  const isDraft = searchParams.get('draft') === 'true'
  
  const [employee, setEmployee] = useState<Employee | EmployeeDraft | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch employee or draft data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (isDraft) {
          // Fetch draft data
          const response = await fetch(`/api/drafts/${employeeId}`)
          if (!response.ok) {
            throw new Error('Draft not found')
          }
          const draftData = await response.json()
          setEmployee(draftData)
        } else {
          // Fetch regular employee data
          const response = await fetch(`/api/employees`)
          if (!response.ok) {
            throw new Error('Failed to fetch employees')
          }
          const employees = await response.json()
          const foundEmployee = employees.find((emp: Employee) => emp.id === employeeId)
          
          if (!foundEmployee) {
            throw new Error('Employee not found')
          }
          
          setEmployee(foundEmployee)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [employeeId, isDraft])

  const handleSave = async (employeeData: any) => {
    setIsSaving(true)
    try {
      if (isDraft) {
        // Convert draft to employee
        const response = await fetch(`/api/drafts/${employeeId}/convert`, {
          method: 'POST'
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save employee')
        }
        
        // Redirect to main dashboard
        router.push('/')
      } else {
        // Update existing employee
        const response = await fetch(`/api/employees/${employeeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData)
        })
        
        if (!response.ok) {
          throw new Error('Failed to update employee')
        }
        
        // Redirect to main dashboard
        router.push('/')
      }
    } catch (err) {
      console.error('Error saving:', err)
      alert(err instanceof Error ? err.message : 'Failed to save employee')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (isDraft) {
      router.push('/employee-drafts')
    } else {
      router.push('/')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {isDraft ? 'Loading draft...' : 'Loading employee data...'}
          </p>
        </div>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">
              {isDraft ? 'Draft Not Found' : 'Employee Not Found'}
            </h2>
            <p className="text-gray-600 mb-4">
              {error || `The ${isDraft ? 'draft' : 'employee'} you're looking for doesn't exist.`}
            </p>
            <Button onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <EmployeeForm
      employee={employee as Employee}
      onSave={handleSave}
      onCancel={handleCancel}
      isEditing={true}
      isSaving={isSaving}
      isDraft={isDraft}
      draftId={isDraft ? employeeId : undefined}
    />
  )
}