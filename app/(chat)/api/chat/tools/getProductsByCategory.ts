import { Jumpseller } from "@/jumpseller";
import { Product, ProductResponse } from "@/jumpseller/types";
import { tool } from "ai";
import { z } from "zod";

export const getProductsByCategory = tool({
    description: "Get products by category with pagination (4 products per page)",
    parameters: z.object({
        categoryId: z
          .number()
          .describe("The category ID to get the products from"),
        page: z
          .number()
          .default(1)
          .describe("Page number (starts at 1, shows 4 products per page)"),
      }),
      execute: async ({ categoryId, page = 1 }) => {
        console.log(`🔧 getProductsByCategory started for category: ${categoryId}, page: ${page}`);
        
        try {
          const allProducts = await Jumpseller.getProductsByCategory(categoryId);
          
          // Paginación: 4 productos por página
          const productsPerPage = 4;
          const startIndex = (page - 1) * productsPerPage;
          const endIndex = startIndex + productsPerPage;
          const paginatedProducts = allProducts.slice(startIndex, endIndex);
          
          const totalPages = Math.ceil(allProducts.length / productsPerPage);
          const hasMorePages = page < totalPages;
          
          console.log(`✅ getProductsByCategory completed: ${paginatedProducts.length} products (page ${page}/${totalPages})`);
          console.log('📊 Sample product data:', paginatedProducts[0] ? {
            id: paginatedProducts[0].id,
            name: paginatedProducts[0].name,
            price: paginatedProducts[0].price,
            hasImages: !!paginatedProducts[0].images
          } : 'No products');
      
          return {
            success: true,
            products: paginatedProducts,
            pagination: {
              currentPage: page,
              totalPages,
              totalProducts: allProducts.length,
              hasMorePages,
              productsPerPage
            },
            message: `Página ${page}/${totalPages} - ${paginatedProducts.length} productos mostrados de ${allProducts.length} total`,
          };
        } catch (error) {
          console.error("❌ Error fetching products by category:", error);
          
          // Mensaje más específico para timeout
          const errorMessage = error instanceof Error && error.message.includes('Timeout') 
            ? "La búsqueda de productos está tardando demasiado. Por favor, intenta con una categoría más específica."
            : error instanceof Error 
              ? error.message 
              : "Error al obtener los productos de la categoría";
          
          return {
            success: false,
            error: errorMessage,
          };
        }
      },
})