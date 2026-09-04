"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function CreateInvoice() {
  const router = useRouter();

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/create-invoice`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        clientName,
        clientEmail,
        clientPhone,
        description,
        amount,
        dueDate,
      }),
    }
  );
const data = await response.json();

if (data.success) {
  router.push("/dashboard");
} else {
  console.log(data.message);
}
};

  return (
    <form
  onSubmit={onSubmit}
  className="max-w-xl mx-auto mt-10 space-y-4"
>

      <h1 className="text-3xl font-bold">
        Create Invoice
      </h1>

      <input
        placeholder="Client Name"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
      />

      <input
        placeholder="Client Email"
        value={clientEmail}
        onChange={(e) => setClientEmail(e.target.value)}
      />

      <input
        placeholder="Client Phone"
        value={clientPhone}
        onChange={(e) => setClientPhone(e.target.value)}
      />

      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

<button type="submit">
    Create Invoice
</button>

    </form>
  );
}
