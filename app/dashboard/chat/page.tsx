import { getUsersAndChats } from '@/lib/data';

export default async function ChatPage() {
  // Esta página solo mostrará una vista previa de los chats
  // El contenido principal estará en el layout que ya muestra los sidebars
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-3xl font-bold">Chat con KreadoresPro</h1>
        
        <p className="text-lg text-muted-foreground">
          Selecciona una conversación de la lista o inicia una nueva para obtener ayuda
          con tus preguntas y necesidades.
        </p>
        
        <div className="flex justify-center">
          <a 
            href="/dashboard/chat/new"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            Nuevo Chat
          </a>
        </div>
      </div>
    </div>
  );
}
