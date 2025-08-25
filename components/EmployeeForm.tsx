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
  Trash2,
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

/* -------------------- Updated Zod schema -------------------- */
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
  
  // Salary Components
  basicSalary: z.number().min(0).default(0),
  specialBasic: z.number().min(0).default(0),
  dearnessAllowance: z.number().min(0).default(0),
  hra: z.number().min(0).default(0),
  overtimeRate: z.number().min(0).default(0),
  foodAllowance: z.number().min(0).default(0),
  conveyanceAllowance: z.number().min(0).default(0),
  officeWearAllowance: z.number().min(0).default(0),
  bonus: z.number().min(0).default(0),
  leaveWithWages: z.number().min(0).default(0),
  otherAllowances: z.number().min(0).default(0),
  rateOfWages: z.number().min(0).default(0),
  
  // Deductions (Employee Share)
  pfDeduction: z.number().min(0).default(0),
  esicDeduction: z.number().min(0).default(0),
  societyDeduction: z.number().min(0).default(0),
  incomeTaxDeduction: z.number().min(0).default(0),
  insuranceDeduction: z.number().min(0).default(0),
  otherRecoveries: z.number().min(0).default(0),
  
  // Employer Contributions
  employerPfContribution: z.number().min(0).default(0),
  employerEsicContribution: z.number().min(0).default(0),
  
  // Payment Details
  bankAccount: z.string().optional(),
  ifsc: z.string().optional(),
  branch: z.string().optional(),
  lastTransactionId: z.string().optional(),
  lastPaymentDate: z.string().optional(),
  
  // Additional Fields
  pan: z.string().optional(),
  aadhaar: z.string().optional(),
  uan: z.string().optional(),
  esicNumber: z.string().optional(),
  pfOptIn: z.boolean().default(true),
  esiApplicable: z.boolean().default(true),
  lwfState: z.string().optional(),
  profilePic: z.string().optional(),
});

type EmployeeInput = z.infer<typeof employeeSchema>;

/* -------------------- props -------------------- */
interface EmployeeFormProps {
  employee?: Employee;
  onSave: (employee: EmployeeInput) => void;
  onCancel: () => void;
  onDelete?: (employeeId: string) => void;
  isEditing?: boolean;
  isSaving?: boolean;
  isDraft?: boolean;
  draftId?: string;
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
  
  // Salary Components
  basicSalary: 0,
  specialBasic: 0,
  dearnessAllowance: 0,
  hra: 0,
  overtimeRate: 0,
  foodAllowance: 0,
  conveyanceAllowance: 0,
  officeWearAllowance: 0,
  bonus: 0,
  leaveWithWages: 0,
  otherAllowances: 0,
  rateOfWages: 0,
  
  // Deductions
  pfDeduction: 0,
  esicDeduction: 0,
  societyDeduction: 0,
  incomeTaxDeduction: 0,
  insuranceDeduction: 0,
  otherRecoveries: 0,
  
  // Employer Contributions
  employerPfContribution: 0,
  employerEsicContribution: 0,
  
  // Payment Details
  bankAccount: "",
  ifsc: "",
  branch: "",
  lastTransactionId: "",
  lastPaymentDate: "",
  
