import { Jumpseller } from "@/jumpseller";
import { tool } from "ai";
import { z } from "zod";

export const getCategories = tool({
    description: "Get all the categories from the store",
    parameters: z.object({}),
    execute: async () => {
        const categories = await Jumpseller.getCategories();
        return categories;
    },
})