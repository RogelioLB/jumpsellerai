'use server';

import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './components/dashboard-client';
import { getUsersAndChats } from '@/lib/data';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '../(auth)/auth';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  
  if (session?.user.type==="guest" || !session) {
    redirect('/login');
  }
  
  if(session?.user.type !=="admin"){
    return <div>Unauthorized</div>
  }

  // Obtener datos del servidor usando la función que conecta con la base de datos
  const { users, chatsMap } = await getUsersAndChats();
  
  return (
    <DashboardClient
      users={users}
      chatsMap={chatsMap}
    >
      {children}
    </DashboardClient>
  );
}
