import { Product } from "@/jumpseller/types";
import Image from "next/image";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "@/store/useCart";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Products({ result }: { result: Product[] }) {
    const { addItem } = useCart();
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Validar y asegurar que result sea un array
    const products = Array.isArray(result) ? result : [];
    
    // Formateo de precio en formato CLP
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount);
    };
    
    // Mensaje cuando no hay productos
    if (products.length === 0) {
        return <div className="text-center p-2">No se encontraron productos</div>;
    }

    // Limitar a 4 productos para la vista inicial
    const previewProducts = products.slice(0, 4);
    
    // Definir animación de variantes
    const variants = {
        collapsed: {
            height: 0,
            opacity: 0,
            marginTop: 0,
            marginBottom: 0
        },
        expanded: {
            height: 'auto',
            opacity: 1,
            marginTop: '0.5rem',
            marginBottom: '0.5rem'
        }
    };
    
    // Componente de tarjeta de producto (reutilizado en vista previa y expandida)
    const ProductCard = ({ product }: { product: Product }) => {
        const [currentImageIndex, setCurrentImageIndex] = useState(0);
        const images = product.images || [];
        const hasMultipleImages = images.length > 1;

        // Navegar a la imagen anterior
        const prevImage = () => {
            setCurrentImageIndex(prev => 
                prev === 0 ? images.length - 1 : prev - 1
            );
        };

        // Navegar a la siguiente imagen
        const nextImage = () => {
            setCurrentImageIndex(prev => 
                prev === images.length - 1 ? 0 : prev + 1
            );
        };

        return (
            <Card className="overflow-hidden flex flex-col h-full max-w-full">
                <CardHeader className="p-2">
                    <CardTitle className="line-clamp-2 text-sm">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-2">
                    <div className="relative w-full aspect-square mb-2 group">
                        <AnimatePresence initial={false} mode="wait">
                            <motion.div 
                                key={currentImageIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0"
                            >
                                <Image 
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    src={images[currentImageIndex]?.url || '/placeholder.jpg'} 
                                    alt={`${product.name} - Imagen ${currentImageIndex + 1}`} 
                                    className="object-cover rounded-md bg-white w-full" 
                                    priority
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Controles de navegación del carrusel (solo visibles al hacer hover) */}
                        {hasMultipleImages && (
                            <>
                                <button 
                                    onClick={(e) => {e.preventDefault(); prevImage();}}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 p-[2px] rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    aria-label="Imagen anterior"
                                >
                                    <ChevronUp className="size-6 -rotate-90" />
                                </button>
                                <button 
                                    onClick={(e) => {e.preventDefault(); nextImage();}}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 p-[2px] rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    aria-label="Imagen siguiente"
                                >
                                    <ChevronDown className="size-6 -rotate-90" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Indicadores de posición del carrusel */}
                    {hasMultipleImages && (
                        <div className="flex gap-1 mt-1">
                            {images.map((_, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`size-1 rounded-full ${currentImageIndex === idx ? 'bg-primary' : 'bg-gray-500'}`}
                                    aria-label={`Ver imagen ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    <p className="text-xs sm:text-sm font-semibold mt-1 truncate w-full text-center">
                        {formatPrice(Number(product.price))}
                    </p>
                    <p className="text-xs sm:text-sm font-light mt-1 w-full line-clamp-4">
                        {//Remove all html tags
                        product.meta_description.replace(/<[^>]*>/g, '')}
                    </p>
                </CardContent>
                <CardFooter className="p-2 pt-0">
                    <Button 
                        className="w-full h-7 text-xs flex items-center justify-center gap-1" 
                        size="sm"
                        onClick={() => addItem({
                            id: product.id.toString(),
                            title: product.name,
                            price: {amount: Number(product.price), currencyCode: 'CLP'},
                            featuredImage: product.images?.[0]?.url || '/placeholder.jpg',
                        })}
                    >
                        <ShoppingCart size={12} />
                        <span className="truncate">Añadir</span>
                    </Button>
                </CardFooter>
            </Card>
        );
    };

    return (
        <div className="w-full max-w-full overflow-hidden">
            {/* Vista previa de productos (máximo 4) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-full">
                {previewProducts.map((product) => (
                    <div key={product.id} className="overflow-hidden">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
            
            {/* Botón para expandir/colapsar y mostrar todos los productos (si hay más de 4) */}
            {products.length > 4 && (
                <div className="w-full">
                    <Button 
                        variant="ghost" 
                        className="w-full mt-2 text-xs flex items-center justify-center gap-1" 
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <>
                                Ocultar productos
                                <ChevronUp size={14} className="ml-1" />
                            </>
                        ) : (
                            <>
                                Ver todos los productos ({products.length})
                                <ChevronDown size={14} className="ml-1" />
                            </>
                        )}
                    </Button>
                    
                    {/* Sección expandible con todos los productos */}
                    <AnimatePresence initial={false}>
                        {isExpanded && (
                            <motion.div
                                initial="collapsed"
                                animate="expanded"
                                exit="collapsed"
                                variants={variants}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                style={{ overflow: "hidden" }}
                                className="mt-2 border-t pt-2"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                    {/* Mostrar todos los productos excepto los primeros 4 que ya se muestran */}
                                    {products.slice(4).map((product) => (
                                        <div key={product.id} className="overflow-hidden">
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}