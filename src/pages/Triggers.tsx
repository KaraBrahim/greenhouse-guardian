import { useState } from 'react';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Power, 
  PowerOff,
  Mail,
  Bell,
  LampCeiling,
  Webhook,
  DoorOpen,
  Fan,
  Droplets,
  Thermometer,
  Wind,
  Activity,
  AlertTriangle,
  Save,
  X,
  Lightbulb,
  Settings2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Trigger, TriggerAction } from '@/types/sensor';
import { toast } from 'sonner';

const API_BASE = 'http://18.212.77.216:8000';
const DEVICE_ID = 'esp32_device';

const defaultTriggers: Trigger[] = [];

const sensorIcons: Record<string, React.ReactNode> = {
  temp: <Thermometer className="w-4 h-4" />,
  hum: <Droplets className="w-4 h-4" />,
  gas: <Wind className="w-4 h-4" />,
  motion: <Activity className="w-4 h-4" />,
  gasAlarm: <AlertTriangle className="w-4 h-4" />,
};

const sensorColors: Record<string, string> = {
  temp: 'hsl(15, 90%, 55%)',
  hum: 'hsl(199, 89%, 48%)',
  gas: 'hsl(270, 70%, 60%)',
  motion: 'hsl(38, 92%, 50%)',
  gasAlarm: 'hsl(0, 72%, 51%)',
};

const actionIcons: Record<string, React.ReactNode> = {
  alert: <AlertTriangle className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  notification: <Bell className="w-4 h-4" />,
  device_control: <Zap className="w-4 h-4" />,
};

