import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuthStore } from "@/context/authContext";
import { productsContext } from "@/context/productsContext";
import {
  CircleUserIcon,
  FileBoxIcon,
  HomeIcon,
  Minus,
  ScrollTextIcon,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const { productsInCart, handleRemoveProduct } = productsContext();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  return (
    <div className="flex justify-around items-center border-b border-gray-200 w-screen ">
      <Link to="/" className="flex md:hidden">
        <HomeIcon className="font-bold text-gray-800" />
      </Link>
      <img
        src="/src/assets/logo_3irmaos.png"
        alt="3 Irmãos"
        className="w-[8rem]"
      />

      <div className="flex items-center justify-center gap-x-6 p-1 w-[8rem]">
        <Popover onOpenChange={() => setOpen(!open)} open={open}>
          <PopoverTrigger
            className="flex hover:cursor-pointer"
            onMouseEnter={() => setOpen(true)}
            onClick={() => setOpen(!open)}
          >
            <div className="flex items-center justify-center gap-x-1">
              <FileBoxIcon className="text-gray-700" size={30} />
              <span className="font-semibold text-red-900 text-lg md:text-xl">
                {productsInCart.length}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] flex flex-col space-y-2 rounded-xs">
            {productsInCart.length === 0 ? (
              <span className="text-center text-sm text-gray-700 font-semibold">
                Nenhum produto adicionado ao seu orçamento.
              </span>
            ) : (
              <>
                {productsInCart.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-2 items-center justify-around w-full border-b p-2 border-gray-300"
                  >
                    <span className="font-semibold text-gray-700 text-sm">
                      {product.nome}
                    </span>
                    <div className="w-full flex items-center justify-around">
                      <span className="text-gray-700 flex-1 text-sm flex items-center gap-x-2">
                        <strong>Quantidade:</strong>
                        <div className="flex items-center gap-x-2">
                          <span>{product.quantidade}</span>
                          <span>{`(${product.unidade})`}</span>
                        </div>
                      </span>
                      <Button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="rounded-xs"
                      >
                        {product.quantidade === 1 ? (
                          <Trash2 className="size-4" />
                        ) : (
                          <span className="font-semibold text-xs">
                            <Minus className="size-4" />
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
            <Button
              disabled={productsInCart.length === 0}
              onClick={() => {
                navigate("/orçamento");
                setOpen(false);
              }}
              className="rounded-xs bg-gray-700 hover:bg-gray-800"
            >
              Prosseguir com orçamento
            </Button>
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-x-2">
          <Popover onOpenChange={() => setOpenUser(!openUser)} open={openUser}>
            <PopoverTrigger
              className="flex hover:cursor-pointer"
              onClick={() => setOpenUser(true)}
              onMouseEnter={() => setOpenUser(true)}
            >
              <CircleUserIcon size={35} className="text-gray-700" />
            </PopoverTrigger>
            <PopoverContent className="w-[300px] flex flex-col space-y-2 rounded-xs p-3">
              {user ? (
                <div className="flex flex-col items-start">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-y-0.5">
                      <div className="flex items-center gap-x-3">
                        <h1
                          className={`font-semibold text-gray-900 text-md ${
                            user.role === "admin" ? "text-red-900" : ""
                          }`}
                        >
                          {user.displayName}
                        </h1>
                      </div>
                      <h1 className="text-xs text-gray-400">{user.email}</h1>
                    </div>
                    <Button
                      className="rounded-xs py-2 px-3"
                      onClick={() => {
                        logout();
                      }}
                    >
                      Sair
                    </Button>
                  </div>
                  <div className="flex items-center gap-x-2 mt-4">
                    <ScrollTextIcon className="text-red-900" size={25} />
                    <Link
                      to="/pedidos-e-orçamentos"
                      className="text-sm md:text-md text-gray-900 font-semibold hover:underline hover:cursor-pointer hover:text-red-900"
                    >
                      Orçamentos
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-lg md:text-lg font-semibold text-gray-900">
                    Bem‑vindo!
                  </h1>
                  <p className="text-sm md:text-md text-gray-600 mb-4">
                    Acesse sua conta ou crie uma agora mesmo.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      className="w-full sm:w-auto flex-1 border-gray-300 border-2 p-2 rounded-xs hover:cursor-pointer "
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </button>
                    <button
                      className="w-full sm:w-auto flex-1 border bg-red-900 p-2 rounded-xs text-white hover:cursor-pointer"
                      onClick={() => navigate("/login")}
                    >
                      Criar Conta
                    </button>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
          {user && user.displayName ? (
            <div className="hidden md:flex text-nowrap text-sm font-semibold text-gray-600 hover:cursor-default">
              {user.displayName.split(" ")[0]}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Header;