  // Additional Fields
  pan: "",
  aadhaar: "",
  uan: "",
  esicNumber: "",
  pfOptIn: true,
  esiApplicable: true,
  lwfState: "",
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

// Helper for database drafts
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
  onDelete,
  isEditing = false,
  isSaving = false,
  isDraft = false,
  draftId,
}: EmployeeFormProps) {
  /* ---------- state ---------- */
  const [data, setData] = useState<EmployeeInput>(() => {
    if (isDraft && employee) {
      return { ...defaultData, ...employee };
    }
    
    const draft = loadDraft(getDraftKey(employee?.id));
    return { ...defaultData, ...employee, ...draft };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const draftKey = getDraftKey(employee?.id);

  /* ---------- auto-save draft ---------- */
  const debouncedSave = useRef(
    debounce((partial: Partial<EmployeeInput>) => {
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
        await saveDBDraft(draftId || null, data);
        alert("Draft updated successfully!");
      } else {
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
    
    if (!isDraft) {
      clearDraft(draftKey);
    }
    
    onSave(result.data);
  };

  const handleDelete = async () => {
    if (!employee?.id || !onDelete) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.name}? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      await onDelete(employee.id);
    } catch (error) {
      console.error("Error deleting employee:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate totals for display
  const totalEarnings = (
    Number(data.basicSalary || 0) +
    Number(data.specialBasic || 0) +
    Number(data.dearnessAllowance || 0) +
    Number(data.hra || 0) +
    Number(data.foodAllowance || 0) +
    Number(data.conveyanceAllowance || 0) +
    Number(data.officeWearAllowance || 0) +
    Number(data.bonus || 0) +
    Number(data.leaveWithWages || 0) +
    Number(data.otherAllowances || 0) +
    Number(data.rateOfWages || 0)
  );

  const totalDeductions = (
    Number(data.pfDeduction || 0) +
    Number(data.esicDeduction || 0) +
    Number(data.societyDeduction || 0) +
    Number(data.incomeTaxDeduction || 0) +
    Number(data.insuranceDeduction || 0) +
    Number(data.otherRecoveries || 0)
  );

  const netSalary = totalEarnings - totalDeductions;

  // Debug logging to identify calculation issues
  console.log('Salary calculation debug:', {
    totalEarnings,
    totalDeductions,
    netSalary,
    data: {
      basicSalary: data.basicSalary,
      specialBasic: data.specialBasic,
      dearnessAllowance: data.dearnessAllowance,
      hra: data.hra,
      rateOfWages: data.rateOfWages
    }
  });

  /* ---------- render ---------- */
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
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
              {isEditing && employee?.id && onDelete && (
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving}
                  className="mr-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </>
                  )}
                </Button>
              )}
              
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

        {/* Basic Information */}
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
                      } catch (error) {
                        console.error("Upload failed:", error);
                        const errorMessage = error instanceof Error ? error.message : "Upload failed";
                        alert(`Upload failed: ${errorMessage}`);
                      } finally {
                        setIsUploading(false);
                        e.target.value = "";
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
    <CardDescription>
      Enter all salary components and allowances
    </CardDescription>
  </CardHeader>
  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {([
      { key: "basicSalary", label: "Basic Salary" },
      { key: "specialBasic", label: "Special Basic" },
      { key: "dearnessAllowance", label: "Dearness Allowance (DA)" },
      { key: "hra", label: "House Rent Allowance (HRA)" },
      { key: "overtimeRate", label: "Overtime Rate" },
      { key: "foodAllowance", label: "Food Allowance" },
      { key: "conveyanceAllowance", label: "Conveyance Allowance" },
      { key: "officeWearAllowance", label: "Office Wear Allowance" },
      { key: "bonus", label: "Bonus" },
      { key: "leaveWithWages", label: "Leave With Wages" },
      { key: "otherAllowances", label: "Other Allowances" },
      { key: "rateOfWages", label: "Rate of Wages" }, // Added rate of wages field
    ] as const).map(({ key, label }) => (
      <div key={key}>
        <Label>{label}</Label>
        <Input
          type="number"
          value={data[key] || 0}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseFloat(e.target.value) || 0;
            // Prevent extremely large values (max 10 crores)
            const sanitizedValue = Math.min(value, 100000000);
            handleChange(key, sanitizedValue);
          }}
          className={errors[key] ? "border-red-500" : ""}
          min="0"
          max="100000000"
          step="0.01"
        />
        {errors[key] && (
          <p className="text-sm text-red-500">{errors[key]}</p>
        )}
      </div>
    ))}
    
    <div className="col-span-full p-3 bg-blue-50 rounded-md">
      <h4 className="font-medium mb-2">Salary Summary</h4>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-sm text-gray-600">Total Earnings:</p>
          <p className="font-semibold">₹{totalEarnings.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Deductions:</p>
          <p className="font-semibold">₹{totalDeductions.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Net Salary:</p>
          <p className="font-semibold text-green-600">₹{netSalary.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
        </div>
      </div>
    </div>
  </CardContent>
</Card>

        {/* Deductions */}
        <Card>
          <CardHeader>
            <CardTitle>Deductions (Employee Share)</CardTitle>
            <CardDescription>
              Employee contribution deductions
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([
              { key: "pfDeduction", label: "Provident Fund (PF)" },
              { key: "esicDeduction", label: "ESIC" },
              { key: "societyDeduction", label: "Society" },
              { key: "incomeTaxDeduction", label: "Income Tax" },
              { key: "insuranceDeduction", label: "Insurance" },
              { key: "otherRecoveries", label: "Other Recoveries" },
            ] as const).map(({ key, label }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  type="number"
                  value={data[key] || 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = parseFloat(e.target.value) || 0;
                    // Prevent extremely large values (max 10 crores)
                    const sanitizedValue = Math.min(value, 100000000);
                    handleChange(key, sanitizedValue);
                  }}
                  min="0"
                  max="100000000"
                  step="0.01"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Employer Contributions */}
        <Card>
          <CardHeader>
            <CardTitle>Employer Contributions</CardTitle>
            <CardDescription>
              Employer statutory contributions
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              { key: "employerPfContribution", label: "Employer PF Contribution" },
              { key: "employerEsicContribution", label: "Employer ESIC Contribution" },
            ] as const).map(({ key, label }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  type="number"
                  value={data[key] || 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = parseFloat(e.target.value) || 0;
                    // Prevent extremely large values (max 10 crores)
                    const sanitizedValue = Math.min(value, 100000000);
                    handleChange(key, sanitizedValue);
                  }}
                  min="0"
                  max="100000000"
                  step="0.01"
                />
              </div>
            ))}
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
            <div className="flex items-center space-x-2">
              <Switch
                id="pf-opt-in"
                checked={data.pfOptIn}
                onCheckedChange={(checked) => handleChange("pfOptIn", checked)}
              />
              <Label htmlFor="pf-opt-in">PF Opt-in</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="esi-applicable"
                checked={data.esiApplicable}
                onCheckedChange={(checked) => handleChange("esiApplicable", checked)}
              />
              <Label htmlFor="esi-applicable">ESI Applicable</Label>
            </div>
            <div>
              <Label>LWF State</Label>
              <Input
                value={data.lwfState || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("lwfState", e.target.value)
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
            <div>
              <Label>Last Transaction ID</Label>
              <Input
                value={data.lastTransactionId || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("lastTransactionId", e.target.value)
                }
              />
            </div>
            <div>
              <Label>Last Payment Date</Label>
              <Input
                type="date"
                value={data.lastPaymentDate || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("lastPaymentDate", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer buttons */}
        <div className="flex justify-between pb-6">
          <div>
            {isEditing && employee?.id && onDelete && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Employee
                  </>
                )}
              </Button>
            )}
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
    </div>
  );
}