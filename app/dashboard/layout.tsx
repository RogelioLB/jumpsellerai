'use server';

import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './components/dashboard-client';
import { getUsersAndChats } from '@/lib/data';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Verificar autenticación (ejemplo básico - implementar según necesidades)
  // En este caso omitimos la verificación de JWT para simplificar
  const cookieStore = await cookies();
  
  // Comentamos la verificación del token ya que no tenemos la implementación de JWT
  // Si necesitas agregar autenticación real, descomenta e implementa estas líneas
  /*
  const token = cookieStore.get('token');
  if (!token) {
    redirect('/login');
  }
  */
  
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
