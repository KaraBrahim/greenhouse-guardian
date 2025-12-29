import { SensorData } from '@/types/sensor';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SensorDataTableProps {
  dataHistory: SensorData[];
}

export function SensorDataTable({ dataHistory }: SensorDataTableProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'normal':
      case 'moist':
      case 'clear':
      case 'none':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warm':
      case 'humid':
      case 'moderate':
      case 'wet':
      case 'attention':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hot':
      case 'cold':
      case 'dry':
      case 'poor':
      case 'hazardous':
      case 'danger':
      case 'detected':
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const reversedData = [...dataHistory].reverse();

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="w-5 h-5 text-primary" />
          Recent Sensor Data
          <Badge variant="outline" className="ml-2">
            {dataHistory.length} records
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] rounded-md border border-border/50">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[100px]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Time
                  </div>
                </TableHead>
                <TableHead className="text-right">Temp</TableHead>
                <TableHead className="text-right">Humidity</TableHead>
                <TableHead className="text-right">Gas</TableHead>
                <TableHead className="text-right">Soil</TableHead>
                <TableHead className="text-center">Motion</TableHead>
                <TableHead className="text-center">Gas Alarm</TableHead>
                <TableHead className="text-center">Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reversedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Waiting for sensor data...
                  </TableCell>
                </TableRow>
              ) : (
                reversedData.map((data, index) => (
                  <TableRow 
                    key={`${data.timestamp}-${index}`}
                    className={cn(
                      "border-border/30 transition-colors",
                      index === 0 && "bg-primary/5"
                    )}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatTime(data.timestamp)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">{data.temp}°C</span>
                      <Badge 
                        variant="outline" 
                        className={cn("ml-2 text-[10px] px-1", getStatusColor(data.temp_status))}
                      >
                        {data.temp_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">{data.hum}%</span>
                      <Badge 
                        variant="outline" 
                        className={cn("ml-2 text-[10px] px-1", getStatusColor(data.hum_status))}
                      >
                        {data.hum_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">{data.gas}</span>
                      <Badge 
                        variant="outline" 
                        className={cn("ml-2 text-[10px] px-1", getStatusColor(data.air_quality))}
                      >
                        {data.air_quality}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">{data.water}%</span>
                      <Badge 
                        variant="outline" 
                        className={cn("ml-2 text-[10px] px-1", getStatusColor(data.soil_status))}
                      >
                        {data.soil_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline" 
                        className={cn("text-[10px] px-1.5", getStatusColor(data.motion_status))}
                      >
                        {data.motion === 1 ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline" 
                        className={cn("text-[10px] px-1.5", getStatusColor(data.gas_alarm_status))}
                      >
                        {data.gasAlarm === 1 ? 'Active' : 'Clear'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline" 
                        className={cn("text-[10px] px-1.5", getStatusColor(data.system_health))}
                      >
                        {data.system_health}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
