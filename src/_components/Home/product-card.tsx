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

  const CategoriesWithValue = ["Portas Pronta Entrega", "Antiguidades"];

  return (
    <div
      onClick={() => navigate(`/detalhes/${Product.id}`, { state: Product })}
      className="group relative hover:cursor-pointer flex flex-col h-[16rem] w-full bg-gradient-to-b from-white to-gray-50 rounded-xs shadow-md hover:shadow-xl transition-all duration-300 ease-in-out overflow-hidden"
    >
      {/* Container de imagem com altura fixa e efeito de escala no hover */}
      <div className="relative h-45 w-full overflow-hidden">
        <div className="absolute inset-0 transform group-hover:scale-105 transition-transform duration-500">
          <div className="h-full w-full">
            <ImageCarousel images={CarouselImages} />
          </div>
        </div>

        {/* Overlay com gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Detalhe decorativo */}

      {/* Conteúdo do produto com posicionamento mais dinâmico */}
      <div className="flex flex-col justify-between flex-1 p-3 relative">
        {/* Badge de preço com design mais destacado */}
        <div className="absolute -top-5 right-1 z-10">
          <Badge
            className={`px-3 py-1.5 font-semibold shadow-lg rounded-xs ${
              !CategoriesWithValue.includes(Product.categoria)
                ? "bg-blue-600 text-white"
                : "bg-emerald-600 text-white"
            }`}
          >
            {!CategoriesWithValue.includes(Product.categoria) ? (
              <span className="text-[0.7rem] tracking-wide">
                VALOR SOB CONSULTA
              </span>
            ) : (
              <span className="text-xs tracking-wide">
                {Product.preco.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            )}
          </Badge>
        </div>

        {/* Título do produto com melhor tipografia */}
        <h3 className="text-gray-800 capitalize font-medium text-xs line-clamp-2 md:text-[0.8rem] 2xl:text-lg leading-tight mt-2 md:line-clamp-1">
          {Product.nome}
        </h3>

        {/* Elemento visual adicional e call-to-action */}
        <div className="flex items-center justify-end mt-3">
          <span className="text-sm font-medium text-red-900 group-hover:underline">
            Ver detalhes
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
