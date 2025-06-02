export interface ProductsInOrderProps {
  id: number;
  nome: string;
  quantidade: number;
  preco: number;
  desconto: number;
  totalValue: number;
  altura: number;
  largura: number;
  comprimento: number;
  unidade: string;
  categoria: string;
  listImages: { imagem: string }[];
  selectedVariation: { id: string; nomeVariacao: string };
}

export interface SellerProps {
  id: number;
  name: string;
}

export interface IClient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface IDeliveryAddress {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  ibge: string;
}

interface IPaymentMethod {
  id: string;
  name: string;
}
export interface DetailsPropostalProps {
  obs: string;
  itemsIncluded: string;
  itemsNotIncluded: string;
  payment: string;
  time: string;
  delivery: number;
  selectedSeller: {
    name: string;
    phone: string;
    email: string;
  };
}
export interface Order {
  logoBase64?: string;
  id: number;
  client: IClient;
  deliveryAddress: IDeliveryAddress;
  billingAddress: IDeliveryAddress;
  products: ProductsInOrderProps[];
  orderId: number;
  codeHiper: string;
  idOrderHiper: string;
  orderStatus: number;
  totalValue: number;
  totalDiscount: number;
  discountTotalValue: number;
  createdAt: string;
  paymentMethod?: IPaymentMethod;
  detailsPropostal: DetailsPropostalProps;
  imagesUrls: string[];
  clientImages: string[];
}
