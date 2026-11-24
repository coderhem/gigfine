// Admin pages: one small line instead of the public site footer
export default function AdminFooter({ className = "" }: { className?: string }) {
  return (
    <footer className={`py-4 text-center text-xs text-gray-500 ${className}`}>
      © {new Date().getFullYear()} GIGFINE. All rights reserved.
    </footer>
  );
}
