import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/context/authContext";
import { ArrowRight, FileBoxIcon, Home } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const clientMenuItems = [
    { label: "Tela inicial", path: "/", icon: <Home className="size-6" /> },
    {
      label: "Orçamentos",
      path: "/pedidos-e-orçamentos",
      icon: <FileBoxIcon className="size-6" />,
    },
  ];
  return (
    <div
      className={`flex flex-col justify-between transition-all duration-400 ${
        open ? "w-48" : "w-12"
      } pt-4`}
    >
      <div className="flex flex-col justify-start gap-y-4 h-full">
        <div
          onClick={() => setOpen(!open)}
          className={`flex flex-col gap-y-2 mb-2 px-2 w-full cursor-pointer ${
            open ? "items-end" : "items-center"
          }`}
        >
          <ArrowRight
            size={26}
            className={`text-red-500 rounded-xs transition-transform duration-400 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
        <div className="flex flex-col gap-y-2">
          {clientMenuItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center p-2 hover:bg-red-200 cursor-pointer"
              onClick={() => navigate(`${item.path}`)}
            >
              {item.icon}
              {open && (
                <span className="relative text-md transition-all duration-300 translate-x-2 text-nowrap">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {user ? (
        <div className="flex flex-col items-center gap-y-1 border-t-2 p-2 transition-all duration-300">
          {/* Exibe ou oculta o email com transição */}
          <div
            className={`text-xs transition-all duration-300 text-gray-700 font-semibold ${
              open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            }`}
          >
            {user?.email}
          </div>
          <div className="flex items-center gap-x-2 transition-all duration-300">
            <Badge
              variant={user?.role === "admin" ? "destructive" : "default"}
              className="sr-only"
            >
              {open ? (
                user?.role === "admin" ? (
                  "Admin"
                ) : (
                  "Cliente"
                )
              ) : (
                <span>{user?.role === "admin" ? "Admin" : "Cliente"}</span>
              )}
            </Badge>
            <div className="flex gap-x-1 items-center">
              <button
                onClick={() => logout()}
                className="text-sm underline text-red-400 hover:cursor-pointer transition-all duration-300"
              >
                {open ? "Sair" : <span>Sair</span>}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-y-1 border-t-2 p-2 transition-all duration-300">
          <div
            className={`text-xs transition-all duration-300 text-gray-700 font-semibold ${
              open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            }`}
          >
            <Badge variant="outline">
              <div className="text-center font-semibold">
                <h1>
                  <span className="text-green-600 text-[0.9rem] font-bold hover:cursor-pointer">
                    Registre-se
                  </span>{" "}
                  ou
                </h1>
                <h1>
                  <Link
                    to={"/login"}
                    className="text-blue-600 text-[0.9rem] font-bold hover:cursor-pointer"
                  >
                    Entre
                  </Link>{" "}
                  para comprar
                </h1>
              </div>
            </Badge>
          </div>
          {/* 
          <div className="flex gap-x-4 mt-2">
            <button
              onClick={() => navigate("/login")}
              className="text-sm hover:underline text-blue-600 hover:cursor-pointer transition-all duration-300 font-bold"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-sm hover:underline text-green-600 hover:cursor-pointer transition-all duration-30 font-bold"
            >
              Criar Conta
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
