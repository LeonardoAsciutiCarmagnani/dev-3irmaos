import { Button } from "@/components/ui/button";
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

interface Product {
  id: string;
  nome: string;
  codigo: string;
  preco?: number;
  unidade: string;
  produtoPrimarioId: string;
}

interface TableItem {
  id: string;
  produto: Product;
  quantidade: number;
  valorUnitario: number;
  descontoUnitario: number;
  subtotal: number;
  unidade: string;
  produtoPrimarioId: string;
}

const GetProductsForm = () => {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [tableItems, settableItems] = useState<TableItem[]>([]);

  const [quantidade, setQuantidade] = useState(1);
  const [valorUnitario, setValorUnitario] = useState(0);
  const [descontoUnitario, setDescontoUnitario] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [tableTotalItems, setTableTotalItems] = useState(0);
  const [frete, setFrete] = useState(0);

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
      const selectedProduct = products.find((p) => p.id === productId);
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
  const addToCart = () => {
    const selectedProduct = products.find((p) => p.id === productId);

    if (!selectedProduct) return;

    const newItem: TableItem = {
      id: selectedProduct.id,
      produto: selectedProduct,
      quantidade,
      valorUnitario,
      descontoUnitario,
      subtotal,
      unidade: selectedProduct.unidade,
      produtoPrimarioId: selectedProduct.produtoPrimarioId,
    };

    settableItems([...tableItems, newItem]);

    // Resetar formulário
    setProductId("");
    setQuantidade(1);
    setValorUnitario(0);
    setDescontoUnitario(0);
    setSubtotal(0);
  };

  const removeTableItem = (itemId: string) => {
    settableItems(tableItems.filter((item) => item.id !== itemId));
  };

  // Formatar valor para moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calculateTotal = () => {
    const total = tableItems
      .reduce((acc, item) => acc + item.subtotal, frete)
      .toFixed(2);
    const totalFormatted = String(total).replace(".", ",");
    return totalFormatted;
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
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
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
                    className="min-w-fit w-full justify-between font-normal text-sm truncate rounded-xs"
                  >
                    {productId
                      ? (() => {
                          const produto = products.find(
                            (p) => p.id === productId
                          );
                          return produto ? produto.nome : "Selecione...";
                        })()
                      : "Selecione..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 md:w-96 2xl:w-[36rem]">
                  <Command>
                    <CommandInput placeholder="Busque pelo nome" />
                    <CommandList>
                      <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                      <CommandGroup>
                        {products
                          .filter(
                            (product) =>
                              product.produtoPrimarioId ===
                              "00000000-0000-0000-0000-000000000000"
                          )
                          .map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.id}
                              onSelect={(currentValue) => {
                                setProductId(
                                  currentValue === productId ? "" : currentValue
                                );
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-red-900",
                                  productId === product.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex items-center gap-x-2">
                                <Badge className="rounded-xs border border-red-900 bg-transparent text-red-900">
                                  {product.codigo}
                                </Badge>
                                <span>{product.nome}</span>
                              </div>
                            </CommandItem>
                          ))}
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
                className="w-full rounded-xs"
              />
            </div>

            {/* Valor Unitário */}
            <div>
              <label className="text-sm text-gray-900 mb-1 block">
                Valor Unitário
              </label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={valorUnitario}
                onChange={(e) => setValorUnitario(Number(e.target.value))}
                className="w-full rounded-xs"
              />
            </div>

            {/* Desconto Unitário */}
            <div>
              <label className="text-sm text-gray-900 mb-1 block">
                Desconto Unitário
              </label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={descontoUnitario}
                onChange={(e) => setDescontoUnitario(Number(e.target.value))}
                className="w-full rounded-xs"
              />
            </div>

            {/* Subtotal */}
            <div>
              <label className="text-sm text-gray-900 mb-1 block">
                Subtotal
              </label>
              <Input
                type="text"
                value={formatCurrency(subtotal)}
                readOnly
                className="w-full bg-gray-50 rounded-xs"
              />
            </div>

            {/* Botão Adicionar */}
            <div>
              <Button
                onClick={addToCart}
                disabled={!productId || quantidade <= 0}
                className="w-[12rem] bg-red-900 hover:bg-red-800 text-white rounded-xs"
              >
                <Plus /> Adicionar
              </Button>
            </div>
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
                  <tbody>
                    {tableItems.length > 0 ? (
                      tableItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-200">
                          <td className="p-2 text-sm text-start text-gray-800">
                            {item.produto.codigo}
                          </td>
                          <td className="p-2 text-sm text-gray-800 text-start">
                            {item.produto.nome}
                          </td>
                          <td className="p-2 text-sm text-gray-800 text-start pl-3">
                            {item.produto.unidade}
                          </td>
                          <td className="p-2 text-sm text-gray-800 text-start pl-4">
                            {item.quantidade}
                          </td>
                          <td className="p-2 text-sm text-gray-800 pl-4 text-start">
                            {formatCurrency(item.valorUnitario)}
                          </td>
                          <td className="p-2 text-sm text-gray-800 pl-4 text-start">
                            {formatCurrency(item.descontoUnitario)}
                          </td>
                          <td className="p-2 text-sm font-medium pl-5 text-gray-800 text-start">
                            {formatCurrency(item.subtotal)}
                          </td>
                          <td className="p-2 text-start pl-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTableItem(item.id)}
                              className="text-gray-500 hover:text-red-900 hover:bg-red-50 "
                            >
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8}>
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
              <table className="w-full table-fixed">
                <tfoot>
                  <tr className="pt-2 border-t border-gray-300">
                    <td colSpan={7} className="p-2 text-right font-base">
                      Quantidade de itens:
                    </td>
                    <td className="p-2 text-right text-gray-700 w-16">
                      {tableTotalItems}
                    </td>
                  </tr>
                  <tr className="flex items-center justify-end w-[172vh] 2xl:w-[174.75vh] mb-3">
                    <td colSpan={7} className="p-2 text-right font-base">
                      Frete:
                    </td>
                    <Input
                      className="text-end text-gray-700 w-25 rounded-xs"
                      type="number"
                      placeholder="R$ 0,00"
                      onChange={(e) => setFrete(Number(e.target.value))}
                    ></Input>
                  </tr>
                  <tr className="text-center border-t border-b border-gray-300">
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
