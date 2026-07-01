import Link from "next/link";
export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-6">
      <h1 className="text-xl font-bold">
        InvoiceTracker
      </h1>

<Link
  href="/login"
  className="px-4 py-2 rounded-lg bg-black text-white"
>
  Login
</Link>
    </nav>
  );
}