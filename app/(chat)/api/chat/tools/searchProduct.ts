import { Jumpseller } from "@/jumpseller";
import { tool } from "ai";
import { z } from "zod";

export default tool({
  description:
    "Search for a product, use this to show the info of the product on a card ui, use it when the user want to know about a product, if the user wants to know again, use it again.",
  parameters: z.object({
    id: z.number().describe("The product id"),
  }),
  execute: async ({ id }) => {
    try {
      const {description,meta_description,name,price,images,sku} = await Jumpseller.getProduct(id);
      console.log(description,meta_description,name,price,images,sku)
      return { product: {description,meta_description,name,price,images,sku}, success: true };
    } catch (error) {
      console.error("Error getting product:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al obtener el producto",
      };
    }
  },
});
