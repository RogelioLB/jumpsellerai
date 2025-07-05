import { NextRequest, NextResponse } from 'next/server';
import { Jumpseller } from '@/jumpseller';
import { CustomerAddress, BillingAddress, Order, OrderProduct, OrderCustomer } from '@/jumpseller/types';
import { CartItem } from '@/store/cartStore';

interface CheckoutRequestBody {
  customer: {
    name: string;
    surname: string;
    email: string;
    phone: string;
  };
  shipping_address: {
    address: string;
    city: string;
    postal: string;
    municipality: string;
    region: string;
  };
  billing_address: {
    name: string;
    surname: string;
    taxid: string;
    address: string;
    city: string;
    postal: string;
    municipality: string;
    region: string;
  };
  same_as_shipping: boolean;
  items: CartItem[];
  shipping_method_id?: number;
  shipping_method_name?: string;
  shipping_price?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequestBody = await request.json();
    const { customer, shipping_address, billing_address, items, shipping_method_id } = body;

    // Check if customer exists
    const existingCustomer = (await Jumpseller.getCustomerByEmail(customer.email)).customer;
    
    let customerId: number | undefined;
    
    // Create shipping address
    const shippingAddress: CustomerAddress = {
      name: customer.name || '',
      surname: customer.surname || '',
      address: shipping_address.address || '',
      city: shipping_address.city || '',
      postal: shipping_address.postal || '',
      municipality: shipping_address.municipality || '',
      region: shipping_address.region || '',
      country: 'CL'
    };
    
    // Create billing address
    const billingAddress: BillingAddress = body.same_as_shipping
      ? {
          ...shippingAddress,
          taxid: ''
        }
      : {
          name: billing_address.name || '',
          surname: billing_address.surname || '',
          address: billing_address.address || '',
          city: billing_address.city || '',
          postal: billing_address.postal || '',
          municipality: billing_address.municipality || '',
          region: billing_address.region || '',
          country: 'CL',
          taxid: billing_address.taxid || ''
        };
    
    if (existingCustomer) {
      customerId = existingCustomer.id;
      
      // Verificar si el cliente existente tiene dirección de envío
      // Si no tiene, actualizarlo con la nueva dirección
      if (!existingCustomer.shipping_address) {
        console.log(`Cliente existente ${customerId} no tiene dirección de envío. Actualizando...`);
        
        try {
          // Asegurarse de que customerId no sea undefined
          if (customerId) {
            // Actualizar cliente con la dirección de envío y facturación
            await Jumpseller.updateCustomer(customerId, {
              shipping_address: shippingAddress,
              billing_address: billingAddress
            });
            
            console.log(`Cliente ${customerId} actualizado exitosamente con direcciones`);
          } else {
            console.error('No se puede actualizar el cliente porque el ID es undefined');
          }
        } catch (error) {
          console.error(`Error al actualizar el cliente ${customerId} con direcciones:`, error);
          // Continuamos con el proceso aunque falle la actualización
        }
      }
    } else {
      // Create new customer with shipping address
      const newCustomer = {
        email: customer.email,
        first_name: customer.name,
        last_name: customer.surname,
        phone: customer.phone,
        shipping_address: shippingAddress,
        billing_address: billingAddress
      };
      
      console.log('Creating new customer with shipping address:', JSON.stringify(newCustomer, null, 2));
      
      const createdCustomer = await Jumpseller.createCustomer(newCustomer);
      customerId = createdCustomer.id;
    }
    
    // Validar que todos los campos requeridos de la dirección de envío estén presentes
    const requiredShippingFields = ['name', 'surname', 'address', 'city', 'region', 'country'];
    const missingShippingFields = requiredShippingFields.filter(field => !shippingAddress[field as keyof CustomerAddress]);
    
    if (missingShippingFields.length > 0) {
      console.error(`Missing required shipping address fields: ${missingShippingFields.join(', ')}`);
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required shipping address fields: ${missingShippingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Validar que todos los campos requeridos de la dirección de facturación estén presentes
    const requiredBillingFields = ['name', 'surname', 'address', 'city', 'region', 'country'];
    const missingBillingFields = requiredBillingFields.filter(field => !billingAddress[field as keyof BillingAddress]);
    
    if (missingBillingFields.length > 0) {
      console.error(`Missing required billing address fields: ${missingBillingFields.join(', ')}`);
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required billing address fields: ${missingBillingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Create order customer
    const orderCustomer: OrderCustomer = {
      id: customerId,
      shipping_address: shippingAddress,
      billing_address: billingAddress
    };
    
    // Get product details to obtain variant_id for each product
    const orderProducts: OrderProduct[] = [];
    
    for (const item of items) {
      try {
        // Get product details from Jumpseller API
        const productId = parseInt(item.id);
        const product = await Jumpseller.getProduct(productId);
        
        // Check if product has variants
        let variantId = undefined;
        if (product && product.variants && product.variants.length > 0) {
          // Use the first variant if available
          variantId = product.variants[0].id;
        }
        
        orderProducts.push({
          id: productId,
          variant_id: variantId,
          qty: item.quantity,
          price: item.price.amount
        });
      } catch (error) {
        console.error(`Error getting product details for ID ${item.id}:`, error);
        // Continue with other products even if one fails
      }
    }
    
    // If no products could be processed, return an error
    if (orderProducts.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No products could be processed for the order' 
        },
        { status: 400 }
      );
    }
    
    // Calculate subtotal
    const subtotal = orderProducts.reduce((total, product) => total + (product.price * product.qty), 0);
    
    // Create order
    const order: Order = {
      status: 'Pending Payment',
      shipping_method_id: shipping_method_id,
      shipping_required: true,
      allow_missing_products: false,
      customer: {
        id: orderCustomer.id,
        shipping_address: {
          name: shippingAddress.name,
          surname: shippingAddress.surname,
          address: shippingAddress.address,
          city: shippingAddress.city,
          postal: shippingAddress.postal,
          municipality: shippingAddress.municipality,
          region: shippingAddress.region,
          country: 'CL'
        },
        billing_address: {
          name: billingAddress.name,
          surname: billingAddress.surname,
          address: billingAddress.address,
          city: billingAddress.city,
          postal: billingAddress.postal,
          municipality: billingAddress.municipality,
          region: billingAddress.region,
          country: 'CL',
          taxid: billingAddress.taxid || ''
        }
      },
      products: orderProducts,
      subtotal: subtotal,
      total: subtotal,
      payment_method: 'webpay',
      billing_information: {
        business_activity: '',
        company_name: '',
        taxpayer_type: ''
      }
    };
    
    // Log the order structure for debugging
    console.log('Order structure:', JSON.stringify(order, null, 2));
    
    try {
      const createdOrder = await Jumpseller.createOrder(order);
      
      return NextResponse.json({ 
        success: true, 
        order: createdOrder 
      });
    } catch (error) {
      console.error('Error creating order:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create order' 
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create order' 
      },
      { status: 500 }
    );
  }
}
