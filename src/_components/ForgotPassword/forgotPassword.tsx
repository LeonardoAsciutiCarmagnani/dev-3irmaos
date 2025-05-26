import { useState, FormEvent } from "react";
import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { sendPasswordResetEmail, getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../Utils/FirebaseConfig";
import { toast } from "sonner";
import axios from "axios";
import Loader from "../Loader/loader";

const PasswordRecovery = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const auth = getAuth();

  const checkEmail = async () => {
    try {
      setIsLoading(true);
      const clientsRef = collection(db, "clients");

      const queryEmail = query(clientsRef, where("email", "==", email));
      const querySnapshotEmail = await getDocs(queryEmail);

      if (!querySnapshotEmail.empty) {
        return {
          status: 200,
          message: "E-mail encontrado.",
        };
      } else {
        return {
          status: 404,
          message: "E-mail não encontrado.",
        };
      }
    } catch (error) {
      console.error("Erro ao verificar o e-mail:", error);
      toast.error("Erro ao verificar o e-mail. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Por favor, digite seu e-mail");
      setSuccess(false);
      return;
    }

    try {
      const checkedEmail = await checkEmail();

      if (checkedEmail?.status === 200) {
        setSuccess(true);
        setError("");
        await sendPasswordResetEmail(auth, email);
        toast.success(
          `Redefinição de senha enviada com sucesso para ${email}`,
          {
            id: "password-reset-success",
            description: "Verifique sua caixa de entrada ou spam.",
            duration: Infinity,
          }
        );
      } else {
        setSuccess(false);
        toast.error(`${checkedEmail?.message}`, {
          id: "email-not-found",
        });
        console.error("Resposta inesperada da API:", checkedEmail);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorMessage =
            error.response.data.message ||
            "Erro ao processar a recuperação de senha.";
          setSuccess(false);
          toast.error(errorMessage);
        } else {
          setSuccess(false);
          toast.error("Erro de conexão. Verifique sua rede.");
        }
      } else {
        console.error("Erro ao enviar a requisição:", error);
        toast.error("Ocorreu um erro ao processar sua solicitação.");
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="text-sm font-extrabold hover:cursor-pointer hover:underline text-red-900 ">
        AQUI
      </DialogTrigger>
      <DialogContent className="bg-white rounded-xs">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Recuperação de Senha
          </DialogTitle>
          {!success && (
            <DialogDescription>Digite o e-mail cadastrado</DialogDescription>
          )}
        </DialogHeader>

        {success ? (
          <Alert className="bg-white text-red-800 border-red-900 border-dotted rounded-xs">
            <AlertDescription className="text-xs">
              <div>Foi enviado um e-mail de redefinição de senha.</div>
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
                className="pl-10 block w-full rounded-xs border border-gray-300 py-2 text-gray-900 shadow-sm focus:ring-2 focus:border-store-primary"
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xs shadow-sm text-sm font-medium text-red-900  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-store-primary"
            >
              Enviar instruções
            </button>
          </form>
        )}
        {isLoading && <Loader />}
      </DialogContent>
    </Dialog>
  );
};

export default PasswordRecovery;
