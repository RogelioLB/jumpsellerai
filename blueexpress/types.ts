/**
 * Configuration for BlueExpress API
 */
export interface BlueExpressConfig {
  token: string;
  userCode: string;
  clientAccount: string;
  apiUrl: string;
}

/**
 * Request parameters for tracking a shipment
 */
export interface BlueExpressTrackingRequest {
  trackingNumber: string;
}

/**
 * BlueExpress API Response
 */
export interface BlueExpressApiResponse {
  status: boolean;
  data: {
    idEspecieValorada: string;
    nroOS: string;
    fechaCreacion: string;
    numeroReferencia: string | null;
    ctaCte: string;
    origen: {
      region: string;
      comuna: string;
      codigoLocalidad: string;
      nombreLocalidad: string;
      direccion: string;
    };
    destino: {
      region: string;
      comuna: string;
      codigoLocalidad: string;
      nombreLocalidad: string;
      direccion: string;
    };
    codigoTipoServicio: string;
    nombreTipoServicio: string;
    codigoProducto: string;
    codigoPersona: string;
    pesoFisico: string;
    pesoVolumen: string;
    valorFlete: string;
    cantidadPiezas: string;
    macroEstadoActual: string;
    fechaMacroEstadoActual: string;
    tpeecdg: string;
    observaciones: string;
    nombreOrigen: string;
    direccionOrigen: string;
    localidadOrigen: string;
    nombreDestino: string;
    direccionDestino: string;
    localidadDestino: string;
    fechaRetiro: string;
    fechaEntrega: string;
    observacionEntrega: string;
    pinchazos: Array<{
      tipoMovimiento: {
        codigo: string;
        descripcion: string;
      };
      codigoPieza: string;
      fechaHora: string;
      cantidadPiezas: string;
      observacion: string;
    }>;
  };
}

/**
 * Tracking event information
 */
export interface TrackingEvent {
  date: string;
  status: string;
  description: string;
  location?: string;
}

/**
 * Tracking data structure
 */
export interface TrackingData {
  trackingNumber: string;
  status: string;
  statusDescription: string;
  events: TrackingEvent[];
  estimatedDeliveryDate?: string;
  lastUpdate?: string;
  originAddress?: string;
  destinationAddress?: string;
  packageInfo?: {
    weight: string;
    pieces: string;
    service: string;
  };
}

/**
 * Response from tracking API
 */
export interface BlueExpressTrackingResponse {
  success: boolean;
  data?: TrackingData;
  error?: string;
}
