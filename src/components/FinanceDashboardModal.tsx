import React, { useState } from "react";
import { X, TrendingUp, DollarSign, Wrench, Calendar, Search, PlusCircle, Filter, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Contract, ServiceReceipt } from "../types";

interface FinanceDashboardModalProps {
  onClose: () => void;
  contracts: Contract[];
  serviceReceipts: ServiceReceipt[];
  onSaveServiceReceipts: (services: ServiceReceipt[]) => void;
  currentUser: { name: string };
}

export default function FinanceDashboardModal({
  onClose,
  contracts,
  serviceReceipts,
  onSaveServiceReceipts,
  currentUser
}: FinanceDashboardModalProps) {
  const [showAddService, setShowAddService] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "sales" | "services">("all");

  // Form states under service insertion
  const [cliente, setCliente] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState<number>(0);
  const [data, setData] = useState("");

  const handleRegisterService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || !descricao || valor <= 0 || !data) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    const newService: ServiceReceipt = {
      id: "SVC-" + Math.floor(Math.random() * 90000 + 10000),
      descricao,
      nomeCliente: cliente,
      valor,
      date: new Date(data + 'T00:00:00').toLocaleDateString("pt-BR"),
      sellerName: currentUser.name
    };

    onSaveServiceReceipts([newService, ...serviceReceipts]);
    setCliente("");
    setDescricao("");
    setValor(0);
    setData("");
    setShowAddService(false);
  };

  // Consolidate cash inflow streams
  const consolidatedInflows = [
    ...contracts.map(c => ({
      id: c.id,
      tipo: "venda" as const,
      origem: "Venda - " + c.modelo,
      cliente: c.nomeCliente,
      valor: c.valor,
      date: c.date,
      responsavel: c.sellerName
    })),
    ...serviceReceipts.map(s => ({
      id: s.id,
      tipo: "servico" as const,
      origem: s.descricao,
      cliente: s.nomeCliente,
      valor: s.valor,
      date: s.date,
      responsavel: s.sellerName
    }))
  ];

  // Parse days for sorting: DD/MM/YYYY to timestamp
  const parseDateToTimestamp = (dateStr: string) => {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
    }
    return 0;
  };

  // Sort by date descending
  consolidatedInflows.sort((a, b) => parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date));

  // Totals calculations
  const totalSalesRevenue = contracts.reduce((sum, c) => sum + c.valor, 0);
  const totalServicesRevenue = serviceReceipts.reduce((sum, s) => sum + s.valor, 0);
  const grossRevenue = totalSalesRevenue + totalServicesRevenue;

  // Filter & Search application
  const filteredInflows = consolidatedInflows.filter(item => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "sales" && item.tipo === "venda") ||
      (activeFilter === "services" && item.tipo === "servico");

    const matchesSearch =
      item.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full bg-white flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-stone-200 select-none shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif text-stone-900 font-bold">Relatório de Faturamento</h2>
              <p className="text-xs text-stone-500 font-mono font-bold">CONTROLE FINANCEIRO & RECEITA DA LOJA</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contents */}
        <div className="overflow-y-auto flex-grow p-6 sm:p-8 space-y-6">
          
          {/* Main Financial KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 select-none">
            
            <div className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border border-amber-200 p-6 rounded-2xl relative overflow-hidden shadow-sm">
              <span className="block text-[10px] font-mono text-amber-800 uppercase tracking-widest font-bold mb-1">Faturamento Total</span>
              <span className="text-3xl font-serif text-stone-900 font-bold">R$ {grossRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              <TrendingUp className="w-12 h-12 text-amber-600/20 absolute right-4 bottom-4" />
            </div>

            <div className="bg-stone-50 border border-stone-200 p-6 rounded-2xl relative shadow-sm">
              <span className="block text-[10px] font-mono text-stone-500 uppercase tracking-widest font-bold mb-1">Total em Vendas (Veículos)</span>
              <span className="text-xl font-serif text-stone-900 font-bold block">R$ {totalSalesRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              <span className="text-[10px] font-mono text-stone-500 mt-1 block font-semibold">{contracts.length} Contrato(s) gerado(s)</span>
              <FileText className="w-8 h-8 text-stone-900/5 absolute right-4 top-4" />
            </div>

            <div className="bg-stone-50 border border-stone-200 p-6 rounded-2xl relative shadow-sm">
              <span className="block text-[10px] font-mono text-stone-500 uppercase tracking-widest font-bold mb-1">Serviços e Outras Entradas</span>
              <span className="text-xl font-serif text-stone-900 font-bold block">R$ {totalServicesRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              <span className="text-[10px] font-mono text-stone-500 mt-1 block font-semibold">{serviceReceipts.length} Serviço(s) prestado(s)</span>
              <Wrench className="w-8 h-8 text-stone-900/5 absolute right-4 top-4" />
            </div>

          </div>

          {/* Service cash-in registration block */}
          <div>
            <div className="flex justify-between items-center mb-4 select-none">
              <h3 className="text-xs font-mono text-stone-950 uppercase tracking-widest font-bold">Caixa da Loja</h3>
              
              {!showAddService && (
                <button
                  type="button"
                  onClick={() => setShowAddService(true)}
                  className="flex items-center gap-2 py-2 px-4 bg-stone-950 hover:bg-stone-900 text-white rounded-xl text-xs font-mono tracking-wider uppercase font-bold transition-all cursor-pointer shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" /> Registrar Entrada de Serviço
                </button>
              )}
            </div>

            {/* Collapsible service form */}
            <AnimatePresence>
              {showAddService && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleRegisterService}
                  className="bg-stone-50 border border-stone-200 p-6 rounded-2xl space-y-4 mb-6 overflow-hidden text-left"
                >
                  <h4 className="text-xs font-mono text-stone-900 uppercase tracking-widest font-bold border-b border-stone-200 pb-2 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" /> Adicionar Receita de Serviço Realizado
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-stone-600 uppercase tracking-wider ml-1 font-semibold">Nome do Cliente *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Roberto Mendes de Mattos"
                        value={cliente}
                        onChange={(e) => setCliente(e.target.value)}
                        className="w-full bg-white text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-stone-600 uppercase tracking-wider ml-1 font-semibold">Descrição do Serviço / Venda *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Revisão Geral Bateria Pearl"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        className="w-full bg-white text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-stone-600 uppercase tracking-wider ml-1 font-semibold">Valor do Serviço (R$) *</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={valor || ""}
                        onChange={(e) => setValor(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-white text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm outline-none transition-all font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-stone-600 uppercase tracking-wider ml-1 flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" /> Data do Recebimento *
                      </label>
                      <input
                        type="date"
                        required
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        className="w-full bg-white text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddService(false)}
                      className="py-2.5 px-4 text-stone-500 hover:text-stone-800 text-xs font-mono uppercase tracking-wider font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="py-2.5 px-6 bg-stone-950 hover:bg-stone-900 text-white rounded-xl text-xs font-mono tracking-wider uppercase font-bold transition-all"
                    >
                      Registrar Entrada
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Consolidated Cash-Inflow timeline ledgers */}
            <div className="space-y-4 text-left">
              
              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="relative w-full sm:max-w-xs block">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar cliente, modelo, desc..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white text-stone-900 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 font-mono text-[11px]">
                  <Filter className="w-3.5 h-3.5 text-stone-400 mr-1" />
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={`px-3 py-1.5 rounded-lg border transition-all font-semibold ${activeFilter === 'all' ? 'bg-stone-950 border-stone-950 text-white' : 'border-stone-200 bg-white text-stone-500 hover:text-stone-800'}`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setActiveFilter("sales")}
                    className={`px-3 py-1.5 rounded-lg border transition-all font-semibold ${activeFilter === 'sales' ? 'bg-stone-950 border-stone-950 text-white' : 'border-stone-200 bg-white text-stone-500 hover:text-stone-800'}`}
                  >
                    Vendas
                  </button>
                  <button
                    onClick={() => setActiveFilter("services")}
                    className={`px-3 py-1.5 rounded-lg border transition-all font-semibold ${activeFilter === 'services' ? 'bg-stone-950 border-stone-950 text-white' : 'border-stone-200 bg-white text-stone-500 hover:text-stone-800'}`}
                  >
                    Serviços
                  </button>
                </div>
              </div>

              {/* Transactions list */}
              <div className="space-y-3">
                {filteredInflows.length === 0 ? (
                  <div className="text-center py-12 border border-stone-250 rounded-3xl border-dashed">
                    <DollarSign className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                    <p className="text-sm text-stone-500 font-light">Nenhuma transação financeira localizada.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredInflows.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white border border-stone-200 rounded-2xl flex items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Financial indicator icon */}
                          <div className={`p-2.5 rounded-xl border shrink-0 ${item.tipo === 'venda' ? 'bg-amber-100 border-amber-200 text-amber-800' : 'bg-green-100 border-green-200 text-green-800'}`}>
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <div className="truncate space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2 select-none">
                              <span className="text-[10px] font-mono text-stone-400">{item.id}</span>
                              <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase rounded ${item.tipo === 'venda' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                                {item.tipo === 'venda' ? 'Contrato de Venda' : 'Serviço'}
                              </span>
                            </div>
                            <h4 className="text-sm font-serif font-bold text-stone-900 truncate">{item.cliente}</h4>
                            <p className="text-xs text-stone-500 font-light truncate">{item.origem}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 space-y-1">
                          <span className={`text-sm font-sans font-bold ${item.tipo === 'venda' ? 'text-amber-800' : 'text-green-800'}`}>
                            + R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                          <div className="text-[10px] font-sans text-stone-500 flex items-center gap-1 justify-end font-semibold">
                            <Calendar className="w-3 h-3" /> {item.date}
                          </div>
                          <p className="text-[9px] font-sans text-stone-400 block font-semibold">Resp: {item.responsavel}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
