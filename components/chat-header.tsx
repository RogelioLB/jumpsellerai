'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon, VercelIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { type VisibilityType, VisibilitySelector } from './visibility-selector';
import type { Session } from 'next-auth';
import { ShoppingCartIcon } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useCartSidebar } from '@/store/useCartSidebar';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
}) {
  const router = useRouter();
  const { open: sidebarOpen } = useSidebar();
  const { items } = useCart();
  const { open: openCart } = useCartSidebar()

  const { width: windowWidth } = useWindowSize();

  return (
    <header className="flex sticky justify-between top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <div className="flex items-center gap-2">
        {!isReadonly && (
        <SidebarToggle />
        )}
        {(!sidebarOpen || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}


      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3"
        />
      )}
      </div>

      {!isReadonly && (
        <Button
          variant="outline"
          className="order-1 md:order-4 relative"
          onClick={() => openCart()}
      >
        <ShoppingCartIcon />
        {items.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 bg-primary text-primary-foreground rounded-full size-5" >{items.length}</span>
        )}
      </Button>
    )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
