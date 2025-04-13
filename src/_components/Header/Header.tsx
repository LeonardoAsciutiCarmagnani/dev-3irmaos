import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { productsContext } from "@/context/productsContext";
import { PopoverClose } from "@radix-ui/react-popover";
import { FileBoxIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { productsInCart, handleRemoveProduct } = productsContext();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-around items-center border-b border-gray-200">
      <div>
        <img src="/src/assets/logo.png" alt="3 Irmãos" className="w-[70%]" />
      </div>
      <Popover onOpenChange={() => setOpen(!open)} open={open}>
        <PopoverTrigger
          className="flex hover:cursor-pointer"
          onMouseEnter={() => setOpen(true)}
        >
          <FileBoxIcon color="darkred" />
          <span className="font-semibold text-red-900 text-lg">
            {productsInCart.length}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] flex flex-col space-y-2  border-red-900">
          <div className=" flex items-center justify-end">
            <PopoverClose className=" text-end text-lg font-bold text-red-900 hover:cursor-pointer">
              X
            </PopoverClose>
          </div>
          {productsInCart.length === 0 ? (
            <span className="text-center text-gray-700 font-semibold">
              Nenhum produto adicionado ao seu orçamento
            </span>
          ) : (
            <>
              {productsInCart.map((product) => (
                <div className="flex flex-col gap-2 items-center justify-around w-full border-b p-2  border-red-900">
                  <span className="font-semibold text-gray-700">
                    {product.nome}
                  </span>
                  <div className=" w-3/5 flex items-center p-2">
                    <span className="text-gray-700 flex-1 text-center">
                      <strong>Qtd:</strong> {product.quantidade}
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
          >
            Prosseguir com orçamento
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Header;
