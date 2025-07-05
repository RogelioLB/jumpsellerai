export interface ProductMapped{
    name: string,
    price: number,
    image: string,
    description: string,
    sku: string,
    categories: Category[]
}

export interface ProductResponse {
    product: Product;
  }
  
  export interface Product {
    id: number
    name: string
    page_title: string
    description: string
    meta_description: string
    price: string
    promotional_price: string
    cost_per_item: null
    compare_at_price: number
    weight: number
    stock: number
    stock_unlimited: boolean
    stock_threshold: number
    stock_notification: boolean
    sku: string
    brand: string
    barcode: null
    featured: boolean
    reviews_enabled: boolean
    status: string
    shipping_required: boolean
    type: string
    days_to_expire: null
    created_at: string
    updated_at: string
    package_format: string
    length: number
    width: number
    height: number
    diameter: number
    google_product_category: string
    categories: Category[]
    images: Image[]
    variants: Variant[]
    fields: Field[]
    permalink: string
    discount: string
    currency: string
  }
  
  export interface Category {
    id: number
    name: string
    description: null
  }
  
  export interface Image {
    id: number
    url: string
    position: number
  }
  
  export interface Field {
    id: number
    custom_field_id: number
    type: string
    label: string
    value_id?: number
    value: string
    variant_id: null
  }
  
  export interface Variant {
    id: number
    product_id: number
    name: string
    price: string
    stock: number
    weight: number
    sku: string
    barcode: string
    status: string
    created_at: string
    updated_at: string
  }

  export interface Country {
    name: string
    code: string
  }

  export interface Customer {
    id?: number;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    shipping_address?: CustomerAddress;
    billing_address?: BillingAddress;
  }

  export interface CustomerResponse {
    customer: Customer;
  }

  export interface CustomersResponse {
    customers: Customer[];
  }

  export interface CustomerAddress {
    name: string;
    surname: string;
    address: string;
    city: string;
    postal: string;
    municipality: string;
    region: string;
    country: string;
  }

  export interface BillingAddress extends CustomerAddress {
    taxid: string;
  }

  export interface OrderCustomer {
    id?: number;
    shipping_address: CustomerAddress;
    billing_address: BillingAddress;
  }

  export interface OrderProduct {
    id: number;
    variant_id?: number;
    qty: number;
    price: number;
    discount?: number;
  }

  export interface BillingInformation {
    business_activity?: string;
    company_name?: string;
    taxpayer_type?: string;
  }

  export interface Order {
    id?: number;
    status?: string;
    shipping_status?: string;
    shipping_method_id?: number;
    shipping_method_name?: string;
    shipping_price?: number;
    shipping_required?: boolean;
    allow_missing_products?: boolean;
    customer: OrderCustomer;
    products: OrderProduct[];
    billing_information?: BillingInformation;
    subtotal?: number;
    tax?: number;
    total?: number;
    payment_method?: string;
    created_at?: string;
    updated_at?: string;
    tracking_number?: string;
  }

  export interface OrderResponse {
    order: Order;
  }

  export interface ShippingMethodFee {
    type: string;
    value: number;
  }

  export interface ShippingMethodService {
    id: number;
    service_name: string;
    service_code: string;
    name: string;
    enabled: boolean;
    original_service_name: string;
  }

  export interface ShippingMethodTableLocation {
    country: string;
    region: number;
    municipality: string;
    postal_code_range_start: string;
    postal_code_range_end: string;
  }

  export interface ShippingMethodTableValues {
    amount: number;
    price: number;
  }

  export interface ShippingMethodTable {
    basedon: string;
    values: ShippingMethodTableValues;
    locations: ShippingMethodTableLocation;
  }

  export interface ShippingMethod {
    id: number;
    type: string;
    name: string;
    enabled: boolean;
    free_shipping: boolean;
    free_shipping_minimum_purchase: boolean;
    fee: ShippingMethodFee[];
    callback_url: string;
    fetch_services_url: string;
    state: string;
    city: string;
    postal: string;
    services: ShippingMethodService[];
    tables: ShippingMethodTable[];
  }

  export interface ShippingMethodResponse {
    shipping_method: ShippingMethod;
  }