import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AccessDenied() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
        <p className="text-gray-700 mb-6">
          Você não tem permissão para acessar esta página.
        </p>
        <Button onClick={handleGoBack} variant="ghost">
          {" "}
          Voltar
        </Button>
      </div>
    </div>
  );
}
