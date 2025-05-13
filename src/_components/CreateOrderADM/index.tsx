import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import GetClients from "./getClients";
import GetProductsForm from "./getProducts";
import { db } from "../Utils/FirebaseConfig";
import { useEffect, useState } from "react";
import { Client } from "@/interfaces/Client";
import { Button } from "@/components/ui/button";

const CreateOrderADM = () => {
  const [budgetNumber, setBudgetNumber] = useState(0);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const collectionRef = collection(db, "budgets");
    const q = query(collectionRef, orderBy("orderId", "desc"), limit(1));
    console.log(q);
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
    console.log("Cliente:", client);
    return () => unsubscribe();
  }, [client]);

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
        <GetProductsForm />
      </div>
      <div className="flex items-center gap-x-2 w-[180vh] justify-end">
        <Button className="bg-red-800 rounded-xs">Cancelar</Button>
        <Button className="bg-green-700 rounded-xs">Criar orçamento</Button>
      </div>
    </div>
  );
};

export default CreateOrderADM;
