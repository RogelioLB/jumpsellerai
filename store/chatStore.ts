import { create } from "zustand";
import { ChatInfo } from "@/lib/types/chat";

interface ChatStore {
  chats: ChatInfo[];
  activeChat: string | null;
  addChat: (chat: ChatInfo) => Promise<string | null>;
  setActiveChat: (chatId: string | null) => void;
  deleteChat: (chatId: string) => Promise<void>;
  clearConversation: (chatId: string) => Promise<void>;
  getChat: (chatId: string) => Promise<ChatInfo | undefined>;
  getAllChats: () => Promise<void>;
  updateChatTitle: (chatId: string, title: string) => Promise<boolean>;
}

// Función para actualizar un chat existente
const updateChat = (
  state: ChatStore,
  chatId: string,
  updates: Partial<ChatInfo>
): ChatInfo[] => {
  return state.chats.map((chat) => {
    if (chat.id === chatId) {
      return { ...chat, ...updates };
    }
    return chat;
  });
};

// Crear el store de chats
export const useChatStore = create<ChatStore>()((set) => ({
  chats: [],
  activeChat: null,

  // Obtener todos los chats
  getAllChats: async () => {
    try {
      // Limpiar el estado para evitar duplicados
      set({ chats: [] });

      // Obtener los chats a través de la API
      const userEmail = localStorage.getItem("userEmail");
      const response = await fetch("/api/chat/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getAll",
          email: userEmail,
        }),
      });

      const result = await response.json();

      if (!result.success || !result.chats) {
        throw new Error(result.error || "Error al obtener los chats");
      }

      // Usar un Map para asegurar que no hay duplicados por ID
      const uniqueChats = new Map();

      // Añadir chats desde la respuesta de la API
      if (Array.isArray(result.chats)) {
        result.chats.forEach((chat: ChatInfo) => {
          if (chat && chat.id) {
            uniqueChats.set(chat.id, chat);
          }
        });
      }

      // Convertir el Map de vuelta a un array
      const deduplicatedChats = Array.from(uniqueChats.values());

      // Actualizar el estado con los chats deduplicados
      set({
        chats: deduplicatedChats,
      });
    } catch (error) {
      console.error("Error al obtener todos los chats:", error);
    }
  },

  // Añadir un nuevo chat
  addChat: async (chat) => {
    try {
      // Usar el título proporcionado o generar uno por defecto
      const title = chat.title || `Chat ${new Date().toLocaleString()}`;
      const userEmail = localStorage.getItem("userEmail");

      // Crear el chat a través de la API
      const response = await fetch("/api/chat/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          title,
          messages: chat.messages || [],
          email: userEmail,
        }),
      });

      const result = await response.json();

      if (!result.success || !result.chat) {
        throw new Error(result.error || "Error al crear el chat");
      }

      const newChat = result.chat;

      // Actualizar el estado con el nuevo chat
      set((state) => ({
        chats: [...state.chats, newChat],
        activeChat: newChat.id,
      }));

      return newChat.id;
    } catch (error) {
      console.error("Error al añadir chat:", error);
      return null;
    }
  },

  // Eliminar un chat
  deleteChat: async (chatId) => {
    try {
      // Eliminar el chat a través de la API
      const response = await fetch("/api/chat/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          chatId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Error al eliminar el chat");
      }

      // Actualizar el estado
      set((state) => {
        // Filtrar el chat eliminado
        const updatedChats = state.chats.filter((chat) => chat.id !== chatId);

        // Si el chat eliminado era el activo, establecer el último chat como activo
        // o null si no hay más chats
        let newActiveChat = state.activeChat;
        if (state.activeChat === chatId) {
          newActiveChat =
            updatedChats.length > 0
              ? updatedChats[updatedChats.length - 1].id
              : null;
        }

        return {
          chats: updatedChats,
          activeChat: newActiveChat,
        };
      });
    } catch (error) {
      console.error("Error al eliminar chat:", error);
    }
  },

  // Establecer el chat activo
  setActiveChat: (chatId) =>
    set({
      activeChat: chatId,
    }),

  // Limpiar la conversación (eliminar todos los mensajes)
  clearConversation: async (chatId) => {
    try {
      // Limpiar los mensajes a través de la API
      const response = await fetch("/api/chat/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clear",
          chatId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Error al limpiar la conversación");
      }

      // Actualizar el estado
      set((state) => ({
        chats: updateChat(state, chatId, { messages: [] }),
      }));
    } catch (error) {
      console.error("Error al limpiar conversación:", error);
    }
  },

  // Obtener un chat específico por su ID
  getChat: async (chatId) => {
    try {
      // Si no está en el estado local, buscarlo a través de la API
      const response = await fetch("/api/chat/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get",
          chatId,
        }),
      });

      const result = await response.json();

      if (!result.success || !result.chat) {
        throw new Error(result.error || "Error al obtener el chat");
      }

      const dbChat = result.chat;

      // Si se encuentra en la base de datos, añadirlo al estado local
      if (dbChat) {
        set((state) => ({
          chats: [...state.chats, dbChat],
        }));
        return dbChat;
      }

      return dbChat;
    } catch (error) {
      console.error("Error al obtener chat:", error);
      return undefined;
    }
  },

  // Actualizar el título de un chat existente
  updateChatTitle: async (chatId, title) => {
    try {
      if (!chatId || !title) {
        return false;
      }

      // Actualizar el título a través de la API para persistencia
      const response = await fetch("/api/chat/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateTitle", // Usando la nueva acción específica para títulos
          chatId,
          title, // Enviamos el título directamente
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.error || "Error al actualizar el título del chat"
        );
      }

      // Actualizar el estado local con el nuevo título
      set((state) => ({
        chats: updateChat(state, chatId, { title }),
      }));

      console.log(`Título del chat ${chatId} actualizado a "${title}"`);
      return true;
    } catch (error) {
      console.error("Error al actualizar título del chat:", error);
      return false;
    }
  },
}));
