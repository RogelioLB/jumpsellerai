import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout - Jumpseller Demo",
  description: "Completa tu compra",
};

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <header className="bg-white dark:bg-zinc-900 shadow-sm dark:shadow-zinc-800">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Jumpseller Demo Store</h1>
        </div>
      </header>
      <main>{children}</main>
      <footer className="bg-white dark:bg-zinc-900 border-t dark:border-zinc-800 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Jumpseller Demo. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}