import { productsContext } from "@/context/productsContext";
import { FileBoxIcon } from "lucide-react";

const Header = () => {
  const { productsInCart } = productsContext();

  return (
    <div className="flex justify-around items-center border-b border-gray-200">
      <div>
        <img src="/src/assets/logo.png" alt="3 Irmãos" className="w-[70%]" />
      </div>
      <div className="flex hover:cursor-pointer">
        <FileBoxIcon color="darkred" />
        <span className="font-semibold text-red-900 text-lg">
          {productsInCart.length}
        </span>
      </div>
    </div>
  );
};

export default Header;
