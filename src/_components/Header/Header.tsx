import { FileBoxIcon } from "lucide-react";

const Header = () => {
  return (
    <div className="flex justify-around items-center border-b border-gray-200">
      <div>
        <img src="/src/assets/logo.png" alt="3 Irmãos" className="w-[70%]" />
      </div>
      <div className="hover:cursor-pointer">
        <FileBoxIcon color="darkred" />
      </div>
    </div>
  );
};

export default Header;
