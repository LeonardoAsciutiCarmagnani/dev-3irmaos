import React from "react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface DialogExclusionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
}

const DialogExclusion: React.FC<DialogExclusionProps> = ({
  isOpen,
  onClose,
  onConfirm,
  name,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Tem certeza de que deseja excluir "{name}"?
          </DialogDescription>
          <DialogFooter>
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded px-4 py-2"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2"
              onClick={onConfirm}
            >
              Excluir
            </button>
          </DialogFooter>
          <DialogClose />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default DialogExclusion;
