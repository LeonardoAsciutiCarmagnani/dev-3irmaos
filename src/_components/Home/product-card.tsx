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
    <div className="flex flex-col  items-center justify-center h-full bg-gray-50 w-full hover:scale-101 hover:cursor-pointer hover:shadow-sm transition-all duration-300 ease-in-out shadow-sm">
      <div className="flex flex-col items-center justify-center w-full space-y-1">
        <ImageCarousel images={CarouselImages} />

        <div className="flex flex-col items-center justify-center gap-y-2 p-1">
          <span className="text-gray-800 font-semibold antialiased text-sm md:text-md line-clamp-2 text-center">
            {Product.nome}
          </span>
          <Badge
            variant={"secondary"}
            className="text-green-500 font-semibold text-sm rounded-xs border border-gray-300"
          >
            <span className="text-gray-800">A partir de</span> R${" "}
            {Product.preco}
          </Badge>
          <div className="text-green-500 font-semibold text-sm rounded-xs ">
            <span
              className="text-gray-800 text-lg underline hover:text-emerald-500"
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
