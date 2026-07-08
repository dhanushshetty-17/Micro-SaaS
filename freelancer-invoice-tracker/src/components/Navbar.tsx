import Link from "next/link";
export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-6">
      <h1 className="text-xl font-bold">
        InvoiceTracker
      </h1>

<div className="flex gap-3">
  <Link
    href="/login"
    className="px-4 py-2 rounded-lg bg-black text-white"
  >
    Login
  </Link>

  <Link
    href="/register"
    className="px-4 py-2 rounded-lg border"
  >
    Register
  </Link>
</div>
    </nav>
  );
}