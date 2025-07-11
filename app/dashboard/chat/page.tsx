import { getUsersAndChats } from '@/lib/data';

export default async function ChatPage() {
  // Esta página solo mostrará una vista previa de los chats
  // El contenido principal estará en el layout que ya muestra los sidebars
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-3xl font-bold">Chat con KreadoresPro</h1>
        
        <p className="text-lg text-muted-foreground">
          Selecciona una conversación de la lista para ver el chat
        </p>
        
      </div>
    </div>
  );
}
