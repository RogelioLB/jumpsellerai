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
      {/* Sidebar principal de navegación - fijo en desktop */}
      <div className="w-16 h-full shrink-0 border-r bg-background">
        <SidebarNav pathname={pathname} />
      </div>
      
      {/* Sidebar de usuarios y chats - visible solo en rutas de chat */}
      {pathname?.includes('/dashboard/chat') && (
        <div className="h-screen shrink-0 border-r bg-background overflow-hidden">
          <UserChats
            users={users}
            chatsMap={chatsMap}
            onSelectChat={handleSelectChat}
            defaultSelectedChatId={chatId}
            isMobileView={false}
          />
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto bg-background">
        <div className="max-w-4xl mx-auto px-4">
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
