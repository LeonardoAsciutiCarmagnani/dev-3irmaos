/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/context/authContext";
import { productsContext } from "@/context/productsContext";
import { api } from "@/lib/axios";
import { InfoIcon, LoaderCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../Utils/FirebaseConfig";
import { format } from "date-fns";
import Loader from "../Loader/loader";
import AuthModal from "./AuthModal";

interface IFireStoreProps {
  document: string;
  clientPhone: string;
  clientAddress?: {
    cep: string;
    city: string;
    ibge: string;
    neighborhood: string;
    number: number;
    state: string;
    street: string;
    complement: string;
  };
  ie?: string;
}

export const Checkout = () => {
  const navigate = useNavigate();
  const { productsInCart, handleRemoveProduct, handlingClearCart } =
    productsContext();
  const { user } = useAuthStore();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [sendOrder, setSendOrder] = useState(false);
  const [userData, setUserData] = useState<IFireStoreProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [address, setAddress] = useState({
    cep: "",
    neighborhood: "",
    street: "",
    number: 0,
    city: "",
    state: "",
    ibge: "",
    complement: "",
  });
  const [billingAddress, setBillingAddress] = useState({
    cep: "",
    neighborhood: "",
    street: "",
    number: 0,
    city: "",
    state: "",
    ibge: "",
    complement: "",
  });

  const getUserAddress = async () => {
    if (!user?.uid) {
      return toast.error("Usuário não autenticado.", {
        id: "auth-error",
      });
    }

    try {
      const refCollection = collection(db, "clients");
      const q = query(refCollection, where("Id", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return toast.error("Endereço não encontrado.");
      }
      // console.log("Dados depois da query => ", querySnapshot.docs[0]?.data());
      const data = querySnapshot.docs[0]?.data();
      if (!data || !data.phone) {
        return toast.error("Dados do cliente incompletos.");
      }

      console.log("Dados do usuário vindos do fireStore =>", data);
      const fireStoreData: IFireStoreProps = {
        document: data.document,
        clientPhone: data.phone,
        clientAddress: data.address,
        ie: data.ie,
      };

      // console.log("Dados do Firestore => ", fireStoreData);

      if (!fireStoreData?.clientAddress) {
        return toast.error("Endereço não cadastrado.");
      }

      setUserData({
        document: fireStoreData.document,
        clientPhone: fireStoreData.clientPhone,
        ie: fireStoreData.ie,
      });
      setAddress(fireStoreData.clientAddress);
      setBillingAddress(fireStoreData.clientAddress);
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      toast.error("Erro ao buscar endereço do usuário.");
    }
  };

  const fetchAddress = useCallback(async (cep: string) => {
    if (!cep || cep.length < 8) return; // Evita requisições desnecessárias

    try {
      const { data } = await api.get(`https://viacep.com.br/ws/${cep}/json/`);
      // console.log("Response data", data);
      if (data.erro) throw new Error("CEP não encontrado");

      setBillingAddress((prev) => ({
        ...prev,
        cep: data.cep,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        ibge: data.ibge,
        complement: data.complemento,
      }));
      toast.success("CEP encontrado com sucesso!", {
        description: `CEP: ${data.cep} - ${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf} - ${data.complemento}`,
      });
    } catch (error) {
      toast.error("CEP inválido ou não encontrado");
      console.error(error);
    }
  }, []);

  const handleSubmitBudget = async () => {
    if (!user?.uid) return toast.error("Usuário não autenticado.");
    if (!address.cep || !address.street || !address.city) {
      return toast.error("Endereço incompleto.");
    }

    setSendOrder(true);
    const dateOrder = format(new Date(), "dd/MM/yyyy HH:mm:ss");

    try {
      setIsLoading(true);
      const order = {
        client: {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          phone: userData?.clientPhone,
          document: userData?.document,
          ie: userData?.ie,
        },
        deliveryAddress: address,
        billingAddress,
        products: productsInCart,
        createdAt: dateOrder,
        imagesUrls: [], // Imagens 3 irmãos
        detailsPropostal: {},
        orderStatus: 1,
        totalValue: total,
      };

      console.log("Dados do pedido", order);
      const response = await api.post("/post-budget", order);
      console.log("Response do pedido: ", response);

      const createdOrderId = response.data;

      const budgetsRef = collection(db, "budgets");
      const q = query(budgetsRef, where("orderId", "==", createdOrderId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.warn(
          "Nenhum orçamento encontrado no Firestore para orderId",
          createdOrderId
        );
      }

      setSendOrder(false);
      handlingClearCart();

      toast.success("Orçamento enviado com sucesso!", {
        duration: 8000,
        description: `Número do orçamento: ${response.data.orderId}`,
      });

      navigate("/pedidos-e-orçamentos", {
        state: {
          highlightOrderId: createdOrderId,
        },
      });
    } catch (error) {
      toast.error(
        "Erro ao enviar o pedido. Verifique os campos e tente novamente.",
        {
          description: "Se o erro persistir, entre em contato com o suporte.",
        }
      );
      setSendOrder(false);
      console.error("Erro ao enviar produtos para o servidor", error);
    } finally {
      setIsLoading(false);
    }
  };

  const total = productsInCart.reduce((acc, product) => {
    if (product.selectedVariation.nomeVariacao === "Sob Medida") {
      return acc;
    }
    const quantidade = product.quantidade ?? 0;
    return (acc += product.preco * quantidade);
  }, 0);

  useEffect(() => {
    if (!user && !modalIsOpen) {
      setModalIsOpen(true);
    } else if (user && modalIsOpen) {
      setModalIsOpen(false);
    }
  }, [user, modalIsOpen]);

  const closeModal = () => setModalIsOpen(false);

  useEffect(() => {
    getUserAddress();
    fetchAddress(address.cep);
  }, [user]);

  const categoriesProducts = [
    "Assoalhos, Escadas, Decks e Forros",
    "Antiguidades",
  ];

  return (
    <div className="flex border-gray-300 p-4 rounded-lg text-sm md:text-md overflow-y-auto">
      {productsInCart.length !== 0 ? (
        <div className="flex flex-col w-full md:flex-row gap-4 md:justify-around">
          <div className="flex flex-col space-y-4 w-full md:w-2/5 ">
            <div className="space-y-2 w-full overflow-y-scroll h-[20rem] p-2">
              {productsInCart.map((product, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 border-[0.12rem] border-gray-200 border-outset rounded-xs bg-gray-50 shadow-md shadow-gray-300`}
                >
                  <div className="flex flex-col items-start h-[3.8rem] md:h-auto">
                    <span className="font-semibold text-sm md:text-md text-gray-700">
                      {product.nome}
                    </span>
                    {!categoriesProducts.includes(product.categoria) && (
                      <div className="text-xs text-gray-700 flex gap-2">
                        <span>Altura: {product.altura} m</span>
                        <span>Largura: {product.largura} m</span>
                        <span>
                          {product.categoria === "Janelas e Esquadrias" ||
                          product.categoria === "Portas Pronta Entrega" ||
                          product.categoria === "Portas Sob Medida"
                            ? "Batente (Espessura da parede)"
                            : "Comprimento"}{" "}
                          {product.comprimento === undefined
                            ? 0
                            : product.comprimento}{" "}
                          m
                        </span>
                      </div>
                    )}

                    {product.selectedVariation.nomeVariacao ===
                      "Medida Padrao" && (
                      <span className="font-semibold text-sm md:text-base text-gray-700">
                        {product.preco.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex w-[9rem] justify-end items-center gap-x-3">
                    <div className="flex items-center gap-x-1 text-sm md:text-base">
                      <span className="text-gray-600 font-bold text-md">
                        {product.quantidade}
                      </span>
                      <span>{`(${product.unidade})`}</span>
                    </div>

                    <Button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="rounded-xs"
                    >
                      {product.quantidade === 1 ? (
                        <Trash2 className="size-4" />
                      ) : (
                        <span className="font-bold text-lg">-</span>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Link to={"/"}>
              <Button
                variant={"default"}
                className="bg-red-900 hover:bg-red-950 hover:cursor-pointer w-full rounded-xs"
              >
                Continuar comprando
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-gray-700 p-2 bg-blue-50 rounded-xs border border-blue-200">
              <InfoIcon className="text-blue-700" />
              <span className="text-xs font-normal antialiased text-blue-700">
                Caso deseje enviar imagens de referência, vá até a aba{" "}
                <strong>Meus Orçamentos</strong> e, dentro do orçamento, utilize
                a seção de Envio de Imagens.
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 ">
            <div className="flex flex-col max-h-96 p-2 space-y-2 md:p-4 justify-between border border-gray-200 bg-gray-50 rounded-xs w-full md:w-lg">
              <span className="font-semibold text-lg">Endereço de entrega</span>
              <h2 className="text-xs text-gray-500">
                Você pode definir um novo endereço de entrega, caso necessário.
              </h2>
              <div className="flex flex-col space-y-2 ">
                {address.cep ? (
                  <>
                    <div className="flex items-center gap-2">
                      <strong className="w-20">CEP:</strong>
                      <Input
                        className="text-gray-700 w-fit bg-gray-50 rounded-xs"
                        value={billingAddress.cep}
                        onBlur={(e) => fetchAddress(e.target.value)}
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            cep: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <strong className="w-20">Bairro:</strong>
                      <Input
                        className="text-gray-700 w-fit bg-gray-50 rounded-xs"
                        value={billingAddress.neighborhood}
                        disabled
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            neighborhood: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <strong className="w-20">Rua:</strong>
                      <Input
                        className="text-gray-700 w-fit bg-gray-50 rounded-xs"
                        value={billingAddress.street}
                        disabled
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            street: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <strong className="w-20">Número:</strong>
                      <Input
                        className="text-gray-700 w-fit bg-gray-50 rounded-xs"
                        value={billingAddress.number}
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            number: Number(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <strong className="w-20">Cidade:</strong>
                      <Input
                        className="text-gray-700 w-fit bg-gray-50 rounded-xs"
                        value={billingAddress.city}
                        disabled
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <strong className="w-20">Estado:</strong>
                      <Input
                        className="text-gray-700 w-fit bg-gray-50 rounded-xs"
                        value={billingAddress.state}
                        disabled
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <strong className="w-20">Comp. :</strong>
                      <Input
                        className="text-gray-700 w-fit bg-gray-50 rounded-xs"
                        value={billingAddress.complement}
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            complement: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </>
                ) : (
                  <span className="text-gray-500">
                    Endereço não encontrado.
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2 justify-between  rounded-xs p-4 w-full md:w-lg">
              <Button
                className="bg-green-700 hover:bg-green-800 hover:cursor-pointer w-full rounded-xs"
                onClick={() => handleSubmitBudget()}
                disabled={sendOrder}
              >
                {sendOrder ? (
                  <>
                    <LoaderCircle className="animate-spin" /> Enviando...
                  </>
                ) : (
                  "Enviar orçamento"
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col w-full  space-y-2 items-center justify-center">
            <span className="text-center text-2xl font-bold text-gray-800">
              Seu orçamento está vazio
            </span>
            <span className="text-center text-sm   text-gray-600">
              Volte para a tela inicial para continuar comprando.
            </span>
            <Link to={"/"}>
              <Button variant={"default"} className="w-fit ">
                Tela Inicial
              </Button>
            </Link>
          </div>
        </>
      )}
      <AuthModal
        open={modalIsOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={closeModal}
      />
      {isLoading && <Loader />}
    </div>
  );
};

export default Checkout;
