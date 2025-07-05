import { tool } from "ai";
import { z } from "zod";
import { Jumpseller } from "@/jumpseller";

export default tool({
  description: "Search for products, use this to search products on the shop.",
  parameters: z.object({
    query: z.string().describe("The search query, this should be in spanish"),
    page: z
      .number()
      .default(1)
      .describe("The page number to get the products from"),
  }),
  execute: async ({ query, page = 1 }) => {
    try {
      let results = [];
      const result = await Jumpseller.searchProducts({ query, page });
      return { products: result, page, success: true };
    } catch (error) {
      console.error("Error searching products:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al buscar los productos",
      };
    }
  },
});
