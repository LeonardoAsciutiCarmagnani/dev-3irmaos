import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { RouteSelect } from "./route-select";

const Home = () => {
  const categorias = [
    "Portas, Vitrais e Grades Antigas",
    "Janelas e Esquadrias",
    "Assoalhos, Deck, Escada e Forro",
    "Portas Duplas, Pivotantes e Internas",
    "Portas Pronta Entrega",
    "Moveis, Painéis e Bancadas",
  ];

  return (
    <div className="md:h-[40rem] h-full w-full px-4 py-2 overflow-y-auto">
      <div className="mb-2 flex items-center justify-center w-full">
        {/* <Select>
          <SelectTrigger className="w-full max-w-xs rounded-xs bg-white shadow-sm shadow-gray-200 ">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((categoria) => (
              <SelectItem key={categoria} value={categoria}>
                {categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
        {/* <RouteSelect /> */}
      </div>
      <div className="h-full w-full grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-1 md:gap-y-4">
        {categorias.map((categoria) => {
          return (
            <div
              key={categoria}
              className="h-full w-full shadow-sm shadow-gray-200 border-1 border-gray-800"
            >
              <Link
                to={`/produtos?c=${categoria}`}
                className="text-gray-700 font-semibold bg-white antialiased text-sm md:text-md line-clamp-2 text-center italic flex flex-col h-full hover:cursor-pointer hover:text-white hover:bg-red-900"
              >
                <div className="relative w-full h-full">
                  <img
                    className="absolute inset-0 w-full h-full object-cover"
                    src="https://hiper-gestao.s3.amazonaws.com/88f64a86-0b27-41c2-beba-076650f8ee25/imagem-de-produto/ecf0a448-f699-43d6-8a3c-a3c4c4cd2e0a/original.jpeg"
                  ></img>
                </div>
                <div className="w-full relative z-[200] flex items-center justify-center border-t-1 border-gray-800">
                  <h1 className="p-1 text-center text-xs md:text-lg line-clamp-1">
                    {categoria}
                  </h1>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
