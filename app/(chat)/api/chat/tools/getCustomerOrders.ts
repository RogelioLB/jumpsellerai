import { tool } from "ai";
import { z } from "zod";
import { Jumpseller } from "@/jumpseller";

export default tool({
  description: "Get all orders for a customer that have tracking information",
  parameters: z.object({
    customerId: z.number().describe("The customer ID"),
  }),
  execute: async ({ customerId }) => {
    try {
      const result = await Jumpseller.getCustomerOrders(customerId);

      if (result.success) {
        if (result.orders && result.orders.length > 0) {
          return {
            success: true,
            orders: result.orders,
            render: {
              type: "orderSelector",
              data: {
                orders: result.orders,
              },
            },
          };
        } else {
          return {
            success: true,
            orders: [],
            message:
              "No se encontraron pedidos con información de seguimiento para este cliente. Por favor, verifica que el pedido haya sido enviado o intenta con otro correo electrónico.",
          };
        }
      } else {
        return {
          success: false,
          error:
            result.error || "No se pudieron obtener los pedidos del cliente",
        };
      }
    } catch (error) {
      console.error("Error getting customer orders:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al obtener los pedidos del cliente",
      };
    }
  },
});
