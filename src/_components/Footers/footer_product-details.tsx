import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { productsContext } from "@/context/productsContext";
import { Minus, ShoppingCartIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FooterProductDetails = () => {
  const { productsInCart, handleRemoveProduct } = productsContext();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="w-full h-[8rem] flex flex-col items-end justify-around border-t px-4 pb-2 bg-gray-50 border-gray-300">
      <div>
        <Popover onOpenChange={() => setOpen(!open)} open={open}>
          <PopoverTrigger
            className="flex hover:cursor-pointer"
            onMouseEnter={() => setOpen(true)}
            onClick={() => setOpen(!open)}
          >
            <div className="flex items-center justify-center gap-x-1">
              <ShoppingCartIcon className="text-gray-900" size={30} />
              <span className="font-semibold text-red-900 text-lg md:text-xl">
                {productsInCart.length}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] flex flex-col space-y-2 rounded-xs">
            {productsInCart.length === 0 ? (
              <span className="text-center text-sm text-gray-700 font-semibold">
                Nenhum produto adicionado ao seu carrinho.
              </span>
            ) : (
              <>
                {productsInCart.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-2 items-center justify-around w-full border-b p-2 border-gray-300"
                  >
                    <span className="font-semibold text-gray-900 text-sm">
                      {product.nome}
                    </span>
                    <div className="w-full flex items-center justify-around">
                      <span className="text-gray-700 flex-1 text-sm flex items-center gap-x-2">
                        <strong>Quantidade:</strong>
                        <div className="flex items-center gap-x-0.5">
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
                <div className="flex items-center justify-between w-full py-2 border-b border-gray-300">
                  <h1 className="text-gray-900 font-semibold">Total:</h1>
                  <span className="text-emerald-600 font-semibold text-sm">
                    {productsInCart
                      .reduce(
                        (total, product) =>
                          total + product.preco * (product.quantidade ?? 0),
                        0
                      )
                      .toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                  </span>
                </div>
              </>
            )}
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-end gap-x-2">
        <Button
          type="button"
          onClick={() => navigate("/")}
          className="w-fit text-xs md:text-sm bg-gray-200 text-gray-900 rounded-xs  py-1 md:py-2 px-2 md:px-4 hover:bg-gray-300 hover:text-gray-50 transition-colors"
        >
          Adicionar outros produtos
        </Button>

        <Button
          type="button"
          className="w-fit text-xs md:text-sm bg-emerald-600 text-white rounded-xs py-1 md:py-2 px-2 md:px-4 hover:bg-green-700 transition-colors"
          onClick={() => navigate("/orçamento")}
          disabled={productsInCart.length === 0}
        >
          Prosseguir com orçamento
        </Button>
      </div>
    </div>
  );
};

export default FooterProductDetails;
