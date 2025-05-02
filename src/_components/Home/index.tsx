import { Link } from "react-router-dom";

const Home = () => {
  // const categorias = [
  //   "Portas, Vitrais e Grades Antigas",
  //   "Janelas e Esquadrias",
  //   "Assoalhos, Deck, Escada e Forro",
  //   "Portas Duplas, Pivotantes e Internas",
  //   "Portas Pronta Entrega",
  //   "Moveis, Painéis e Bancadas",
  // ];

  const categorias = [
    {
      label: "Portas, Vitrais e Grades Antigas",
      imageUrl:
        "https://hiper-gestao.s3.amazonaws.com/88f64a86-0b27-41c2-beba-076650f8ee25/imagem-de-produto/70dc2c26-abd4-4bae-bf11-b4cb9a57a0c9/original.jpeg",
    },
    {
      label: "Janelas e Esquadrias",
      imageUrl:
        "https://hiper-gestao.s3.amazonaws.com/88f64a86-0b27-41c2-beba-076650f8ee25/imagem-de-produto/ba20adcb-37a3-4eb7-8c84-35146f5878a1/original.jpeg",
    },
    {
      label: "Assoalhos, Deck, Escada e Forro",
      imageUrl:
        "https://hiper-gestao.s3.amazonaws.com/88f64a86-0b27-41c2-beba-076650f8ee25/imagem-de-produto/3b63fefb-d27b-4c6b-b847-40bcb805a6c3/original.jpeg",
    },
    {
      label: "Portas Duplas, Pivotantes e Internas",
      imageUrl:
        "https://hiper-gestao.s3.amazonaws.com/88f64a86-0b27-41c2-beba-076650f8ee25/imagem-de-produto/4e2eb499-669a-4703-aaaa-4f954b5ec039/original.jpeg",
    },
    {
      label: "Portas Pronta Entrega ",
      imageUrl:
        "https://hiper-gestao.s3.amazonaws.com/88f64a86-0b27-41c2-beba-076650f8ee25/imagem-de-produto/ecf0a448-f699-43d6-8a3c-a3c4c4cd2e0a/original.jpeg",
    },
    {
      label: "Moveis, Painéis e Bancadas",
      imageUrl:
        "https://hiper-gestao.s3.amazonaws.com/88f64a86-0b27-41c2-beba-076650f8ee25/imagem-de-produto/b8611f73-46eb-493e-b576-b4b97f2ef0f9/original.jpeg",
    },
  ];

  return (
    <div className="h-full w-full px-2 overflow-y-auto md:h-[calc(100vh-64px)] pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-1 h-full">
        {categorias.map((categoria) => (
          <div
            key={categoria.label}
            className="relative group overflow-hidden rounded-xs shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <Link
              to={`/produtos?c=${categoria.label}`}
              className="block w-full h-full text-center text-gray-800 hover:text-white"
            >
              <div className="relative w-full aspect-square h-full">
                <img
                  src={categoria.imageUrl}
                  alt={categoria.label}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-800"
                />
              </div>
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-red-500 via-red-500/90 to-transparent backdrop-blur-xs p-3">
                <h1 className="text-sm md:text-lg lg:text-lg font-semibold text-white/90 line-clamp-1">
                  {categoria.label}
                </h1>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
