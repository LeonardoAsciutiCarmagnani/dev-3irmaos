import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCallback, useState } from "react";
import { z } from "zod";
import { cpf, cnpj } from "cpf-cnpj-validator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IMaskInput } from "react-imask";
import { Button } from "@/components/ui/button";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import Loader from "../Loader/loader";
import {
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../Utils/FirebaseConfig";
import { api } from "@/lib/axios";
import Login from "../Login";

const formSchema = z.object({
  Name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  Email: z.string().email("E-mail inválido").trim().toLowerCase(),
  Document: z.string().refine((value) => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.length === 11 ? cpf.isValid(cleaned) : cnpj.isValid(cleaned);
  }, "Documento inválido."),
  Phone: z.string().min(15, "Telefone inválido."),
  IE: z.string().optional(),
  FantasyName: z.string().optional(),
  Address: z.object({
    Cep: z.string().length(9, "CEP inválido."),
    Street: z.string().min(3, "Logradouro inválido."),
    Number: z.coerce.number().min(1, "Número inválido."),
    Neighborhood: z.string().min(2, "Bairro inválido."),
    City: z.string().min(2, "Cidade inválida."),
    State: z.string().length(2, "UF inválida."),
    Ibge: z.string().min(7, "Código IBGE inválido."),
  }),
  Password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
  ConfirmPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
});

type FormSchema = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
};

