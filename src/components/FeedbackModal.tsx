
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Megaphone } from "lucide-react";

const FEEDBACK_API =
  "https://chat.googleapis.com/v1/spaces/AAAANO1zhRM/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=mcR1cRRO6n-kX20fOWJuuwEXT09rKYAGQLF43Wm0j4s";

export default function FeedbackModal() {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Função para enviar feedback para a API
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mensagem com marcações para o Google Chat
    const mensagem = isAnonymous
      ? `*Feedback Assistentes de Produtividade*\n` +
        `*Tipo:* Feedback Anônimo\n` +
        `*Descrição:* ${description}`
      : `*Feedback Assistentes de Produtividade*\n` +
        `*Nome:* ${fullName}\n` +
        `*E-mail:* ${email}\n` +
        `*Descrição:* ${description}`;

    const payload = {
      text: mensagem,
    };

    try {
      const resp = await fetch(FEEDBACK_API, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (resp.ok) {
        setOpen(false);
        setFullName("");
        setEmail("");
        setDescription("");
        setIsAnonymous(false);
        toast({
          title: "Feedback enviado com sucesso",
          variant: "default",
        });
      } else {
        throw new Error();
      }
    } catch {
      toast({
        title: "Erro ao enviar feedback",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-full px-3 py-1 border-primary/40 hover:bg-primary/10"
          type="button"
        >
          <Megaphone className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Enviar feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Enviar feedback</DialogTitle>
          <DialogDescription>
            Queremos saber o que você achou dos Assistentes de Produtividade. Sua opinião é super importante pra gente continuar melhorando a experiência.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSend} className="flex flex-col gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked === true)}
            />
            <label
              htmlFor="anonymous"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Enviar feedback anônimo
            </label>
          </div>
          
          {!isAnonymous && (
            <>
              <div>
                <label className="text-sm font-medium block mb-1" htmlFor="nome">Nome completo</label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  maxLength={150}
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1" htmlFor="email">E-mail</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="text-sm font-medium block mb-1" htmlFor="descricao">Descrição</label>
            <Textarea
              id="descricao"
              placeholder="Descreva sua experiência, sugestões ou problemas encontrados."
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              maxLength={1000}
            />
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button 
              type="submit"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
