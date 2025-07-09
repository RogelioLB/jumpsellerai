'use client';

import Link from 'next/link';
import { MessagesSquare, HelpCircle, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarNavProps {
  pathname: string;
}

export default function SidebarNav({ pathname }: SidebarNavProps) {
  // Define las opciones de navegación
  const navItems = [
    {
      icon: <MessagesSquare size={20} />,
      label: 'Conversaciones',
      href: '/dashboard/chat',
      active: pathname.includes('/dashboard/chat')
    },
  ];

  return (
    <div className="w-16 h-screen flex flex-col justify-between border-r bg-background dark:bg-background">
      {/* Logo */}
      <div className="w-full flex text-black justify-center py-6">
        <Link href="/dashboard">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-black font-bold">
            K
          </div>
        </Link>
      </div>
      
      {/* Navegación principal */}
      <div className="flex-1 flex flex-col items-center pt-2 space-y-4">
        {navItems.map((item) => (
          <TooltipProvider key={item.href} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={item.href}>
                  <Button
                    variant={item.active ? "secondary" : "ghost"}
                    size="icon"
                    className={cn(
                      "size-10 rounded-lg",
                      item.active && "bg-slate-200 dark:bg-slate-800"
                    )}
                  >
                    {item.icon}
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" align="start" alignOffset={15}>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}
