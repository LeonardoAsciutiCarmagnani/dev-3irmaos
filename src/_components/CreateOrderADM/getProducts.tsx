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
import { Check, Plus, Trash2 } from "lucide-react";
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
}

interface CartItem {
  id: string;
  produto: Product;
  quantidade: number;
  valorUnitario: number;
  descontoUnitario: number;
  subtotal: number;
}

const GetProductsForm = () => {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [tableItems, settableItems] = useState<CartItem[]>([]);

  const [quantidade, setQuantidade] = useState(1);
  const [valorUnitario, setValorUnitario] = useState(0);
  const [descontoUnitario, setDescontoUnitario] = useState(0);
  const [subtotal, setSubtotal] = useState(0);

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
  }, [quantidade, valorUnitario, descontoUnitario]);

  // Adicionar item ao carrinho
  const addToCart = () => {
    const selectedProduct = products.find((p) => p.id === productId);

    if (!selectedProduct) return;

    const newItem: CartItem = {
      id: selectedProduct.id,
      produto: selectedProduct,
      quantidade,
      valorUnitario,
      descontoUnitario,
      subtotal,
    };

    settableItems([...tableItems, newItem]);

    // Resetar formulário
    setProductId("");
    setQuantidade(1);
    setValorUnitario(0);
    setDescontoUnitario(0);
    setSubtotal(0);
  };

  const removeCartItem = (itemId: string) => {
    settableItems(tableItems.filter((item) => item.id !== itemId));
  };

  // Formatar valor para moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-4 p-4 bg-white rounded-xs w-[175vh]">
          <h2 className="text-xl font-semibold text-red-900">
            Adicionar Produtos
          </h2>

          {/* Formulário de seleção e dados do produto */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
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
                    className="w-full justify-between font-normal text-base rounded-xs"
                  >
                    {productId
                      ? (() => {
                          const produto = products.find(
                            (p) => p.id === productId
                          );
                          return produto ? `${produto.nome}` : "Selecione...";
                        })()
                      : "Selecione..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 md:w-96">
                  <Command>
                    <CommandInput placeholder="Busque pelo nome ou código" />
                    <CommandList>
                      <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                      <CommandGroup>
                        {products.map((product) => (
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

            <div>
              <label className="text-sm text-gray-900 mb-1 block">
                Quantidade
              </label>
              <Input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                className="w-full rounded-xs"
              />
            </div>

            <div>
              <label className="text-sm text-gray-900 mb-1 block">
                Valor Unitário
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={valorUnitario}
                onChange={(e) => setValorUnitario(Number(e.target.value))}
                className="w-full rounded-xs"
              />
            </div>

            <div>
              <label className="text-sm text-gray-900 mb-1 block">
                Desconto Unit.
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={descontoUnitario}
                onChange={(e) => setDescontoUnitario(Number(e.target.value))}
                className="w-full rounded-xs"
              />
            </div>

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

            <div>
              <Button
                onClick={addToCart}
                disabled={!productId || quantidade <= 0}
                className="w-full bg-red-900 hover:bg-red-800 text-white rounded-xs"
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </div>
          </div>

          {/* Tabela de produtos */}
          {tableItems.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-red-900 mb-2">
                Itens Adicionados
              </h3>
              <div className="max-h-[20rem] overflow-y-auto border border-gray-200 rounded-xs">
                <table className="w-full border-collapse max-h-[10rem]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left text-sm font-medium text-gray-900">
                        Código
                      </th>
                      <th className="p-2 text-left text-sm font-medium text-gray-900">
                        Produto
                      </th>
                      <th className="p-2 text-center text-sm font-medium text-gray-900">
                        Qtd
                      </th>
                      <th className="p-2 text-right text-sm font-medium text-gray-900">
                        Valor Unit.
                      </th>
                      <th className="p-2 text-right text-sm font-medium text-gray-900">
                        Desconto
                      </th>
                      <th className="p-2 text-right text-sm font-medium text-gray-900">
                        Subtotal
                      </th>
                      <th className="p-2 text-center text-sm font-medium text-gray-900">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {tableItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-200">
                        <td className="p-2 text-sm text-gray-800">
                          {item.produto.codigo}
                        </td>
                        <td className="p-2 text-sm text-gray-800">
                          {item.produto.nome}
                        </td>
                        <td className="p-2 text-sm text-center text-gray-800">
                          {item.quantidade}
                        </td>
                        <td className="p-2 text-sm text-right text-gray-800">
                          {formatCurrency(item.valorUnitario)}
                        </td>
                        <td className="p-2 text-sm text-right text-gray-800">
                          {formatCurrency(item.descontoUnitario)}
                        </td>
                        <td className="p-2 text-sm text-right font-medium text-gray-800">
                          {formatCurrency(item.subtotal)}
                        </td>
                        <td className="p-2 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCartItem(item.id)}
                            className="text-gray-500 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="p-2 text-right font-medium">
                        Total:
                      </td>
                      <td className="p-2 text-right font-bold text-red-900">
                        {formatCurrency(
                          tableItems.reduce(
                            (sum, item) => sum + item.subtotal,
                            0
                          )
                        )}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default GetProductsForm;
