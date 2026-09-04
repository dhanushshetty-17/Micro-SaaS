"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

type InvoiceForm = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  description: string;
  amount: string;
  dueDate: string;
};

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [form, setForm] = useState<InvoiceForm>({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    description: "",
    amount: "",
    dueDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const getInvoice = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/invoices/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!data.success) {
          setError(data.message || "Invoice not found");
          return;
        }

        setForm({
          clientName: data.invoice.client_name || "",
          clientEmail: data.invoice.client_email || "",
          clientPhone: data.invoice.client_phone || "",
          description: data.invoice.description || "",
          amount: String(data.invoice.amount || ""),
          dueDate: data.invoice.due_date
            ? data.invoice.due_date.slice(0, 10)
            : "",
        });
      } catch (error) {
        console.error("Failed to load invoice", error);
        setError("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    getInvoice();
  }, [params.id, router]);

  const updateField = (field: keyof InvoiceForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/invoices/${params.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (data.success) {
        router.push("/dashboard");
      } else {
        setError(data.message || "Failed to update invoice");
      }
    } catch (error) {
      console.error("Failed to update invoice", error);
      setError("Failed to update invoice");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading invoice...
      </div>
    );
  }

  return (
    <main className="min-h-screen p-10">
      <form
        onSubmit={onSubmit}
        className="max-w-xl mx-auto space-y-4"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Edit Invoice
          </h1>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 border rounded-lg"
          >
            Back
          </button>
        </div>

        {error && (
          <p className="p-3 rounded-lg bg-red-50 text-red-600">
            {error}
          </p>
        )}

        <input
          placeholder="Client Name"
          className="w-full p-3 border rounded-lg"
          value={form.clientName}
          onChange={(e) => updateField("clientName", e.target.value)}
        />

        <input
          type="email"
          placeholder="Client Email"
          className="w-full p-3 border rounded-lg"
          value={form.clientEmail}
          onChange={(e) => updateField("clientEmail", e.target.value)}
        />

        <input
          placeholder="Client Phone"
          className="w-full p-3 border rounded-lg"
          value={form.clientPhone}
          onChange={(e) => updateField("clientPhone", e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full p-3 border rounded-lg"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          className="w-full p-3 border rounded-lg"
          value={form.amount}
          onChange={(e) => updateField("amount", e.target.value)}
        />

        <input
          type="date"
          className="w-full p-3 border rounded-lg"
          value={form.dueDate}
          onChange={(e) => updateField("dueDate", e.target.value)}
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full p-3 rounded-lg bg-black text-white disabled:bg-gray-400"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </main>
  );
}
