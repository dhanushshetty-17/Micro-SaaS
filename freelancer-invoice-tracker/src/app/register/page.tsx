"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-lg border">
        <h1 className="text-3xl font-bold">
          Register
        </h1>

        <p className="mt-2 text-gray-500">
          Create your account
        </p>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();

            const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                password,
            }),
            });

            const data = await response.json();

            setMessage(data.message);
            setSuccess(data.success);
          }}
        >
          <input
            type="text"
            placeholder="Enter your full name"
            className="p-3 border rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Enter your email"
            className="p-3 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter your password"
            className="p-3 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="p-3 rounded-lg bg-black text-white"
          >
            Register
          </button>
          {message && (
        <p
          className={`mt-4 text-center ${
            success ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
        )}
        </form>
        <p className="mt-4 text-green-500">
            You typed: {email}
        </p>
      </div>
    </main>
  );
}