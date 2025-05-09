export type Client = {
  Id: string;
  address: {
    cep: string;
    city: string;
    ibge: string;
    neighborhood: string;
    number: number;
    state: string;
    street: string;
  };
  createdAt: string;
  document: string;
  email: string;
  fantasyName: string;
  ie: string;
  name: string;
  password: string;
  phone: string;
  updatedAt: string;
};
