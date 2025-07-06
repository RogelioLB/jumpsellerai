'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
  selectedVisibilityType: VisibilityType;
}

function PureSuggestedActions({
  chatId,
  append,
  selectedVisibilityType,
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'Rastreo de pedidos',
      label: '¿Cómo puedo rastrear mi pedido?',
      action: '¿Cómo puedo rastrear mi pedido?',
    },
    {
      title: 'Estoy buscando una camara',
      label: `¿Cuál es la mejor camara para mi necesidad?`,
      action: `¿Cuál es la mejor camara para mi necesidad?`,
    },
    {
      title: 'Productos disponibles',
      label: `¿Cuáles productos tienes disponibles?`,
      action: `¿Cuáles productos tienes disponibles?`,
    },
    {
      title: 'Promociones',
      label: '¿Cuáles promociones tienes disponibles?',
      action: '¿Cuáles promociones tienes disponibles?',
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid grid-cols-2 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 flex-col w-full h-auto justify-start items-start"
          >
            <span className="text-muted-foreground text-balance text-xs sm:text-sm">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  },
);
