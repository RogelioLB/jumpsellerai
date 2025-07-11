'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  
  // Función para crear un nuevo chat
  const createNewChat = () => {
    // Aquí iría la lógica para crear un nuevo chat
    // Por ahora simplemente simulamos ir a un nuevo chat
    router.push('/dashboard/chat/new');
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Bienvenido a KreadoresPro</h1>

    </div>
  );
}
