"use client";

import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Upload,
  User,
  ArrowLeft,
  Save,
  X,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Employee } from "../types/payroll";
import { uploadImageToCloudinary } from "@/lib/cloudinary";


// Custom debounce function to replace lodash dependency
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  const debounced = ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;

  // Add cancel method
  (debounced as any).cancel = () => clearTimeout(timeout);

  return debounced;
}

/* -------------------- Zod schemas -------------------- */
const employeeSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(1, "Phone number required"),
  department: z.string().min(1, "Department required"),
  designation: z.string().min(1, "Designation is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().optional(),
  grade: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  joiningDate: z.string().min(1, "Joining date required"),
  dateOfBirth: z.string().optional(),
  basicSalary: z.number().min(0).default(0),
  hra: z.number().min(0).default(0),
  allowances: z.number().min(0).default(0),
  pan: z.string().optional(),
  aadhaar: z.string().optional(),
  uan: z.string().optional(),
  esicNumber: z.string().optional(),
  pfOptIn: z.boolean().default(true),
  esiApplicable: z.boolean().default(true),
  lwfState: z.string().optional(),
  bankAccount: z.string().optional(),
  ifsc: z.string().optional(),
  branch: z.string().optional(),
  profilePic: z.string().optional(),
});

type EmployeeInput = z.infer<typeof employeeSchema>;

/* -------------------- props -------------------- */
interface EmployeeFormProps {
  employee?: Employee;
  onSave: (employee: EmployeeInput) => void;
  onCancel: () => void;
  isEditing?: boolean;
  isSaving?: boolean;
  isDraft?: boolean; // New prop to indicate if we're editing a draft
  draftId?: string; // ID of the draft being edited
}

/* -------------------- helpers -------------------- */
const defaultData: EmployeeInput = {
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
  dateOfBirth: "",
  basicSalary: 0,
  hra: 0,
  allowances: 0,
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
  profilePic: "",
};

const getDraftKey = (id?: string) => `DRAFT_${id || "new"}`;

const saveDraft = (key: string, data: Partial<EmployeeInput>) =>
  localStorage.setItem(key, JSON.stringify(data));

const loadDraft = (key: string): Partial<EmployeeInput> | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const clearDraft = (key: string) => localStorage.removeItem(key);

// New helper for database drafts
const saveDBDraft = async (draftId: string | null, data: Partial<EmployeeInput>) => {
  try {
    const method = draftId ? "PUT" : "POST";
    const url = draftId ? `/api/drafts/${draftId}` : "/api/drafts";
    
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error("Failed to save draft");
    return await response.json();
  } catch (error) {
    console.error("Error saving draft to database:", error);
    throw error;
  }
};

