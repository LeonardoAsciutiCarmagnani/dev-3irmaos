/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/interfaces/Product";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Fade from "embla-carousel-fade";
import Autoplay from "embla-carousel-autoplay";
import { productsContext } from "@/context/productsContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const productSchema = z.object({
  altura: z.coerce.number().min(1, "Altura obrigatória"),
  comprimento: z.coerce.number().min(1, "Comprimento obrigatório"),
  largura: z.coerce.number().min(1, "Largura obrigatória"),
  quantidade: z.coerce.number().min(1, "Quantidade obrigatória"),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const DetailsProduct = () => {
  const { state } = useLocation();

  const { handleAddProduct } = productsContext();
  const [typeProduct, setTypeProduct] = useState(true);
  const [product, setProduct] = useState<Product>(state);

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: typeProduct
      ? {
          altura: product.altura,
          comprimento: product.comprimento,
          largura: product.largura,
          quantidade: 1,
        }
      : {
          altura: 0,
          comprimento: 0,
          largura: 0,
          quantidade: 1,
        },
  });

  useEffect(() => {
    if (typeProduct) {
      reset({
        altura: product.altura,
        comprimento: product.comprimento,
        largura: product.largura,
        quantidade: 1,
      });
    } else {
      reset({
        altura: 0,
        comprimento: 0,
        largura: 0,
        quantidade: 1,
      });
    }
  }, [typeProduct]);

  const CarouselImages = [
    { imagem: product.imagem },
    ...product.imagensAdicionais,
  ];

  const onSubmit = (data: ProductFormData) => {
    setProduct((prev) => ({
      ...prev,
      altura: data.altura,
      comprimento: data.comprimento,
      largura: data.largura,
      quantidade: data.quantidade,
    }));

    handleAddProduct(product);
    toast.success("Produto adicionado ao orçamento !", {
      id: 1,
      closeButton: false,
    });
  };

  return (
    <div className="h-screen">
      <Toaster richColors />
      <div className="flex flex-col  justify-center  items-start p-4 md:p-10 space-y-4 ">
        <h1 className="font-bold text-xl text-gray-800">Detalhes do produto</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full ">
          <div className="md:w-2/5 ">
            <Carousel plugins={[Autoplay({ delay: 2500 }), Fade()]}>
              <CarouselContent className=" w-full">
                {CarouselImages.map((imagem, index) => (
                  <CarouselItem className="border w-full">
                    <img
                      key={index}
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
                  checked={typeProduct === false}
                  onChange={() => setTypeProduct(false)}
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
                  checked={typeProduct === true}
                  onChange={() => setTypeProduct(true)}
                />
                <label
                  htmlFor="prontaentrega"
                  className="hover:cursor-pointer text-red-900 font-semibold text-lg"
                >
                  Pronta entrega
                </label>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col items-center md:flex-row md:justify-around space-y-2">
                <div>
                  <label htmlFor="altura">Altura</label>
                  <Input
                    id="altura"
                    type="number"
                    placeholder="Altura"
                    {...register("altura")}
                    disabled={typeProduct}
                    className="w-fit focus-visible:border-red-900 focus-visible:ring-red-900 focus-visible:ring-1 disabled:bg-gray-100 disabled:text-black"
                  />
                  {errors.altura && (
                    <span className="text-red-500 text-sm">
                      {errors.altura.message}
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="comprimento">Comprimento</label>
                  <Input
                    id="comprimento"
                    type="number"
                    placeholder="Comprimento"
                    {...register("comprimento")}
                    disabled={typeProduct}
                    className="w-fit focus-visible:border-red-900 focus-visible:ring-red-900 focus-visible:ring-1 disabled:bg-gray-100 disabled:text-black"
                  />
                  {errors.comprimento && (
                    <span className="text-red-500 text-sm">
                      {errors.comprimento.message}
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="largura">Largura</label>
                  <Input
                    id="largura"
                    type="number"
                    placeholder="Largura"
                    {...register("largura")}
                    disabled={typeProduct}
                    className="w-fit focus-visible:border-red-900 focus-visible:ring-red-900 focus-visible:ring-1 disabled:bg-gray-100 disabled:text-black"
                  />
                  {errors.largura && (
                    <span className="text-red-500 text-sm">
                      {errors.largura.message}
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="quantidade">Quantidade</label>
                  <Input
                    id="quantidade"
                    type="number"
                    placeholder="Quantidade"
                    {...register("quantidade")}
                    className="w-fit focus-visible:border-red-900 focus-visible:ring-red-900 focus-visible:ring-1"
                  />
                  {errors.quantidade && (
                    <span className="text-red-500 text-sm">
                      {errors.quantidade.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex md:justify-center mt-4">
                <Button type="submit" className="w-full md:w-[20rem]">
                  Adicionar produto
                </Button>
              </div>
            </form>
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
