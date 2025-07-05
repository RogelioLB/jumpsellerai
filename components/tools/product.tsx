import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/store/useCart";
import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";

interface ProductImage {
  id: number;
  url: string;
  position: number;
}

interface ProductData {
  description: string;
  meta_description: string;
  name: string;
  price: number;
  images: ProductImage[];
  sku: string;
}

interface ProductProps {
  product: ProductData;
}

export default function Product({ product }: ProductProps) {
    console.log(product)
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images[0]?.url || "/placeholder.jpg"
  );
  const { addItem } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  const handleAddToCart = () => {
    addItem({
      id: product.sku,
      title: product.name,
      price: { amount: product.price, currencyCode: "CLP" },
      featuredImage: product.images[0]?.url || "/placeholder.jpg",
    });
  };

  return (
    <div className="space-y-8 pb-10">
      <Card className="overflow-hidden border-0 shadow-none">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(image.url)}
                      className={`relative size-16 border-2 rounded-md overflow-hidden shrink-0 
                        ${selectedImage === image.url ? "border-primary" : "border-gray-200"}`}
                    >
                      <Image
                        src={image.url}
                        alt={`${product.name} - Imagen ${image.position}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
                <p className="text-xl font-bold text-primary mt-2">
                  {formatPrice(product.price)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">SKU: {product.sku}</p>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleAddToCart} 
                  className="w-full md:w-auto"
                  size="lg"
                >
                  <ShoppingCart className="mr-2" size={18} />
                  Añadir al carrito
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Description */}
      <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert dark:text-white">
        <div 
          dangerouslySetInnerHTML={{ __html: product.description }} 
          className="dark:text-gray-200 [&_table]:dark:border-gray-700 [&_th]:dark:bg-gray-800 [&_th]:dark:text-white [&_td]:dark:border-gray-700 [&_h1]:dark:text-white [&_h2]:dark:text-white [&_h3]:dark:text-white [&_strong]:dark:text-white [&_p]:dark:text-gray-300 [&_li]:dark:text-gray-300"
        />
      </div>
    </div>
  );
}
