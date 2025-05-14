import { Badge } from "@/components/ui/badge";
import { ImageCarousel } from "./carousel";
import { Product } from "@/interfaces/Product";
import { useNavigate } from "react-router-dom";

const ProductCard = (Product: Product) => {
  const navigate = useNavigate();

  const CarouselImages = [
    { imagem: Product.imagem },
    ...Product.imagensAdicionais,
  ];

  return (
    <div
      onClick={() => navigate(`/detalhes/${Product.id}`, { state: Product })}
      className="hover:cursor-pointer flex flex-col items-center justify-between h-[17.5rem] bg-gray-50/80 w-full hover:shadow-md transition-all duration-300 ease-in-out shadow-sm shadow-gray-300"
    >
      <div className="flex flex-col items-center justify-start w-full space-y-2">
        <div className="relative inline-block w-full">
          <ImageCarousel images={CarouselImages} />
          <Badge className="text-green-500 font-semibold text-sm bg-gray-900 rounded-xs absolute bottom-[-0.45rem] left-1/2 transform -translate-x-1/2 z-[100]">
            <span>Valor sob consulta</span>
          </Badge>
        </div>

        <div className="flex flex-col items-center justify-center md:gap-y-2 p-1 gap-y-0.5">
          <span className="text-gray-800 font-semibold antialiased text-xs md:text-[0.9rem] line-clamp-2 text-center">
            {Product.nome}
          </span>

          <div className="text-green-500 font-semibold text-sm rounded-xs">
            <Badge
              variant={"secondary"}
              className="text-red-900 text-xs md:text-sm hover:underline border-red-900 rounded-xs hover:bg-red-900 hover:text-white transition-all duration-300 ease-in-out"
              onClick={() =>
                navigate(`/detalhes/${Product.id}`, { state: Product })
              }
            >
              Realizar orçamento
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
