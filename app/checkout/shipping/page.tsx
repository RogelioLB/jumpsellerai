'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/useCart';
import { ShippingMethod } from '@/jumpseller/types';
import { CartItem } from '@/store/cartStore';
import { ArrowLeft, ArrowRight, MapPin, Truck, Package, Check } from 'lucide-react';

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
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh] bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando métodos de envío...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-6 py-4 rounded-lg shadow-md" role="alert">
            <h2 className="font-bold text-lg mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Error al cargar métodos de envío
            </h2>
            <p className="mb-4">{error}</p>
            <button 
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              onClick={() => router.push('/checkout/contact')}
            >
              <ArrowLeft className="mr-2" /> Volver a información de contacto
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-100">
      <div className="max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-sm mt-2">Contacto</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-blue-600">
              <div className="h-full w-full bg-blue-600"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                2
              </div>
              <span className="text-sm mt-2">Envío</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-300 dark:bg-gray-700">
              <div className="h-full w-0 bg-blue-600"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400">
                3
              </div>
              <span className="text-sm mt-2">Pago</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">Método de Envío</h1>
        
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md">
          {contactData && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-2 flex items-center">
                <MapPin className="mr-2" /> Dirección de Envío
              </h2>
              <p className="mb-1"><span className="font-medium">{contactData.name} {contactData.surname}</span></p>
              <p className="mb-1">{contactData.address}</p>
              <p className="mb-1">{municipalityName || contactData.municipality}, {contactData.city}</p>
              <p className="mb-1">{regionName || contactData.region}, Chile</p>
              <button 
                onClick={() => router.push('/checkout/contact')}
                className="mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center"
              >
                <ArrowLeft className="mr-1" /> Editar información
              </button>
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Truck className="mr-2" /> Selecciona un método de envío
            </h2>
            
            {shippingMethods.length === 0 ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-700 dark:text-yellow-200">
                <p className="flex items-center">
                  <Package className="mr-2" />
                  No hay métodos de envío disponibles para tu ubicación.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {shippingMethods.map((method) => (
                  <div 
                    key={method.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedMethod === method.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id={`method-${method.id}`}
                        name="shipping-method"
                        checked={selectedMethod === method.id}
                        onChange={() => setSelectedMethod(method.id)}
                        className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`method-${method.id}`} className="flex-grow cursor-pointer">
                        <div className="flex justify-between">
                          <span className="font-medium">{method.name}</span>
                          <span className="font-semibold">
                            {method.free_shipping ? 'Gratis' : (method.fee && method.fee.length > 0 ? `$${method.fee[0].value.toLocaleString()}` : 'Consultar')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => router.push('/checkout/contact')}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
            >
              <ArrowLeft className="mr-2" /> Volver
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedMethod || shippingMethods.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              Continuar a Pago <ArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
