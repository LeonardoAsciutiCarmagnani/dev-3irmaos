import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { productsContext } from "@/context/productsContext";
import { FileBoxIcon } from "lucide-react";

const Header = () => {
  const { productsInCart } = productsContext();
  console.log(productsInCart);

  return (
    <div className="flex justify-around items-center border-b border-gray-200">
      <div>
        <img src="/src/assets/logo.png" alt="3 Irmãos" className="w-[70%]" />
      </div>
      <Popover>
        <PopoverTrigger className="flex hover:cursor-pointer">
          <FileBoxIcon color="darkred" />
          <span className="font-semibold text-red-900 text-lg">
            {productsInCart.length}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-[600px]">
          {productsInCart.map((product) => (
            <div className="flex flex-col gap-2 items-center justify-around w-full border p-2 rounded-lg">
              <span className="font-semibold text-gray-700">
                {product.nome}
              </span>
              <span>
                <strong className="text-gray-700">Qtd:</strong>{" "}
                {product.quantidade}
              </span>
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Header;
