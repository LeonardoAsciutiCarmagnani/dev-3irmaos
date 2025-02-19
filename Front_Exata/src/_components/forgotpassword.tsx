import { useState, FormEvent } from "react";
import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import ToastNotifications from "../_components/Toasts";
import apiBaseUrl from "@/lib/apiConfig";
import axios from "axios";
import { sendPasswordResetEmail, getAuth } from "firebase/auth";

const PasswordRecovery = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { toastError, toastSuccess } = ToastNotifications();
  const auth = getAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Por favor, digite seu e-mail");
      setSuccess(false);
      return;
    }

    try {
      const response = await axios.post(
        `${apiBaseUrl}/check-email`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setSuccess(true);
        setError("");
        await sendPasswordResetEmail(auth, email);
        toastSuccess(`Verifique o email ${email} para redefinir sua senha.`);
      } else {
        setSuccess(false);
        toastError("Erro inesperado. Verifique o console para mais detalhes.");
        console.error("Resposta inesperada da API:", response);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorMessage =
            error.response.data.message ||
            "Erro ao processar a recuperação de senha.";
          setSuccess(false);
          toastError(errorMessage);
        } else {
          setSuccess(false);
          toastError("Erro de conexão. Verifique sua rede.");
        }
      } else {
        console.error("Erro ao enviar a requisição:", error);
        toastError("Ocorreu um erro ao processar sua solicitação.");
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="text-sm font-medium text-store-primary hover:text-store-hover-primary">
        Esqueceu a senha?
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Recuperação de Senha
          </DialogTitle>
          {!success && (
            <DialogDescription>Digite o e-mail cadastrado</DialogDescription>
          )}
        </DialogHeader>

        {success ? (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertDescription>
              Verifique seu email para redefinir sua senha.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 block w-full rounded-md border border-gray-300 py-2 text-gray-900 shadow-sm focus:ring-2 focus:border-store-primary"
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-store-primary hover:bg-store-hover-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-store-primary"
            >
              Enviar instruções
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PasswordRecovery;
