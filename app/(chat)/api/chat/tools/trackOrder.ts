import { tool } from "ai";
import { z } from "zod";
import { BlueExpress } from "@/blueexpress";

export default tool({
  description: "Track an order using BlueExpress Chile's tracking service",
  parameters: z.object({
    trackingNumber: z
      .string()
      .describe("The tracking number or order number provided by BlueExpress"),
  }),
  execute: async ({ trackingNumber }) => {
    try {
      const result = await BlueExpress.trackOrder({ trackingNumber });
      return result;
    } catch (error) {
      console.error("Error tracking order:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Error al buscar el pedido",
      };
    }
  },
});
