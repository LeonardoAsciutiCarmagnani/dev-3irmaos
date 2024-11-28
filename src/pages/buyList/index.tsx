import PedidoVendaForm from "@/_components/PostedOrderOfBuyList";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useZustandContext } from "@/context/cartContext";
import { useEffect } from "react";

export default function BuyList() {
  const { listProductsInCart, totalValue, setTotalValue } = useZustandContext();

  console.log(listProductsInCart);

  useEffect(() => {
    setTotalValue();
  }, []);

  return (
    <div className="flex flex-col space-y-3 text-center md:grid md:grid-cols-2 md:gap-9 md:items-start p-8">
      <PedidoVendaForm />

      <div className="flex flex-col justify-center items-center space-y-2">
        <div>
          <span className="text-xl">
            Valor total do pedido:{" "}
            {totalValue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>
        <h1>Lista de produtos selecionados:</h1>
        <div className="flex flex-col space-y-2  p-8 w-full mr-2">
          <Carousel>
            <CarouselContent className=" mx-1 gap-3 h-64">
              {listProductsInCart.map((item) => {
                return (
                  <CarouselItem
                    key={item.id}
                    className="basis-full flex flex-col p-2 text-center items-center border-2 rounded-lg space-y-1 border-black space-y-3"
                  >
                    {item.imagem ? (
                      <img
                        src={item.imagem}
                        className="size-48 rounded-lg"
                        alt="Imagem"
                      />
                    ) : (
                      <div className="w-60 size-48  bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
                        Sem imagem
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-semibold">{item.nome}</span>
                      <div>
                        <span className="text-sm font-semibold">
                          {item.categoria}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm">
                          quantidade: {item.quantidade}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm">
                          Valor unitario:{" "}
                          {item.preco.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </div>
  );
}
