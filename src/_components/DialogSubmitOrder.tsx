import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoaderCircleIcon } from "lucide-react";

type DialogSubmitProps = {
  isSubmitting: boolean;
};

export default function DialogSubmit({ isSubmitting }: DialogSubmitProps) {
  return (
    <Dialog open={isSubmitting}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle>Concluindo Operação...</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <LoaderCircleIcon className="animate-spin text-store-secondary w-10 h-10" />
          <p className="text-store-hover-primary">
            Por favor, aguarde enquanto enviamos seu pedido.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
