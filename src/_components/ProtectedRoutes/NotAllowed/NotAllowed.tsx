import { LockIcon } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white0 p-6">
      <div className="max-w-md w-full bg-opacity-75 rounded-xs shadow-xl p-8 text-center">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-red-100 bg-opacity-20 border border-red-300 shadow-md">
            <LockIcon className="h-12 w-12 text-red-900 animate-pulse" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">
          Acesso Negado
        </h1>
        <p className="text-red-900 text-md">
          Essa página é restrita para administradores.
        </p>
        <p className="text-gray-800 mb-6 text-[0.8rem]">
          Você não tem permissão para acessar esta página.
        </p>
        <button
          className="px-6 py-3 bg-blue-400 hover:bg-blue-600 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-none text-white font-semibold transition-transform transform hover:scale-105"
          onClick={() => window.history.back()}
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
