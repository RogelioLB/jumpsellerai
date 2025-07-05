"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/useCart";
import { ArrowLeft, ArrowRight, Mail, MapPin, Phone, ShoppingBag, User } from "lucide-react";

interface FormData {
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

export default function ContactPage() {
  const router = useRouter();
  const { items } = useCart();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    surname: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal: "",
    municipality: "",
    region: "",
  });
  const [regions, setRegions] = useState<Region[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingMunicipalities, setFetchingMunicipalities] = useState(false);
  const [cartEmpty, setCartEmpty] = useState(false);

  useEffect(() => {
    // Fetch regions directly from Chile
    const fetchRegions = async () => {
      try {
        const response = await fetch("/api/jumpseller/regions");
        const data = await response.json();
        console.log("Regions API response:", data);
        if (data.regions) {
          console.log("Setting regions:", data.regions);
          setRegions(data.regions);
        } else {
          console.error("No regions found in data:", data);
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    };

    fetchRegions();

    // Try to load saved contact data from session storage
    const savedContact = sessionStorage.getItem("checkoutContact");
    if (savedContact) {
      try {
        const parsedData = JSON.parse(savedContact);
        setFormData(parsedData);
      } catch (e) {
        console.error("Error parsing saved contact data:", e);
      }
    }
  }, []);

  useEffect(() => {
    // Fetch municipalities when region changes
    const fetchMunicipalities = async () => {
      if (!formData.region) {
        setMunicipalities([]);
        return;
      }

      setFetchingMunicipalities(true);
      try {
        const response = await fetch(
          `/api/jumpseller/municipalities?region=${formData.region}`
        );
        const data = await response.json();
        if (data.municipalities) {
          setMunicipalities(data.municipalities);
        }
      } catch (error) {
        console.error("Error fetching municipalities:", error);
      } finally {
        setFetchingMunicipalities(false);
      }
    };

    fetchMunicipalities();
  }, [formData.region]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
      // Reset municipality when region changes
      ...(field === "region" ? { municipality: "" } : {}),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Store contact information in session storage
    sessionStorage.setItem("checkoutContact", JSON.stringify(formData));

    // Navigate to shipping page
    router.push("/checkout/shipping");
  };

  // Check if cart is empty
  useEffect(() => {
    setCartEmpty(items.length === 0);
  }, [items]);

  // If cart is empty, show a message and a button to go back to the main page
  if (cartEmpty) {
    return (
      <div className="container mx-auto px-4 py-16 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-100">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="text-blue-600 dark:text-blue-300 text-3xl" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Parece que aún no has agregado productos a tu carrito de compras.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
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
                1
              </div>
              <span className="text-sm mt-2">Contacto</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-300">
              <div className="h-full w-0 bg-blue-600"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                2
              </div>
              <span className="text-sm mt-2">Envío</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-300">
              <div className="h-full w-0 bg-blue-600"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                3
              </div>
              <span className="text-sm mt-2">Pago</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">
          Información de Contacto
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="mr-2" /> Datos Personales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  placeholder="Ingresa tu nombre"
                />
              </div>
              <div>
                <label
                  htmlFor="surname"
                  className="block text-sm font-medium mb-1"
                >
                  Apellido
                </label>
                <input
                  type="text"
                  id="surname"
                  value={formData.surname}
                  onChange={(e) => handleChange("surname", e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  placeholder="Ingresa tu apellido"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium mb-1 flex items-center"
                >
                  <Mail className="mr-1" /> Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="text-sm font-medium mb-1 flex items-center"
                >
                  <Phone className="mr-1" /> Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  placeholder="+56 9 XXXX XXXX"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="mr-2" /> Dirección de Envío
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium mb-1"
                >
                  Dirección
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  placeholder="Calle, número, departamento"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="region"
                    className="block text-sm font-medium mb-1"
                  >
                    Región
                  </label>
                  <select
                    id="region"
                    value={formData.region}
                    onChange={(e) => handleChange("region", e.target.value)}
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
                  <label
                    htmlFor="municipality"
                    className="block text-sm font-medium mb-1"
                  >
                    Comuna
                  </label>
                  <select
                    id="municipality"
                    value={formData.municipality}
                    onChange={(e) =>
                      handleChange("municipality", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled={!formData.region || fetchingMunicipalities}
                  >
                    <option value="">
                      {fetchingMunicipalities
                        ? "Cargando comunas..."
                        : formData.region
                        ? "Selecciona una comuna"
                        : "Primero selecciona una región"}
                    </option>
                    {municipalities.map((municipality) => (
                      <option key={municipality.code} value={municipality.code}>
                        {municipality.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium mb-1"
                  >
                    Ciudad
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    placeholder="Ingresa tu ciudad"
                  />
                </div>
                <div>
                  <label
                    htmlFor="postal"
                    className="block text-sm font-medium mb-1"
                  >
                    Código Postal (opcional)
                  </label>
                  <input
                    type="text"
                    id="postal"
                    value={formData.postal}
                    onChange={(e) => handleChange("postal", e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ej: 7500000"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
            >
              <ArrowLeft className="mr-2" /> Volver al Carrito
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <span className="mr-2">Cargando...</span>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                </>
              ) : (
                <>
                  Continuar a Envío <ArrowRight className="ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