export default function Triggers() {
  const [triggers, setTriggers] = useState<Trigger[]>(defaultTriggers);
  const [showNewTrigger, setShowNewTrigger] = useState(false);

  // const toggleTrigger = (id: string) => {
  //   setTriggers(prev =>
  //     prev.map(t => (t.id === id ? { ...t, enabled: !t.enabled } : t))
  //   );
  // };

  // const deleteTrigger = (id: string) => {
  //   setTriggers(prev => prev.filter(t => t.id !== id));
  // };

  const getOperatorLabel = (op: string) => {
    switch (op) {
      case '>': return 'greater than';
      case '<': return 'less than';
      case '=': return 'equals';
      case '>=': return 'at least';
      case '<=': return 'at most';
      default: return op;
    }
  };

  const getSensorLabel = (sensor: string) => {
    switch (sensor) {
      case 'temp': return 'Temperature';
      case 'hum': return 'Humidity';
      case 'gas': return 'Gas Level';
      case 'motion': return 'Motion';
      case 'gasAlarm': return 'Gas Alarm';
      default: return sensor;
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'alert': return 'Show Alert';
      case 'email': return 'Send Email';
      case 'notification': return 'Push Notification';
      case 'device_control': return 'Control Device';
      default: return type;
    }
  };

  // Actuator control states
  const [windowAngle, setWindowAngle] = useState(0);
  const [valveAngle, setValveAngle] = useState(0);
  const [ledState, setLedState] = useState<'off' | 'on' | 'blink_slow' | 'blink_fast'>('off');
  const [loadingActuator, setLoadingActuator] = useState<string | null>(null);

  const controlWindow = async (angle: number) => {
    setLoadingActuator('window');
    try {
      const response = await fetch(`${API_BASE}/actuator/${DEVICE_ID}/window`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ angle })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Window set to ${angle}°`);
        console.log('✅ Window:', data);
      } else {
        throw new Error(data.detail || 'Failed to control window');
      }
    } catch (error) {
      console.error('❌ Window error:', error);
      toast.error('Failed to control window');
    } finally {
      setLoadingActuator(null);
    }
  };

  const controlValve = async (angle: number) => {
    setLoadingActuator('valve');
    try {
      const response = await fetch(`${API_BASE}/actuator/${DEVICE_ID}/valve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ angle })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Valve set to ${angle}°`);
        console.log('✅ Valve:', data);
      } else {
        throw new Error(data.detail || 'Failed to control valve');
      }
    } catch (error) {
      console.error('❌ Valve error:', error);
      toast.error('Failed to control valve');
    } finally {
      setLoadingActuator(null);
    }
  };

  const controlLED = async (state: 'off' | 'on' | 'blink_slow' | 'blink_fast') => {
    setLoadingActuator('led');
    try {
      const response = await fetch(`${API_BASE}/actuator/${DEVICE_ID}/led_warning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, color: 'red' })
      });
      const data = await response.json();
      if (response.ok) {
        setLedState(state);
        toast.success(`LED ${state === 'off' ? 'turned off' : state === 'on' ? 'turned on' : state.replace('_', ' ')}`);
        console.log('✅ LED:', data);
      } else {
        throw new Error(data.detail || 'Failed to control LED');
      }
    } catch (error) {
      console.error('❌ LED error:', error);
      toast.error('Failed to control LED');
    } finally {
      setLoadingActuator(null);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              <span className="text-gradient">Automation & Controls</span>
            </h2>
            <p className="text-muted-foreground">
              Manual actuator controls and automated trigger responses
            </p>
          </div>
        </div>

        {/* Actuator Controls Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Manual Actuator Controls</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Window Control */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <DoorOpen className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold">Window Servo</h4>
                  <p className="text-sm text-muted-foreground">0° closed – 90° open</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Angle</span>
                  <span className="font-mono text-lg font-bold text-blue-500">{windowAngle}°</span>
                </div>
                <Slider
                  value={[windowAngle]}
                  onValueChange={(v) => setWindowAngle(v[0])}
                  max={180}
                  step={5}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => { setWindowAngle(0); controlWindow(0); }}
                    disabled={loadingActuator === 'window'}
                  >
                    Close
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => { setWindowAngle(90); controlWindow(90); }}
                    disabled={loadingActuator === 'window'}
                  >
                    Open
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => controlWindow(windowAngle)}
                    disabled={loadingActuator === 'window'}
                  >
                    {loadingActuator === 'window' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Valve Control */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-cyan-500/10">
                  <Droplets className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <h4 className="font-semibold">Water Valve</h4>
                  <p className="text-sm text-muted-foreground">0° closed – 90° open</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Angle</span>
                  <span className="font-mono text-lg font-bold text-cyan-500">{valveAngle}°</span>
                </div>
                <Slider
                  value={[valveAngle]}
                  onValueChange={(v) => setValveAngle(v[0])}
                  max={180}
                  step={5}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => { setValveAngle(0); controlValve(0); }}
                    disabled={loadingActuator === 'valve'}
                  >
                    Close
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => { setValveAngle(90); controlValve(90); }}
                    disabled={loadingActuator === 'valve'}
                  >
                    Open
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => controlValve(valveAngle)}
                    disabled={loadingActuator === 'valve'}
                  >
                    {loadingActuator === 'valve' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set'}
                  </Button>
                </div>
              </div>
            </div>

            {/* LED Control */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "p-3 rounded-lg transition-colors",
                  ledState === 'off' ? 'bg-muted' : 'bg-red-500/20'
                )}>
                  <Lightbulb className={cn(
                    "w-6 h-6 transition-colors",
                    ledState === 'off' ? 'text-muted-foreground' : 'text-red-500',
                    (ledState === 'blink_slow' || ledState === 'blink_fast') && 'animate-pulse'
                  )} />
                </div>
                <div>
                  <h4 className="font-semibold">Warning LED</h4>
                  <p className="text-sm text-muted-foreground">
                    Status: <span className={cn(
                      "font-medium",
                      ledState === 'off' ? 'text-muted-foreground' : 'text-red-500'
                    )}>{ledState.replace('_', ' ')}</span>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={ledState === 'off' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => controlLED('off')}
                  disabled={loadingActuator === 'led'}
                >
                  {loadingActuator === 'led' && ledState !== 'off' ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Off
                </Button>
                {/* <Button 
                  variant={ledState === 'on' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => controlLED('on')}
                  disabled={loadingActuator === 'led'}
                  className={ledState === 'on' ? 'bg-red-500 hover:bg-red-600' : ''}
                >
                  On
                </Button> */}
                <Button 
                  variant={ledState === 'blink_slow' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => controlLED('blink_slow')}
                  disabled={loadingActuator === 'led'}
                  className={ledState === 'blink_slow' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                >
                  Warning
                </Button>
                <Button 
                  variant={ledState === 'blink_fast' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => controlLED('blink_fast')}
                  disabled={loadingActuator === 'led'}
                  className={ledState === 'blink_fast' ? 'bg-red-500 hover:bg-red-600' : ''}
                >
                  Error
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{triggers.length}</p>
                <p className="text-sm text-muted-foreground">Total Triggers</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <Power className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{triggers.filter(t => t.enabled).length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-muted">
                <PowerOff className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{triggers.filter(t => !t.enabled).length}</p>
                <p className="text-sm text-muted-foreground">Inactive</p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Triggers List */}
        <div className="space-y-4">
          {triggers.map((trigger, index) => (
            <div
              key={trigger.id}
              className={cn(
                'glass rounded-xl p-6 animate-fade-in transition-all duration-300',
                trigger.enabled ? 'border-primary/30' : 'opacity-60'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Trigger Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ 
                        backgroundColor: `${sensorColors[trigger.condition.sensor]}20`,
                        color: sensorColors[trigger.condition.sensor]
                      }}
                    >
                      {sensorIcons[trigger.condition.sensor]}
                    </div>
                    <div>
                      <h3 className="font-semibold">{trigger.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        When <span className="text-foreground font-medium">{getSensorLabel(trigger.condition.sensor)}</span> is{' '}
                        <span className="text-foreground font-medium">{getOperatorLabel(trigger.condition.operator)}</span>{' '}
                        <span className="text-primary font-mono">{trigger.condition.value}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {trigger.actions.map((action, actionIndex) => (
                      <div
                        key={actionIndex}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-sm"
                      >
                        <span className="text-primary">{actionIcons[action.type]}</span>
                        <span>{getActionLabel(action.type)}</span>
                        {action.config.device && (
                          <span className="text-muted-foreground">
                            → {action.config.device.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controls */}
                {/* <div className="flex items-center gap-3">
                  <Switch
                    checked={trigger.enabled}
                    onCheckedChange={() => toggleTrigger(trigger.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTrigger(trigger.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div> */}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {/* {triggers.length === 0 && (
          <div className="glass rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Triggers Configured</h3>
            <p className="text-muted-foreground mb-6">
              Create your first automation trigger to respond to sensor changes
            </p>
            <Button onClick={() => setShowNewTrigger(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Trigger
            </Button>
          </div>
        )} */}

        {/* Action Types Reference */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-4">Available Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Mail />, title: 'Email Alert', desc: 'Send email notifications to specified recipients' },
              { icon: <DoorOpen />, title: 'Door Control', desc: 'Open or close greenhouse doors and window' },
              { icon: <LampCeiling />, title: 'Warning indicator', desc: 'Signals warnings and emergencies via dashboard colors and blinking LEDs.' },
            ].map((action, index) => (
              <div
                key={index}
                className="glass rounded-xl p-5 flex items-start gap-4 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {action.icon}
                </div>
                <div>
                  <h4 className="font-medium mb-1">{action.title}</h4>
                  <p className="text-sm text-muted-foreground">{action.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
