"use client";

import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Props para o componente SuccessDialog
 */
interface SuccessDialogProps {
  /** Controla se o dialog está aberto */
  isOpen: boolean;
  /** Função chamada quando o dialog é fechado */
  onClose: () => void;
  /** Título do dialog */
  title?: string;
  /** Mensagem de sucesso */
  message: string;
  /** Texto do botão de confirmação */
  confirmText?: string;
  /** Função chamada quando o botão de confirmação é clicado */
  onConfirm?: () => void;
  /** URL para redirecionamento após confirmação */
  redirectTo?: string;
}

/**
 * Componente de dialog para exibir mensagens de sucesso
 */
export function SuccessDialog({
  isOpen,
  onClose,
  title = "Tudo certo!",
  message,
  confirmText = "OK",
  onConfirm,
  redirectTo,
}: SuccessDialogProps) {
  const handleConfirm = () => {
    onConfirm?.();

    // Se há uma URL de redirecionamento, redireciona
    if (redirectTo) {
      window.location.href = redirectTo;
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </button>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-6">
          {/* Ícone de sucesso */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          {/* Título */}
          <DialogTitle className="text-xl font-semibold text-center">
            {title}
          </DialogTitle>

          {/* Mensagem */}
          <p className="text-center text-gray-600 px-4">{message}</p>

          {/* Botão de confirmação */}
          <Button
            onClick={handleConfirm}
            className="w-full max-w-xs bg-green-600 hover:bg-green-700 text-white"
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
