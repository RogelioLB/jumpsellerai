'use client';

import { useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SidebarNav from './sidebar-nav';
import UserChats from './user-chats';
import type { User, Chat } from '@/lib/db/schema';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

interface DashboardClientProps {
  children: ReactNode;
  users: Map<string, User>;
  chatsMap: Map<string, Chat[]>;
}

export default function DashboardClient({ children, users, chatsMap }: DashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [chatId, setChatId] = useState<string | null>(null);

  // Obtener ID del chat actual de la URL si estamos en una página de chat
  useEffect(() => {
    const regex = /\/dashboard\/chat\/([^\/]+)/;
    const match = pathname?.match(regex);
    if (match) {
      setChatId(match[1]);
    } else {
      setChatId(null);
    }
  }, [pathname]);
  
  // Manejar la selección de un chat
  const handleSelectChat = (chatId: string) => {
    setChatId(chatId);
    router.push(`/dashboard/chat/${chatId}`);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar principal de navegación - fijo en desktop con animación */}
      <div className="w-16 h-full shrink-0 border-r bg-background transition-all duration-300 ease-in-out">
        <SidebarNav pathname={pathname} />
      </div>
      
      {/* Sidebar de usuarios y chats - con animación de entrada/salida */}
      <div 
        className={`h-full shrink-0 border-r bg-background overflow-hidden transition-all duration-300 ease-in-out ${pathname?.includes('/dashboard/chat') 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 -translate-x-full w-0 border-r-0'}`}
      >
        {pathname?.includes('/dashboard/chat') && (
          <UserChats
            users={users}
            chatsMap={chatsMap}
            onSelectChat={handleSelectChat}
            defaultSelectedChatId={chatId}
            isMobileView={false}
          />
        )}
      </div>

      {/* Contenido principal con animación */}
      <div className="flex-1 overflow-auto bg-background transition-all duration-300 ease-in-out">
        <div 
          className="max-w-4xl mx-auto px-4  transition-all duration-300 ease-in-out opacity-100"
        >
          <SidebarProvider>
            <SidebarInset>
            {children}
            </SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    </div>
  );
}
