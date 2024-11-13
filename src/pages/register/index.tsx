import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
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
  logra: string;
}

export const Register = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<CreateUserProps>();
  const [selectState, setSelectState] = useState("");
  const [selectPriceList, setSelectPriceList] = useState("");
  const { priceLists, fetchPriceLists } = useZustandContext();

  console.log("selectPriceList: ", selectPriceList);

  useEffect(() => {
    fetchPriceLists();
  }, []);

  async function handleCreateUser(data: CreateUserProps) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.userEmail,
        data.userPassword
      );

      const user = userCredential.user;
      const userId = user.uid;

      await updateProfile(user, {
        displayName: data.userName,
      });

      // Adiciona o restante dos dados no Firestore
      await api.post("/v1/create-user", {
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
        user_logra: data.logra,
      });

      console.log("Usuário cadastrado com sucesso!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (e) {
      console.error("Ocorreu um erro ao criar o usuário!", { message: e });
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center md:py-8">
      <div className="flex flex-col w-full border-2 p-4 rounded-lg space-y-2 md:w-2/5 ">
        <h1 className="text-lg font-medium underline">Cadastro de usuário:</h1>
        <form
          onSubmit={handleSubmit(handleCreateUser)}
          className="flex flex-col space-y-2"
        >
          <Accordion type="multiple" className="w-full h-auto space-y-2">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-semibold text-base md:text-lg">
                Informações do usuário
              </AccordionTrigger>
              <AccordionContent>
                <div>
                  <label htmlFor="userName">Nome do cliente:</label>
                  <Input
                    id="userName"
                    type="text"
                    placeholder="Digite o nome do usuário"
                    className="flex-1"
                    {...register("userName")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="userEmail">Email:</label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="Digite o email para acesso"
                    {...register("userEmail")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="userPassword">Senha:</label>
                  <Input
                    id="userPassword"
                    type="password"
                    placeholder="Digite sua senha"
                    {...register("userPassword")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="CPF">CPF:</label>
                  <Input
                    id="CPF"
                    type="text"
                    placeholder="Informe seu CPF"
                    {...register("CPF")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone">Telefone:</label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Informe seu telefone"
                    {...register("phone")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="IE">Inscrição estadual:</label>
                  <Input
                    id="IE"
                    type="text"
                    placeholder="Inscrição estadual"
                    {...register("IE")}
                  />
                </div>
                <div>
                  <label htmlFor="fantasyName">Nome Fantasia:</label>
                  <Input
                    id="fantasyName"
                    type="text"
                    placeholder="Digite o Nome Fantasia"
                    {...register("fantasyName")}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="font-semibold text-base md:text-lg">
                Endereço de cobrança:
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div>
                  <label htmlFor="neighborhood">Bairro:</label>
                  <Input
                    id="neighborhood"
                    type="text"
                    placeholder="Informe seu bairro"
                    {...register("neighborhood")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cep">Cep:</label>
                  <Input
                    id="cep"
                    type="text"
                    placeholder="Informe seu CEP"
                    {...register("cep")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="ibge">Código IBGE:</label>
                  <Input
                    id="ibge"
                    type="text"
                    placeholder="Informe o código IBGE"
                    {...register("ibge")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="complement">Complemento:</label>
                  <Input
                    id="complement"
                    type="text"
                    placeholder="Complemento"
                    {...register("complement")}
                  />
                </div>
                <div>
                  <label htmlFor="logra">Logradouro:</label>
                  <Input
                    id="logra"
                    type="text"
                    placeholder="Informe seu logradouro"
                    {...register("logra")}
                    required
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <Select onValueChange={(value) => setSelectState(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Permissões de usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adm">Administrador</SelectItem>
                <SelectItem value="comun">Usuário comum</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => setSelectPriceList(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Lista de preços" />
              </SelectTrigger>
              <SelectContent>
                {priceLists.map((item) => (
                  <SelectItem value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Accordion>
          <Button type="submit">Cadastrar</Button>
        </form>
      </div>
    </div>
  );
};
