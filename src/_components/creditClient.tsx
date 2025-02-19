/* eslint-disable react-hooks/exhaustive-deps */
import Sidebar from "./Sidebar";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import { useEffect, useState } from "react";
import { ChevronsRightIcon, DollarSignIcon, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useUserStore from "@/context/UserStore";
import { CardHeader, CardTitle } from "@/components/ui/card";
import logo from "../assets/logo_sem_fundo.png";

interface UsersProps {
  user_id: string;
  name: string;
  cpf: string;
  credito: number;
}

interface OperationListProps {
  name: string;
  created_at: string;
  credito: number;
  operation_type: string;
}

type OperationsType = "sum" | "sub";

const formSchema = z
  .object({
    updateValue: z.coerce.number().min(1, {
      message: "O valor minimo para realizar o ajuste de valor é de R$ 1.00",
    }),
  })
  .required();

type typeFormSchema = z.infer<typeof formSchema>;

export function CreditClientComponent() {
  const { setTypeUser } = useUserStore();
  const [credit, setCredit] = useState(0);
  const [typeOperation, setTypeOperation] = useState<OperationsType>("sum");
  const [user, setUser] = useState<UsersProps | undefined>(undefined);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<typeFormSchema>({
    resolver: zodResolver(formSchema),
  });
  const [usersFromFireStore, setUsersFromFireStore] = useState<UsersProps[]>(
    []
  );
  const [usersFiltered, setUsersFiltered] = useState<UsersProps[]>([]);
  const [operations, setOperations] = useState<OperationListProps[]>([]);

  const [open, setOpen] = useState(false);

  const usersList =
    usersFiltered.length > 0 ? usersFiltered : usersFromFireStore;

  async function getAllClients() {
    const usersList: UsersProps[] = [];
    const collectionRef = collection(firestore, "clients");
    const usersRef = getDocs(collectionRef);

    (await usersRef).forEach((user) => {
      const users = user.data() as UsersProps;

      usersList.push(users);
    });

    setUsersFromFireStore(usersList);
  }

  async function handlingSearchAllOperations(id: string) {
    try {
      const clientRef = doc(firestore, "clients", id);
      const clientDoc = await getDoc(clientRef);

      if (clientDoc.exists()) {
        const fireStoreUser = clientDoc.data() as UsersProps;
        setCredit(fireStoreUser.credito);
      }

      const operationsList: OperationListProps[] = [];
      const operationsRef = collection(
        firestore,
        "operations",
        "Operations_data",
        id
      );
      const q = query(operationsRef, where("id", "==", id));

      const operationsSnapshot = getDocs(q);

      (await operationsSnapshot).forEach((operations) => {
        const operation = operations.data() as OperationListProps;

        operationsList.push(operation);
      });

      setOperations(operationsList);
    } catch (e) {
      console.error(
        "Ocorreu um erro ao buscar as operações do cliente selecionado !",
        e
      );
    }
  }

  async function handlingUserSelectedInSelect() {
    if (!user) {
      return;
    }
    setCredit(user.credito);
    await handlingSearchAllOperations(user.user_id);
  }

  async function handlingUpdateUserCredits(data: typeFormSchema) {
    if (!user) return;

    console.log("Dados recebidos:", data);
    const operationData = Number(data.updateValue);

    if (operationData <= 0) {
      return;
    }

    if (credit < 0) {
      return alert(
        "Saldo zerado, porfavor adicione um valor antes de tentar subtrair !"
      );
    }

    const newCredit =
      typeOperation === "sum"
        ? (user.credito += operationData)
        : (user.credito -= operationData);

    console.log("Novo crédito:", newCredit);
    setCredit(newCredit);

    try {
      const operationDocRef = doc(
        collection(firestore, "operations", "Operations_data", user.user_id)
      );

      const clientCollectionRef = doc(firestore, "clients", user.user_id);

      await setDoc(operationDocRef, {
        id: user.user_id,
        name: user.name,
        operation_type: typeOperation,
        credito: operationData,
        created_at: new Date().toISOString(),
      });

      await setDoc(
        clientCollectionRef,
        { credito: newCredit },
        { merge: true }
      );

      handlingSearchAllOperations(user.user_id);
      reset();
      console.log("Nova operação cadastrada no Firestore!");
    } catch (error) {
      console.error("Erro ao atualizar crédito:", error);
    }
  }

  function handlingSearchClientInPopover(e: string) {
    console.log(e);
    const result = usersFromFireStore.filter((user) => {
      const matchedName = e ? user.name.toLowerCase().includes(e) : true;
      const matchedCPF = e ? user.cpf.toLowerCase().includes(e) : true;

      return matchedName || matchedCPF;
    });
    setUsersFiltered(result);
  }

  const fetchTypeUser = async (): Promise<string | null> => {
    const getUserCredentials = localStorage.getItem("loggedUser");
    const userCredentials =
      getUserCredentials && JSON.parse(getUserCredentials);

    const id = userCredentials.uid;

    if (!id) {
      console.error("ID não encontrado no localStorage.");
      return null;
    }

    try {
      const clientDoc = doc(firestore, "clients", id);
      const docSnap = await getDoc(clientDoc);
      console.log("Tipo do usuário encontrado.");

      if (docSnap.exists()) {
        const typeUser = docSnap.data()?.type_user || null;

        setTypeUser(typeUser);

        return typeUser;
      } else {
        console.error("Usuário não encontrado.");
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar user_name no Firestore:", error);
      return null;
    }
  };

  function handlingClosePopover(client: UsersProps) {
    setUser(client);
    setOpen(false);
  }

  useEffect(() => {
    fetchTypeUser();
    getAllClients();
  }, []);

  useEffect(() => {
    console.log("Operations: ", operations);
    console.log("Usuários filtrados: ", usersFiltered);
  }, [operations, usersFiltered]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-shrink-0 ">
        <Sidebar />
      </div>
      <div className="flex-1 p-4 flex flex-col  pl-[3rem]">
        <CardHeader className="bg-white rounded">
          {" "}
          <CardTitle className="text-xl font-bold">
            <div className="flex items-center justify-start gap-x-12">
              <img src={logo} className="size-[8rem] rounded-full " />
              <h1 className="antialised text-[1.7rem]  flex items-center gap-x-1 text-gray-600">
                <span>
                  <ChevronsRightIcon size={26} className="text-store-primary" />
                </span>
                Crédito do cliente
              </h1>
            </div>
          </CardTitle>
        </CardHeader>
        <div className="flex flex-col items-center bg-white shadow-xl p-1 overflow-auto">
          <div className="grid grid-cols-2 border border-gray-200 rounded-lg   w-full justify-around mt-4 ">
            <div className="flex flex-col items-center gap-2 p-4 col-span-1 border-r">
              <div>
                <label
                  htmlFor="clients"
                  className="font-semibold hover:cursor-pointer text-gray-700"
                >
                  Cliente:{" "}
                </label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger
                    onClick={() => setOpen(true)}
                    className="border-2 text-start text-gray-700 bg-gray-100 text-nowrap border-black rounded-lg p-1 w-[19rem]"
                  >
                    {user === undefined ? (
                      "Selecione o cliente"
                    ) : (
                      <span>
                        {user.name} - {user.cpf}
                      </span>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="space-y-1 w-[20rem]">
                    <div className="flex flex-col  gap-2">
                      <Input
                        type="text"
                        placeholder="Buscar cliente"
                        onChange={(e) =>
                          handlingSearchClientInPopover(
                            e.target.value.toLowerCase()
                          )
                        }
                      />

                      <div className="space-y-2">
                        {usersList.map((client, index) => {
                          return (
                            <div
                              key={index}
                              className=" w-full text-nowrap p-2 space-y-1 border rounded-lg hover:border-black hover:cursor-pointer"
                              onClick={() => handlingClosePopover(client)}
                            >
                              {client.name} - {client.cpf}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center w-[23rem] justify-evenly">
                <span className="flex flex-col text-gray-700 font-semibold flex-1">
                  Saldo Atual:{" "}
                  <span className="font-bold text-emerald-600 text-lg">
                    {credit.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </span>
                <Button
                  onClick={handlingUserSelectedInSelect}
                  className="active:scale-90"
                >
                  Pesquisar
                </Button>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(handlingUpdateUserCredits)}
              className="flex col-span-1"
            >
              <div className="flex  w-full gap-2 items-center justify-center">
                <div className="flex  flex-col">
                  <span className="font-semibold">Operações: </span>

                  <div className="flex   items-center gap-2 py-5 justify-center">
                    <span className="font-semibold">R$</span>
                    <Input
                      type="number"
                      step={"0.01"}
                      placeholder="0.00"
                      className="w-44"
                      {...register("updateValue", {
                        required: true,
                      })}
                    />
                  </div>
                  <span className="text-sm text-wrap max-w-52 ">
                    {errors.updateValue?.message}
                  </span>
                </div>

                <div className="flex flex-col  gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center p-2 border rounded-lg  font-semibold text-xl bg-emerald-300 border-transparent active:scale-90
                  `}
                    onClick={() => setTypeOperation("sum")}
                  >
                    <DollarSignIcon className=" text-emerald-600" />
                    Adicionar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center p-2 border rounded-lg font-semibold text-xl 
                      bg-red-300 border-transparent active:scale-90
                    `}
                    onClick={() => setTypeOperation("sub")}
                  >
                    <strong className="text-red-600">-</strong>
                    <DollarSignIcon className=" text-red-600" />
                    Remover
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="flex flex-col  justify-center w-[50rem]    p-2">
            <span className="font-semibold text-xl flex gap-2  mb-4">
              Histórico de operações/vendas <History />
            </span>
            <div>
              <div>
                {/* <span className="font-semibold text-lg">Operações: </span> */}

                <div className="h-[28rem] overflow-hidden overflow-y-scroll">
                  {" "}
                  {operations
                    .sort((a, b) => {
                      return (
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                      );
                    })
                    .map((op, index) => (
                      <div
                        key={index}
                        className={`grid grid-cols-4 border rounded-lg justify-around items-center text-center p-2 ${
                          op.operation_type === "sum"
                            ? "bg-emerald-500 bg-opacity-70"
                            : "bg-red-500 bg-opacity-70"
                        }`}
                      >
                        <span className="font-semibold col-span-1">
                          {op.operation_type === "sum" ? "Acréscimo" : "Débito"}
                        </span>
                        <span className="font-semibold col-span-1">
                          {op.name}
                        </span>
                        <span className="col-span-1">
                          {format(op.created_at, "dd/MM/yyyy 'ás' HH:mm:ss")}
                        </span>
                        <span className="col-span-1">
                          {op.operation_type !== "sum" ? (
                            <>
                              <strong>-</strong>
                              {op.credito.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </>
                          ) : (
                            <>
                              {op.credito.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
