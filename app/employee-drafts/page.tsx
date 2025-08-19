"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { 
  Edit3, 
  Trash2, 
  Save, 
  Calendar, 
  User, 
  Building2,
  Phone,
  Mail,
  Loader2,
  Plus,
  RefreshCw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

export default function EmployeeDraftsPage() {
  const [drafts, setDrafts] = useState<EmployeeDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/drafts");
      if (!response.ok) throw new Error("Failed to fetch drafts");
      const data = await response.json();
      setDrafts(data);
    } catch (error) {
      console.error("Error fetching drafts:", error);
      toast({
        title: "Error",
        description: "Failed to load employee drafts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleConvertToEmployee = async (draftId: string) => {
    setConvertingId(draftId);
    try {
      const response = await fetch(`/api/drafts/${draftId}/convert`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to convert draft");
      }

      toast({
        title: "Success",
        description: "Draft converted to employee successfully!",
      });

      // Refresh the drafts list
      await fetchDrafts();
    } catch (error) {
      console.error("Error converting draft:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert draft",
        variant: "destructive",
      });
    } finally {
      setConvertingId(null);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    setDeletingId(draftId);
    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to delete draft");

      toast({
        title: "Success",
        description: "Draft deleted successfully!",
      });

      // Refresh the drafts list
      await fetchDrafts();
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast({
        title: "Error",
        description: "Failed to delete draft",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditDraft = (draftId: string) => {
    router.push(`/edit-employee/${draftId}?draft=true`);
  };

  const getCompletionPercentage = (draft: EmployeeDraft): number => {
    const requiredFields = [
      'employeeId', 'name', 'email', 'phone', 'department', 
      'designation', 'company', 'joiningDate', 'basicSalary'
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = draft[field as keyof EmployeeDraft];
      return value !== null && value !== undefined && value !== '' && value !== 0;
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg text-gray-600">Loading drafts...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Employee Drafts</CardTitle>
              <p className="text-gray-600 mt-1">
                Manage incomplete employee records that are saved as drafts
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchDrafts}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => router.push("/add-employee")}>
                <Plus className="h-4 w-4 mr-2" />
                New Employee
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Drafts</p>
                  <p className="text-2xl font-bold">{drafts.length}</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ready to Convert</p>
                  <p className="text-2xl font-bold text-green-600">
                    {drafts.filter(d => getCompletionPercentage(d) >= 80).length}
                  </p>
                </div>
                <Save className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Incomplete</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {drafts.filter(d => getCompletionPercentage(d) < 50).length}
                  </p>
                </div>
                <Edit3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Drafts List */}
        <Card>
          <CardHeader>
            <CardTitle>Draft Employees ({drafts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {drafts.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">No employee drafts found</p>
                <p className="text-sm text-gray-500 mb-4">
                  Start creating employee records and save them as drafts to continue later
                </p>
                <Button onClick={() => router.push("/add-employee")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Draft
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {drafts.map((draft) => {
                  const completion = getCompletionPercentage(draft);
                  return (
                    <Card key={draft.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {draft.name || "Unnamed Employee"}
                              </h3>
                              <Badge 
                                variant={completion >= 80 ? "default" : completion >= 50 ? "secondary" : "outline"}
                                className={
                                  completion >= 80 
                                    ? "bg-green-100 text-green-800 border-green-200" 
                                    : completion >= 50 
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : "bg-orange-100 text-orange-800 border-orange-200"
                                }
                              >
                                {completion}% Complete
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="h-4 w-4" />
                                <span>{draft.employeeId || "No ID"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span>{draft.email || "No email"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{draft.phone || "No phone"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Building2 className="h-4 w-4" />
                                <span>{draft.company || "No company"}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Modified: {formatDate(draft.lastModified)}</span>
                              </div>
                              {draft.createdBy && (
                                <span>Created by: {draft.createdBy}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditDraft(draft.id)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleConvertToEmployee(draft.id)}
                              disabled={convertingId === draft.id || completion < 80}
                              className={completion >= 80 ? "text-green-700 border-green-300 hover:bg-green-50" : ""}
                            >
                              {convertingId === draft.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={deletingId === draft.id}
                                  className="text-red-700 border-red-300 hover:bg-red-50"
                                >
                                  {deletingId === draft.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Draft</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this employee draft? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteDraft(draft.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}