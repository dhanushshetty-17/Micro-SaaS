"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

            const response = await fetch("http://localhost:5000/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email,
                password,
              }),
            });

            const data = await response.json();

            console.log(data);
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
        <p className="mt-4 text-green-500">
            You typed: {email}
        </p>
      </div>
    </main>
  );
}