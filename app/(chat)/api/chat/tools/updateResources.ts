import { tool } from "ai";
import { z } from "zod";
import { createResource } from "@/lib/ai/embedding";

export default tool({
  description: "Use this tool to add new resources to the database",
  parameters: z.object({
    title: z.string().describe("The title of the resource"),
    content: z.string().describe("The content of the resource"),
  }),
  execute: async ({ title, content }) => {
    try {
      const result = await createResource(title, content);
      return { resources: result, success: true };
    } catch (error) {
      console.error("Error updating resources:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al actualizar los recursos",
      };
    }
  },
});
