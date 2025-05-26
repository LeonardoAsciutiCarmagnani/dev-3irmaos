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
      label: "Portas Sob Medida",
      imageUrl:
        "https://hiper-gestao.s3.amazonaws.com/88f64a86-0b27-41c2-beba-076650f8ee25/imagem-de-produto/4e2eb499-669a-4703-aaaa-4f954b5ec039/original.jpeg",
    },
    {
      label: "Portas Pronta Entrega",
      imageUrl:
        "https://hiper-gestao.s3.amazonaws.com/88f64a86-0b27-41c2-beba-076650f8ee25/imagem-de-produto/ecf0a448-f699-43d6-8a3c-a3c4c4cd2e0a/original.jpeg",
    },
    {
      label: "Antiguidades",
      imageUrl:
        "https://hiper-gestao.s3.amazonaws.com/88f64a86-0b27-41c2-beba-076650f8ee25/imagem-de-produto/70dc2c26-abd4-4bae-bf11-b4cb9a57a0c9/original.jpeg",
    },
    {
      label: "Janelas e Esquadrias",
      imageUrl:
        "https://hiper-gestao.s3.amazonaws.com/88f64a86-0b27-41c2-beba-076650f8ee25/imagem-de-produto/ba20adcb-37a3-4eb7-8c84-35146f5878a1/original.jpeg",
    },
    {
      label: "Assoalhos, Escadas, Decks e Forros",
      imageUrl:
        "https://hiper-gestao.s3.amazonaws.com/88f64a86-0b27-41c2-beba-076650f8ee25/imagem-de-produto/3b63fefb-d27b-4c6b-b847-40bcb805a6c3/original.jpeg",
    },
    {
      label: "Bancadas, Móveis e Painéis",
      imageUrl:
        "https://hiper-gestao.s3.amazonaws.com/88f64a86-0b27-41c2-beba-076650f8ee25/imagem-de-produto/b8611f73-46eb-493e-b576-b4b97f2ef0f9/original.jpeg",
    },
  ];

  return (
    <div className="w-full px-2 py-1 overflow-y-auto pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-1 mb-4">
        {categorias.map((categoria) => (
          <div
            key={categoria.label}
            className="relative group overflow-hidden rounded-xs shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <Link
              to={`/produtos?c=${categoria.label.toLowerCase()}`}
              className="block w-full h-full text-center text-gray-800 hover:text-white"
            >
              <div className="relative w-full h-[16rem] md:h-[20rem] 2xl:h-[25rem] overflow-hidden">
                <img
                  src={categoria.imageUrl}
                  alt={categoria.label}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-900 via-red-900/80 to-transparent p-2">
                <h1 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                  {categoria.label}
                </h1>
              </div>
            </Link>
          </div>
        ))}
      </div>
      {/* Espaço adicional para garantir visibilidade do último card */}
      <div className="h-2"></div>
    </div>
  );
};

export default Home;
