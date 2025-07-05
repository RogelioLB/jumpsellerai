'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/useCart';
import { ShippingMethod } from '@/jumpseller/types';
import { CartItem } from '@/store/cartStore';
import { ArrowLeft, ArrowRight, MapPin, Truck, CreditCard, User, Home, Phone, Mail, FileText, Check } from 'lucide-react';

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

interface BillingData {
  name: string;
  surname: string;
  taxid: string;
  address: string;
  city: string;
  postal: string;
  municipality: string;
  region: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingData, setBillingData] = useState<BillingData>({
    name: '',
    surname: '',
    taxid: '',
    address: '',
    city: '',
    postal: '',
    municipality: '',
    region: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<{code: string, name: string}[]>([]);
  const [municipalities, setMunicipalities] = useState<{code: string, name: string}[]>([]);
  const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(false);
  const [regionName, setRegionName] = useState<string>("");
  const [municipalityName, setMunicipalityName] = useState<string>("");

  const subtotal = items.reduce((total: number, item: CartItem) => total + (item.price.amount * item.quantity), 0);
  
  // Calculate shipping cost based on the new structure
  const shipping = shippingMethod?.free_shipping 
    ? 0 
    : (shippingMethod?.fee && shippingMethod.fee.length > 0) 
      ? shippingMethod.fee[0].value 
      : 0;
      
  const total = subtotal + shipping;

  useEffect(() => {
    // Redirect to contact page if contact information is not available
    const storedContact = sessionStorage.getItem('checkoutContact');
    const storedShipping = sessionStorage.getItem('checkoutShipping');
    
    if (!storedContact || !storedShipping) {
      router.push('/checkout/contact');
      return;
    }

    const parsedContact = JSON.parse(storedContact) as ContactData;
    const parsedShipping = JSON.parse(storedShipping) as ShippingMethod;
    
    setContactData(parsedContact);
    setShippingMethod(parsedShipping);
    
    // Initialize billing data with contact data
    setBillingData({
      name: parsedContact.name,
      surname: parsedContact.surname,
      taxid: '',
      address: parsedContact.address,
      city: parsedContact.city,
      postal: parsedContact.postal,
      municipality: parsedContact.municipality,
      region: parsedContact.region
    });

    // Fetch regions
    const fetchRegions = async () => {
      try {
        const response = await fetch('/api/jumpseller/regions');
        const data = await response.json();
        if (data.regions) {
          setRegions(data.regions);
          
          // Find region name
          const region = data.regions.find((r: {code: string, name: string}) => r.code === parsedContact.region);
          if (region) {
            setRegionName(region.name);
          }
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    };

    // Fetch municipality name
    const fetchMunicipalityName = async () => {
      try {
        const response = await fetch(`/api/jumpseller/municipalities?region=${parsedContact.region}`);
        const data = await response.json();
        if (data.municipalities) {
          const municipality = data.municipalities.find((m: {code: string, name: string}) => m.code === parsedContact.municipality);
          if (municipality) {
            setMunicipalityName(municipality.name);
          }
        }
      } catch (error) {
        console.error('Error fetching municipality name:', error);
      }
    };

    fetchRegions();
    fetchMunicipalityName();
  }, [router]);

  useEffect(() => {
    // Fetch municipalities when region changes
    const fetchMunicipalities = async () => {
      if (!billingData.region) {
        setMunicipalities([]);
        return;
      }

      try {
        setIsLoadingMunicipalities(true);
        const response = await fetch(`/api/jumpseller/municipalities?region=${billingData.region}`);
        const data = await response.json();
        if (data.municipalities) {
          setMunicipalities(data.municipalities);
        }
      } catch (error) {
        console.error('Error fetching municipalities:', error);
      } finally {
        setIsLoadingMunicipalities(false);
      }
    };

    if (!sameAsShipping) {
      fetchMunicipalities();
    }
  }, [billingData.region, sameAsShipping]);

  const handleBillingChange = (field: keyof BillingData, value: string) => {
    setBillingData({
      ...billingData,
      [field]: value,
      // Reset municipality when region changes
      ...(field === 'region' ? { municipality: '' } : {})
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactData || !shippingMethod) {
      setError('Información de contacto o envío no disponible');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const orderData = {
        customer: {
          name: contactData.name,
          surname: contactData.surname,
          email: contactData.email,
          phone: contactData.phone
        },
        shipping_address: {
          address: contactData.address,
          city: contactData.city,
          postal: contactData.postal,
          municipality: contactData.municipality,
          region: contactData.region
        },
        billing_address: sameAsShipping
          ? {
              name: contactData.name,
              surname: contactData.surname,
              taxid: billingData.taxid,
              address: contactData.address,
              city: contactData.city,
              postal: contactData.postal,
              municipality: contactData.municipality,
              region: contactData.region
            }
          : billingData,
        same_as_shipping: sameAsShipping,
        items,
        shipping_method_id: shippingMethod.id,
        shipping_method_name: shippingMethod.name,
        shipping_price: shipping
      };
      
      const response = await fetch('/api/jumpseller/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el pago');
      }
      
      const data = await response.json();
      
      if (data.success && data.order) {
        // Clear cart and stored checkout data
        clearCart();
        sessionStorage.removeItem('checkoutContact');
        sessionStorage.removeItem('checkoutShipping');
        
        // Redirect to success page or Jumpseller checkout
        if (data.order.checkout_url) {
          window.location.href = data.order.checkout_url;
        } else {
          alert('¡Orden creada con éxito!');
          router.push('/');
        }
      } else {
        throw new Error(data.error || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setError(error instanceof Error ? error.message : 'Error al procesar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-100">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Tu carrito está vacío</h1>
          <p className="text-lg mb-8">Necesitas agregar productos a tu carrito antes de proceder con el pago.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="mr-2" /> Ir a la tienda
          </button>
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
                <Check className="w-5 h-5" />
              </div>
              <span className="text-sm mt-2">Envío</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-blue-600">
              <div className="h-full w-full bg-blue-600"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                3
              </div>
              <span className="text-sm mt-2">Pago</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">Resumen y Pago</h1>
        
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {contactData && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                      <MapPin className="mr-2" /> Dirección de Envío
                    </h2>
                    <button 
                      onClick={() => router.push('/checkout/contact')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center"
                    >
                      <ArrowLeft className="mr-1" /> Editar
                    </button>
                  </div>
                  <p className="mb-1"><span className="font-medium">{contactData.name} {contactData.surname}</span></p>
                  <p className="mb-1">{contactData.address}</p>
                  <p className="mb-1">{municipalityName || contactData.municipality}, {contactData.city}</p>
                  <p className="mb-1">{regionName || contactData.region}, Chile</p>
                  <p className="mb-1 flex items-center"><Mail className="mr-1" /> {contactData.email}</p>
                  <p className="mb-1 flex items-center"><Phone className="mr-1" /> {contactData.phone}</p>
                </div>
              )}
              
              {shippingMethod && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                      <Truck className="mr-2" /> Método de Envío
                    </h2>
                    <button 
                      onClick={() => router.push('/checkout/shipping')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center"
                    >
                      <ArrowLeft className="mr-1" /> Editar
                    </button>
                  </div>
                  <p className="font-medium">{shippingMethod.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {shippingMethod.services && shippingMethod.services.length > 0 
                      ? `Servicio: ${shippingMethod.services[0].original_service_name || shippingMethod.services[0].service_name || shippingMethod.services[0].name || shippingMethod.type}`
                      : `Tipo: ${shippingMethod.type}`}
                  </p>
                  <p className="mt-1 font-semibold">
                    {shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString()}`}
                  </p>
                  <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-2 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-4 w-4 mr-1 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    El precio final del envío se calculará en la pasarela de pago.
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6 p-4 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <FileText className="mr-2" /> Información de Facturación
                  </h2>
                  
                  <div className="mb-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsShipping}
                        onChange={() => setSameAsShipping(!sameAsShipping)}
                        className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span>Usar la misma dirección de envío</span>
                    </label>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="taxid" className="text-sm font-medium mb-1 flex items-center">
                      <User className="mr-1" /> RUT (para factura)
                    </label>
                    <input
                      type="text"
                      id="taxid"
                      value={billingData.taxid}
                      onChange={(e) => handleBillingChange('taxid', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="12.345.678-9"
                    />
                  </div>
                  
                  {!sameAsShipping && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="billing-name" className="text-sm font-medium mb-1 flex items-center">
                          <User className="mr-1" /> Nombre
                        </label>
                        <input
                          type="text"
                          id="billing-name"
                          value={billingData.name}
                          onChange={(e) => handleBillingChange('name', e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                          placeholder="Nombre"
                        />
                      </div>
                      <div>
                        <label htmlFor="billing-surname" className="text-sm font-medium mb-1 flex items-center">
                          <User className="mr-1" /> Apellido
                        </label>
                        <input
                          type="text"
                          id="billing-surname"
                          value={billingData.surname}
                          onChange={(e) => handleBillingChange('surname', e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                          placeholder="Apellido"
                        />
                      </div>
                      <div>
                        <label htmlFor="billing-address" className="text-sm font-medium mb-1 flex items-center">
                          <Home className="mr-1" /> Dirección
                        </label>
                        <input
                          type="text"
                          id="billing-address"
                          value={billingData.address}
                          onChange={(e) => handleBillingChange('address', e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                          placeholder="Dirección"
                        />
                      </div>
                      <div>
                        <label htmlFor="billing-region" className="text-sm font-medium mb-1 flex items-center">
                          <MapPin className="mr-1" /> Región
                        </label>
                        <select
                          id="billing-region"
                          value={billingData.region}
                          onChange={(e) => handleBillingChange('region', e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="">Selecciona una región</option>
                          {regions.map((region) => (
                            <option key={region.code} value={region.code}>
                              {region.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="billing-municipality" className="text-sm font-medium mb-1 flex items-center">
                          <MapPin className="mr-1" /> Comuna
                        </label>
                        <select
                          id="billing-municipality"
                          value={billingData.municipality}
                          onChange={(e) => handleBillingChange('municipality', e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                          disabled={!billingData.region || isLoadingMunicipalities}
                        >
                          {isLoadingMunicipalities ? (
                            <option value="">Cargando comunas...</option>
                          ) : (
                            <>
                              <option value="">Selecciona una comuna</option>
                              {municipalities.map((municipality) => (
                                <option key={municipality.code} value={municipality.code}>
                                  {municipality.name}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="billing-city" className="text-sm font-medium mb-1 flex items-center">
                          <MapPin className="mr-1" /> Ciudad
                        </label>
                        <input
                          type="text"
                          id="billing-city"
                          value={billingData.city}
                          onChange={(e) => handleBillingChange('city', e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                          placeholder="Ciudad"
                        />
                      </div>
                      <div>
                        <label htmlFor="billing-postal" className="text-sm font-medium mb-1 flex items-center">
                          <MapPin className="mr-1" /> Código Postal (opcional)
                        </label>
                        <input
                          type="text"
                          id="billing-postal"
                          value={billingData.postal}
                          onChange={(e) => handleBillingChange('postal', e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Código Postal"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg">
                    <p className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => router.push('/checkout/shipping')}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
                  >
                    <ArrowLeft className="mr-2" /> Volver
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      <>
                        Finalizar Compra <ArrowRight className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sticky top-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <CreditCard className="mr-2" /> Resumen de la Orden
                </h2>
                
                <div className="space-y-3 mb-4">
                  {items.map((item: CartItem) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <span className="font-medium">{item.title}</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">x{item.quantity}</span>
                      </div>
                      <span>${(item.price.amount * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Envío</span>
                    <span className="flex items-center">
                      {shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString()}`}
                      <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">*</span>
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    * El precio final del envío se calculará en la pasarela de pago.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