/* -------------------- component -------------------- */
export function EmployeeForm({
  employee,
  onSave,
  onCancel,
  isEditing = false,
  isSaving = false,
  isDraft = false,
  draftId,
}: EmployeeFormProps) {
  /* ---------- state ---------- */
  const [data, setData] = useState<EmployeeInput>(() => {
    // If editing a draft, use the passed employee data
    if (isDraft && employee) {
      return { ...defaultData, ...employee };
    }
    
    // Otherwise, try to load from localStorage for regular editing
    const draft = loadDraft(getDraftKey(employee?.id));
    return { ...defaultData, ...employee, ...draft };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const draftKey = getDraftKey(employee?.id);

  /* ---------- auto-save draft ---------- */
  const debouncedSave = useRef(
    debounce((partial: Partial<EmployeeInput>) => {
      // Only auto-save to localStorage for regular forms, not drafts
      if (!isDraft) {
        const partialSchema = employeeSchema.partial();
        const safe = partialSchema.safeParse(partial);
        if (safe.success) saveDraft(draftKey, safe.data);
      }
    }, 3000)
  ).current;

  useEffect(() => {
    if (!isDraft) {
      debouncedSave(data);
    }
    return () => (debouncedSave as any).cancel();
  }, [data, debouncedSave, draftKey, isDraft]);

  /* ---------- handlers ---------- */
  const handleChange = <K extends keyof EmployeeInput>(
    key: K,
    value: EmployeeInput[K]
  ) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const manualSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      if (isDraft) {
        // Save to database if editing a draft
        await saveDBDraft(draftId || null, data);
        alert("Draft updated successfully!");
      } else {
        // Save to localStorage for regular forms
        saveDraft(draftKey, data);
        alert("Draft saved locally!");
      }
    } catch (error) {
      alert("Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const createNewDraft = async () => {
    setIsSavingDraft(true);
    try {
      const newDraft = await saveDBDraft(null, data);
      alert("Draft saved to database successfully!");
      // Optionally redirect to the draft editing page
      window.location.href = `/edit-employee/${newDraft.id}?draft=true`;
    } catch (error) {
      alert("Failed to save draft to database");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    console.log("Form submitted with data:", data);

    const result = employeeSchema.safeParse(data);
    if (!result.success) {
      console.log("Validation failed:", result.error.errors);
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    console.log("Validation passed, calling onSave with:", result.data);
    
    // Clear local draft only if not editing a database draft
    if (!isDraft) {
      clearDraft(draftKey);
    }
    
    onSave(result.data);
  };

  /* ---------- render ---------- */
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* header */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={onCancel}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <div>
                <CardTitle className="text-2xl">
                  {isEditing ? "Edit Employee" : "Add New Employee"}
                </CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Update information"
                    : "Fill in the details below"}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={manualSaveDraft}
                disabled={isSavingDraft}
              >
                {isSavingDraft ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    {isDraft ? "Update Draft" : "Save Draft"}
                  </>
                )}
              </Button>
              
              {!isDraft && !isEditing && (
                <Button 
                  variant="outline" 
                  onClick={createNewDraft}
                  disabled={isSavingDraft}
                  className="bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  {isSavingDraft ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Save as Draft
                    </>
                  )}
                </Button>
              )}
              
              <Button variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    {isEditing || isDraft ? "Save Employee" : "Create Employee"}
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* rest of the form stays identical, just use handleChange / data / errors */}
        {/* … all existing cards (Basic Info, Statutory, Company, Salary, Bank, Address, Status) … */}
        {/* For brevity only one representative card shown below */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                "employeeId",
                "name",
                "email",
                "phone",
                "department",
                "joiningDate",
              ] as const
            ).map((f) => (
              <div key={f}>
                <Label className="capitalize">
                  {f.replace(/([A-Z])/g, " $1")} *
                </Label>
                <Input
                  type={f === "joiningDate" ? "date" : "text"}
                  value={data[f] as string}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(f, e.target.value)
                  }
                  className={errors[f] ? "border-red-500" : ""}
                />
                {errors[f] && (
                  <p className="text-sm text-red-500">{errors[f]}</p>
                )}
              </div>
            ))}
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={data.dateOfBirth || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("dateOfBirth", e.target.value)
                }
                className={errors.dateOfBirth ? "border-red-500" : ""}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={data.profilePic || "/placeholder.svg"}
                  alt={data.name || "Employee"}
                />
                <AvatarFallback className="text-2xl">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <label htmlFor="profile-pic-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer"
                      disabled={isUploading}
                      asChild
                    >
                      <span>
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Photo
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                  <input
                    id="profile-pic-upload"
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // Check configuration before attempting upload
                   
                    setIsUploading(true);
                      try {
                        const formData = new FormData();
formData.append("file", file);

const res = await fetch("/api/upload", { method: "POST", body: formData });
const data = await res.json();

if (data.url) {
  handleChange("profilePic", data.url);
  alert("Profile picture uploaded successfully!");
} else {
  alert("Upload failed");
}

                        
                        // Show success message
                        alert("Profile picture uploaded successfully!");
                      } catch (error) {
                        console.error("Upload failed:", error);
                        const errorMessage = error instanceof Error ? error.message : "Upload failed";
                        alert(`Upload failed: ${errorMessage}`);
                      } finally {
                        setIsUploading(false);
                        e.target.value = ""; // allow re-upload
                      }
                    }}
                    className="hidden"
                  />
                  {data.profilePic && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleChange("profilePic", "")}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Upload a photo (max 5MB). Supported formats: JPG, PNG, GIF
                </p>
               
              
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Designation *</Label>
              <Input
                value={data.designation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("designation", e.target.value)
                }
                className={errors.designation ? "border-red-500" : ""}
              />
              {errors.designation && (
                <p className="text-sm text-red-500">{errors.designation}</p>
              )}
            </div>
            <div>
              <Label>Company *</Label>
              <Input
                value={data.company || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("company", e.target.value)
                }
                className={errors.company ? "border-red-500" : ""}
              />
              {errors.company && (
                <p className="text-sm text-red-500">{errors.company}</p>
              )}
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={data.location || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("location", e.target.value)
                }
              />
            </div>
            <div>
              <Label>Grade</Label>
              <Input
                value={data.grade || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("grade", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Salary Information */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Basic Salary *</Label>
              <Input
                type="number"
                value={data.basicSalary}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("basicSalary", parseFloat(e.target.value) || 0)
                }
                className={errors.basicSalary ? "border-red-500" : ""}
              />
              {errors.basicSalary && (
                <p className="text-sm text-red-500">{errors.basicSalary}</p>
              )}
            </div>
            <div>
              <Label>HRA</Label>
              <Input
                type="number"
                value={data.hra}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("hra", parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <Label>Allowances</Label>
              <Input
                type="number"
                value={data.allowances}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("allowances", parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div className="col-span-full">
              <p className="text-sm text-gray-600">
                Total Salary: ₹
                {(
                  (data.basicSalary || 0) +
                  (data.hra || 0) +
                  (data.allowances || 0)
                ).toLocaleString("en-IN")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Statutory Information */}
        <Card>
          <CardHeader>
            <CardTitle>Statutory Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>PAN Number</Label>
              <Input
                value={data.pan || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("pan", e.target.value.toUpperCase())
                }
              />
            </div>
            <div>
              <Label>Aadhaar Number</Label>
              <Input
                value={data.aadhaar || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("aadhaar", e.target.value)
                }
              />
            </div>
            <div>
              <Label>UAN Number</Label>
              <Input
                value={data.uan || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("uan", e.target.value)
                }
              />
            </div>
            <div>
              <Label>ESIC Number</Label>
              <Input
                value={data.esicNumber || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("esicNumber", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Bank Information */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Bank Account Number</Label>
              <Input
                value={data.bankAccount || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("bankAccount", e.target.value)
                }
              />
            </div>
            <div>
              <Label>IFSC Code</Label>
              <Input
                value={data.ifsc || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("ifsc", e.target.value.toUpperCase())
                }
              />
            </div>
            <div>
              <Label>Branch</Label>
              <Input
                value={data.branch || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("branch", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* … remaining cards identical to previous answer … */}

        <div className="flex justify-end gap-2 pb-6">
          <Button 
            variant="outline" 
            onClick={manualSaveDraft}
            disabled={isSavingDraft}
          >
            {isSavingDraft ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                {isDraft ? "Update Draft" : "Save Draft"}
              </>
            )}
          </Button>
          
          {!isDraft && !isEditing && (
            <Button 
              variant="outline" 
              onClick={createNewDraft}
              disabled={isSavingDraft}
              className="bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save as Draft
                </>
              )}
            </Button>
          )}
          
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                {isEditing || isDraft ? "Save Employee" : "Create Employee"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
