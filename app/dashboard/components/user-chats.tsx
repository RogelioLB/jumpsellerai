'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { User, Chat } from '@/lib/db/schema';

interface UserChatsProps {
  users: Map<string, User>;
  chatsMap: Map<string, Chat[]>;
  onSelectChat: (chatId: string) => void;
  defaultSelectedChatId?: string | null;
  isMobileView?: boolean;
}

export default function UserChats({ 
  users, 
  chatsMap, 
  onSelectChat,
  defaultSelectedChatId,
  isMobileView = false
}: UserChatsProps) {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>(Array.from(users.values()));
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);

  // Manejar la búsqueda
  useEffect(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      
      // Filtrar usuarios
      const matchedUsers = Array.from(users.values()).filter(user => 
        user.email.toLowerCase().includes(term)
      );
      setFilteredUsers(matchedUsers);
      
      // Filtrar chats del usuario activo
      if (activeUser) {
        const userChats = chatsMap.get(activeUser.id) || [];
        const matchedChats = userChats.filter(chat => 
          chat.title.toLowerCase().includes(term)
        );
        setFilteredChats(matchedChats);
      }
    } else {
      setFilteredUsers(Array.from(users.values()));
      if (activeUser) {
        setFilteredChats(chatsMap.get(activeUser.id) || []);
      }
    }
  }, [searchTerm, users, activeUser, chatsMap]);

  // Preselección de chat basado en URL
  useEffect(() => {
    if (defaultSelectedChatId && users.size > 0) {
      // Encontrar a qué usuario pertenece este chat
      for (const [userId, user] of users.entries()) {
        const userChats = chatsMap.get(userId) || [];
        const chat = userChats.find(c => c.id === defaultSelectedChatId);
        
        if (chat) {
          setActiveUser(user);
          setActiveChat(chat);
          setFilteredChats(userChats);
          break;
        }
      }
    }
  }, [defaultSelectedChatId, users, chatsMap]);

  // Actualizar chats filtrados cuando cambia el usuario activo
  useEffect(() => {
    if (activeUser) {
      const userChats = chatsMap.get(activeUser.id) || [];
      setFilteredChats(userChats);
    } else {
      setFilteredChats([]);
    }
  }, [activeUser, chatsMap]);

  // Manejar la selección de usuario
  const handleUserSelect = (user: User) => {
    setActiveUser(user);
    setActiveChat(null);
  };

  // Manejar la selección de chat
  const handleChatSelect = (chat: Chat) => {
    if (activeUser) {
      setActiveChat(chat);
      onSelectChat(chat.id);
    }
  };

  // Obtener las iniciales del nombre del usuario
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  // Formatear fecha para mostrar
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="flex h-screen w-full transition-all duration-300 ease-in-out">
      {/* Lista de usuarios */}
      <div className="w-64 border-r flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuario..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                className={`w-full flex items-center space-x-3 p-2 rounded-md hover:bg-accent transition-all duration-200 ease-in-out hover:scale-[1.02] ${
                  activeUser?.id === user.id ? 'bg-accent shadow-sm' : ''
                }`}
                onClick={() => handleUserSelect(user)}
              >
                <Avatar>
                  <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="font-medium">{user.email.includes("guest") ? "Invitado" : "Usuario"}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Lista de chats */}
      <div className="w-64 flex flex-col h-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-medium">
            {activeUser ? 'Chats' : 'Selecciona un usuario'}
          </h3>
        </div>
        
        <ScrollArea className="flex-1">
          {activeUser && (
            <div className="p-2 space-y-1">
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    className={`w-full text-left p-2 rounded-md hover:bg-accent transition-all duration-200 ease-in-out hover:-translate-y-0.5 ${
                      activeChat?.id === chat.id ? 'bg-accent shadow-sm' : ''
                    }`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="font-medium truncate">{chat.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(chat.createdAt)}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground text-sm">
                  No hay chats disponibles
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
