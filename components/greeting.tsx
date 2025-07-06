import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { useEffect } from 'react';

export const Greeting = () => {
  return (
    <div
    id='greeting'
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-semibold mb-2"
      >
        ¡Hola! Bienvenido a Jumpseller AI
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-lg text-zinc-500 mb-3"
      >
        ¿En qué puedo ayudarte hoy?
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.7 }}
        className="bg-blue-950 text-white p-4 rounded-lg mb-2"
      >
        <h2 className="text-base font-semibold mb-3">Rastreo de Pedidos</h2>
        <p className="mb-4 text-sm">Para rastrear tu pedido, puedes:</p>
        <ul className="list-disc pl-6 space-y-2  text-xs">
          <li>Proporcionar tu número de seguimiento directamente</li>
          <li>Compartir tu correo electrónico para ver todos tus pedidos y seleccionar cuál rastrear</li>
        </ul>
      </motion.div>
    </div>
  );
};
