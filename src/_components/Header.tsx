import React, { useEffect } from "react";
import { Link } from "react-router-dom";
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
import logoKyoto from "../assets/logo.png";
import Sidebar from "./Sidebar";

const Header: React.FC = () => {
  // const [userName, setUserName] = useState<string | null>(null);
  const { countItemsInCart, listProductsInCart } = useZustandContext();
  // const navigate = useNavigate();

  useEffect(() => {
    console.log("Contando os itens no carrinho: ", countItemsInCart);
  }, [countItemsInCart]);

  useEffect(() => {}, [countItemsInCart]);

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md fixed top-0 w-full z-10">
      <div className="flex items-center gap-x-4">
        <Sidebar />
      </div>
      <div>
        <img src={logoKyoto} alt="Kyoto" className="rounded-full size-[4rem]" />
      </div>
      <div className="flex items-center gap-3">
        {/* Icone do carrinho de compras + o count de produtos selecionados */}
        <Sheet>
          <SheetTrigger>
            <div className="flex items-center">
              <ShoppingCart
                className="text-gray-800 relative left-3"
                size={32}
              />
              <span className="relative right-[0.2rem] bottom-2.5 flex items-center justify-center text-lg text-black bg-yellow-400 border-2 border-black rounded-full size-6 font-semibold">
                {countItemsInCart}
              </span>
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
                      className="flex flex-col items-center w-60 p-4 text-center border border-gray-300 rounded-lg shadow-lg space-y-3 bg-white"
                    >
                      {item.imagem ? (
                        <img
                          src={item.imagem}
                          alt="Imagem referente ao produto selecionado"
                          className="w-36 h-36 object-cover rounded-md border border-gray-200"
                        />
                      ) : (
                        <div className="w-full h-28 sm:h-32 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
                          Sem imagem
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 ">
                          {item.nome}
                        </h3>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {item.categoria}
                        </h3>
                      </div>
                      <div className="text-gray-600">
                        <span>
                          Quantidade:{" "}
                          <span className="font-medium">{item.quantidade}</span>
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
      </div>
    </header>
  );
};

export default Header;
