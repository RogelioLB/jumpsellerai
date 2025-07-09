import { getUsersChats } from "./db/queries";
import { User, Chat } from "./db/schema";

/**
 * Obtiene los usuarios y sus chats para el dashboard
 */
export async function getUsersAndChats() {
  try {
    // Obtener datos usando la función existente en queries.ts
    const { users, userChats } = await getUsersChats();
    
    // Mantener usuarios como Map para compatibilidad con dashboard-client
    // Y asegurar que los chats tengan la propiedad visibility requerida
    const chatsMap = new Map<string, Chat[]>();
    userChats.forEach((chats, userId) => {
      // Asegurar que cada chat tenga una propiedad visibility (usamos 'private' como default)
      const chatsWithVisibility = chats.map(chat => ({
        ...chat,
        visibility: chat.visibility || 'private'
      }));
      chatsMap.set(userId, chatsWithVisibility);
    });
    
    return {
      users,
      chatsMap
    };
  } catch (error) {
    console.error("Error al obtener usuarios y chats:", error);
    return {
      users: new Map(),
      chatsMap: new Map()
    };
  }
}
