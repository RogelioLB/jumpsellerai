import { tool } from "ai";
import { z } from "zod";

export default tool({
  description: "🚨 OBLIGATORIO: Ejecutar SIEMPRE después de getProductsByCategory o searchProducts. Sin esta herramienta los productos NO se muestran al usuario.",
  parameters: z.object({
    products: z.any().describe("Array of products from search results"),
    searchQuery: z.string().describe("The original search query from the user"),
    context: z.string().describe("Additional context about the search or user intent"),
  }),
  execute: async ({ products, searchQuery, context }) => {
    console.log('🔧 generateProductsDisplay INICIADO:', { searchQuery, productsCount: products?.length });
    try {
      // Validación inmediata
      if (!products) {
        console.log('⚠️ No se recibieron productos');
        return {
          success: false,
          error: 'No se recibieron productos para procesar'
        };
      }

      // Simplemente pasar los productos tal como vienen
    const productArray = Array.isArray(products) ? products : [];
    console.log('📦 Products to process:', productArray.length);
    
    const result = {
      success: true,
      displayObject: {
        type: "products_display",
        data: {
          products: productArray,
          searchQuery,
          context,
          totalCount: productArray.length,
          metadata: {
            generatedAt: new Date().toISOString(),
            hasResults: productArray.length > 0,
          }
        }
      },
      productsCount: productArray.length,
      message: `Found ${productArray.length} products`
    };
    
    console.log('✅ generateProductsDisplay SUCCESS - returning result');
    return result;
      
    } catch (error) {
      console.error('❌ Error en generateProductsDisplay:', error);
      return {
        success: false,
        error: 'Error al procesar productos'
      };
    }
  },
});
