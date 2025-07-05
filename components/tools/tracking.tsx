import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";

interface TrackingEvent {
  date: string;
  status: string;
  description: string;
  location: string;
}

interface PackageInfo {
  weight: string;
  pieces: string;
  service: string;
}

interface TrackingData {
  trackingNumber: string;
  status: string;
  statusDescription: string;
  events: TrackingEvent[];
  lastUpdate: string;
  originAddress: string;
  destinationAddress: string;
  packageInfo: PackageInfo;
}

interface TrackingProps {
  data: TrackingData;
}

export default function Tracking({ data }: TrackingProps) {
    console.log(data)
  // Format the date to a more readable format
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(date);
    } catch (error) {
      return dateStr;
    }
  };

  // Determine badge color based on status
  const getBadgeVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
      case "DL":
        return "success";
      case "IN_TRANSIT":
      case "TR":
      case "LD":
        return "warning";
      case "CREATED":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Seguimiento de Envío</CardTitle>
            <Badge variant={getBadgeVariant(data.status)}>{data.statusDescription}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Número de seguimiento: {data.trackingNumber}
          </p>
          <p className="text-sm text-muted-foreground">
            Última actualización: {data.lastUpdate}
          </p>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Origen:</p>
              <p className="text-sm">{data.originAddress}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Destino:</p>
              <p className="text-sm">{data.destinationAddress}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Peso</p>
              <p className="font-medium">{data.packageInfo.weight} kg</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Piezas</p>
              <p className="font-medium">{data.packageInfo.pieces}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Servicio</p>
              <p className="font-medium">{data.packageInfo.service}</p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Historial de Eventos</h3>
            
            <div className="space-y-4">
              {data.events.map((event, index) => (
                <div key={index} className="relative pl-6 pb-4">
                  {index !== data.events.length - 1 && (
                    <div className="absolute top-2 left-[9px] bottom-0 w-[2px] bg-gray-200" />
                  )}
                  <div className="absolute top-2 left-0 w-[20px] h-[20px] rounded-full border-2 border-primary bg-background" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant={getBadgeVariant(event.status)} className="h-6">
                        {event.description}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                    </div>
                    {event.location && (
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
