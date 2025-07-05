import { tool } from "ai";
import { z } from "zod";
import { Jumpseller } from "@/jumpseller";

export default tool({
  description: "Find a customer by their email address to get their orders",
  parameters: z.object({
    email: z.string().describe("The customer email address"),
  }),
  execute: async ({ email }) => {
    try {
      const result = await Jumpseller.getCustomerByEmail(email);

      if (result.success && result.customer) {
        return {
          success: true,
          customer: result.customer,
          render: {
            type: "customer",
            data: result.customer,
          },
        };
      } else {
        return {
          success: false,
          error:
            result.error ||
            "No se encontró ningún cliente con este correo electrónico",
        };
      }
    } catch (error) {
      console.error("Error finding customer:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Error al buscar el cliente",
      };
    }
  },
});
