import { BlueExpressTrackingRequest, BlueExpressTrackingResponse, BlueExpressConfig, BlueExpressApiResponse } from './types';

/**
 * BlueExpress service for tracking shipments
 * Based on the BlueExpress Chile API
 */
export const BlueExpress = {
  /**
   * Track a shipment using BlueExpress Chile API
   * @param trackingNumber - The tracking number provided by BlueExpress
   * @returns Tracking information for the shipment
   */
  trackOrder: async (
    { trackingNumber }: BlueExpressTrackingRequest
  ): Promise<BlueExpressTrackingResponse> => {
    try {
      // Get BlueExpress configuration from environment variables
      const config: BlueExpressConfig = {
        token: process.env.BX_CLIENT_TOKEN || '',
        userCode: process.env.BX_CLIENT_USER_ID || '',
        clientAccount: process.env.BX_CLIENT_ACCOUNT || '',
        apiUrl: process.env.BLUEEXPRESS_API_URL || 'https://bx-tracking.bluex.cl/bx-tracking/v1'
      };

      // Validate configuration
      if (!config.token || !config.userCode || !config.clientAccount) {
        throw new Error('Missing BlueExpress API configuration');
      }

      // Construct the API URL for tracking
      const apiUrl = `${config.apiUrl}/tracking-pull/${trackingNumber}`;
      
      // Make the API request
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'BX-TOKEN': config.token,
          'BX-USERCODE': config.userCode,
          'BX-CLIENT-ACCOUNT': config.clientAccount
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from BlueExpress API:', errorText);
        throw new Error(`Error tracking shipment: ${response.statusText}`);
      }

      // Parse the API response
      const apiResponse = await response.json() as BlueExpressApiResponse;
      console.log('BlueExpress API response:', apiResponse);
      
      // Check if the response is successful
      if (!apiResponse.status || !apiResponse.data) {
        return {
          success: false,
          error: 'No se encontró información de seguimiento para este número'
        };
      }
      
      // Transform the API response to match our internal structure
      const data = apiResponse.data;
      
      // Map the status to a standardized format based on macroEstadoActual
      const statusMap: Record<string, string> = {
        'Entregado': 'DELIVERED',
        'En Ruta': 'IN_TRANSIT',
        'En Reparto': 'OUT_FOR_DELIVERY',
        'Fallido': 'FAILED_DELIVERY',
        'Devuelto': 'RETURNED',
        'Creado': 'CREATED'
      };
      
      // Get the standardized status
      const status = statusMap[data.macroEstadoActual] || 'UNKNOWN';
      
      // Handle the pinchazos array with the correct structure
      let pinchazos = Array.isArray(data.pinchazos) ? data.pinchazos : [];
      
      console.log('Parsed pinchazos:', pinchazos);
      
      // Transform the events (pinchazos) to our event format
      const events = pinchazos.map(event => ({
        date: event.fechaHora || '',
        status: event.tipoMovimiento?.codigo || 'UNKNOWN',
        description: event.tipoMovimiento?.descripcion || '',
        location: event.observacion || ''
      }));
      
      // Add the order creation date as the first event
      if (data.fechaCreacion) {
        events.push({
          date: data.fechaCreacion,
          status: 'CREATED',
          description: 'Orden Creada',
          location: ''
        });
        
        // Sort events by date in descending order (newest first)
        events.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        });
      }
      
      // Format addresses
      const originAddress = `${data.direccionOrigen}, ${data.localidadOrigen}`;
      const destinationAddress = `${data.direccionDestino}, ${data.localidadDestino}`;
      
      // Create the response object
      const trackingData = {
        trackingNumber: data.nroOS,
        status,
        statusDescription: data.macroEstadoActual,
        events,
        lastUpdate: data.fechaMacroEstadoActual,
        originAddress,
        destinationAddress,
        packageInfo: {
          weight: data.pesoFisico,
          pieces: data.cantidadPiezas,
          service: data.nombreTipoServicio
        }
      };
      
      console.log('Transformed tracking data:', trackingData);
      
      return {
        success: true,
        data: trackingData
      };
    } catch (error) {
      console.error("Error tracking shipment with BlueExpress:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};
