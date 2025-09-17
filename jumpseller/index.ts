import { ProductResponse, Country, Customer, CustomerResponse, Order, OrderResponse, ShippingMethod, ShippingMethodResponse, Product } from "./types";

export const Jumpseller = {
    getProducts: async ({page}:{page:number}) => {
        const actualLimit = 50;
        const response = await fetch(`https://api.jumpseller.com/v1/products.json?page=${page}&limit=${actualLimit}&login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}`);
        const products: ProductResponse[] = await response.json();
        console.log(products)
        return products.filter(({product}) => product.status && product.stock>0).map(({product})=>({
            id: product.id,
            name: product.name,
            price: product.price,
            images: product.images,
            categories: product.categories
        }))
    },
    getCountries: async () => {
        const response = await fetch(`https://api.jumpseller.com/v1/countries.json?login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}`);
        const countries: Country = await response.json();
        return countries;
    },
    getCustomerByEmail: async (email: string) => {
        try {
            const response = await fetch(`https://api.jumpseller.com/v1/customers/email/${encodeURIComponent(email)}.json?login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}`);
            
            if (!response.ok) {
                throw new Error(`Error fetching customer: ${response.statusText}`);
            }
            
            const data: CustomerResponse = await response.json();

            return {
                success: true,
                customer: data.customer
            };
        } catch (error) {
            console.error("Error fetching customer by email:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
                customer: null
            };
        }
    },
    getCustomerOrders: async (customerId: number) => {
        try {
            const response = await fetch(`https://api.jumpseller.com/v1/customers/${customerId}/orders.json?login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}`);
            
            if (!response.ok) {
                throw new Error(`Error fetching orders: ${response.statusText}`);
            }
            
            const data: OrderResponse[] = await response.json();
            
            const ordersWithTracking = data.filter(({order}) => 
                order.tracking_number && order.shipping_method_id === 689500
            );
            
            return {
                success: true,
                orders: ordersWithTracking
            };
        } catch (error) {
            console.error("Error fetching customer orders:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
                orders: []
            };
        }
    },
    createCustomer: async (customer: Customer) => {
        try {
            
            if (!customer.shipping_address) {
                console.warn('Customer does not have shipping address, this may cause issues later');
            }
            
            const response = await fetch(`https://api.jumpseller.com/v1/customers.json?login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ customer }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response from Jumpseller API:', errorText);
                throw new Error(`Error creating customer: ${response.statusText}`);
            }
            
            const data: CustomerResponse = await response.json();
            return data.customer;
        } catch (error) {
            console.error("Error creating customer:", error);
            throw error;
        }
    },
    updateCustomer: async (customerId: number, customerData: Partial<Customer>) => {
        try {
            const response = await fetch(`https://api.jumpseller.com/v1/customers/${customerId}.json?login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ customer: customerData }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response from Jumpseller API:', errorText);
                throw new Error(`Error updating customer: ${response.statusText}`);
            }
            
            const data: CustomerResponse = await response.json();
            return data.customer;
        } catch (error) {
            console.error("Error updating customer:", error);
            throw error;
        }
    },
    createOrder: async (order: Order) => {
        try {
            if (!order.customer.shipping_address || !order.customer.billing_address) {
                throw new Error("Customer shipping or billing address is missing");
            }
            const orderPayload = {
                order: {
                    status: order.status || 'Pending Payment',
                    shipping_method_id: order.shipping_method_id || 0,
                    shipping_required: order.shipping_required !== undefined ? order.shipping_required : true,
                    allow_missing_products: order.allow_missing_products !== undefined ? order.allow_missing_products : true,
                    customer: {
                        id: order.customer.id,
                        shipping_address: {
                            name: order.customer.shipping_address.name || '',
                            surname: order.customer.shipping_address.surname || '',
                            address: order.customer.shipping_address.address || '',
                            city: order.customer.shipping_address.city || '',
                            postal: order.customer.shipping_address.postal || '',
                            municipality: order.customer.shipping_address.municipality || '',
                            region: order.customer.shipping_address.region || '',
                            country: order.customer.shipping_address.country || 'CL'
                        },
                        billing_address: {
                            name: order.customer.billing_address.name || '',
                            surname: order.customer.billing_address.surname || '',
                            taxid: order.customer.billing_address.taxid || '',
                            address: order.customer.billing_address.address || '',
                            city: order.customer.billing_address.city || '',
                            postal: order.customer.billing_address.postal || '',
                            municipality: order.customer.billing_address.municipality || '',
                            region: order.customer.billing_address.region || '',
                            country: order.customer.billing_address.country || 'CL'
                        }
                    },
                    products: order.products.map(product => ({
                        id: product.id || 0,
                        variant_id: product.variant_id || 0,
                        qty: product.qty || 0,
                        price: product.price || 0,
                        discount: product.discount || 0
                    })),
                    subtotal: order.subtotal || 0,
                    total: order.total || 0,
                    payment_method: order.payment_method || '',
                    billing_information: order.billing_information || {
                        business_activity: '',
                        company_name: '',
                        taxpayer_type: ''
                    }
                }
            };

            const response = await fetch(`https://api.jumpseller.com/v1/orders.json?login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(orderPayload),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response from Jumpseller API:', errorText);
                throw new Error(`Error creating order: ${response.statusText}`);
            }
            
            const data: OrderResponse = await response.json();
            return data.order;
        } catch (error) {
            console.error("Error creating order:", error);
            throw error;
        }
    },
    getProduct: async (productId: number) => {
        try {
            const url = `https://api.jumpseller.com/v1/products/${productId}.json?login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error fetching product ${productId}:`, errorText);
                throw new Error(`Error fetching product: ${response.statusText}`);
            }
            
            const data: ProductResponse = await response.json();
            return data.product;
        } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            throw error;
        }
    },
    searchProducts: async ({query, page = 1}:{query:string, page?:number}) => {
        const actualLimit = 5;
        const response = await fetch(`https://api.jumpseller.com/v1/products/search.json?query=${query}&fields=name,id&login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}&page=${page}&limit=${actualLimit}`)
        console.log(`https://api.jumpseller.com/v1/products/search.json?query=${query}&fields=name,id&login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}&page=${page}&limit=${actualLimit}`)
        const products: ProductResponse[] = await response.json();
        const productsInfo = await Promise.all(products.map(async ({product})=>{
            const productInfo : Product = await Jumpseller.getProduct(product.id);
            return productInfo;
        }))
        return productsInfo.filter((product) => product.status && product.stock>0).map((product)=>({
            id: product.id,
            name: product.name,
            price: product.price,
            images: product.images,
            categories: product.categories,
            meta_description: product.meta_description,
        }))
    },
    getMunicipalities: async (regionCode: string): Promise<{code: string, name: string}[]> => {
        try {
            const response = await fetch(
                `https://api.jumpseller.com/v1/countries/CL/regions/${regionCode}/municipalities.json?login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}`
            );
            
            if (!response.ok) {
                throw new Error(`Error fetching municipalities: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                console.error('Unexpected response format from Jumpseller API');
                return [];
            }
            
            return data;
        } catch (error) {
            console.error('Error fetching municipalities:', error);
            return [];
        }
    },
    getRegions: async () => {
        try {
            const response = await fetch(`https://api.jumpseller.com/v1/countries/CL/regions.json?login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}`);
            
            if (!response.ok) {
                throw new Error(`Error fetching regions: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                console.error('Unexpected response format from Jumpseller API');
                return [];
            }
            
            return { regions: data };
        } catch (error) {
            console.error('Error in getRegions:', error);
            return { regions: [] };
        }
    },
    getShippingMethods: async (regionCode: string, municipality: string): Promise<ShippingMethod[]> => {
        try {
            const response = await fetch(
                `https://api.jumpseller.com/v1/shipping_methods.json?login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}&country_code=CL&state=${regionCode}&city=${encodeURIComponent(municipality)}`
            );
            
            if (!response.ok) {
                throw new Error(`Error fetching shipping methods: ${response.statusText}`);
            }
            
            const data: ShippingMethodResponse[] = await response.json();
            
            // Check if data is an array of ShippingMethodResponse objects
            if (Array.isArray(data)) {
                // Map through each item to extract the shipping_method
                const methods = data.map(item => item.shipping_method).filter(method => method && method.enabled);
                
                return methods;
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching shipping methods:', error);
            return [];
        }
    },
    getPromotions: async () => {
        try {
            const response = await fetch(`https://api.jumpseller.com/v1/promotions.json?login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}`);
            
            if (!response.ok) {
                throw new Error(`Error fetching promotions: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                console.error('Unexpected response format from Jumpseller API');
                return [];
            }
            
            return data;
        } catch (error) {
            console.error('Error fetching promotions:', error);
            return [];
        }
    },
    getCategories: async () => {
        try {
            const response = await fetch(`https://api.jumpseller.com/v1/categories.json?login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}`);
            console.log(`https://api.jumpseller.com/v1/categories.json?login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}`);
            if (!response.ok) {
                throw new Error(`Error fetching categories: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                console.error('Unexpected response format from Jumpseller API');
                return [];
            }

            const mappedData = data.map(({category}) => ({ id: category.id, name: category.name }));
            return mappedData;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    },
    getProductsByCategory: async (categoryId: number) => {
        try {
            console.log(`🔍 Fetching products for category ${categoryId}...`);
            
            // Crear AbortController para timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout
            
            const response = await fetch(
                `https://api.jumpseller.com/v1/products/category/${categoryId}.json?login=${process.env.JUMPSELLER_LOGIN}&authtoken=${process.env.JUMPSELLER_AUTHTOKEN}&limit=20`, 
                {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Kreadores-Bot/1.0'
                    }
                }
            );
            
            clearTimeout(timeoutId);
            console.log(`📡 API Response status: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`Error fetching products by category: ${response.status} ${response.statusText}`);
            }
            
            const data : ProductResponse[] = await response.json();
            
            if (!Array.isArray(data)) {
                console.error('Unexpected response format from Jumpseller API');
                return [];
            }

            const products = data.filter(({product}) => product.status && product.stock>0)
            const mappedProducts = products.map(({product}) => ({
                id: product.id,
                name: product.name,
                price: product.price,
                images: product.images.slice(0,3),
                meta_description: product.meta_description,
            }))
            return mappedProducts;
        } catch (error) {
            console.error('Error fetching products by category:', error);
            return [];
        }
    }
}