import { useState, useEffect } from "react";
import {
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  PackageIcon,
  PackagePlusIcon,
  ReceiptIcon,
  UserIcon,
  UserRoundPlusIcon,
  UsersIcon,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import ToastNotifications from "./Toasts";
import useUserTypeStore from "@/context/UserStore";
import useUserStore from "@/context/UserStore";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const { typeUser, username, setUserName } = useUserStore();

  const { toastSuccess } = ToastNotifications();

  const handleLogout = async () => {
    try {
      // Chama o método signOut do Firebase Authentication
      await signOut(auth);
      const setTypeUser = useUserTypeStore.getState().setTypeUser;
      setTypeUser(null);

      toastSuccess("Logout realizado com sucesso!");

      // Limpa o localStorage ou qualquer outro dado de sessão
      localStorage.removeItem("userName");
      localStorage.removeItem("user");
      localStorage.removeItem("loggedUser");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  useEffect(() => {
    const userJSON = localStorage.getItem("loggedUser");
    const getUserName = localStorage.getItem("userName");
    if (userJSON) {
      const user = JSON.parse(userJSON);
      setEmail(user.email);
      setUserName(getUserName);
    }
  }, []);

  return (
    <div className="relative">
      {/* Botão para abrir a Sidebar */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 focus:outline-none"
        aria-label="Abrir menu"
      >
        <MenuIcon className="text-gray-800" size={32} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/50"
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-gray-100 text-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Cabeçalho da Sidebar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-800 focus:outline-none"
            aria-label="Fechar menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo da Sidebar */}
        <div className="p-4">
          {/* Informações do Usuário */}
          <div className="flex items-center gap-x-4 mb-6">
            <UserIcon className="text-amber-500" size={32} />
            <div>
              <p className="font-semibold text-amber-600">{username}</p>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>

          <ul className="space-y-4">
            {typeUser !== "fábrica" && (
              <li>
                <Link
                  to="/"
                  className="block text-gray-800 hover:text-white hover:bg-gray-700 rounded-md px-3 py-2 transition-colors"
                >
                  <span className="flex items-center gap-x-4">
                    <HomeIcon className="text-amber-500" size={24} />
                    Home
                  </span>
                </Link>
              </li>
            )}

            <li>
              <Link
                to={
                  typeUser === "cliente" ? "/get-orders-client" : "/get-orders"
                }
                className="block text-gray-800 hover:text-white hover:bg-gray-700 rounded-md px-3 py-2 transition-colors"
              >
                <span className="flex items-center gap-x-4">
                  <PackageIcon className="text-amber-500" size={24} /> Pedidos
                </span>
              </Link>
            </li>
            {typeUser === "adm" && (
              <>
                <li>
                  <Link
                    to="/prices-lists"
                    className="block text-gray-800 hover:text-white hover:bg-gray-700 rounded-md px-3 py-2 transition-colors"
                  >
                    <span className="flex items-center gap-x-4">
                      <ReceiptIcon className="text-amber-500" size={24} />{" "}
                      Listas de preços
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="block text-gray-800 hover:text-white hover:bg-gray-700 rounded-md px-3 py-2 transition-colors"
                  >
                    <span className="flex items-center gap-x-4">
                      <UserRoundPlusIcon className="text-amber-500" size={24} />{" "}
                      Cadastro de cliente
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/clients"
                    className="block text-gray-800 hover:text-white hover:bg-gray-700 rounded-md px-3 py-2 transition-colors"
                  >
                    <span className="flex items-center gap-x-4">
                      <UsersIcon className="text-amber-500" size={24} />{" "}
                      Clientes
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/create-order-sale"
                    className="block text-gray-800 hover:text-white hover:bg-gray-700 rounded-md px-3 py-2 transition-colors"
                  >
                    <span className="flex items-center gap-x-4">
                      <PackagePlusIcon className="text-amber-500" size={24} />{" "}
                      Criação de pedido
                    </span>
                  </Link>
                </li>{" "}
              </>
            )}
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-gray-800 hover:text-white hover:bg-gray-700 rounded-md px-3 py-2 transition-colors"
              >
                <span className="flex items-center gap-x-4">
                  <LogOutIcon className="text-red-600" size={24} /> Sair
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
