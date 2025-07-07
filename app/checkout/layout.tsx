import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout - KreadoresPro",
  description: "Completa tu compra",
};

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container max-w-7xl mx-auto py-4 px-4">
          <Link href="/" className="text-xl font-bold hover:underline">
            KreadoresPro
          </Link>
        </div>
      </header>
      <main className="container max-w-7xl mx-auto py-8 px-4">
        <Card className="w-full shadow-sm">
          <div className="p-6">
            {children}
          </div>
        </Card>
      </main>
      <footer className="border-t mt-auto py-4">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Jumpseller Demo. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}