export interface User {
  email: string;
  password: string;
  name: string;
  branchName: string;
  isDev?: boolean;
  role?: 'owner' | 'seller';
}

export interface Contract {
  id: string;
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  chassi: string;
  acessorios: string;
  nomeCliente: string;
  cpfCliente: string;
  enderecoCliente: string;
  telefoneCliente: string;
  tempoGarantia: string;
  formaPagamento: string;
  dataEntrega: string;
  valor: number;
  date: string;
  sellerName: string;
  sellerEmail: string;
  customHtml?: string;
}

export interface ServiceReceipt {
  id: string;
  descricao: string;
  nomeCliente: string;
  valor: number;
  date: string;
  sellerName: string;
}

export interface MaintenanceReminder {
  id: string;
  cliente: string;
  telefoneCliente?: string;
  modelo: string;
  data: string;
  descricao: string;
  status: 'pending' | 'completed';
  createdAt: string;
}


