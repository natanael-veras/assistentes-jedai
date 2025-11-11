
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

// Form schema for Epic
const epicSchema = z.object({
  title: z.string().min(3, { message: 'O título deve ter pelo menos 3 caracteres' }),
  description: z.string().min(10, { message: 'A descrição deve ter pelo menos 10 caracteres' }),
  businessValue: z.string().min(5, { message: 'O valor de negócio deve ser especificado' }),
  acceptanceCriteria: z.string().min(10, { message: 'Os critérios de aceitação devem ser especificados' }),
});

// Form schema for Task
const taskSchema = z.object({
  title: z.string().min(3, { message: 'O título deve ter pelo menos 3 caracteres' }),
  description: z.string().min(10, { message: 'A descrição deve ter pelo menos 10 caracteres' }),
  estimatedHours: z.string().refine((val) => !isNaN(Number(val)), {
    message: 'Horas estimadas devem ser um número',
  }),
  priority: z.string().min(1, { message: 'A prioridade deve ser especificada' }),
  dependencies: z.string().optional(),
});

type EpicFormValues = z.infer<typeof epicSchema>;
type TaskFormValues = z.infer<typeof taskSchema>;

interface ProductOwnerFormsProps {
  formType: 'epic' | 'task' | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, type: 'epic' | 'task') => Promise<void>;
}

const ProductOwnerForms: React.FC<ProductOwnerFormsProps> = ({
  formType,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Epic form
  const epicForm = useForm<EpicFormValues>({
    resolver: zodResolver(epicSchema),
    defaultValues: {
      title: '',
      description: '',
      businessValue: '',
      acceptanceCriteria: '',
    },
  });

  // Task form
  const taskForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      estimatedHours: '',
      priority: 'Média',
      dependencies: '',
    },
  });

  const handleSubmit = async (values: EpicFormValues | TaskFormValues) => {
    if (!formType) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(values, formType);
      if (formType === 'epic') {
        epicForm.reset();
      } else {
        taskForm.reset();
      }
      onClose();
      toast.success(`${formType === 'epic' ? 'Épico' : 'Tarefa'} criado com sucesso!`);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      toast.error(`Erro ao criar ${formType === 'epic' ? 'épico' : 'tarefa'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        {formType === 'epic' && (
          <>
            <DialogHeader>
              <DialogTitle>Criar Novo Épico</DialogTitle>
              <DialogDescription>
                Preencha os detalhes do épico para adicioná-lo ao backlog do produto.
              </DialogDescription>
            </DialogHeader>
            <Form {...epicForm}>
              <form onSubmit={epicForm.handleSubmit((data) => handleSubmit(data))} className="space-y-4">
                <FormField
                  control={epicForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título do épico" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={epicForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva o épico em detalhes" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={epicForm.control}
                  name="businessValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor de Negócio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva o valor de negócio deste épico" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={epicForm.control}
                  name="acceptanceCriteria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Critérios de Aceitação</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Liste os critérios de aceitação" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando...' : 'Criar Épico'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}

        {formType === 'task' && (
          <>
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da tarefa para adicioná-la ao backlog.
              </DialogDescription>
            </DialogHeader>
            <Form {...taskForm}>
              <form onSubmit={taskForm.handleSubmit((data) => handleSubmit(data))} className="space-y-4">
                <FormField
                  control={taskForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título da tarefa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taskForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva a tarefa em detalhes" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taskForm.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horas Estimadas</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Exemplo: 8" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Informe uma estimativa em horas para esta tarefa
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taskForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Alta, Média, Baixa" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taskForm.control}
                  name="dependencies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dependências (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="IDs de tarefas dependentes" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Liste os IDs das tarefas que esta tarefa depende, separados por vírgula
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando...' : 'Criar Tarefa'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductOwnerForms;
