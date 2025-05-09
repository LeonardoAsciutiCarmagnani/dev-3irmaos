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

const CreateOrderADM = () => {
  const [budgetNumber, setBudgetNumber] = useState(0);

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

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col items-start h-full">
      <div className="w-full">
        <div className="p-2 flex items-center justify-between ">
          <h1 className="text-xl font-bold text-gray-600">{`Novo orçamento - #${budgetNumber}`}</h1>
          <h2 className="text-sm text-red-800">
            Emissão: {new Date().toLocaleDateString()}
          </h2>
        </div>
        <GetClients />
      </div>
      <div>
        <GetProductsForm />
      </div>
    </div>
  );
};

export default CreateOrderADM;
