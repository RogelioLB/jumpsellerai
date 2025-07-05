import { tool } from "ai";
import { z } from "zod";
import { retrieveContext } from "../embeddings";

export const getContext = tool({
    description: 'Get context from any question or query of the user, for example "Politicas de envio"',
    parameters: z.object({
      query: z.string(),
    }),
    execute: async ({ query }) => {
        console.log(query)
        const context = await retrieveContext(query);
        console.log(context)
        return context;
    },
  });