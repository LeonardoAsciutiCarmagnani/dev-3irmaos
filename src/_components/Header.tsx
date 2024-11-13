import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig"; // Instância do Firebase Auth
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import voidCart from "../assets/cart-xmark-svgrepo-com.svg";
import { useZustandContext } from "../context/cartContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";

const Header: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const { countItemsInCart, listProductsInCart } = useZustandContext();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Contando os itens no carrinho: ", countItemsInCart);
  }, [countItemsInCart]);

  const fetchUserData = () => {
    const user = auth.currentUser;
    if (user?.displayName) {
      localStorage.setItem("userName", user.displayName);
      const getUserName = localStorage.getItem("userName");
      setUserName(getUserName);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [countItemsInCart]);

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="flex items-center">
        <span className="text-xl font-semibold text-gray-800">
          {userName ? `Olá, ${userName}` : "Bem-vindo!"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Icone do carrinho de compras + o count de produtos selecionados */}
        <Sheet>
          <SheetTrigger>
            <div className="flex  items-center rounded-md p-2 gap-1 bg-red-500">
              <ShoppingCart color="white" />
              <span className="text-base text-white">{countItemsInCart}</span>
            </div>
          </SheetTrigger>
          <SheetContent className="flex flex-col p-2 text-center items-center overflow-scroll">
            <SheetHeader>
              <SheetTitle>
                Vamos conferir todos os produtos selecionados ?
              </SheetTitle>
              <SheetDescription className="text-base text-black font-semibold">
                Total de itens:{" "}
                <span className="underline text-lg">{countItemsInCart}</span>
              </SheetDescription>
            </SheetHeader>
            {listProductsInCart.length < 1 ? (
              <>
                <img src={voidCart} alt="Carrinho vazio" className="size-16" />
                <span>Nenhum produto adicionado ao carrinho. 😢</span>
              </>
            ) : (
              <>
                {listProductsInCart.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col items-center p-4 text-center border border-gray-300 rounded-lg shadow-lg space-y-3 bg-white"
                    >
                      <img
                        src={item.imagem}
                        alt="Imagem referente ao produto selecionado"
                        className="w-36 h-36 object-cover rounded-md border border-gray-200"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.nome}
                        </h3>
                      </div>
                      <div className="text-gray-600">
                        <span>
                          Quantidade:{" "}
                          <span className="font-medium">{item.quantity}</span>
                        </span>
                      </div>
                      <div className="text-gray-600">
                        <span>
                          Valor unitário:{" "}
                          <span className="font-semibold text-green-600">
                            {item.preco.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}{" "}
            {listProductsInCart.length > 0 ? (
              <Link to={"/buyList"}>
                <Button>
                  <span>Pedido conferido !</span>
                </Button>
              </Link>
            ) : (
              <Button disabled={listProductsInCart.length === 0}>
                <span>Pedido conferido !</span>
              </Button>
            )}
          </SheetContent>
        </Sheet>
        {/* Botão de Logout */}
        <button
          onClick={handleLogout}
          className="bg-transparent text-gray-600 hover:text-gray-800 border-2 border-gray-600 hover:bg-gray-100 py-2 px-4 rounded-md text-sm "
        >
          Sair
        </button>
      </div>
    </header>
  );
};

export default Header;
