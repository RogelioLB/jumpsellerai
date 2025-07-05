import { tool } from "ai";
import { z } from "zod";
import { Jumpseller } from "@/jumpseller";

export default tool({
  description:
    "Get all the products from the store execute always when you need to show a list of products",
  parameters: z.object({
    page: z
      .number()
      .default(1)
      .describe("The page number to get the products from (default: 1)"),
  }),
  execute: async ({ page }) => {
    try {
      const result = await Jumpseller.getProducts({ page });
      const mapped = result.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        categories: product.categories.map((category) => category.name),
      }));
      return { products: mapped, page, success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al obtener los productos",
      };
    }
  },
});
