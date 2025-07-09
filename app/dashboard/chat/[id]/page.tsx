import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { Chat } from '@/components/chat';
import type { VisibilityType } from '@/components/visibility-selector';
import type { UIMessage } from 'ai';


// Componente servidor para mostrar el Chat con SSR
export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  
  try {
    // Obtener datos del chat y sus mensajes desde la base de datos usando SSR
    const chat = await getChatById({ id });
    const dbMessages = await getMessagesByChatId({ id });
    
    // Configuración básica de la sesión para el componente Chat
    const session = {
      user: {
        name: 'Usuario',
        email: 'usuario@ejemplo.com',
        image: '/placeholder-user.jpg'
      },
      expires: new Date().toISOString()
    };
    
    // Convertir los mensajes al formato esperado por el componente Chat
    const messages: UIMessage[] = dbMessages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      createdAt: new Date(msg.createdAt),
      parts: msg.parts as UIMessage['parts'],
      attachments: msg.attachments,
      content:""
    }));
    
    // Si no se encuentra el chat o no hay mensajes, mostrar mensaje apropiado
    if (!chat) {
      return (
        <div className="h-screen flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Chat no encontrado</h2>
          <p className="text-muted-foreground mb-6">
            El chat que buscas no existe o ha sido eliminado.
          </p>
        </div>
      );
    }

    // Renderizar el componente Chat en modo de solo lectura
    return (
      <div className="size-full flex flex-col">
        <Chat
          id={id}
          initialMessages={messages}
          initialChatModel="gpt-4"
          initialVisibilityType={"private" as VisibilityType}
          isReadonly={true}
          session={session as any}
          autoResume={false}
        />
      </div>
    );
  } catch (error) {
    console.error('Error al cargar el chat:', error);
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-muted-foreground mb-6">
          Ha ocurrido un error al cargar el chat. Inténtalo de nuevo más tarde.
        </p>
      </div>
    );
  }
}
