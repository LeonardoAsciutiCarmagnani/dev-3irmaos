import { Badge } from "@/components/ui/badge";
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
  MenuIcon,
  ScrollTextIcon,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const { productsInCart, handleRemoveProduct } = productsContext();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  return (
    <div className="flex justify-between md:justify-around px-2 items-center border-b border-gray-200">
      <div className="flex items-center justify-around">
        <MenuIcon className="hover:cursor-pointer md:hidden flex" size={30} />
        <img src="/src/assets/logo.png" alt="3 Irmãos" className="w-[60%]" />
      </div>
      <div className="flex items-end justify-evenly gap-x-8 p-1 w-[8rem]">
        <Popover onOpenChange={() => setOpen(!open)} open={open}>
          <PopoverTrigger
            className="flex hover:cursor-pointer"
            onMouseEnter={() => setOpen(true)}
            onClick={() => setOpen(!open)}
          >
            <FileBoxIcon color="darkred" />
            <span className="font-semibold text-red-900 text-lg">
              {productsInCart.length}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] flex flex-col space-y-2 rounded-xs">
            {productsInCart.length === 0 ? (
              <span className="text-center text-sm text-gray-700 font-semibold">
                Nenhum produto adicionado ao seu orçamento.
              </span>
            ) : (
              <>
                {productsInCart.map((product) => (
                  <div className="flex flex-col gap-2 items-center justify-around w-full border-b p-2 border-red-900">
                    <span className="font-semibold text-gray-700 text-sm">
                      {product.nome}
                    </span>
                    <div className="w-full flex items-center justify-around">
                      <span className="text-gray-700 flex-1 text-sm">
                        <strong>Quantidade:</strong> {product.quantidade}
                      </span>
                      <Button onClick={() => handleRemoveProduct(product.id)}>
                        {product.quantidade === 1 ? (
                          <Trash2 className="size-4" />
                        ) : (
                          <span className="font-semibold text-xs">
                            Remover Un.
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
              className="rounded-xs"
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
              <CircleUserIcon size={35} className="text-gray-800" />
            </PopoverTrigger>
            <PopoverContent className="w-[300px] flex flex-col space-y-2 rounded-xs p-3">
              {user ? (
                <div className="flex flex-col items-start">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-y-1">
                      <div className="flex items-center gap-x-3">
                        <h1 className="font-semibold text-gray-900">
                          {user.displayName}
                        </h1>
                        {user.role === "admin" && (
                          <Badge className="bg-red-900">ADM</Badge>
                        )}
                      </div>
                      <h1>
                        <h2 className="text-xs">{user.email}</h2>
                      </h1>
                    </div>
                    <Button className="rounded-xs py-2 px-3">Sair</Button>
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
                  <h1 className="text-lg md:text-xl font-semibold text-gray-900">
                    Olá, seja bem‑vindo!
                  </h1>
                  <p className="text-sm md:text-base text-gray-600 mb-4">
                    Acesse sua conta ou crie uma nova.
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
            <div
              className={`${
                user.role === "admin" && "text-red-900 font-bold"
              } hidden md:flex text-nowrap text-sm font-semibold text-gray-600 hover:cursor-default`}
            >
              {user.displayName.split(" ")[0]}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Header;
