"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

type Invoice = {
  id: number;
  invoice_number: string;
  client_name: string;
  client_email: string;
  amount: string | number;
  status: string;
  due_date: string;
};

type Analytics = {
  totalInvoices: number;
  pendingInvoices: number;
  paidInvoices: number;
  totalPaidRevenue: number;
};

export default function Dashboard() {
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalInvoices: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    totalPaidRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<number | null>(null);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<number | null>(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState<number | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const refreshAnalytics = async (token: string) => {
    const response = await fetch(`${API_URL}/dashboard/analytics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.success) {
      setAnalytics(data.analytics);
    }
  };

  const markAsPaid = async (invoiceId: number) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/invoices/${invoiceId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setInvoices((currentInvoices) =>
          currentInvoices.map((invoice) =>
            invoice.id === invoiceId ? { ...invoice, status: "Paid" } : invoice
          )
        );
        if (token) {
          await refreshAnalytics(token);
        }
      } else {
        alert(data.message || "Failed to update invoice");
      }
    } catch (error) {
      console.error("Failed to update invoice", error);
      alert("Failed to update invoice");
    }
  };

  const downloadPdf = async (invoiceId: number) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/invoices/${invoiceId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF", error);
      alert("Failed to download PDF");
    }
  };

  const sendInvoiceEmail = async (invoiceId: number) => {
    const token = localStorage.getItem("token");
    setSendingInvoiceId(invoiceId);

    try {
      const response = await fetch(`${API_URL}/invoices/${invoiceId}/send-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert("Invoice email sent successfully");
      } else {
        alert(data.message || "Failed to send invoice email");
      }
    } catch (error) {
      console.error("Failed to send invoice email", error);
      alert("Failed to send invoice email");
    } finally {
      setSendingInvoiceId(null);
    }
  };

  const payInvoice = async (invoiceId: number) => {
    const token = localStorage.getItem("token");
    setPayingInvoiceId(invoiceId);

    try {
      const response = await fetch(`${API_URL}/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.message || "Payment failed");
      }
    } catch (error) {
      console.error("Failed to create payment session", error);
      alert("Failed to create payment session");
    } finally {
      setPayingInvoiceId(null);
    }
  };

  const deleteInvoice = async (invoiceId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this invoice?");

    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setDeletingInvoiceId(invoiceId);

    try {
      const response = await fetch(`${API_URL}/invoices/${invoiceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setInvoices((currentInvoices) => currentInvoices.filter((invoice) => invoice.id !== invoiceId));
        if (token) {
          await refreshAnalytics(token);
        }
      } else {
        alert(data.message || "Failed to delete invoice");
      }
    } catch (error) {
      console.error("Failed to delete invoice", error);
      alert("Failed to delete invoice");
    } finally {
      setDeletingInvoiceId(null);
    }
  };

  useEffect(() => {
    const getInvoices = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/invoices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setInvoices(data.invoices);
          await refreshAnalytics(token);
        } else {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch invoices", error);
      } finally {
        setLoading(false);
      }
    };

    getInvoices();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen p-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">My Invoices</h1>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/create-invoice")}
            className="bg-black text-white px-5 py-3 rounded-lg"
          >
            + Create Invoice
          </button>

          <button
            onClick={handleLogout}
            className="px-5 py-3 bg-red-600 text-white rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="border rounded-lg p-4">
          <p className="text-gray-500">Total invoices</p>
          <h2 className="text-2xl font-bold">{analytics.totalInvoices}</h2>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-gray-500">Pending</p>
          <h2 className="text-2xl font-bold">{analytics.pendingInvoices}</h2>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-gray-500">Paid</p>
          <h2 className="text-2xl font-bold">{analytics.paidInvoices}</h2>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-gray-500">Revenue</p>
          <h2 className="text-2xl font-bold">₹{analytics.totalPaidRevenue}</h2>
        </div>
      </div>

      {invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="border p-5 rounded-lg">
              <div className="flex justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-bold">{invoice.invoice_number}</h2>
                  <p>Client: {invoice.client_name}</p>
                  <p>Email: {invoice.client_email}</p>
                  <p>Amount: ₹{invoice.amount}</p>
                </div>

                <div>
                  <p className="font-bold">{invoice.status}</p>
                  <p>Due: {new Date(invoice.due_date).toLocaleDateString("en-GB")}</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {invoice.status !== "Paid" && (
                      <button
                        onClick={() => markAsPaid(invoice.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg"
                      >
                        Mark as Paid
                      </button>
                    )}

                    {!invoice.status || invoice.status !== "Paid" ? (
                      <button
                        onClick={() => payInvoice(invoice.id)}
                        disabled={payingInvoiceId === invoice.id}
                        className="bg-violet-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                      >
                        {payingInvoiceId === invoice.id ? "Processing..." : "Pay Now"}
                      </button>
                    ) : null}

                    <button
                      onClick={() => downloadPdf(invoice.id)}
                      className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                    >
                      Download PDF
                    </button>

                    <button
                      onClick={() => sendInvoiceEmail(invoice.id)}
                      disabled={sendingInvoiceId === invoice.id}
                      className="bg-sky-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                    >
                      {sendingInvoiceId === invoice.id ? "Sending..." : "Send Email"}
                    </button>

                    <button
                      onClick={() => router.push(`/edit-invoice/${invoice.id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteInvoice(invoice.id)}
                      disabled={deletingInvoiceId === invoice.id}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                    >
                      {deletingInvoiceId === invoice.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
