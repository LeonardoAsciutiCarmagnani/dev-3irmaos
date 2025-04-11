import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/interfaces/Product";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Fade from "embla-carousel-fade";
import Autoplay from "embla-carousel-autoplay";

export const DetailsProduct = () => {
  const { state } = useLocation();
  const [typeProduct, setTypeProduct] = useState(false);

  const product: Product = state;

  console.log(product);

  const CarouselImages = [
    { imagem: product.imagem },
    ...product.imagensAdicionais,
  ];

  return (
    <div className="h-screen">
      <div className="flex flex-col  justify-center  items-start p-4 md:p-10 space-y-4 ">
        <h1 className="font-bold text-xl text-gray-800">Detalhes do produto</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full ">
          <div className="w-2/5 ">
            <Carousel plugins={[Autoplay({ delay: 2500 }), Fade()]}>
              <CarouselContent className=" w-full">
                {CarouselImages.map((imagem) => (
                  <CarouselItem className="border w-full">
                    <img
                      src={imagem.imagem}
                      alt={`Imagens do produto ${product.nome}`}
                      className="w-full h-96"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          {/* Responsável por alinhar todos os elementos do lado direito da tela  */}
          <div className="flex flex-col space-y-4  w-full">
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-gray-700">
                {product.nome}
              </span>
              <span className="text-xl font-semibold text-gray-700">
                Categoria: {product.categoria}
              </span>
            </div>
            <div className="flex flex-col ">
              <span className="text-lg">Descrição:</span>
              <span className=" rounded-sm p-2 bg-gray-100 w-full text-gray-700">
                {product.descricao === null ? (
                  <>Produto sem descrição</>
                ) : (
                  <>{product.descricao}</>
                )}
              </span>
            </div>
            <div className="flex  md:justify-end gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="typeProduct"
                  id="sobmedida"
                  className="hover:cursor-pointer"
                  checked={typeProduct === true}
                  onClick={() => setTypeProduct(true)}
                />
                <label
                  htmlFor="sobmedida"
                  className="hover:cursor-pointer text-red-900 font-semibold text-lg"
                >
                  Sob medida
                </label>
              </div>
              <div className="flex items-center gap-2 ">
                <input
                  type="radio"
                  name="typeProduct"
                  id="prontaentrega"
                  className="hover:cursor-pointer"
                  checked={typeProduct === false}
                  onClick={() => setTypeProduct(false)}
                />
                <label
                  htmlFor="prontaentrega"
                  className="hover:cursor-pointer text-red-900 font-semibold text-lg"
                >
                  Pronta entrega
                </label>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:justify-around space-y-2 ">
              <Input
                placeholder="Altura"
                className="w-fit focus-visible:border-red-900 focus-visible:ring-red-900 focus-visible:ring-1"
              />
              <Input
                placeholder="Comprimento"
                className="w-fit focus-visible:border-red-900 focus-visible:ring-red-900 focus-visible:ring-1"
              />
              <Input
                placeholder="Largura"
                className="w-fit focus-visible:border-red-900 focus-visible:ring-red-900 focus-visible:ring-1"
              />
              <Input
                type="number"
                placeholder="Quantidade"
                className="w-fit focus-visible:border-red-900 focus-visible:ring-red-900 focus-visible:ring-1"
              />
            </div>
            <div className=" flex md:justify-center">
              <Button className="w-[20rem]">Adicionar produto</Button>
            </div>
            <div className="flex justify-around">
              <Button className="text-xs md:text-sm">
                Adicionar novos produtos
              </Button>
              <Button className="text-xs md:text-sm">
                Prosseguir com a cotação
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsProduct;
