import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/context/authContext";
import { productsContext } from "@/context/productsContext";
import { api } from "@/lib/axios";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import RegisterModal from "./register-modal";

export const Checkout = () => {
  const { productsInCart, handleRemoveProduct } = productsContext();
  const { user } = useAuthStore();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [address, setAddress] = useState({
    cep: "",
    neighborhood: "",
    street: "",
    number: 0,
    city: "",
    state: "",
  });

  const fetchAddress = useCallback(async (cep: string) => {
    if (!cep || cep.length < 8) return; // Evita requisições desnecessárias

    try {
      const { data } = await api.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (data.erro) throw new Error("CEP não encontrado");

      setAddress((prev) => ({
        ...prev,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        ibge: data.ibge,
      }));
    } catch (error) {
      toast.error("CEP inválido ou não encontrado");
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setModalIsOpen(true);
    }
  }, [user]);

  return (
    <div className="flex border-gray-300 p-4 rounded-lg">
      {productsInCart.length !== 0 ? (
        <div className="flex flex-col w-full md:flex-row gap-4  md:justify-around">
          <div className="flex flex-col space-y-4 w-full md:w-2/5 ">
            <div className="space-y-4 w-full  h-72 overflow-y-scroll">
              {productsInCart.map((product, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 border border-gray-500 rounded-lg bg-gray-100 shadow-md shadow-gray-200`}
                >
                  <div className="flex flex-col items-start h-[6rem] md:h-auto">
                    <span className="font-semibold text-sm md:text-lg text-gray-700">
                      {product.nome}
                    </span>
                    {/*   <span className="text-gray-700 text-sm md:text-base font-semibold">
                      {"R$ " +
                        (
                          product.price /
                          (product.packageQuantity * product.boxQuantity)
                        ).toFixed(2)}
                      /Espt
                    </span> */}
                    {/*  <span className="font-semibold text-sm md:text-base text-gray-700">
                      {product.price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                      / Cx
                    </span> */}
                  </div>

                  <div className="flex w-[9rem] justify-around items-center">
                    <Button onClick={() => handleRemoveProduct(product.id)}>
                      {product.quantidade === 1 ? (
                        <Trash2 className="size-4" />
                      ) : (
                        <span className="font-bold text-lg">-</span>
                      )}
                    </Button>
                    <span className="text-gray-600">
                      <strong>Qtd:</strong> {product.quantidade}{" "}
                    </span>
                    {/*      <Button
                      onClick={() => handlingAddProductInCart(product)}
                      className="bg-red-500 hover:bg-red-600 hover:cursor-pointer"
                    >
                      <span className="font-bold text-lg">+</span>
                    </Button> */}
                  </div>
                </div>
              ))}
            </div>
            <Link to={"/"}>
              <Button
                variant={"default"}
                className="bg-red-900 hover:bg-red-950 hover:cursor-pointer w-full"
              >
                Continuar comprando
              </Button>
            </Link>
          </div>
          <div className="flex flex-col gap-2 ">
            <div className="flex flex-col max-h-96 p-2 md:p-4 justify-between border border-gray-200 bg-gray-100 rounded-lg  w-full md:w-lg">
              <span className="text-lg font-semibold">Endereço de entrega</span>
              <div className="flex flex-col space-y-2 ">
                {address?.cep ? (
                  <>
                    <div className="flex items-center gap-2">
                      <strong className="w-20">CEP:</strong>
                      <Input
                        className="text-gray-700 w-fit bg-gray-50"
                        value={address.cep}
                        onBlur={(e) => fetchAddress(e.target.value)}
                        onChange={(e) =>
                          setAddress((prev) => ({
                            ...prev,
                            cep: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <strong className="w-20">Bairro:</strong>
                      <Input
                        className="text-gray-700 w-fit bg-gray-50"
                        value={address.neighborhood}
                        onChange={(e) =>
                          setAddress((prev) => ({
                            ...prev,
                            neighborhood: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <strong className="w-20">Rua:</strong>
                      <Input
                        className="text-gray-700 w-fit bg-gray-50"
                        value={address.street}
                        onChange={(e) =>
                          setAddress((prev) => ({
                            ...prev,
                            street: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <strong className="w-20">Número:</strong>
                      <Input
                        className="text-gray-700 w-fit bg-gray-50"
                        value={address.number}
                        onChange={(e) =>
                          setAddress((prev) => ({
                            ...prev,
                            number: Number(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <strong className="w-20">Cidade:</strong>
                      <Input
                        className="text-gray-700 w-fit bg-gray-50"
                        value={address.city}
                        onChange={(e) =>
                          setAddress((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <strong className="w-20">Estado:</strong>
                      <Input
                        className="text-gray-700 w-fit bg-gray-50"
                        value={address.state}
                        onChange={(e) =>
                          setAddress((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 w-fit">
                      <Input
                        id="check"
                        type="checkbox"
                        className="size-5 text-center placeholder:text-center border-gray-400 hover:cursor-pointer"
                        // onChange={() => setUrgencyDelivery(!urgencyDelivery)}
                      />
                      <label
                        htmlFor="check"
                        className="text-lg text-red-600 font-semibold hover:cursor-pointer"
                      >
                        Entrega com urgência
                      </label>
                    </div>
                  </>
                ) : (
                  <span className="text-gray-500">
                    Endereço não encontrado.
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2 justify-between border border-gray-200 bg-gray-100 rounded-lg p-4 w-full md:w-lg">
              {/*  <Select
                onValueChange={(e) => setpaymentMethodSelected(JSON.parse(e))}
              >
                <SelectTrigger className="w-[210px] bg-gray-50">
                  <SelectValue placeholder="Métodos de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Métodos de pagamento:</SelectLabel>
                    {clientPaymentMethods.map((method) => (
                      <SelectItem value={JSON.stringify(method)}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select> */}
              {/*   {total < minValueClient && (
                <span className="text-sm text-center font-semibold text-red-500">
                  Seu pedido ainda não atingiu o valor mínimo de:{" "}
                  {minValueClient.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              )} */}
              <div className="flex items-center justify-between p-2">
                <span className="text-lg font-semibold">Total</span>
                {/*  <span className="font-bold text-gray-900 text-xl">
                  {total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span> */}
              </div>

              {/* <Button
                variant={"default"}
                className={`bg-red-500 hover:bg-red-600 hover:cursor-pointer w-full `}
                onClick={() => handleSubmitProducts()}
                disabled={sendOrder || total < minValueClient}
              >
                {sendOrder ? (
                  <>
                    <LoaderCircle className="animate-spin" /> Enviando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </Button> */}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col w-full  space-y-2 items-center justify-center">
            <span className="text-center text-2xl font-bold text-gray-800">
              Nenhum produto adicionado ao seu orçamento
            </span>
            <span className="text-center text-sm   text-gray-600">
              Volte para a tela inicial para continuar comprando !
            </span>
            <Link to={"/"}>
              <Button variant={"default"} className="w-fit ">
                Tela Inicial
              </Button>
            </Link>
          </div>
        </>
      )}
      {modalIsOpen && <RegisterModal open={modalIsOpen} />}
    </div>
  );
};

export default Checkout;
