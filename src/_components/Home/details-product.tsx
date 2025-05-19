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
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/context/authContext";

export const DetailsProduct = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { productsInCart, handleAddProduct } = productsContext();
  const [product, setProduct] = useState<Product>(state);
  const [variationSelectedId, setVariationSelectedId] = useState({
    id: "",
    name: "",
  });
  const [isSquareMeter, setIsSquareMeter] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSobMedida, setIsSobMedida] = useState(false);

  //Controla a nomenclatura do input de comprimento
  const [variationNameInput, setVariationNameInput] = useState("Profundidade");

  const { user } = useAuthStore();

  const productSchema = z.object({
    comprimento:
      // (isSobMedida && !isSquareMeter) || product.nome.includes("Painel")
      // ? z.coerce.number().min(1, "Comprimento obrigatório")
      z.coerce.number(),
    altura:
      // isSobMedida && !isSquareMeter
      // ? z.coerce.number().min(1, "Altura obrigatória")
      z.coerce.number(),
    largura:
      // isSobMedida && !isSquareMeter
      // ? z.coerce.number().min(1, "Largura obrigatória")
      z.coerce.number(),
    quantidade:
      // isSquareMeter
      //   ? z.coerce.number().min(1, "Quantidade obrigatória")
      z.coerce.number().min(1, "Quantidade obrigatória"),
  });

  type ProductFormData = z.infer<typeof productSchema>;

  // Verificar se o produto tem variações
  const hasVariations = product.variacao && product.variacao.length > 0;
  // Verificar se o produto tem variação B (grade composta)
  const hasVariationB = hasVariations && product.variacao?.[0]?.tipoVariacaoB;

  const [typeProduct, setTypeProduct] = useState({
    typeProduct: true,
    productVariationSelected: {
      id: hasVariations ? product.variacao?.[0]?.id || "" : "",
      nomeVariacao: product.variacao?.[0]?.nomeVariacaoA || "",
    },
  });

  useEffect(() => {
    const stringTest = typeProduct.productVariationSelected.nomeVariacao;

    console.log("Variação selecionada =>", stringTest.trim());
  }, [typeProduct]);

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
    console.log("Product:", product);
    if (product.unidade === "m²") {
      setIsSquareMeter(true);
    }

    const batenteVariaton = ["Portas Pronta Entrega", "Janelas e Esquadrias"];
    const validationForNameProduct = ["Mesa", "mesa", "Mesas", "mesa"];

    if (batenteVariaton.includes(product.categoria)) {
      setVariationNameInput("Batente (Espessura da parede)");
    } else if (
      validationForNameProduct.some((item) =>
        product.nome.toLowerCase().includes(item)
      )
    ) {
      setVariationNameInput("Comprimento");
    } else {
      setVariationNameInput("Profundidade");
    }

    setIsSobMedida(!typeProduct.typeProduct);

    if (typeProduct.typeProduct) {
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
    console.log("Chegou na função");
    if (user?.role === "admin") {
      toast.error("Administradores não podem comprar produtos.", {
        duration: 5000,
      });
      return;
    }

    const listImages = [
      {
        imagem: product.imagem,
      },
      ...product.imagensAdicionais,
    ];

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
    <div className="h-screen w-full overflow-auto">
      <div className="flex flex-col justify-start items-start p-3 md:p-10 space-y-3 md:space-y-4">
        <div className="flex flex-col md:flex-row gap-y-3 w-full gap-x-6 p-1 md:items-center">
          {/* Imagem do produto - Ajustado para mobile */}
          <div className="md:w-3/5 w-full rounded-xs overflow-hidden transition-shadow duration-300 shadow-md flex flex-col gap-y-1">
            <Carousel plugins={[Autoplay({ delay: 2500 }), Fade()]}>
              <CarouselContent className="w-full">
                {CarouselImages.map((imagem, index) => (
                  <CarouselItem
                    key={index}
                    className="border border-gray-200 w-full"
                  >
                    <img
                      src={imagem.imagem}
                      alt={product.nome}
                      className="w-full h-40 md:h-[72vh] object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <div className="text-center line-clamp-2 p-2 bg-white rounded-xs px-4">
              <span className="text-sm md:text-md font-normal text-gray-800">
                {product.nome}
              </span>
            </div>
          </div>

          {/* Informações do produto - Ajustado para mobile */}
          <div className="flex flex-col space-y-3 md:space-y-4 w-full">
            <div className="flex flex-col w-full p-2 rounded-xs shadow-sm">
              <div className="flex justify-center items-center">
                <h1 className="text-red-900 text-md md:text-xl font-bold">
                  Descrição do produto
                </h1>
              </div>
              <span className="rounded-xs p-2 md:p-3 text-gray-700 text-xs md:text-sm font-normal antialiased">
                {product.descricao ?? "Descrição não disponível"}
              </span>
            </div>

            <div className="p-2 md:p-2.5 rounded-xs shadow-sm h-[45vh]">
              <div className="flex-col space-y-2 md:space-y-3 justify-center md:justify-end gap-3 md:gap-4 p-1">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm md:text-lg font-semibold text-red-900">
                    Disponibilidade
                  </h2>
                  {typeProduct.typeProduct === true && (
                    <div className="flex items-center justify-end gap-1 text-end">
                      <Badge className="text-green-700 font-bold text-base md:text-2xl bg-white border-b-green-700 border-3 rounded-none border-double">
                        {product.preco.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Opções de tipo de produto */}
                {hasVariations && (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="typeProduct"
                        id="sobmedida"
                        value={
                          product.variacao?.find(
                            (v) => v.nomeVariacaoA === "Sob Medida"
                          )?.nomeVariacaoA || ""
                        }
                        className="h-4 md:h-5 w-4 md:w-5 text-red-900 focus:ring-2 focus:ring-transparent rounded-xs accent-red-900"
                        checked={typeProduct.typeProduct === false}
                        onChange={() =>
                          setTypeProduct(() => ({
                            typeProduct: false,
                            productVariationSelected: {
                              id: product.variacao?.[1].id || "",
                              nomeVariacao:
                                product.variacao?.[1].nomeVariacaoA || "",
                            },
                          }))
                        }
                      />
                      <label
                        htmlFor="sobmedida"
                        className="cursor-pointer text-xs md:text-sm font-semibold text-gray-900"
                      >
                        Sob medida
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="typeProduct"
                        id="prontaentrega"
                        value={
                          product.variacao?.find(
                            (v) => v.nomeVariacaoA === "Medida Padrao"
                          )?.nomeVariacaoA || ""
                        }
                        className="h-4 md:h-5 w-4 md:w-5 text-gray-900 focus:ring-2 focus:ring-transparent rounded-xs accent-red-900"
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
                        className="cursor-pointer text-xs md:text-sm font-semibold text-gray-900"
                      >
                        Pronta entrega
                      </label>
                    </div>
                  </>
                )}
              </div>

              {/* Seção de variações */}
              {hasVariations && (
                <div className="flex flex-col space-y-2 place-items-stretch mt-3 md:mt-4">
                  {/* Seleção de variação B */}
                  {hasVariationB && (
                    <>
                      <h1 className="text-sm md:text-lg font-semibold text-red-900">
                        Escolha a variação:
                      </h1>
                      <div className="flex flex-wrap items-center justify-start w-full gap-x-2 gap-y-2">
                        {product.variacao?.map((variation) => {
                          const isMedidaPadrao =
                            variation.nomeVariacaoA === "Medida Padrao";
                          const isSobMedida =
                            variation.nomeVariacaoA === "Sob Medida";

                          return (
                            <div key={variation.id}>
                              {typeProduct.typeProduct
                                ? isMedidaPadrao && (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        id={variation.id}
                                        disabled={
                                          variation.quantidadeEmEstoque <= 0
                                        }
                                        value={variation.id || ""}
                                        checked={
                                          variation.id ===
                                          variationSelectedId.id
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
                                                nomeVariacao: `${variation.nomeVariacaoA} - ${variation.nomeVariacaoB}`,
                                              },
                                            };
                                          });
                                        }}
                                        className="h-4 md:h-5 w-4 md:w-5 text-gray-900 focus:ring-2 focus:ring-transparent rounded-xs text-xs md:text-sm accent-red-900"
                                      />
                                      <div className="flex flex-col items-center">
                                        <label
                                          htmlFor={variation.id}
                                          className={`cursor-pointer text-xs md:text-sm font-semibold text-gray-900 ${
                                            variation.quantidadeEmEstoque <=
                                              0 && "line-through"
                                          }`}
                                        >
                                          {variation.nomeVariacaoB}{" "}
                                        </label>
                                        {variation.quantidadeEmEstoque <= 0 && (
                                          <Badge className="text-xs">
                                            Sem estoque
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )
                                : isSobMedida && (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        id={variation.id}
                                        value={variation.id || ""}
                                        checked={
                                          variation.id ===
                                          variationSelectedId.id
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
                                                nomeVariacao: `${variation.nomeVariacaoA} - ${variation.nomeVariacaoB}`,
                                              },
                                            };
                                          });
                                        }}
                                        className="h-4 md:h-5 w-4 md:w-5 text-gray-900 focus:ring-2 focus:ring-transparent rounded-xs accent-red-900"
                                      />
                                      <label
                                        htmlFor={variation.id}
                                        className="cursor-pointer text-xs md:text-md font-semibold text-gray-900"
                                      >
                                        {variation.nomeVariacaoB}
                                      </label>
                                    </div>
                                  )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Formulário */}
                  <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="flex flex-col md:flex-row md:h-18 items-start md:justify-start space-y-2 gap-x-4 md:gap-x-8 md:space-y-0">
                        {!isSquareMeter ? (
                          <div className="flex flex-wrap gap-2 md:gap-x-6 items-center justify-start">
                            {product.categoria ===
                            "Bancadas, Móveis e Painéis" ? (
                              <div className="space-y-2">
                                <div>
                                  <span className="font-semibold text-red-900">
                                    MESAS:
                                  </span>
                                  <div className="flex  gap-10">
                                    <div>
                                      <label
                                        htmlFor="altura"
                                        className="text-xs md:text-sm font-medium text-gray-700 text-nowrap"
                                      >
                                        Altura (m)
                                      </label>
                                      <Input
                                        id="altura"
                                        type="number"
                                        step={"0.01"}
                                        {...register("altura")}
                                        disabled={
                                          hasVariations
                                            ? typeProduct.typeProduct
                                            : false
                                        }
                                        className="w-[4.5rem] md:w-[5rem] border border-gray-300 rounded-xs p-1 md:p-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-500"
                                      />
                                      {errors.altura && (
                                        <span className="text-red-500 text-xs md:text-sm">
                                          {errors.altura.message}
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      <label
                                        htmlFor="largura"
                                        className="text-xs md:text-sm font-medium text-gray-700 text-nowrap"
                                      >
                                        Largura (m)
                                      </label>
                                      <Input
                                        id="largura"
                                        type="number"
                                        step={"0.01"}
                                        {...register("largura")}
                                        disabled={
                                          hasVariations
                                            ? typeProduct.typeProduct
                                            : false
                                        }
                                        className="w-[4.5rem] md:w-[5rem] border border-gray-300 rounded-xs p-1 md:p-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-500"
                                      />
                                      {errors.largura && (
                                        <span className="text-red-500 text-xs md:text-sm">
                                          {errors.largura.message}
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      <label
                                        htmlFor="comprimento"
                                        className="text-xs md:text-sm font-medium text-gray-700 text-nowrap"
                                      >
                                        {variationNameInput} (m)
                                      </label>
                                      <Input
                                        id="comprimento"
                                        type="number"
                                        step={"0.01"}
                                        {...register("comprimento")}
                                        disabled={
                                          hasVariations
                                            ? typeProduct.typeProduct
                                            : false
                                        }
                                        className="w-[4.5rem] md:w-[4rem] border border-gray-300 rounded-xs p-1 md:p-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-500"
                                      />
                                      {errors.comprimento && (
                                        <span className="text-red-500 text-xs md:text-sm">
                                          {errors.comprimento.message}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <span className="font-semibold text-red-900">
                                    BANCADAS:
                                  </span>
                                  <div className="flex  gap-10">
                                    <div>
                                      <label
                                        htmlFor="altura"
                                        className="text-xs md:text-sm font-medium text-gray-700 text-nowrap"
                                      >
                                        Altura (m)
                                      </label>
                                      <Input
                                        id="altura"
                                        type="number"
                                        step={"0.01"}
                                        {...register("altura")}
                                        disabled={
                                          hasVariations
                                            ? typeProduct.typeProduct
                                            : false
                                        }
                                        className="w-[4.5rem] md:w-[5rem] border border-gray-300 rounded-xs p-1 md:p-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-500"
                                      />
                                      {errors.altura && (
                                        <span className="text-red-500 text-xs md:text-sm">
                                          {errors.altura.message}
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      <label
                                        htmlFor="largura"
                                        className="text-xs md:text-sm font-medium text-gray-700 text-nowrap"
                                      >
                                        Largura (m)
                                      </label>
                                      <Input
                                        id="largura"
                                        type="number"
                                        step={"0.01"}
                                        {...register("largura")}
                                        disabled={
                                          hasVariations
                                            ? typeProduct.typeProduct
                                            : false
                                        }
                                        className="w-[4.5rem] md:w-[5rem] border border-gray-300 rounded-xs p-1 md:p-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-500"
                                      />
                                      {errors.largura && (
                                        <span className="text-red-500 text-xs md:text-sm">
                                          {errors.largura.message}
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      <label
                                        htmlFor="comprimento"
                                        className="text-xs md:text-sm font-medium text-gray-700 text-nowrap"
                                      >
                                        {variationNameInput} (m)
                                      </label>
                                      <Input
                                        id="comprimento"
                                        type="number"
                                        step={"0.01"}
                                        {...register("comprimento")}
                                        disabled={
                                          hasVariations
                                            ? typeProduct.typeProduct
                                            : false
                                        }
                                        className="w-[4.5rem] md:w-[4rem] border border-gray-300 rounded-xs p-1 md:p-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-500"
                                      />
                                      {errors.comprimento && (
                                        <span className="text-red-500 text-xs md:text-sm">
                                          {errors.comprimento.message}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <span className="font-semibold text-red-900">
                                    PAINÉIS:
                                  </span>
                                  <div className="flex  gap-10">
                                    <div>
                                      <label
                                        htmlFor="altura"
                                        className="text-xs md:text-sm font-medium text-gray-700 text-nowrap"
                                      >
                                        Altura (m)
                                      </label>
                                      <Input
                                        id="altura"
                                        type="number"
                                        step={"0.01"}
                                        {...register("altura")}
                                        disabled={
                                          hasVariations
                                            ? typeProduct.typeProduct
                                            : false
                                        }
                                        className="w-[4.5rem] md:w-[5rem] border border-gray-300 rounded-xs p-1 md:p-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-500"
                                      />
                                      {errors.altura && (
                                        <span className="text-red-500 text-xs md:text-sm">
                                          {errors.altura.message}
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      <label
                                        htmlFor="largura"
                                        className="text-xs md:text-sm font-medium text-gray-700 text-nowrap"
                                      >
                                        Largura (m)
                                      </label>
                                      <Input
                                        id="largura"
                                        type="number"
                                        step={"0.01"}
                                        {...register("largura")}
                                        disabled={
                                          hasVariations
                                            ? typeProduct.typeProduct
                                            : false
                                        }
                                        className="w-[4.5rem] md:w-[5rem] border border-gray-300 rounded-xs p-1 md:p-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-500"
                                      />
                                      {errors.largura && (
                                        <span className="text-red-500 text-xs md:text-sm">
                                          {errors.largura.message}
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      <label
                                        htmlFor="comprimento"
                                        className="text-xs md:text-sm font-medium text-gray-700 text-nowrap"
                                      >
                                        {variationNameInput} (m)
                                      </label>
                                      <Input
                                        id="comprimento"
                                        type="number"
                                        step={"0.01"}
                                        {...register("comprimento")}
                                        disabled={
                                          hasVariations
                                            ? typeProduct.typeProduct
                                            : false
                                        }
                                        className="w-[4.5rem] md:w-[4rem] border border-gray-300 rounded-xs p-1 md:p-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-500"
                                      />
                                      {errors.comprimento && (
                                        <span className="text-red-500 text-xs md:text-sm">
                                          {errors.comprimento.message}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <label
                                    htmlFor="altura"
                                    className="text-xs md:text-sm font-medium text-gray-700 text-nowrap"
                                  >
                                    Altura (m)
                                  </label>
                                  <Input
                                    id="altura"
                                    type="number"
                                    step={"0.01"}
                                    {...register("altura")}
                                    disabled={
                                      hasVariations
                                        ? typeProduct.typeProduct
                                        : false
                                    }
                                    className="w-[4.5rem] md:w-[5rem] border border-gray-300 rounded-xs p-1 md:p-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-500"
                                  />
                                  {errors.altura && (
                                    <span className="text-red-500 text-xs md:text-sm">
                                      {errors.altura.message}
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <label
                                    htmlFor="largura"
                                    className="text-xs md:text-sm font-medium text-gray-700 text-nowrap"
                                  >
                                    Largura (m)
                                  </label>
                                  <Input
                                    id="largura"
                                    type="number"
                                    step={"0.01"}
                                    {...register("largura")}
                                    disabled={
                                      hasVariations
                                        ? typeProduct.typeProduct
                                        : false
                                    }
                                    className="w-[4.5rem] md:w-[5rem] border border-gray-300 rounded-xs p-1 md:p-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-500"
                                  />
                                  {errors.largura && (
                                    <span className="text-red-500 text-xs md:text-sm">
                                      {errors.largura.message}
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <label
                                    htmlFor="comprimento"
                                    className="text-xs md:text-sm font-medium text-gray-700 text-nowrap"
                                  >
                                    {variationNameInput} (m)
                                  </label>
                                  <Input
                                    id="comprimento"
                                    type="number"
                                    step={"0.01"}
                                    {...register("comprimento")}
                                    disabled={
                                      hasVariations
                                        ? typeProduct.typeProduct
                                        : false
                                    }
                                    className="w-[4.5rem] md:w-[4rem] border border-gray-300 rounded-xs p-1 md:p-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-500"
                                  />
                                  {errors.comprimento && (
                                    <span className="text-red-500 text-xs md:text-sm">
                                      {errors.comprimento.message}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="flex gap-x-6 items-center justify-center">
                            <div>
                              <label
                                htmlFor="metroQuadrado"
                                className="text-xs md:text-sm font-medium text-gray-700"
                              >
                                Quantidade (m²)
                              </label>
                              <Input
                                id="metroQuadrado"
                                type="number"
                                step={"0.01"}
                                {...register("quantidade")}
                                className="w-[4.5rem] md:w-[4rem] border border-gray-300 rounded-xs p-1 md:p-2 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100 disabled:text-gray-500"
                              />
                              {errors.quantidade && (
                                <span className="text-red-500 text-xs md:text-sm">
                                  {errors.quantidade.message}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {!isSquareMeter && (
                          <div className="mt-2 md:mt-0">
                            <label
                              htmlFor="quantidade"
                              className="text-xs md:text-sm font-medium text-gray-700"
                            >
                              Quantidade
                            </label>
                            <Input
                              id="quantidade"
                              type="number"
                              {...register("quantidade")}
                              className="w-[4.5rem] md:w-[4.3rem] border border-gray-300 rounded-xs p-1 md:p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                            {errors.quantidade && (
                              <span className="text-red-500 text-xs md:text-sm">
                                {errors.quantidade.message}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end mt-3 md:mt-4 mb-3 md:mb-4">
                        <Button
                          type="submit"
                          className="w-fit text-xs md:text-sm bg-red-900 text-white rounded-xs py-1 md:py-2 px-2 md:px-4 hover:bg-red-700 transition-colors"
                        >
                          Adicionar produto
                        </Button>
                      </div>
                    </form>

                    <div className="flex justify-end gap-x-2 md:gap-x-4">
                      <Button
                        type="button"
                        onClick={() => navigate("/")}
                        className="text-xs md:text-sm bg-gray-200 text-gray-700 rounded-xs py-1 md:py-2 px-2 md:px-3 hover:bg-gray-300 transition-colors"
                      >
                        Adicionar outros produtos
                      </Button>
                      <Button
                        onClick={() => navigate("/orçamento")}
                        className="text-xs md:text-sm bg-green-700 text-white rounded-xs py-1 md:py-2 px-2 md:px-3 hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={productsInCart.length === 0}
                      >
                        Prosseguir com a cotação
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsProduct;
