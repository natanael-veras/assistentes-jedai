
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Thermometer, Zap, Scale, BarChart, Info } from 'lucide-react';

interface TemperatureSelectProps {
  control: Control<any>;
}

const TemperatureSelect: React.FC<TemperatureSelectProps> = ({ control }) => {
  const temperatureOptions = [
    {
      value: '1.2',
      label: 'Criativo',
      icon: Zap,
      description: 'Respostas mais criativas e variadas'
    },
    {
      value: '0.9',
      label: 'Informal',
      icon: Thermometer,
      description: 'Tom mais descontraído e flexível'
    },
    {
      value: '0.5',
      label: 'Balanceado',
      icon: Scale,
      description: 'Equilibrio entre criatividade e consistência'
    },
    {
      value: '0',
      label: 'Neutro',
      icon: BarChart,
      description: 'Respostas mais precisas e determinísticas'
    }
  ];

  return (
    <FormField
      control={control}
      name="temperature"
      render={({ field }) => {
        const selectedOption = temperatureOptions.find(option => option.value === field.value);
        
        return (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-sm font-medium">
              Temperatura
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Controla a criatividade das respostas da IA. Valores mais altos geram respostas mais criativas e variadas, enquanto valores mais baixos produzem respostas mais precisas e determinísticas.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  {selectedOption ? (
                    <div className="flex items-center space-x-2">
                      <selectedOption.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedOption.label}</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Selecione a temperatura" />
                  )}
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {temperatureOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </FormItem>
        );
      }}
    />
  );
};

export default TemperatureSelect;
