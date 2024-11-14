import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { api } from "@/lib/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useZustandContext } from "@/context/cartContext";

interface CreateUserProps {
  userName: string;
  userEmail: string;
  userPassword: string;
  CPF: string;
  phone: string;
  IE: string;
  fantasyName: string;
  neighborhood: string;
  cep: string;
  ibge: string;
  complement: string;
  logradouro: string;
  number: number;
}

export const Register = () => {
  const { register, handleSubmit } = useForm<CreateUserProps>();
  const [selectState, setSelectState] = useState("");
  const [selectPriceList, setSelectPriceList] = useState("");
  const { priceLists, fetchPriceLists } = useZustandContext();

  async function handleCreateUser(data: CreateUserProps) {
    let userCredential = null;
    let userId = null;

    try {
      userCredential = await createUserWithEmailAndPassword(
        auth,
        data.userEmail,
        data.userPassword
      );
      const user = userCredential.user;
      userId = user.uid;

      // Atualiza o perfil do usuário no Firebase
      await updateProfile(user, {
        displayName: data.userName,
      });

      const response = await api.post("/v1/create-user", {
        user_id: userId,
        id_priceList: selectPriceList,
        type_user: selectState,
        user_name: data.userName,
        user_CPF: data.CPF,
        user_phone: data.phone,
        user_IE: data.IE,
        user_fantasyName: data.fantasyName,
        user_neighborhood: data.neighborhood,
        user_cep: data.cep,
        user_ibgeCode: data.ibge,
        user_complement: data.complement,
        user_logradouro: data.logradouro,
        user_houseNumber: data.number,
      });

      // Verifica se a resposta do back-end foi bem-sucedida
      if (response.status !== 200) {
        await deleteUser(userCredential.user); // Exclui o usuário do Firebase
        throw new Error("Falha ao criar o usuário no back-end.");
      }

      console.log("Usuário cadastrado com sucesso!");
    } catch (e) {
      console.error("Ocorreu um erro ao criar o usuário!", { message: e });

      // Rollback caso algo falhe durante a criação no Firebase ou no back-end
      if (userCredential && userCredential.user) {
        await deleteUser(userCredential.user); // Exclui o usuário do Firebase
      }
    }
  }

  useEffect(() => {
    fetchPriceLists();
  }, []);

  return (
    <div className="w-screen h-screen flex justify-center items-center p-4 bg-gray-100">
      <div className="flex flex-col w-full max-w-lg border border-gray-300 shadow-lg rounded-lg bg-white p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-gray-700 text-center">
          Cadastro de Usuário
        </h1>
        <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-6">
          <Accordion type="multiple" className="space-y-4">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-semibold text-base md:text-lg text-gray-700">
                Informações do Usuário
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div>
                  <label htmlFor="userName" className="text-gray-600">
                    Nome do Cliente:
                  </label>
                  <Input
                    id="userName"
                    type="text"
                    placeholder="Digite o nome do usuário"
                    className="w-full mt-1"
                    {...register("userName")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="userEmail" className="text-gray-600">
                    Email:
                  </label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="Digite o email para acesso"
                    className="w-full mt-1"
                    {...register("userEmail")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="userPassword" className="text-gray-600">
                    Senha:
                  </label>
                  <Input
                    id="userPassword"
                    type="password"
                    placeholder="Digite sua senha"
                    className="w-full mt-1"
                    {...register("userPassword")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="CPF" className="text-gray-600">
                    CPF/CNPJ:
                  </label>
                  <Input
                    id="CPF"
                    type="text"
                    placeholder="Informe seu CPF ou CNPJ"
                    className="w-full mt-1"
                    {...register("CPF")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="text-gray-600">
                    Telefone:
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Informe seu telefone"
                    className="w-full mt-1"
                    {...register("phone")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="IE" className="text-gray-600">
                    Inscrição Estadual:
                  </label>
                  <Input
                    id="IE"
                    type="text"
                    placeholder="Inscrição estadual"
                    className="w-full mt-1"
                    {...register("IE")}
                  />
                </div>
                <div>
                  <label htmlFor="fantasyName" className="text-gray-600">
                    Nome Fantasia:
                  </label>
                  <Input
                    id="fantasyName"
                    type="text"
                    placeholder="Digite o Nome Fantasia"
                    className="w-full mt-1"
                    {...register("fantasyName")}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="font-semibold text-base md:text-lg text-gray-700">
                Endereço de Cobrança
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div>
                  <label htmlFor="neighborhood" className="text-gray-600">
                    Bairro:
                  </label>
                  <Input
                    id="neighborhood"
                    type="text"
                    placeholder="Informe seu bairro"
                    className="w-full mt-1"
                    {...register("neighborhood")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cep" className="text-gray-600">
                    CEP:
                  </label>
                  <Input
                    id="cep"
                    type="text"
                    placeholder="Informe seu CEP"
                    className="w-full mt-1"
                    {...register("cep")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="ibge" className="text-gray-600">
                    Código IBGE:
                  </label>
                  <Input
                    id="ibge"
                    type="text"
                    placeholder="Informe o código IBGE"
                    className="w-full mt-1"
                    {...register("ibge")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="complement" className="text-gray-600">
                    Complemento:
                  </label>
                  <Input
                    id="complement"
                    type="text"
                    placeholder="Complemento"
                    className="w-full mt-1"
                    {...register("complement")}
                  />
                </div>
                <div>
                  <label htmlFor="logradouro" className="text-gray-600">
                    Logradouro:
                  </label>
                  <Input
                    id="logradouro"
                    type="text"
                    placeholder="Informe seu logradouro"
                    className="w-full mt-1"
                    {...register("logradouro")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="number" className="text-gray-600">
                    Número:
                  </label>
                  <Input
                    id="number"
                    type="number"
                    placeholder="Informe o número"
                    className="w-full mt-1"
                    {...register("number")}
                    required
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <Select onValueChange={(value) => setSelectState(value)}>
              <SelectTrigger className="w-full mt-2 bg-gray-100 rounded-md border border-gray-300">
                <SelectValue placeholder="Permissões de usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adm">Administrador</SelectItem>
                <SelectItem value="comun">Usuário Comum</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => setSelectPriceList(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Lista de preços" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Lista padrão</SelectItem>
                {priceLists.map((item) => (
                  <SelectItem value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Accordion>
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
          >
            Cadastrar
          </Button>
        </form>
      </div>
    </div>
  );
};
