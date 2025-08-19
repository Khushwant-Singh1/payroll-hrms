// File: /app/add-employee/page.tsx

"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast"; // Assuming shadcn/ui toast
import { EmployeeForm } from "@/components/EmployeeForm";
import { usePayrollData } from "@/hooks/usePayrollData";
import { signIn, useSession } from "next-auth/react";

export default function AddEmployeePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addEmployee } = usePayrollData(); // This hook now makes the API call
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (employeeData: any) => {
    setIsSaving(true);
    try {
      // Auto sign-in for demo if not authenticated
      if (!session) {
        console.log("Not authenticated, signing in automatically for demo...");
        await signIn("credentials", {
          email: "demo@example.com",
          password: "password",
          redirect: false
        });
      }

      // The addEmployee function in your hook handles the POST request and shows success toast
      await addEmployee(employeeData);
      
      // If we reach here, the employee was added successfully
      router.push("/"); // Redirect after a successful save
    } catch (error) {
      console.error("Save error:", error);
      // The hook should ideally handle this, but as a fallback:
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  // Show loading while checking session
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <EmployeeForm
      onSave={handleSave}
      onCancel={handleCancel}
      isEditing={false}
      // Pass the saving state to the form to disable buttons
      isSaving={isSaving} 
    />
  );
}