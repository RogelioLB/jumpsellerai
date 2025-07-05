import { tool } from "ai";
import { z } from "zod";
import { searchRelevantResources } from "@/lib/ai/embedding";

export default tool({
  description:
    "Use this tool to search for information that you have added to the database",
  parameters: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    try {
      const result = await searchRelevantResources(query, 30);
      console.log(result);
      return { resources: result, success: true };
    } catch (error) {
      console.error("Error searching relevant information:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al buscar información relevante",
      };
    }
  },
});
