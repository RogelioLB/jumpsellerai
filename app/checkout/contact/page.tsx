"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/useCart";
import { ArrowLeft, ArrowRight, Mail, MapPin, Phone, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    // Tratar "placeholder" como valor vacío
    const processedValue = value === "placeholder" ? "" : value;
    setFormData({
      ...formData,
      [field]: processedValue,
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
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="mb-8">
              <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="text-primary text-3xl" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
            <p className="text-muted-foreground mb-8">
              Parece que aún no has agregado productos a tu carrito de compras.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="mx-auto"
            >
              <ArrowLeft className="mr-2" size={16} /> Ir a la tienda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <div className="flex-1 h-1 mx-4 bg-muted">
                <div className="h-full w-0 bg-primary"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="size-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
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
        
        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-4">
                  <User size={20} />
                </div>
                <CardTitle>Información de Contacto</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    placeholder="Ingresa tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Apellido</Label>
                  <Input
                    type="text"
                    id="surname"
                    value={formData.surname}
                    onChange={(e) => handleChange("surname", e.target.value)}
                    required
                    placeholder="Ingresa tu apellido"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                    placeholder="+569 XXXX XXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-4">
                  <MapPin size={20} />
                </div>
                <CardTitle>Dirección de Envío</CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-2 mb-4">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  required
                  placeholder="Ingresa tu dirección completa"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Región</Label>
                  <Select 
                    value={formData.region}
                    onValueChange={(value) => handleChange("region", value)}
                  >
                    <SelectTrigger id="region">
                      <SelectValue placeholder="Selecciona una región" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder" disabled>Selecciona una región</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region.code} value={region.code}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipality">Comuna</Label>
                  <Select
                    value={formData.municipality}
                    onValueChange={(value) => handleChange("municipality", value)}
                    disabled={!formData.region || fetchingMunicipalities}
                  >
                    <SelectTrigger id="municipality">
                      <SelectValue placeholder={
                        fetchingMunicipalities
                          ? "Cargando comunas..."
                          : formData.region
                          ? "Selecciona una comuna"
                          : "Primero selecciona una región"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder" disabled>Selecciona una comuna</SelectItem>
                      {municipalities.map((municipality) => (
                        <SelectItem key={municipality.code} value={municipality.code}>
                          {municipality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    required
                    placeholder="Ingresa tu ciudad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal">Código Postal (opcional)</Label>
                  <Input
                    type="text"
                    id="postal"
                    value={formData.postal}
                    onChange={(e) => handleChange("postal", e.target.value)}
                    placeholder="Ej: 7500000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2" /> Volver al Carrito
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? (
                <>
                  <span className="mr-2">Cargando...</span>
                  <div className="animate-spin size-4 border-2 border-current border-t-transparent rounded-full"></div>
                </>
              ) : (
                <>
                  Continuar a Envío <ArrowRight className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
