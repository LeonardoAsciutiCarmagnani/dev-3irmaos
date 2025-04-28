// import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/context/authContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormSchema = z.infer<typeof formSchema>;

const Login = () => {
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleUserLogin = async (data: FormSchema) => {
    try {
      await login(data.email.trim(), data.password.trim());
    } catch (error) {
      console.error("Erro de autenticação:", error);
      toast.error("Login ou senha incorretos.");
    }
  };

  return (
    <>
      <Toaster
        richColors
        position="top-right"
        duration={5000}
        closeButton={false}
      />
      <div className="flex flex-col items-center justify-center h-[28vh] w-full">
        <div className="p-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUserLogin)}>
              <div className="flex flex-col gap-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-full"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...field}
                            className="pr-10 border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm"
                          />
                          {showPassword ? (
                            <EyeOffIcon
                              className="absolute right-3 top-1.5 cursor-pointer"
                              onClick={() => setShowPassword(false)}
                              color="darkred"
                            />
                          ) : (
                            <EyeIcon
                              className="absolute right-3 top-1.5 cursor-pointer"
                              onClick={() => setShowPassword(true)}
                              color="darkred"
                            />
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit">Entrar</Button>
              </div>
            </form>
          </Form>
        </div>
        {/* <div className="flex flex-col items-center justify-center">
          <h1 className="font-semibold text-sm">Não possui uma conta?</h1>
          <Link
            to={"/cadastro"}
            className="text-blue-400 hover:underline hover:cursor-pointer text-sm"
          >
            Criar agora
          </Link>
        </div> */}
      </div>
    </>
  );
};

export default Login;
