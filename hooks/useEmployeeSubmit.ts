import { Employee } from "@/types/payroll";

export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body });
  const { url } = await res.json();
  return url;
}

export async function saveEmployee(payload: Employee, id?: string) {
  const url = id ? `/api/employees/${id}` : "/api/employees";
  const method = id ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const { error, errors } = await res.json();
    throw { error, errors };
  }
  return res.json();
}