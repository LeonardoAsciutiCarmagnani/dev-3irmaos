import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { EditIcon, LucideTrash2, PlusIcon } from "lucide-react";
import DialogExclusion from "./DialogExclusion";
import { PriceListProps, useZustandContext } from "@/context/cartContext";
import ToastNotifications from "./Toasts";
import Sidebar from "./Sidebar";

const PriceListsOverview = () => {
  const { priceLists, loading, fetchPriceLists, filterPricesList } =
    useZustandContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPriceList, setSelectedPriceList] =
    useState<PriceListProps | null>(null);
  const { toastSuccess, toastError } = ToastNotifications();
  const navigate = useNavigate();

  const deletePriceList = async (id: string) => {
    console.log(id);
    try {
      await axios.delete(
        `https://us-central1-kyoto-f1764.cloudfunctions.net/api/v1/prices-lists/${id}`
      );

      filterPricesList(id);

      setIsDialogOpen(false);
      toastSuccess("Lista de preços excluida com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir lista de preços:", error);
      toastError("Erro ao excluir lista de preços.");
    }
  };

  const handleDeletePriceList = (pricelist: PriceListProps) => {
    setSelectedPriceList(pricelist);
    setIsDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setSelectedPriceList(null);
  };

  const handleConfirmDelete = () => {
    if (selectedPriceList) {
      deletePriceList(selectedPriceList.id);
    }
  };

  useEffect(() => {
    fetchPriceLists();
  }, []);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className=" flex items-center gap-x-8 mb-6">
        <Sidebar />
        <h1 className="text-2xl font-semibold text-center">Listas de Preços</h1>
      </div>
      {loading && (
        <p className="text-center text-gray-500">
          Carregando listas de preços...
        </p>
      )}
      <div className="mb-7 flex justify-center">
        <button
          className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded flex items-center gap-2 px-4 py-2"
          onClick={() => navigate("/create-prices-list/")}
        >
          <PlusIcon size={16} />
          Nova Lista de Preços
        </button>
      </div>
      {priceLists && priceLists.length > 0 ? (
        <ul className="space-y-3">
          {priceLists.map((pricelist) => (
            <li
              key={pricelist.id}
              className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <span className="text-lg font-medium text-gray-700">
                {pricelist.name}
              </span>
              <div className="flex gap-2">
                <button
                  className="focus:outline-none transition-colors bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                  onClick={() => handleDeletePriceList(pricelist)}
                >
                  <LucideTrash2 size={16} />
                </button>
                <button
                  className="focus:outline-none transition-colors bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded"
                  onClick={() => navigate(`/prices-lists/${pricelist.id}`)}
                >
                  <EditIcon size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">Sem dados disponíveis.</p>
      )}

      {selectedPriceList && (
        <DialogExclusion
          isOpen={isDialogOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          name={selectedPriceList.name}
        />
      )}
    </div>
  );
};

export default PriceListsOverview;
