import { tool } from "ai";
import { z } from "zod";
import { Jumpseller } from "@/jumpseller";

export default tool({
  description: "Get all available store discounts",
  parameters: z.object({}),
  execute: async () => {
    const promotions = await Jumpseller.getPromotions();
    console.log(promotions);
    return { promotions };
  },
});
