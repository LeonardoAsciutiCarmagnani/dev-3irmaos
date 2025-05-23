export interface Product {
  quantidade?: number;
  selectedVariation: {
    id: string;
    nomeVariacao: string;
  };
  pontoDeSincronizacao: number;
  altura: number;
  ativo: boolean;
  categoria: string;
  codigo: number;
  codigoDeBarras: string;
  comprimento: number;
  descricao: string;
  grade: boolean;
  id: string;
  imagem: string;
  imagensAdicionais: [
    {
      imagem: string;
    }
  ];
  largura: number;
  marca: string;
  nome: string;
  peso: number;
  preco: number;
  produtoPrimarioId: string;
  quantidadeEmEstoque: number;
  quantidadeMinimaEmEstoque: number;
  unidade: string;
  variacao?: {
    codigo: number;
    codigoDeBarras: string;
    id: string;
    nomeVariacaoA: string;
    nomeVariacaoB: string | null;
    quantidadeEmEstoque: number;
    quantidadeEmEstoqueReservado: number;
    quantidadeMinimaEmEstoque: number;
    tipoVariacaoA: string | null;
    tipoVariacaoB: string | null;
  }[];
  removido: boolean;
}

export interface ProductInCart {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
}
