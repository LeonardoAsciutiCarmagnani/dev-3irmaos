/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import CurrencyInput from "react-currency-input-field";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Check, Plus, Trash2, TriangleAlertIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import Loader from "../Loader/loader";
interface GetProductsInBudgetProps {
  selectedProducts: TableItem[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<TableItem[]>>;
  frete: number | null;
  setFrete: React.Dispatch<React.SetStateAction<number | null>>;

  totalWithoutFreteAndDiscount: number;
  setTotalWithoutFreteAndDiscount: React.Dispatch<React.SetStateAction<number>>;
  totalDiscount: number;
  setTotalDiscount: React.Dispatch<React.SetStateAction<number>>;
}

interface Product {
  id: string;
  nome: string;
  codigo: string;
  preco?: number;
  unidade: string;
  produtoPrimarioId: string;
  categoria: string;
  altura: number;
  largura: number;
  comprimento: number;
  variacao: [
    {
      codigo: number;
      codigoDeBarras: string;
      id: string;
      nomeVariacaoA: string | null;
      nomeVariacaoB: string | null;
      quantidadeEmEstoque: number;
      quantidadeEmEstoqueReservado: number;
      quantidadeMinimaEmEstoque: number;
      tipoVariacaoA: string | null;
      tipoVariacaoB: string | null;
    }
  ];
}
export interface TableItem {
  id: string;
  produto: Product;
  quantidade: number;
  valorUnitario: number;
  descontoUnitario: number;
  subtotal: number;
  unidade: string;
  produtoPrimarioId: string;
}

const GetProductsForm = ({
  selectedProducts,
  setSelectedProducts,
  frete,
  setFrete,
  setTotalWithoutFreteAndDiscount,
  setTotalDiscount,
}: GetProductsInBudgetProps) => {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [tableItems, setTableItems] = useState<TableItem[]>([]);

  const [quantidade, setQuantidade] = useState(1);
  const [valorUnitario, setValorUnitario] = useState(0);
  const [descontoUnitario, setDescontoUnitario] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [tableTotalItems, setTableTotalItems] = useState(0);
  const [selectedVariacaoId, setSelectedVariacaoId] = useState<string>("");

  const getProducts = async () => {
    try {
      setIsLoading(true);
      const url = "/get-products";

      const response = await api.get(url);
      const products = response.data.products.produtos;
      setProducts(products);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  // Atualizar o valor unitário quando um produto for selecionado
  useEffect(() => {
    if (productId) {
      const selectedProduct = products.find((p) => p.id === selectedVariacaoId);
      if (selectedProduct && selectedProduct.preco) {
        setValorUnitario(selectedProduct.preco);
      }
    }
  }, [productId, products]);

  // Calcular o subtotal
  useEffect(() => {
    const total = quantidade * (valorUnitario - descontoUnitario);
    setSubtotal(total);
    const totalItems = tableItems.reduce(
      (acc, item) => acc + item.quantidade,
      0
    );
    setTableTotalItems(totalItems);
  }, [quantidade, valorUnitario, descontoUnitario, tableItems]);

  // Adicionar item ao carrinho
  const addToTable = () => {
    const selectedProduct = products.find((p) => p.id === selectedVariacaoId);

    if (!selectedProduct) return;

    const newItem: TableItem = {
      id: selectedVariacaoId,
      produto: selectedProduct,
      quantidade,
      valorUnitario,
      descontoUnitario,
      subtotal,
      unidade: selectedProduct.unidade,
      produtoPrimarioId: selectedProduct.produtoPrimarioId,
    };

    // setTableItems([...tableItems, newItem]);

    setSelectedProducts((prev) => [...prev, newItem]);

    // Resetar formulário
    setProductId("");
    setQuantidade(1);
    setValorUnitario(0);
    setSelectedVariacaoId("");
    setDescontoUnitario(0);
    setSubtotal(0);
  };

  const removeTableItem = (itemId: string) => {
    setSelectedProducts((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Formatar valor para moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calculateTotal = () => {
    const total = selectedProducts
      .reduce((acc, item) => acc + item.subtotal, frete ?? 0)
      .toFixed(2);
    const totalFormatted = String(total).replace(".", ",");
    return totalFormatted;
  };

  useEffect(() => {
    setTotalWithoutFreteAndDiscount(
      calculateTotalWithoutFreteAndDiscountValue()
    );
    setTotalDiscount(calculateTotalDiscountValue());
  }, [selectedProducts, frete]);

  const calculateTotalWithoutFreteAndDiscountValue = (): number => {
    return selectedProducts.reduce(
      (acc, item) => acc + item.valorUnitario * item.quantidade,
      0
    );
  };

  const calculateTotalDiscountValue = (): number => {
    return selectedProducts.reduce(
      (acc, item) => acc + item.descontoUnitario * item.quantidade,
      0
    );
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-4 p-4 bg-white rounded-xs w-[180vh] border border-gray-200 shadow-md shadow-gray-200">
          <h2 className="text-xl font-semibold text-red-900">
            Adicionar Produtos
          </h2>
          {/* Formulário de seleção e dados do produto */}
          <div className="flex items-end flex-wrap justify-between gap-x-1">
            {/* Seletor de produto */}
            <div className="md:col-span-2">
              <label className="text-sm text-gray-900 mb-1 block">
                Produto
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[40rem] justify-between font-normal text-sm truncate rounded-xs"
                  >
                    {selectedVariacaoId
                      ? (() => {
                          const produtoComVariacao = products.find((produto) =>
                            produto.variacao?.some(
                              (v) => v.id === selectedVariacaoId
                            )
                          );
                          const variacaoSelecionada =
                            produtoComVariacao?.variacao?.find(
                              (v) => v.id === selectedVariacaoId
                            );

                          if (!produtoComVariacao || !variacaoSelecionada)
                            return "Selecione...";

                          const nomeVariacao = [
                            variacaoSelecionada.nomeVariacaoA,
                            variacaoSelecionada.nomeVariacaoB,
                          ]
                            .filter(Boolean)
                            .join(" - ");

                          return (
                            <div className="flex justify-start items-center gap-x-2 text-xs 2xl:text-sm">
                              <span className="font-semibold text-gray-800">
                                {produtoComVariacao.nome}
                              </span>
                              <Badge className="bg-red-900 rounded-xs">
                                {nomeVariacao}
                              </Badge>
                            </div>
                          );
                        })()
                      : "Selecione..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 md:w-96 2xl:w-[36rem]">
                  <Command>
                    <CommandInput
                      placeholder="Busque pelo nome do produto ou nome da variação."
                      className="placeholder:text-xs"
                    />
                    <CommandList>
                      <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                      <CommandGroup>
                        {products
                          .filter((product) => product.variacao !== null)
                          .sort((p1, p2) => p1.nome.localeCompare(p2.nome))
                          .flatMap((product) =>
                            product.variacao?.map((v) => {
                              const nomeVariacao = [
                                v.nomeVariacaoA,
                                v.nomeVariacaoB,
                              ]
                                .filter(Boolean)
                                .join(" - ");

                              const searchValue =
                                `${product.nome} ${nomeVariacao}`.toLowerCase();

                              return (
                                <CommandItem
                                  key={v.id}
                                  value={searchValue}
                                  onSelect={() => {
                                    setSelectedVariacaoId(v.id);
                                    setOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 text-red-900",
                                      selectedVariacaoId === v.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col text-sm">
                                    <div className="flex items-center gap-x-2 justify-start">
                                      <span className="font-medium">
                                        {product.nome}
                                      </span>
                                      <Badge className="font-medium bg-red-900 rounded-xs">
                                        {nomeVariacao}
                                      </Badge>
                                    </div>

                                    <Badge className="text-xs text-red-900 bg-gray-100 rounded-xs">
                                      Cód: {v.codigo}
                                    </Badge>
                                  </div>
                                </CommandItem>
                              );
                            })
                          )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Quantidade */}
            <div>
              <label className="text-sm text-gray-900 mb-1 block">
                Quantidade
              </label>
              <Input
                type="number"
                min={1}
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                className="w-[4rem] rounded-xs"
              />
            </div>

            {/* Valor Unitário */}
            <div>
              <label className="text-sm text-gray-900 mb-1 block">
                Valor Unitário
              </label>
              <CurrencyInput
                id="valor-unitario"
                name="valor-unitario"
                placeholder="R$ 0,00"
                decimalsLimit={2}
                decimalSeparator=","
                groupSeparator="."
                prefix="R$ "
                value={valorUnitario || ""}
                onValueChange={(value) =>
                  setValorUnitario(value ? Number(value) : 0)
                }
                className="w-[7rem] rounded-xs"
              />
            </div>

            {/* Desconto Unitário */}
            <div>
              <label className="text-sm text-gray-900 mb-1 block">
                Desconto Unitário
              </label>
              <CurrencyInput
                id="desconto-unitario"
                name="desconto-unitario"
                placeholder="R$ 0,00"
                decimalsLimit={2}
                decimalSeparator=","
                groupSeparator="."
                prefix="R$ "
                value={descontoUnitario || ""}
                onValueChange={(value) =>
                  setDescontoUnitario(value ? Number(value) : 0)
                }
                className="w-[7rem] rounded-xs"
              />
            </div>

            {/* Subtotal */}
            <div>
              <label className="text-sm text-gray-900 mb-1 block">
                Subtotal
              </label>
              <CurrencyInput
                id="Subtotal"
                name="Subtotal"
                placeholder="R$ 0,00"
                decimalsLimit={2}
                decimalSeparator=","
                groupSeparator="."
                prefix="R$ "
                value={subtotal || valorUnitario}
                disabled
                className="w-[7rem] rounded-xs"
              />
            </div>

            {/* Botão Adicionar */}
          </div>
          <div>
            <Button
              onClick={() => {
                addToTable();
                calculateTotal();
              }}
              disabled={!selectedVariacaoId || quantidade <= 0}
              className="w-[12rem] bg-red-900 hover:bg-red-800 text-white rounded-xs"
            >
              <Plus /> Adicionar
            </Button>
          </div>

          {/* Tabela de produtos */}
          <div className="mt-6 p-2 border border-gray-200">
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Itens Adicionados
            </h3>

            <div className="flex flex-col border border-gray-200 rounded-xs sm:h-45 2xl:max-h-64 overflow-hidden">
              {/* Cabeçalho fixo */}
              <div className="bg-gray-200/60">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-16" /> {/* Código */}
                    <col className="w-48" /> {/* Produto */}
                    <col className="w-20" /> {/* Medida */}
                    <col className="w-40" /> {/* Variação */}
                    <col className="w-12" /> {/* Qtd */}
                    <col className="w-28" /> {/* Valor Unit. */}
                    <col className="w-28" /> {/* Desconto */}
                    <col className="w-28" /> {/* Subtotal */}
                    <col className="w-16" /> {/* Ações */}
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="p-2 text-start text-sm font-medium text-gray-900">
                        Código
                      </th>
                      <th className="p-2 text-start text-sm font-medium text-gray-900">
                        Produto
                      </th>
                      <th className="p-2 text-start text-sm font-medium text-gray-900">
                        Medida
                      </th>
                      <th className="p-2 text-start text-sm font-medium text-gray-900">
                        Variação
                      </th>
                      <th className="p-2 text-start text-sm font-medium text-gray-900">
                        Qtd
                      </th>
                      <th className="p-2 text-start text-sm font-medium text-gray-900">
                        Valor Unit.
                      </th>
                      <th className="p-2 text-start text-sm font-medium text-gray-900">
                        Desconto
                      </th>
                      <th className="p-2 text-start text-sm font-medium text-gray-900">
                        Subtotal
                      </th>
                      <th className="p-2 text-start text-sm font-medium text-gray-900">
                        Ações
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Corpo da tabela */}
              <div className="flex-1 overflow-y-auto">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-16" />
                    <col className="w-48" />
                    <col className="w-20" />
                    <col className="w-40" />
                    <col className="w-12" />
                    <col className="w-28" />
                    <col className="w-28" />
                    <col className="w-28" />
                    <col className="w-16" />
                  </colgroup>
                  <tbody>
                    {selectedProducts.length > 0 ? (
                      selectedProducts.map((item) => {
                        const produtoPai = products.find((p) =>
                          p.variacao?.some((v) => v.id === item.id)
                        );
                        const variacao = produtoPai?.variacao?.find(
                          (v) => v.id === item.id
                        );
                        const nomeVariacao = [
                          variacao?.nomeVariacaoA,
                          variacao?.nomeVariacaoB,
                        ]
                          .filter(Boolean)
                          .join(" - ");

                        return (
                          <tr
                            key={item.id}
                            className="border-b border-gray-200"
                          >
                            <td className="p-2 text-sm text-start text-gray-800">
                              {item.produto.codigo}
                            </td>
                            <td className="p-2 text-sm text-gray-800 text-start">
                              {item.produto.nome}
                            </td>
                            <td className="p-2 text-sm text-gray-800 text-start pl-4">
                              {item.unidade}
                            </td>
                            <td className="p-2 text-sm text-gray-800 text-start pl-4">
                              {nomeVariacao || "—"}
                            </td>
                            <td className="p-2 text-sm text-gray-800 text-start pl-4">
                              {item.quantidade}
                            </td>
                            <td className="p-2 text-sm text-gray-800 text-start pl-5">
                              {formatCurrency(item.valorUnitario)}
                            </td>
                            <td className="p-2 text-sm text-gray-800 text-start pl-5">
                              {formatCurrency(item.descontoUnitario)}
                            </td>
                            <td className="p-2 text-sm font-medium text-gray-800 text-start pl-5">
                              {formatCurrency(item.subtotal)}
                            </td>
                            <td className="p-2 text-start pl-6">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTableItem(item.id)}
                                className="text-gray-500 hover:text-red-900 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={9}>
                          <div className="w-full flex items-center justify-center h-32">
                            <div className="flex items-center gap-x-2">
                              <TriangleAlertIcon color="darkred" />
                              <h1>Nenhum produto adicionado</h1>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rodapé com totais */}
            <div className="mt-2">
              <table className="w-full">
                <colgroup>
                  <col span={7} /> {/* mantém colspans uniformes */}
                  <col className="w-16" />
                </colgroup>
                <tfoot>
                  <tr className="pt-2 border-t border-gray-300">
                    <td colSpan={7} className="p-2 text-right font-base">
                      Quantidade de itens:
                    </td>
                    <td className="p-2 text-start text-gray-700">
                      {" "}
                      {selectedProducts.length}{" "}
                    </td>
                  </tr>
                  <tr className="flex items-center justify-end mb-3 w-full">
                    <td colSpan={2} className="p-2 text-right font-base">
                      Frete:
                    </td>
                    <td>
                      <Input
                        className="text-end text-gray-700 w-25 rounded-xs"
                        type="number"
                        placeholder="R$ 0,00"
                        onChange={(e) => setFrete(Number(e.target.value))}
                      />
                    </td>
                  </tr>
                  <tr className="text-center border-t border-b border-gray-300 bg-gray-100">
                    <td
                      colSpan={7}
                      className="p-2.5 px-4 text-right font-semibold text-gray-700"
                    >
                      Total:
                    </td>
                    <td className="text-start font-bold text-gray-700 pr-6 text-nowrap">
                      {"R$ " + calculateTotal()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GetProductsForm;
