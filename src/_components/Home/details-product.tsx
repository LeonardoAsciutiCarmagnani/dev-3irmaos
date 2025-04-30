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
  const [variationSelectedId, setVariationSelectedId] = useState({
    id: "",
    name: "",
  });

  console.log(product);

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
    <div className="h-screen w-full bg-gray-50 overflow-auto">
      <div className="flex flex-col justify-start items-start p-4 md:p-10 space-y-4 ">
        <div className="flex flex-col md:flex-row gap-y-3 w-full gap-x-6">
          <div className="md:w-3/5 w-full h-fit rounded-xs overflow-hidden transition-shadow duration-300 hover:shadow-2xl flex flex-col gap-y-1 border-[0.12rem] border-gray-200 shadow-sm">
            <Carousel plugins={[Autoplay({ delay: 2500 }), Fade()]}>
              <CarouselContent className="w-full">
                {CarouselImages.map((imagem, index) => (
                  <CarouselItem
                    key={index}
                    className="border border-gray-200 w-full"
                  >
                    <img
                      src={imagem.imagem}
                      alt={`Imagens do produto ${product.nome}`}
                      className="w-full h-40 md:h-80 object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <div className="text-center line-clamp-2 p-2 bg-white rounded-xs px-4">
              <span className="text-md font-semibold text-gray-800">
                {product.nome}
              </span>
            </div>
          </div>
          {/* Responsável por alinhar todos os elementos do lado direito da tela  */}
          <div className="flex flex-col space-y-4 w-full">
            {product.descricao !== null && (
              <div className="flex flex-col p-1 bg-gray-100 md:max-w-[55rem] shadow-sm shadow-gray-200">
                <span className="text-md md:text-lg font-medium text-gray-800 text-center">
                  Descrição
                </span>
                <span className="rounded-xs p-3 bg-white text-gray-700 shadow-inner text-[0.77rem] md:text-md font-normal antialiased">
                  {product.descricao}
                </span>
              </div>
            )}
            <div className="flex justify-center md:justify-end gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="typeProduct"
                  id="sobmedida"
                  value={product.variacao?.[1]?.nomeVariacaoA || ""}
                  className="h-5 w-5 text-red-900 focus:ring-2 focus:ring-red-600 rounded-xs"
                  checked={typeProduct.typeProduct === false}
                  onChange={() =>
                    setTypeProduct(() => ({
                      typeProduct: false,
                      productVariationSelected: {
                        id: product.variacao?.[1]?.id || "",
                        nomeVariacao:
                          product.variacao?.[1]?.nomeVariacaoA || "",
                        variationName: "",
                      },
                    }))
                  }
                />
                <label
                  htmlFor="sobmedida"
                  className="cursor-pointer text-sm md:text-lg font-semibold text-red-900"
                >
                  Sob medida
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="typeProduct"
                  id="prontaentrega"
                  value={product.variacao?.[0]?.nomeVariacaoA || ""}
                  className="h-5 w-5 text-red-900 focus:ring-2 focus:ring-red-600 rounded-xs"
                  checked={typeProduct.typeProduct === true}
                  onChange={() =>
                    setTypeProduct(() => ({
                      typeProduct: true,
                      productVariationSelected: {
                        id: "",
                        nomeVariacao: "",
                        variationName: "",
                      },
                    }))
                  }
                />
                <label
                  htmlFor="prontaentrega"
                  className="cursor-pointer text-sm md:text-lg font-semibold text-red-900"
                >
                  Pronta entrega
                </label>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <h1 className="text-lg font-semibold text-red-900">
                {product.variacao?.[0].tipoVariacaoB}:
              </h1>
              <div className="flex gap-2">
                {product.variacao?.map((variation) => {
                  const isMedidaPadrao =
                    variation.nomeVariacaoA === "Medida Padrao";
                  const isSobMedida = variation.nomeVariacaoA === "Sob Medida";

                  return (
                    <div key={variation.id}>
                      {typeProduct.typeProduct
                        ? isMedidaPadrao && (
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                id={variation.id}
                                value={variation.id || ""}
                                checked={
                                  variation.id === variationSelectedId.id
                                }
                                // disabled={variation.quantidadeEmEstoque <= 0}
                                onChange={(e) => {
                                  setVariationSelectedId({
                                    id: e.target.value,
                                    name: "",
                                  });
                                  setTypeProduct((prev) => {
                                    return {
                                      ...prev,
                                      productVariationSelected: {
                                        id: variation.id,
                                        nomeVariacao:
                                          variation.nomeVariacaoB || "",
                                      },
                                    };
                                  });
                                }}
                                className="h-5 w-5 text-red-900 focus:ring-2 focus:ring-red-600 rounded-xs"
                              />
                              <label
                                htmlFor={variation.id}
                                className={`cursor-pointer text-sm md:text-lg font-semibold text-red-900 ${
                                  variation.quantidadeEmEstoque <= 0 &&
                                  "line-through"
                                }`}
                              >
                                {variation.nomeVariacaoB}{" "}
                              </label>
                            </div>
                          )
                        : isSobMedida && (
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                id={variation.id}
                                value={variation.id || ""}
                                checked={
                                  variation.id === variationSelectedId.id
                                }
                                onChange={(e) => {
                                  setVariationSelectedId({
                                    id: e.target.value,
                                    name: "",
                                  });
                                  setTypeProduct((prev) => {
                                    return {
                                      ...prev,
                                      productVariationSelected: {
                                        id: variation.id,
                                        nomeVariacao:
                                          variation.nomeVariacaoB || "",
                                      },
                                    };
                                  });
                                }}
                                className="h-5 w-5 text-red-900 focus:ring-2 focus:ring-red-600 rounded-xs"
                              />
                              <label
                                htmlFor={variation.id}
                                className="cursor-pointer text-sm md:text-lg font-semibold text-red-900"
                              >
                                {variation.nomeVariacaoB}
                              </label>
                            </div>
                          )}
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex md:h-24 flex-col items-center md:flex-row md:justify-around space-y-2 md:space-y-0">
                <div>
                  <label
                    htmlFor="altura"
                    className="text-sm font-medium text-gray-700"
                  >
                    Altura
                  </label>
                  <Input
                    id="altura"
                    type="number"
                    step={"0.01"}
                    placeholder="Altura"
                    {...register("altura")}
                    disabled={typeProduct.typeProduct}
                    className="w-fit border border-gray-300 rounded-xs p-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  {errors.altura && (
                    <span className="text-red-500 text-sm">
                      {errors.altura.message}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="comprimento"
                    className="text-sm font-medium text-gray-700"
                  >
                    Comprimento
                  </label>
                  <Input
                    id="comprimento"
                    type="number"
                    step={"0.01"}
                    placeholder="Comprimento"
                    {...register("comprimento")}
                    disabled={typeProduct.typeProduct}
                    className="w-fit border border-gray-300 rounded-xs p-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  {errors.comprimento && (
                    <span className="text-red-500 text-sm">
                      {errors.comprimento.message}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="largura"
                    className="text-sm font-medium text-gray-700"
                  >
                    Largura
                  </label>
                  <Input
                    id="largura"
                    type="number"
                    step={"0.01"}
                    placeholder="Largura"
                    {...register("largura")}
                    disabled={typeProduct.typeProduct}
                    className="w-fit border border-gray-300 rounded-xs p-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  {errors.largura && (
                    <span className="text-red-500 text-sm">
                      {errors.largura.message}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="quantidade"
                    className="text-sm font-medium text-gray-700"
                  >
                    Quantidade
                  </label>
                  <Input
                    id="quantidade"
                    type="number"
                    placeholder="Quantidade"
                    {...register("quantidade")}
                    className="w-fit border border-gray-300 rounded-xs p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  {errors.quantidade && (
                    <span className="text-red-500 text-sm">
                      {errors.quantidade.message}
                    </span>
                  )}
                </div>
              </div>
              {typeProduct.typeProduct === true && (
                <div className="flex items-center justify-end gap-1 text-end">
                  <span className="font-semibold text-red-900 text-lg">
                    Preço:
                  </span>
                  <span className="text-gray-700">{product.preco}</span>
                </div>
              )}
              <div className="flex md:justify-center mt-4 px-6">
                <Button
                  type="submit"
                  className="w-full md:w-[20rem] bg-red-900 text-white rounded-xs py-2 hover:bg-red-700 transition-colors"
                >
                  Adicionar produto
                </Button>
              </div>
            </form>

            <div className="flex justify-around">
              <Button
                onClick={() => navigate("/")}
                className="text-xs md:text-sm bg-gray-200 text-gray-700 rounded-xs py-2 hover:bg-gray-300 transition-colors"
              >
                Adicionar novos produtos
              </Button>
              <Button
                onClick={() => navigate("/orçamento")}
                className="text-xs md:text-sm bg-red-900 text-white rounded-xs py-2 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
