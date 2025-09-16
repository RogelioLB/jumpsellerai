import { Jumpseller } from "@/jumpseller";
import { Product, ProductResponse } from "@/jumpseller/types";
import { tool } from "ai";
import { z } from "zod";

export const getProductsByCategory = tool({
    description: "Get products by category",
    parameters: z.object({
        categoryId: z
          .number()
          .describe("The category ID to get the products from"),
      }),
      execute: async ({ categoryId }) => {
        const products = await Jumpseller.getProductsByCategory(categoryId);
        return products;
      },
})