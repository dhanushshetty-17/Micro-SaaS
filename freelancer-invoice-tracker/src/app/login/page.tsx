"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-lg border">

        <h1 className="text-3xl font-bold">
          Login
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome back!
        </p>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();

            const response = await fetch(
              `${API_URL}/login`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email,
                  password,
                }),
              }
            );

            // Convert server response to JavaScript object
            const data = await response.json();

            if (data.success) {
              localStorage.setItem("token", data.token);
              router.push("/dashboard");
            } else {
              setMessage(data.message || "Login failed");
            }
          }}
        >

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
            Login
          </button>

        </form>

        {message && (
          <p className="mt-4 text-center text-red-600">
            {message}
          </p>
        )}

      </div>
    </main>
  );
}
