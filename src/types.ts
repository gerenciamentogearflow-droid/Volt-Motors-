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

export interface ShowroomMotorcycle {
  id: string;
  name: string;
  brand: string;
  price: number;
  year: number;
  mileage?: number;
  description?: string;
  range?: string;
  installments?: string;
  fuel?: string;
  power?: string;
  speed?: string;
  batteryType?: string;
  color?: string; // Main backward compability color (could be the first variant)
  photoBase64?: string; // Main backward compability photo
  gallery?: string[]; // Main backward compatibility gallery
  variants?: { colorName: string, colorHex?: string, photoBase64: string, gallery: string[] }[];
  status: 'available' | 'sold';
  createdAt: number;
  order?: number;
}


