import React, { useState } from "react";
import { X, Calendar, Wrench, CheckCircle, Clock, Plus, Trash2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MaintenanceReminder } from "../types";

interface MaintenanceModalProps {
  onClose: () => void;
  maintenanceReminders: MaintenanceReminder[];
  onSaveMaintenance: (maintenances: MaintenanceReminder[]) => void;
  currentUser: { name: string };
}

export default function MaintenanceModal({ onClose, maintenanceReminders, onSaveMaintenance, currentUser }: MaintenanceModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [cliente, setCliente] = useState("");
  const [modelo, setModelo] = useState("");
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("Revisão de Fábrica Geral - 1.000 km");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || !modelo || !data || !descricao) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const newItem: MaintenanceReminder = {
      id: "MNT-" + Math.floor(Math.random() * 90000 + 10000),
      cliente,
      modelo,
      data,
      descricao,
      status: "pending",
      createdAt: new Date().toLocaleDateString("pt-BR")
    };

    onSaveMaintenance([newItem, ...maintenanceReminders]);
    setCliente("");
    setModelo("");
    setData("");
    setDescricao("Revisão de Fábrica Geral - 1.000 km");
    setShowAddForm(false);
  };

  const toggleStatus = (id: string) => {
    const updated = maintenanceReminders.map(item => {
      if (item.id === id) {
        return { ...item, status: item.status === "pending" ? "completed" as const : "pending" as const };
      }
      return item;
    });
    onSaveMaintenance(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Deseja realmente remover este lembrete de manutenção?")) {
      onSaveMaintenance(maintenanceReminders.filter(item => item.id !== id));
    }
  };

  // Metrics
  const pendingCount = maintenanceReminders.filter(m => m.status === "pending").length;
  const completedCount = maintenanceReminders.filter(m => m.status === "completed").length;
  const totalCount = maintenanceReminders.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif text-stone-900 font-bold">Lembretes de Manutenção</h2>
              <p className="text-xs text-stone-500 font-mono font-bold">AGENDAMENTOS & REVISÕES DO CLIENTE</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-grow p-6 sm:p-8 space-y-6">
          
          {/* Dashboard Summary Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 select-none">
            
            <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider font-bold">Pendentes</span>
                <span className="text-2xl font-serif text-amber-600 font-bold">{pendingCount}</span>
              </div>
              <Clock className="w-8 h-8 text-amber-600/20" />
            </div>

            <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider font-bold">Finalizadas</span>
                <span className="text-2xl font-serif text-green-600 font-bold">{completedCount}</span>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600/20" />
            </div>

            <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider font-bold">Meta Conclusão</span>
                <span className="text-xs font-mono text-stone-700 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

          </div>

          {/* Quick Add Form Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center select-none">
              <h3 className="text-sm font-mono text-stone-900 uppercase tracking-widest font-bold">Lista de Agendamentos</h3>
              
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 py-2 px-4 bg-stone-950 hover:bg-stone-900 text-white rounded-xl text-xs font-mono tracking-wider uppercase font-bold transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Novo Agendamento
                </button>
              )}
            </div>

            {/* Collapsible scheduling form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSubmit}
                  className="bg-stone-50 border border-stone-200 p-6 rounded-2xl space-y-4 overflow-hidden"
                >
                  <h4 className="text-xs font-mono text-stone-900 uppercase tracking-widest font-bold border-b border-stone-200 pb-2 flex items-center gap-1">
                     <Wrench className="w-3.5 h-3.5" /> Registrar Ordem de Manutenção
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-stone-600 uppercase tracking-wider ml-1 font-semibold">Nome do Cliente *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Carlos Augusto Silveira"
                        value={cliente}
                        onChange={(e) => setCliente(e.target.value)}
                        className="w-full bg-white text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-stone-600 uppercase tracking-wider ml-1 font-semibold">Modelo Moto Elétrica *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Volt Pearl Roadster N° 07"
                        value={modelo}
                        onChange={(e) => setModelo(e.target.value)}
                        className="w-full bg-white text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-stone-600 uppercase tracking-wider ml-1 font-semibold">Tipo de Serviço / Revisão *</label>
                      <select
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        className="w-full bg-white text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      >
                        <option value="Revisão de Fábrica Geral - 1.000 km">Revisão de Fábrica Geral - 1.000 km</option>
                        <option value="Revisão de Fábrica Periódica - 5.000 km">Revisão de Fábrica Periódica - 5.000 km</option>
                        <option value="Manutenção Corretiva / Pastilhas">Manutenção Corretiva / Pastilhas</option>
                        <option value="Check-up Eletrônico e Calibração">Check-up Eletrônico e Calibração</option>
                        <option value="Instalação Especial de Acessórios Gold">Instalação Especial de Acessórios Gold</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-stone-600 uppercase tracking-wider ml-1 flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" /> Data do Alerta / Agendamento *
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
                      onClick={() => setShowAddForm(false)}
                      className="py-2.5 px-4 text-stone-500 hover:text-stone-800 text-xs font-mono uppercase tracking-wider font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="py-2.5 px-6 bg-stone-950 hover:bg-stone-900 text-white rounded-xl text-xs font-mono tracking-wider uppercase font-bold transition-all"
                    >
                      Agendar
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* List entries */}
            <div className="space-y-3">
              {maintenanceReminders.length === 0 ? (
                <div className="text-center py-12 border border-stone-200 rounded-3xl border-dashed select-none">
                  <Wrench className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <p className="text-sm text-stone-500 font-light">Nenhuma manutenção pendente ou agendada.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {maintenanceReminders.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${item.status === 'completed' ? 'bg-stone-50 border-stone-150 opacity-60' : 'bg-white border-stone-200 hover:border-amber-500/30 shadow-sm'}`}
                    >
                      <div className="flex gap-4 items-start">
                        <button
                          type="button"
                          onClick={() => toggleStatus(item.id)}
                          className={`mt-1 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${item.status === "completed" ? "bg-green-600 border-green-600 text-white" : "border-amber-500/50 hover:bg-amber-50 text-transparent"}`}
                        >
                          ✓
                        </button>
                        
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 select-none">
                            <span className="text-[10px] font-mono text-stone-400">{item.id}</span>
                            <span className={`px-2 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase rounded ${item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800 animate-pulse'}`}>
                              {item.status === 'completed' ? 'Realizado' : 'Aguardando'}
                            </span>
                          </div>
                          
                          <h4 className={`text-sm font-serif font-bold text-stone-900 ${item.status === 'completed' ? 'line-through text-stone-400' : ''}`}>
                            {item.cliente} <span className="text-stone-500 font-sans font-light text-xs">({item.modelo})</span>
                          </h4>
                          
                          <p className={`text-xs ${item.status === 'completed' ? 'text-stone-400' : 'text-stone-600'} font-light`}>
                            {item.descricao}
                          </p>

                          <div className="text-[10px] font-mono text-stone-500 flex items-center gap-1.5 pt-1">
                            <Calendar className="w-3 h-3 text-amber-600" /> 
                            Agendado para: <span className="text-stone-800 font-semibold">{new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col justify-between items-end gap-2 text-right shrink-0">
                        <span className="text-[10px] font-mono text-stone-400 sm:block hidden">Cadastrado: {item.createdAt}</span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-xl transition-all self-end"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
