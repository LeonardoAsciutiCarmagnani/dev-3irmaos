import { ImageCarousel } from "./carousel";

const ProductCard = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 w-full hover:scale-101 hover:cursor-pointer hover:shadow-sm transition-all duration-300 ease-in-out  shadow-sm">
      <div className="flex flex-col items-center justify-center w-full gap-y-2 space-y-2">
        <ImageCarousel />
        <div className="flex flex-col items-center justify-center gap-y-0.5">
          <span className="text-gray-800 font-semibold antialiased text-md md:text-lg">
            Porta de Peróba
          </span>
          <span className="text-green-500 font-semibold text-sm">
            <span className="text-gray-800">A partir de</span> R$ 15.430,00{" "}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
