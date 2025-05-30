import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { cnpj, cpf } from "cpf-cnpj-validator";
import {
  Building,
  FileText,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../Utils/FirebaseConfig";

const CreateClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isIndividual, setIsIndividual] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  const formSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
    email: z.string().email("E-mail inválido").trim().toLowerCase(),
    document: z.string().refine((value) => {
      const cleaned = value.replace(/\D/g, "");
      return cleaned.length === 11
        ? cpf.isValid(cleaned)
        : cnpj.isValid(cleaned);
    }, "Documento inválido."),
    phone: z.string().min(15, "Telefone inválido."),
    ie: z.string().optional(),
    fantasyName: z.string().optional(),
    address: z.object({
      cep: z.string().length(9, "CEP inválido."),
      street: z.string().min(3, "Logradouro inválido."),
      number: z.coerce.number().min(1, "Número inválido."),
      neighborhood: z.string().min(2, "Bairro inválido."),
      city: z.string().min(2, "Cidade inválida."),
      state: z.string().length(2, "UF inválida."),
      ibge: z.string().min(7, "Código IBGE inválido."),
      complement: z.string().optional(),
    }),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
  });

  type FormSchema = z.infer<typeof formSchema>;

  function generateTemporaryPassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyz123456789!@#$";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }
    return password;
  }

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      document: "",
      phone: "",
      ie: "",
      fantasyName: "",
      address: {
        cep: "",
        street: "",
        number: 0,
        neighborhood: "",
        city: "",
        state: "",
        ibge: "",
        complement: "",
      },
      password: generateTemporaryPassword(12),
    },
  });

  const fetchAddress = useCallback(
    async (cep: string) => {
      try {
        const { data } = await axios.get(
          `https://viacep.com.br/ws/${cep}/json/`
        );
        if (data.erro) toast.error("CEP inválido ou não encontrado");

        form.setValue("address.street", data.logradouro);
        form.setValue("address.neighborhood", data.bairro);
        form.setValue("address.city", data.localidade);
        form.setValue("address.state", data.uf);
        form.setValue("address.ibge", data.ibge);
        form.setValue("address.cep", data.cep);
        form.setValue("address.complement", data.complemento);

        toast.success("Endereço encontrado com sucesso!");
      } catch (error) {
        toast.error("CEP inválido ou não encontrado");
        console.error(error);
        form.resetField("address.cep");
      }
    },
    [form]
  );

  const checkUserExistsInFirebase = async (document: string, email: string) => {
    const clientsRef = collection(db, "clients");

    const queryDocument = query(clientsRef, where("document", "==", document));
    const querySnapshotDocument = await getDocs(queryDocument);

    const queryEmail = query(clientsRef, where("email", "==", email));
    const querySnapshotEmail = await getDocs(queryEmail);

    if (!querySnapshotEmail.empty) {
      toast.error("Já existe um usuário cadastrado com este e-mail.");
      return true;
    }

    if (!querySnapshotDocument.empty) {
      toast.error("Já existe um usuário cadastrado com este documento.");
      return true;
    }

    return false;
  };

  const createClient = async (data: FormSchema) => {
    try {
      setIsLoading(true);
      const userExists = await checkUserExistsInFirebase(
        data.document,
        data.email
      );
      if (userExists === false) {
        const createClientObject = {
          name: data.name,
          email: data.email,
          document: data.document,
          phone: data.phone,
          ie: data.ie,
          fantasyName: data.fantasyName,
          address: {
            cep: data.address.cep,
            street: data.address.street,
            number: data.address.number,
            neighborhood: data.address.neighborhood,
            city: data.address.city,
            state: data.address.state,
            ibge: data.address.ibge,
            complement: data.address.complement,
          },
          password: data.password,
        };
        console.log("Objeto de criação cliente:", createClientObject);
        const response = await api.post("/create-client", createClientObject);
        console.log("Response Create Client:", response.data);

        await sendPasswordResetEmail(auth, data.email);

        toast.info("Senha provisória.", {
          id: "reg-info",
          duration: 20000,
          description: `A senha provisória gerada é: ${data.password}`,
        });
        toast.success("Usuário criado com sucesso", {
          id: "reg-success",
          description: `Um e-mail foi enviado para o cliente configurar sua própria senha.`,
          duration: 10000,
        });
        navigate("/adm/clientes");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao registrar usuário.", { id: "reg-error" });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: FormSchema) => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.error(
        "Formulário possui erros de validação:",
        form.formState.errors
      );
      toast.error("Por favor, corrija os erros no formulário.");
      return;
    }

    createClient(data);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onError = (errors: any) => {
    console.error("Erros de validação do formulário:", errors);
    toast.error("Por favor, corrija os erros no formulário.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="space-y-1.5"
          >
            {/* Tipo de Pessoa */}
            <Card className="border rounded-xs border-gray-200 shadow-sm bg-white/90 backdrop-blur-sm px-4 py-6 ">
              <CardHeader className="rounded-t-xs">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                  <div className="bg-red-900 p-2 rounded-xs">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  Tipo de Pessoa
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-start gap-4">
                  <Badge
                    variant="secondary"
                    onClick={() => setIsIndividual(true)}
                    className={`hover:cursor-pointer px-8 py-3 text-base font-medium ${
                      isIndividual
                        ? "bg-gradient-to-r from-red-900 to-red-800 text-white hover:from-red-800 hover:to-red-700 shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    } rounded-xs transition-all duration-300 transform hover:scale-105`}
                  >
                    Pessoa Física
                  </Badge>
                  <Badge
                    variant="secondary"
                    onClick={() => setIsIndividual(false)}
                    className={`hover:cursor-pointer px-8 py-3 text-base font-medium ${
                      !isIndividual
                        ? "bg-gradient-to-r from-red-900 to-red-800 text-white hover:from-red-800 hover:to-red-700 shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    } rounded-xs transition-all duration-300 transform hover:scale-105`}
                  >
                    Pessoa Jurídica
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Dados Pessoais/Empresariais */}
            <Card className="border border-gray-200 shadow-sm bg-white/90 backdrop-blur-sm rounded-xs px-4 py-6">
              <CardHeader className="pb-4 rounded-t-xs">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                  <div className="bg-red-900 p-2 rounded-xs">
                    {isIndividual ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Building className="w-5 h-5 text-white" />
                    )}
                  </div>
                  {isIndividual ? "Dados Pessoais" : "Dados da Empresa"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold flex items-center gap-2 text-gray-800">
                          <div className="bg-red-900 p-1 rounded-xs">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          {isIndividual ? "Nome Completo *" : "Razão Social *"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={
                              isIndividual
                                ? "Digite o nome completo"
                                : "Digite a razão social"
                            }
                            className="h-11 text-base rounded-xs border-2 border-gray-200 focus:border-red-900 focus:ring-2 focus:ring-red-900/20 transition-all duration-300 bg-white/80"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold flex items-center gap-2 text-gray-800">
                          <div className="bg-red-900 p-1 rounded-xs">
                            <Mail className="w-3 h-3 text-white" />
                          </div>
                          E-mail *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="exemplo@email.com"
                            className="h-11 text-base rounded-xs border-2 border-gray-200 focus:border-red-900 focus:ring-2 focus:ring-red-900/20 transition-all duration-300 bg-white/80"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="document"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold flex items-center gap-2 text-gray-800">
                          <div className="bg-red-900 p-1 rounded-xs">
                            <FileText className="w-3 h-3 text-white" />
                          </div>
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
                            className="flex h-11 w-full rounded-xs border-2 border-gray-200 bg-white/80 px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-red-900 focus-visible:ring-2 focus-visible:ring-red-900/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold flex items-center gap-2 text-gray-800">
                          <div className="bg-red-900 p-1 rounded-xs">
                            <Phone className="w-3 h-3 text-white" />
                          </div>
                          Telefone *
                        </FormLabel>
                        <FormControl>
                          <IMaskInput
                            mask="(00) 00000-0000"
                            placeholder="(11) 99999-9999"
                            value={field.value}
                            onAccept={(value) => field.onChange(value)}
                            className="flex h-11 w-full rounded-xs border-2 border-gray-200 bg-white/80 px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-red-900 focus-visible:ring-2 focus-visible:ring-red-900/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {!isIndividual && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-gray-200">
                    <FormField
                      control={form.control}
                      name="fantasyName"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-base font-semibold flex items-center gap-2 text-gray-800">
                            <div className="bg-red-900 p-1 rounded-xs">
                              <Building className="w-3 h-3 text-white" />
                            </div>
                            Nome Fantasia
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Digite o nome fantasia"
                              className="h-11 text-base rounded-xs border-2 border-gray-200 focus:border-red-900 focus:ring-2 focus:ring-red-900/20 transition-all duration-300 bg-white/80"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ie"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-base font-semibold flex items-center gap-2 text-gray-800">
                            <div className="bg-red-900 p-1 rounded-xs">
                              <FileText className="w-3 h-3 text-white" />
                            </div>
                            Inscrição Estadual
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Digite a inscrição estadual"
                              className="h-11 text-base rounded-xs border-2 border-gray-200 focus:border-red-900 focus:ring-2 focus:ring-red-900/20 transition-all duration-300 bg-white/80"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card className="border border-gray-200 shadow-sm bg-white/90 backdrop-blur-sm rounded-xs px-4 py-6">
              <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white rounded-t-xs">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                  <div className="bg-red-900 p-2 rounded-xs">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                <FormField
                  control={form.control}
                  name="address.cep"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold text-gray-800">
                        CEP *
                      </FormLabel>
                      <div className="flex gap-4">
                        <FormControl>
                          <IMaskInput
                            mask="00000-000"
                            placeholder="12345-678"
                            value={field.value}
                            onAccept={(value) => field.onChange(value)}
                            className="flex h-11 w-full rounded-xs border-2 border-gray-200 bg-white/80 px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-red-900 focus-visible:ring-2 focus-visible:ring-red-900/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => {
                            const cleaned = field.value.replace(/\D/g, "");
                            if (cleaned.length === 8) {
                              fetchAddress(field.value);
                            } else {
                              toast.error("CEP inválido");
                            }
                          }}
                          className="h-11 px-8 rounded-xs border-2 border-red-900 text-red-900 hover:bg-red-900 hover:text-white transition-all duration-300 font-semibold"
                        >
                          Buscar
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-base font-semibold text-gray-800">
                            Logradouro *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              readOnly
                              className="h-11 text-base rounded-xs bg-gray-50 border-2 border-gray-200"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address.number"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold text-gray-800">
                          Número *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            className="h-11 text-base rounded-xs border-2 border-gray-200 focus:border-red-900 focus:ring-2 focus:ring-red-900/20 transition-all duration-300 bg-white/80"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="address.neighborhood"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold text-gray-800">
                          Bairro *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            className="h-11 text-base rounded-xs bg-gray-50 border-2 border-gray-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold text-gray-800">
                          Cidade *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            className="h-11 text-base rounded-xs bg-gray-50 border-2 border-gray-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address.complement"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold text-gray-800">
                        Complemento
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Apartamento, bloco, etc."
                          className="h-11 text-base rounded-xs border-2 border-gray-200 focus:border-red-900 focus:ring-2 focus:ring-red-900/20 transition-all duration-300 bg-white/80"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-6 pt-8">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => form.reset()}
                className="px-10 h-11 rounded-xs border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                onClick={() => console.log("clicou")}
                disabled={isLoading}
                size="lg"
                className="px-10 h-11 rounded-xs bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 shadow-lg transition-all duration-300 font-semibold"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-3" />
                    Cadastrar Cliente
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateClient;
