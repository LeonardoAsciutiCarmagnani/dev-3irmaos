import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import GetClients from "./getClients";
import GetProductsForm, { TableItem } from "./getProducts";
import { db, storage } from "../Utils/FirebaseConfig";
import { useEffect, useState } from "react";
import { Client } from "@/interfaces/Client";
import { api } from "@/lib/axios";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Dropzone from "../DropzoneImage/DropzoneImage";
import Loader from "../Loader/loader";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const CreateOrderADM = () => {
  const [budgetNumber, setBudgetNumber] = useState(0);
  const [client, setClient] = useState<Client | null>(null);
  const [productsInBudget, setProductsInBudget] = useState<TableItem[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [observations, setObservations] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [deliveryTime, setDeliveryTime] = useState<number | undefined>(
    undefined
  );
  const [timeEstimate, setTimeEstimate] = useState("");

  const postBudget = async () => {
    try {
      setIsLoading(true);

      // Verifica se o cliente foi selecionado
      if (!client) {
        alert("Selecione um cliente para continuar");
        setIsLoading(false);
        return;
      }

      // Verifica se há produtos no orçamento
      if (productsInBudget.length === 0) {
        alert("Adicione pelo menos um produto ao orçamento");
        setIsLoading(false);
        return;
      }

      const imageUrls = files.length ? await saveImagesInStorage(files) : [];

      // Mapeia produtos para o formato esperado pelo schema
      const formattedProducts = productsInBudget.map((product) => {
        // Encontra o produto no objeto original para extrair as informações de variação
        const produto = product.produto;

        // Encontra a variação específica selecionada
        const variacao = produto.variacao?.find((v) => v.id === product.id);

        // Constrói o nome da variação combinando ambos os campos, se existirem
        const nomeVariacao = [variacao?.nomeVariacaoA, variacao?.nomeVariacaoB]
          .filter(Boolean)
          .join(" - ");

        return {
          nome: produto.nome,
          quantidade: product.quantidade,
          altura: produto.altura || 1,
          largura: produto.largura || 1,
          categoria: produto.categoria || null,
          preco: product.valorUnitario || 0,
          selectedVariation: {
            id: product.id,
            nomeVariacao: nomeVariacao,
          },
          imagesUrls: imageUrls.map((url) => ({ imagem: url })),
        };
      });

      // Cria o objeto conforme o schema esperado
      const orderData = {
        orderId: budgetNumber,
        client: {
          id: client.Id || uuidv4(),
          name: client.name,
          email: client.email,
          phone: client.phone,
          document: client.document,
          ie: client.ie || undefined,
        },
        deliveryAddress: {
          cep: client.address?.cep || "",
          neighborhood: client.address?.neighborhood || "",
          street: client.address?.street || "",
          number: Number(client.address?.number) || 0,
          city: client.address?.city || "",
          state: client.address?.state || "",
          ibge: client.address?.ibge || undefined,
        },
        billingAddress: {
          cep: client.address?.cep || "",
          neighborhood: client.address?.neighborhood || "",
          street: client.address?.street || "",
          number: Number(client.address?.number) || 0,
          city: client.address?.city || "",
          state: client.address?.state || "",
          ibge: client.address?.ibge || undefined,
        },
        products: formattedProducts,
        detailsPropostal: {
          obs: observations || undefined,
          payment: paymentMethod || undefined,
          delivery: deliveryTime || undefined,
          time: timeEstimate || undefined,
        },
        createdAt: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
        orderStatus: 1,
        totalValue: productsInBudget.reduce(
          (acc, item) => acc + item.subtotal,
          0
        ),
        imagesUrls: imageUrls,
      };

      console.log("Enviando orçamento:", orderData);
      const response = await api.post("/post-budget", orderData);
      console.log("Resposta:", response);

      // Limpa os campos após sucesso
      if (response.status === 200 || response.status === 201) {
        alert("Orçamento criado com sucesso!");
        setClient(null);
        setProductsInBudget([]);
        setFiles([]);
        setObservations("");
        setPaymentMethod("");
        setDeliveryTime(undefined);
        setTimeEstimate("");
      }
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
      alert("Erro ao criar orçamento. Verifique o console para mais detalhes.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveImagesInStorage = async (files: File[]): Promise<string[]> => {
    // 1. Limita a 5 arquivos
    const limitedFiles = files.slice(0, 5);

    // 2. Cria um array de promessas de upload
    const uploadPromises = limitedFiles.map(async (file) => {
      // 2.1. Extrai e valida extensão
      const ext = file.name.split(".").pop();
      if (!ext) {
        throw new Error(`Arquivo '${file.name}' sem extensão válida.`);
      }

      // 2.2. Gera nome único e referência no Storage
      const fileName = `${Date.now()}_${file.name}_order_${budgetNumber}`;
      const storageRef = ref(storage, `imagens/${fileName}`);

      // 2.3. Faz upload e obtém snapshot
      const snap = await uploadBytes(storageRef, file);

      // 2.4. Retorna URL de download
      return getDownloadURL(snap.ref);
    });

    // 3. Aguarda todos os uploads em paralelo e retorna as URLs
    return Promise.all(uploadPromises);
  };

  useEffect(() => {
    const collectionRef = collection(db, "budgets");
    const q = query(collectionRef, orderBy("orderId", "desc"), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        // pega o ID do documento mais recente e converte para número
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lastOrderId = (snapshot.docs[0].data() as any).orderId as number;
        setBudgetNumber(lastOrderId + 1);
      } else {
        // nenhum documento ainda
        setBudgetNumber(1);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col items-start h-full gap-y-4">
      <div className="w-full">
        <div className="p-2 flex items-center justify-between gap-x-12">
          <h1 className="text-2xl font-bold text-gray-800">{`Novo orçamento - #${budgetNumber}`}</h1>
          <h2 className="text-sm text-gray-400">
            Emissão: {new Date().toLocaleDateString()}
          </h2>
        </div>
        <GetClients selectedClient={client} setSelectedClient={setClient} />
      </div>
      <div>
        <GetProductsForm
          selectedProducts={productsInBudget}
          setSelectedProducts={setProductsInBudget}
        />
      </div>

      {/* Detalhes adicionais do orçamento */}
      <div className="bg-white rounded-xs w-[180vh] border border-gray-200 shadow-md shadow-gray-200 p-4">
        <div className="flex flex-col gap-y-4">
          <span className="text-xl font-semibold text-gray-800">
            Detalhes da proposta
          </span>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Observações</label>
              <textarea
                className="border border-gray-300 rounded p-2"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Método de pagamento
              </label>
              <input
                type="text"
                className="border border-gray-300 rounded p-2"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Prazo de entrega (dias)
              </label>
              <input
                type="number"
                className="border border-gray-300 rounded p-2"
                value={deliveryTime || ""}
                onChange={(e) =>
                  setDeliveryTime(Number(e.target.value) || undefined)
                }
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Estimativa de tempo
              </label>
              <input
                type="text"
                className="border border-gray-300 rounded p-2"
                value={timeEstimate}
                onChange={(e) => setTimeEstimate(e.target.value)}
                placeholder="Ex: 1 semana, 2 meses, etc."
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="bg-white rounded-xs w-[180vh] border border-gray-200 shadow-md shadow-gray-200 p-2">
          <div className="flex flex-col gap-y-2">
            <span className="text-xl font-semibold text-red-900">
              Imagens ilustrativas
            </span>
            <Dropzone onFileSelect={setFiles} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-x-2 justify-start w-[180vh]">
        <Button
          type="reset"
          className="bg-red-800 rounded-xs"
          onClick={() => {
            setClient(null);
            setProductsInBudget([]);
            setFiles([]);
            setObservations("");
            setPaymentMethod("");
            setDeliveryTime(undefined);
            setTimeEstimate("");
          }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-green-700 rounded-xs"
          onClick={postBudget}
          disabled={isLoading}
        >
          {isLoading ? "Processando..." : "Criar orçamento"}
        </Button>
      </div>

      {isLoading && <Loader />}
    </div>
  );
};

export default CreateOrderADM;
