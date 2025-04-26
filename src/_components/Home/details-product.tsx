/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/interfaces/Product";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const productSchema = z.object({
  altura: z.coerce.number().min(1, "Altura obrigatória"),
  comprimento: z.coerce.number().min(1, "Comprimento obrigatório"),
  largura: z.coerce.number().min(1, "Largura obrigatória"),
  quantidade: z.coerce.number().min(1, "Quantidade obrigatória"),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const DetailsProduct = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { productsInCart, handleAddProduct } = productsContext();
  const [product, setProduct] = useState<Product>(state);
  const [typeProduct, setTypeProduct] = useState({
    typeProduct: true,
    productVariationSelected: {
      id: product.variacao?.[0]?.id || "",
      nomeVariacao: product.variacao?.[0].nomeVariacaoA || "",
    },
  });

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: typeProduct.typeProduct
      ? {
          altura: product.altura,
          comprimento: product.comprimento,
          largura: product.largura,
          quantidade: 1,
        }
      : {
          altura: undefined,
          comprimento: undefined,
          largura: undefined,
          quantidade: 1,
        },
  });

  useEffect(() => {
    if (typeProduct.typeProduct) {
      reset({
        altura: product.altura,
        comprimento: product.comprimento,
        largura: product.largura,
        quantidade: 1,
      });
    } else {
      reset({
        altura: undefined,
        comprimento: undefined,
        largura: undefined,
        quantidade: 1,
      });
    }
    console.log(
      "Variação selecionada => ",
      typeProduct.productVariationSelected
    );
  }, [typeProduct]);

  const CarouselImages = [
    { imagem: product.imagem },
    ...product.imagensAdicionais,
  ];

  const onSubmit = (data: ProductFormData) => {
    const listImages = [
      {
        imagem: product.imagem,
      },
      ...product.imagensAdicionais,
    ];

    console.log("Lista de imagens", listImages);
    const updatedProduct = {
      ...product,
      selectedVariation: typeProduct.productVariationSelected,
      altura: data.altura,
      comprimento: data.comprimento,
      largura: data.largura,
      quantidade: data.quantidade,
      listImages: listImages,
    };

    setProduct(updatedProduct);
    handleAddProduct(updatedProduct);
    toast.success("Produto adicionado ao orçamento !", {
      description:
        "Você pode adicionar mais produtos ou prosseguir com a cotação",
      duration: 5000,
    });
    reset();
  };

  return (
    <div className="h-screen ">
      <div className="flex flex-col   justify-center  items-start p-4 md:p-10 space-y-4 ">
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
          <div className="flex flex-col space-y-4  w-full ">
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
                  value={product.variacao?.[1]?.nomeVariacaoA || ""}
                  className="hover:cursor-pointer"
                  checked={typeProduct.typeProduct === false}
                  onChange={() =>
                    setTypeProduct(() => ({
                      typeProduct: false,
                      productVariationSelected: {
                        id: product.variacao?.[1]?.id || "",
                        nomeVariacao:
                          product.variacao?.[1]?.nomeVariacaoA || "",
                      },
                    }))
                  }
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
                  value={product.variacao?.[0]?.nomeVariacaoA || ""}
                  className="hover:cursor-pointer"
                  checked={typeProduct.typeProduct === true}
                  onChange={() =>
                    setTypeProduct(() => ({
                      typeProduct: true,
                      productVariationSelected: {
                        id: product.variacao?.[0]?.id || "",
                        nomeVariacao:
                          product.variacao?.[0]?.nomeVariacaoA || "",
                      },
                    }))
                  }
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
              <div className="flex md:h-24  flex-col items-center md:flex-row md:justify-around space-y-2 ">
                <div>
                  <label htmlFor="altura">Altura</label>
                  <Input
                    id="altura"
                    type="number"
                    step={"0.01"}
                    placeholder="Altura"
                    {...register("altura")}
                    disabled={typeProduct.typeProduct}
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
                    step={"0.01"}
                    placeholder="Comprimento"
                    {...register("comprimento")}
                    disabled={typeProduct.typeProduct}
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
                    step={"0.01"}
                    placeholder="Largura"
                    {...register("largura")}
                    disabled={typeProduct.typeProduct}
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
              {typeProduct.typeProduct === true && (
                <>
                  <div className="flex items-center justify-end gap-1 text-end">
                    <span className="font-semibold text-red-900 text-lg">
                      Preço:
                    </span>
                    <span className="text-gray-700">{product.preco}</span>
                  </div>
                </>
              )}
              <div className="flex md:justify-center mt-4">
                <Button type="submit" className="w-full md:w-[20rem]">
                  Adicionar produto
                </Button>
              </div>
            </form>

            <div className="flex justify-around">
              <Button
                onClick={() => navigate("/")}
                className="text-xs md:text-sm"
              >
                Adicionar novos produtos
              </Button>
              <Button
                onClick={() => navigate("/orçamento")}
                className="text-xs md:text-sm"
                disabled={productsInCart.length === 0}
              >
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
