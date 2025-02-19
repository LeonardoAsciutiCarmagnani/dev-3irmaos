import { useToast } from "@/hooks/use-toast";

const ToastNotifications = () => {
  const { toast } = useToast();

  const toastSuccess = (description: string) => {
    toast({
      title: "Sucesso!",
      description: description,
      variant: "success",
      duration: 3500,
    });
  };

  const toastError = (description: string) => {
    toast({
      title: "Erro",
      description: description,
      variant: "error",
      duration: 3500,
    });
  };

  return {
    toastSuccess,
    toastError,
  };
};

export default ToastNotifications;
