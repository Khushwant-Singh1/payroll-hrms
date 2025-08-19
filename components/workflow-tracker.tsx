"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, Play, Loader2 } from 'lucide-react'
import { PayrollCycle, WorkflowStep } from '../types/erp-payroll'

interface WorkflowTrackerProps {
  cycle: PayrollCycle
  onExecuteStep: (stepId: string) => Promise<void>
  canExecuteStep: (stepId: string) => boolean
}

export function WorkflowTracker({ cycle, onExecuteStep, canExecuteStep }: WorkflowTrackerProps) {
  const getStepIcon = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in-progress':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStepBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'in-progress':
        return 'secondary'
      case 'error':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const completedSteps = cycle.steps.filter(step => step.status === 'completed').length
  const progressPercentage = (completedSteps / cycle.steps.length) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payroll Workflow - {cycle.month} {cycle.year}</CardTitle>
            <CardDescription>
              Step {completedSteps + 1} of {cycle.steps.length} • {Math.round(progressPercentage)}% Complete
            </CardDescription>
          </div>
          <Badge variant={
            cycle.status === 'closed' ? 'default' :
            cycle.status === 'approved' ? 'secondary' :
            cycle.status === 'processing' ? 'outline' : 'destructive'
          }>
            {cycle.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={progressPercentage} className="w-full" />
        
        <div className="space-y-4">
          {cycle.steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-shrink-0">
                {getStepIcon(step)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  <Badge variant={getStepBadgeVariant(step.status)}>
                    {step.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
                {step.completedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Completed: {new Date(step.completedAt).toLocaleString()}
                  </p>
                )}
                {step.assignedTo && (
                  <p className="text-xs text-gray-500">
                    Assigned to: {step.assignedTo}
                  </p>
                )}
              </div>
              
              <div className="flex-shrink-0">
                {step.status === 'pending' && canExecuteStep(step.id) && (
                  <Button 
                    size="sm" 
                    onClick={() => onExecuteStep(step.id)}
                    disabled={step.status === 'in-progress'}
                  >
                    {step.status === 'in-progress' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Execute
                      </>
                    )}
                  </Button>
                )}
                {step.status === 'pending' && !canExecuteStep(step.id) && (
                  <Button size="sm" variant="outline" disabled>
                    Waiting
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
