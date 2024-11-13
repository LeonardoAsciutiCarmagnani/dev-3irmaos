import { Input } from "@/components/ui/input";
import logoKyoto from "../../assets/logo.png";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig"; // Importe a instância de autenticação do Firebase

interface AuthUserProps {
  userLogin: string;
  userPassword: string;
}

export const Auth = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, setError } = useForm<AuthUserProps>();

  const handleUserLogin = async (data: AuthUserProps) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.userLogin,
        data.userPassword
      );

      // Informações do usuário autenticado
      const user = userCredential.user;
      const userCredentials = {
        uid: user.uid,
        email: user.email,
        accessToken: await user.getIdToken(),
      };

      localStorage.setItem("user", JSON.stringify(userCredentials));

      alert("Acesso Liberado");
      navigate("/");
    } catch (error) {
      console.error("Erro de autenticação:", error);
      setError("userLogin", {
        type: "manual",
        message: "Usuário ou senha incorretos!",
      });
    }
  };

  return (
    <div className="w-screen h-screen">
      <div className="flex flex-col justify-center items-center p-2 space-y-4">
        <img
          src={logoKyoto}
          alt="Logo da empresa Pasteis Kyoto"
          className="size-40 border-2 border-orange-500 rounded-full"
        />
        <div>
          <form
            onSubmit={handleSubmit(handleUserLogin)}
            className="flex flex-col border-2 border-orange-500 space-y-4 p-3 rounded-lg"
          >
            <div>
              <label htmlFor="login">Login:</label>
              <Input
                id="login"
                type="email"
                placeholder="Digite seu login"
                {...register("userLogin")}
                required
              />
            </div>
            <div>
              <label htmlFor="password">Senha:</label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                {...register("userPassword")}
                required
              />
            </div>
            <Button type="submit" className="flex-1">
              Acessar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
