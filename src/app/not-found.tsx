import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <h1 className="font-bold">
        4<span className="text-primary">0</span>4
      </h1>
      <h2>Oops! We Can't Find That Page</h2>
      <Link href="/" className="btn btn-primary">
        Go Home
      </Link>
    </div>
  );
}