const RegisterModal = ({ open }: Props) => {
  const [isIndividual, setIsIndividual] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Name: "",
      Email: "",
      Document: "",
      Phone: "",
      IE: "",
      FantasyName: "",
      Address: {
        Cep: "",
        Street: "",
        Number: 0,
        Neighborhood: "",
        City: "",
        State: "",
        Ibge: "",
      },
      Password: "",
      ConfirmPassword: "",
    },
  });

  const fetchAddress = useCallback(
    async (cep: string) => {
      try {
        const { data } = await axios.get(
          `https://viacep.com.br/ws/${cep}/json/`
        );
        if (data.erro) toast.error("CEP inválido ou não encontrado");

        form.setValue("Address.Street", data.logradouro);
        form.setValue("Address.Neighborhood", data.bairro);
        form.setValue("Address.City", data.localidade);
        form.setValue("Address.State", data.uf);
        form.setValue("Address.Ibge", data.ibge);
        toast.success("Endereço encontrado com sucesso!");
      } catch (error) {
        toast.error("CEP inválido ou não encontrado");
        console.error(error);
        form.resetField("Address.Cep");
      }
    },
    [form]
  );

  const onSubmit = async (values: FormSchema) => {
    setIsSubmitting(true);

    try {
      const methods = await fetchSignInMethodsForEmail(auth, values.Email);

      if (methods.length > 0) {
        toast.error("E-mail já cadastrado");
        return;
      }

      const createdUser = await api.post("/create-client", {
        name: values.Name,
        email: values.Email,
        document: values.Document,
        phone: values.Phone,
        ie: values.IE,
        fantasyName: values.FantasyName,
        address: {
          cep: values.Address.Cep,
          street: values.Address.Street,
          number: values.Address.Number,
          neighborhood: values.Address.Neighborhood,
          city: values.Address.City,
          state: values.Address.State,
          ibge: values.Address.Ibge,
        },
        password: values.Password,
      });

      const { data } = createdUser.data;

      await signInWithEmailAndPassword(auth, data.email, data.password);

      toast.success("Conta criada com sucesso!");
      console.log("Conta criada com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      toast.error("Erro ao cadastrar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Dialog open={open} modal>
        <DialogContent className="bg-white max-w-[45rem] rounded-xs">
          <DialogHeader>
            <DialogTitle>
              {isLogin ? "Entre com sua conta" : "Crie sua conta"}
            </DialogTitle>
            <DialogDescription>
              {isLogin ? (
                <>
                  <div className="flex flex-col items-start justify-between">
                    <div>
                      Para continuar com seu orçamento, precisamos que entre com
                      sua conta
                    </div>
                    <div className="flex items-center gap-x-1 w-full justify-start">
                      <h1>Ainda não possui uma conta?</h1>
                      <Button
                        variant="link"
                        className="px-1 py-0 text-red-900 font-bold"
                        onClick={() => setIsLogin(false)}
                      >
                        Criar
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-start justify-between">
                  <div>
                    Para continuar com seu orçamento, precisamos que crie sua
                    conta.
                  </div>
                  <div className="flex items-center gap-x-1 w-full justify-start font-semibold">
                    <h1>Já possui uma conta?</h1>
                    <Button
                      variant="link"
                      className="px-1 py-0 text-red-900 font-bold"
                      onClick={() => setIsLogin(true)}
                    >
                      Entrar
                    </Button>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {!isLogin && (
            <div className="flex items-center justify-center gap-x-2">
              <Badge
                variant={"secondary"}
                onClick={() => setIsIndividual(true)}
                className={`hover:cursor-pointer ${
                  isIndividual ? "bg-red-900 text-white" : ""
                } rounded-xs`}
              >
                Pessoa Física
              </Badge>
              <Badge
                variant={"secondary"}
                onClick={() => setIsIndividual(false)}
                className={`hover:cursor-pointer ${
                  !isIndividual ? "bg-red-900 text-white" : ""
                } rounded-xs`}
              >
                Pessoa Jurídica
              </Badge>
            </div>
          )}
          {isLogin ? (
            <Login onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <div>
              <Form {...form}>
                <form
                  className="space-y-3 max-h-[60vh] overflow-y-auto"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="Name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {isIndividual ? "Nome Completo *" : "Razão Social *"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="Email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="Phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone *</FormLabel>
                        <FormControl>
                          <IMaskInput
                            mask="(00) 00000-0000"
                            placeholder="(00) 00000-0000"
                            value={field.value}
                            onAccept={(value) => field.onChange(value)}
                            className="input border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm px-2.5 py-1.5 rounded-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="Document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {isIndividual ? "CPF *" : "CNPJ *"}
                        </FormLabel>
                        <FormControl>
                          <IMaskInput
                            mask={
                              isIndividual
                                ? "000.000.000-00"
                                : "00.000.000/0000-00"
                            }
                            placeholder={
                              isIndividual
                                ? "000.000.000-00"
                                : "00.000.000/0000-00"
                            }
                            value={field.value}
                            onAccept={(value) => field.onChange(value)}
                            className="input border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm px-2.5 py-1.5 rounded-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!isIndividual && (
                    <>
                      <FormField
                        control={form.control}
                        name="IE"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inscrição estadual</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="FantasyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Fantasia *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm"
                                required
                              />
                            </FormControl>
                            <FormMessage className="mt-0 pt-2" />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  <div className="flex flex-col space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Endereço
                    </h2>
                    <div className="bg-white rounded-lg">
                      <FormField
                        control={form.control}
                        name="Address.Cep"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex flex-col space-y-2">
                              <FormLabel>CEP *</FormLabel>
                              <div className="flex items-center space-x-2">
                                <IMaskInput
                                  mask="00000-000"
                                  placeholder="00000-000"
                                  value={field.value}
                                  onAccept={(value) => field.onChange(value)}
                                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-fit rounded p-2"
                                />
                                <Badge
                                  onClick={() => {
                                    const cleaned = field.value.replace(
                                      /\D/g,
                                      ""
                                    );
                                    if (cleaned.length === 8) {
                                      fetchAddress(field.value);
                                    }
                                  }}
                                  className="bg-red-900 text-white cursor-pointer text-xs rounded-xs"
                                >
                                  Buscar
                                </Badge>
                              </div>
                              <FormMessage />
                            </div>

                            <div className="mt-4 space-y-3">
                              <FormField
                                control={form.control}
                                name="Address.City"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Cidade</FormLabel>
                                    <FormControl>
                                      <Input
                                        readOnly
                                        {...field}
                                        className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-full rounded p-2"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="Address.Neighborhood"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Bairro</FormLabel>
                                    <FormControl>
                                      <Input
                                        readOnly
                                        {...field}
                                        className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-full rounded p-2"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="Address.Street"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Logradouro</FormLabel>
                                    <FormControl>
                                      <Input
                                        readOnly
                                        {...field}
                                        className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-full rounded p-2"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                                <FormField
                                  control={form.control}
                                  name="Address.Number"
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormLabel>Número</FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="number"
                                          className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-full rounded p-2"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="Address.State"
                                  render={({ field }) => (
                                    <FormItem className="w-full sm:w-1/4">
                                      <FormLabel>UF</FormLabel>
                                      <FormControl>
                                        <Input
                                          readOnly
                                          {...field}
                                          maxLength={2}
                                          className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-full rounded p-2"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-4">
                    {/* Campo de Senha */}
                    <FormField
                      control={form.control}
                      name="Password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                maxLength={20}
                                className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-full rounded p-2"
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPassword ? (
                                <EyeOffIcon className="h-5 w-5 text-gray-500" />
                              ) : (
                                <EyeIcon className="h-5 w-5 text-gray-500" />
                              )}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Campo de Confirmação da Senha */}
                    <FormField
                      control={form.control}
                      name="ConfirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                maxLength={20}
                                className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-full rounded p-2"
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            ></button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-full flex justify-end pr-4">
                    <Button type="submit" className="rounded-xs">
                      Criar conta
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {isSubmitting && <Loader />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegisterModal;
