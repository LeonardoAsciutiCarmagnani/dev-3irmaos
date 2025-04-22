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
    <div className="flex flex-col items-center justify-start h-[17.5rem] bg-gray-50 w-full hover:cursor-pointer hover:shadow-sm transition-all duration-300 ease-in-out shadow-sm">
      <div className="flex flex-col items-center justify-center w-full space-y-2">
        <div className="relative inline-block ">
          <ImageCarousel images={CarouselImages} />
          <Badge className="text-green-500 font-semibold text-sm bg-gray-900 rounded-xs absolute bottom-[-0.45rem] left-1/2 transform -translate-x-1/2 z-[100]">
            <span className="text-white">A partir de</span> R$ {Product.preco}
          </Badge>
        </div>

        <div className="flex flex-col items-center justify-center gap-y-1 md:gap-y-2 p-1">
          <span className="text-gray-800 font-semibold antialiased text-xs md:text-md line-clamp-2 text-center">
            {Product.nome}
          </span>

          <div className="text-green-500 font-semibold text-sm rounded-xs">
            <span
              className="text-red-900 text-xs md:text-sm hover:underline "
              onClick={() =>
                navigate(`/detalhes/${Product.id}`, { state: Product })
              }
            >
              Realizar orçamento
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
