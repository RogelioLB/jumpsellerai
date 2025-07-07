'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/useCart';
import { ShippingMethod } from '@/jumpseller/types';
import { CartItem } from '@/store/cartStore';
import { ArrowLeft, ArrowRight, MapPin, Truck, Package, Check, User, ShoppingBag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

interface ContactData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
  municipality: string;
  region: string;
}

interface Region {
  code: string;
  name: string;
}

interface Municipality {
  code: string;
  name: string;
}

export default function ShippingPage() {
  const router = useRouter();
  const { items } = useCart();
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regionName, setRegionName] = useState<string>("");
  const [municipalityName, setMunicipalityName] = useState<string>("");

  const subtotal = items.reduce((total: number, item: CartItem) => total + (item.price.amount * item.quantity), 0);

  useEffect(() => {
    // Redirect to contact page if contact information is not available
    const storedContact = sessionStorage.getItem('checkoutContact');
    if (!storedContact) {
      router.push('/checkout/contact');
      return;
    }

    const parsedContact = JSON.parse(storedContact) as ContactData;
    setContactData(parsedContact);

    // Fetch shipping methods
    const fetchShippingMethods = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/jumpseller/shipping?region=${parsedContact.region}&municipality=${encodeURIComponent(parsedContact.municipality)}`);
        
        if (!response.ok) {
          throw new Error('Error al obtener métodos de envío');
        }
        
        const data = await response.json();
        
        if (data.shippingMethods) {
          // Filter out methods with free_shipping_minimum_purchase requirement that isn't met
          const filteredMethods = data.shippingMethods.filter((method: ShippingMethod) => 
            !method.free_shipping_minimum_purchase || (typeof method.free_shipping_minimum_purchase === 'number' && subtotal >= method.free_shipping_minimum_purchase)
          );
          
          setShippingMethods(filteredMethods);
          
          // Select the first method by default
          if (filteredMethods.length > 0) {
            setSelectedMethod(filteredMethods[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching shipping methods:', error);
        setError(error instanceof Error ? error.message : 'Error al obtener métodos de envío');
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch region and municipality names
    const fetchRegionName = async () => {
      try {
        const response = await fetch('/api/jumpseller/regions');
        const data = await response.json();
        if (data.regions) {
          const region = data.regions.find((r: Region) => r.code === parsedContact.region);
          if (region) {
            setRegionName(region.name);
          }
        }
      } catch (error) {
        console.error('Error fetching region name:', error);
      }
    };

    const fetchMunicipalityName = async () => {
      try {
        const response = await fetch(`/api/jumpseller/municipalities?region=${parsedContact.region}`);
        const data = await response.json();
        if (data.municipalities) {
          const municipality = data.municipalities.find((m: Municipality) => m.code === parsedContact.municipality);
          if (municipality) {
            setMunicipalityName(municipality.name);
          }
        }
      } catch (error) {
        console.error('Error fetching municipality name:', error);
      }
    };

    fetchShippingMethods();
    fetchRegionName();
    fetchMunicipalityName();
  }, [router, subtotal]);

  const handleContinue = () => {
    if (!selectedMethod) {
      alert('Por favor selecciona un método de envío');
      return;
    }

    // Store selected shipping method in session storage
    const selectedShippingMethod = shippingMethods.find(method => method.id === selectedMethod);
    if (selectedShippingMethod) {
      sessionStorage.setItem('checkoutShipping', JSON.stringify(selectedShippingMethod));
      router.push('/checkout/payment');
    }
  };

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-8 text-center">Checkout</h1>
          
          {/* Progress Steps */}
          <Card className="mb-8">
            <CardContent>
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col items-center">
                  <div className="size-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                    1
                  </div>
                  <span className="text-sm mt-2">Contacto</span>
                </div>
                <div className="flex-1 h-1 mx-4 bg-primary">
                  <div className="size-full bg-primary"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="size-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                    2
                  </div>
                  <span className="text-sm mt-2">Envío</span>
                </div>
                <div className="flex-1 h-1 mx-4 bg-muted"></div>
                <div className="flex flex-col items-center">
                  <div className="size-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                    3
                  </div>
                  <span className="text-sm mt-2">Pago</span>
                </div>
              </div>
            </CardContent>
          </Card>


          
          {/* Skeleton loaders */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="animate-pulse">
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="border border-gray-200 dark:border-gray-700">
                    <div className="p-4 flex items-center animate-pulse">
                      <div className="size-5 rounded-full bg-gray-300 dark:bg-gray-600 mr-3"></div>
                      <div className="space-y-2 grow">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-100">
        <div className="max-w-3xl mx-auto">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-400 flex items-center">
                <svg className="size-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Error al cargar métodos de envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{error}</p>
              <Button 
                variant="destructive"
                onClick={() => router.push('/checkout/contact')}
              >
                <ArrowLeft className="mr-2" /> Volver a información de contacto
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-100">
      <div className="max-w-3xl mx-auto">
        {/* Progress Steps */}
        {/* Progress Steps */}
        <Card className="mb-8">
            <CardContent>
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col items-center">
                  <div className="size-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                    1
                  </div>
                  <span className="text-sm mt-2">Contacto</span>
                </div>
                <div className="flex-1 h-1 mx-4 bg-primary">
                  <div className="size-full bg-primary"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="size-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                    2
                  </div>
                  <span className="text-sm mt-2">Envío</span>
                </div>
                <div className="flex-1 h-1 mx-4 bg-muted"></div>
                <div className="flex flex-col items-center">
                  <div className="size-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                    3
                  </div>
                  <span className="text-sm mt-2">Pago</span>
                </div>
              </div>
            </CardContent>
          </Card>

        <h1 className="text-2xl font-bold mb-6 text-center">Método de Envío</h1>
        
        {/* Main Content */}
        <div className="space-y-6">
          {/* Contact Summary */}
          {contactData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center">
                  <MapPin className="mr-2" /> Dirección de contacto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">{contactData?.name} {contactData?.surname}</p>
                    <p className="text-muted-foreground">{contactData?.email}</p>
                    <p className="text-muted-foreground">{contactData?.phone}</p>
                  </div>
                  <div>
                    <p className="font-medium">{contactData?.address}</p>
                    <p className="text-muted-foreground">{regionName}, {municipalityName}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary hover:text-primary"
                    onClick={() => router.push('/checkout/contact')}
                  >
                    Editar información
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Shipping Method Selection */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-4">
                  <Truck size={20} />
                </div>
                <CardTitle>Selecciona un método de envío</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {shippingMethods.length === 0 ? (
                <Card className="border-yellow-200 dark:border-yellow-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-200">
                      <Package className="size-5" />
                      <p className="font-medium">No hay métodos de envío disponibles para tu ubicación.</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Por favor revisa la dirección ingresada o contacta al administrador para obtener ayuda.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <div 
                      key={method.id}
                      className={`border rounded-md p-4 cursor-pointer transition-all ${
                        selectedMethod === method.id 
                          ? 'border-primary ring-1 ring-primary' 
                          : 'border-input hover:border-muted-foreground'
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <div className="flex items-center">
                        <div className="shrink-0 mr-3">
                          <div className={`size-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id ? 'border-primary' : 'border-muted-foreground'}`}>
                            {selectedMethod === method.id && (
                              <div className="size-3 rounded-full bg-primary"></div>
                            )}
                          </div>
                          <input
                            type="radio"
                            id={`method-${method.id}`}
                            name="shipping-method"
                            checked={selectedMethod === method.id}
                            onChange={() => setSelectedMethod(method.id)}
                            className="sr-only"
                          />
                        </div>
                        
                        <label htmlFor={`method-${method.id}`} className="grow cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{method.name}</span>
                            <span className={`font-medium ${method.free_shipping ? 'text-green-600 dark:text-green-400' : ''}`}>
                              {method.free_shipping ? 'Gratis' : (method.fee && method.fee.length > 0 ? `$${method.fee[0].value.toLocaleString()}` : 'Consultar')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {method.services && method.services.length > 0 
                              ? `Servicio: ${method.services[0].original_service_name || method.services[0].service_name || method.services[0].name || method.type}`
                              : `Tipo: ${method.type}`}
                          </p>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-8 flex justify-between space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push('/checkout/contact')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Volver a contacto
            </Button>
            
            <Button
              onClick={handleContinue}
              disabled={!selectedMethod || isLoading}
              className="flex items-center gap-2"
            >
              Continuar a pago <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
