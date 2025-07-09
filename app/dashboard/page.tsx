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
      
      <div className="bg-card border rounded-lg p-8 w-full mb-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Comienza una nueva conversación</h2>
        <p className="text-muted-foreground mb-6">
          Crea un nuevo chat para hablar con nuestro asistente inteligente y obtener ayuda con tus consultas.
        </p>
        <Button 
          size="lg" 
          onClick={createNewChat}
          className="gap-2"
        >
          <PlusCircle size={18} />
          Nuevo Chat
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Rastreo de Pedidos</h3>
          <p className="text-sm text-muted-foreground">
            Consulta el estado de tus pedidos proporcionando tu número de seguimiento o email.
          </p>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Catálogo de Productos</h3>
          <p className="text-sm text-muted-foreground">
            Explora nuestro catálogo completo de productos y encuentra lo que necesitas.
          </p>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Promociones Activas</h3>
          <p className="text-sm text-muted-foreground">
            Descubre las promociones y descuentos disponibles actualmente.
          </p>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-2">Ayuda y Soporte</h3>
          <p className="text-sm text-muted-foreground">
            Consulta nuestras preguntas frecuentes o contacta con nuestro equipo de soporte.
          </p>
        </div>
      </div>
    </div>
  );
}
