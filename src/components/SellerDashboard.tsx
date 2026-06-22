import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, LogOut, Wrench, Share2 } from "lucide-react";
import { Contract, MaintenanceReminder, User } from "../types";
import ContractModal from "./ContractModal";
import MaintenanceModal from "./MaintenanceModal";
import ShowroomManagementModal from "./ShowroomManagementModal";

interface SellerDashboardProps {
  handleLogout: () => void;
  user: User;
  contracts: Contract[];
  saveContracts: (contracts: Contract[]) => void;
  maintenanceReminders: MaintenanceReminder[];
  saveMaintenanceReminders: (maintenances: MaintenanceReminder[]) => void;
  contractSequence: number;
  saveContractSequence: (seq: number) => void;
  activeLogo: string;
}

export default function SellerDashboard({
  handleLogout,
  user,
  contracts,
  saveContracts,
  maintenanceReminders,
  saveMaintenanceReminders,
  contractSequence,
  saveContractSequence,
  activeLogo
}: SellerDashboardProps) {
  const [showContract, setShowContract] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [showShowroomConfig, setShowShowroomConfig] = useState(false);

  // Stats for the visual counters
  const myContracts = contracts.filter(c => c.sellerEmail === user.email);
  const pendingMaintenances = maintenanceReminders.filter(m => m.status === "pending").length;

  return (
    <motion.div
      key="seller-dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-4xl mx-auto m-4 bg-white border border-stone-200/80 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative z-10 text-left"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8 select-none">
        <div>
          <h1 className="text-2xl font-serif text-stone-900 tracking-wide font-extrabold">Painel do Consultor</h1>
          <p className="text-sm text-stone-500 mt-1 font-sans">
            Consultor: <span className="font-bold text-amber-600">{user.name}</span>
          </p>
        </div>
        <div className="flex flex-col items-end">
          <button onClick={handleLogout} className="flex items-center gap-2 text-stone-400 hover:text-stone-800 transition-colors mt-1 cursor-pointer mb-3">
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-widest">Sair</span>
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const url = `${window.location.origin}?page=showroom`;
                if (navigator.share) {
                  navigator.share({
                    title: 'Showroom Volt Motors',
                    url: url
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(url);
                  alert("Link do Showroom copiado para a área de transferência!");
                }
              }}
              className="px-3 py-1.5 flex items-center gap-1.5 border border-stone-200 rounded text-[10px] font-mono text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer uppercase tracking-wider"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-600" />
              Copiar Link
            </button>
            <button 
              onClick={() => setShowShowroomConfig(true)}
              className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-mono hover:bg-amber-100 transition-colors cursor-pointer uppercase tracking-wider hidden sm:block"
            >
              Editar Showroom
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
        
        {/* CARD: EMITIR CONTRATO DE COMPRA E VENDA */}
        <div
          onClick={() => setShowContract(true)}
          className="bg-stone-50 border border-stone-200/60 rounded-3xl p-6 hover:border-amber-500/40 hover:bg-stone-100/55 transition-all cursor-pointer flex flex-col justify-between min-h-[160px] group shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-700 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-mono text-stone-900 uppercase tracking-widest font-bold">Emitir Contrato de Compra e Venda</h2>
              <p className="text-xs text-stone-500 font-light mt-1">Gerar e imprimir novo contrato oficial.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-amber-600 font-extrabold uppercase tracking-widest mt-4">
            {myContracts.length} Contratos Gerados por Mim
          </span>
        </div>

        {/* CARD: LEMBRETE DE MANUTENÇÃO */}
        <div
          onClick={() => setShowMaintenance(true)}
          className="bg-stone-50 border border-stone-200/60 rounded-3xl p-6 hover:border-amber-500/40 hover:bg-stone-100/55 transition-all cursor-pointer flex flex-col justify-between min-h-[160px] group shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-700 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-mono text-stone-900 uppercase tracking-widest font-bold">Lembrete de Manutenção</h2>
              <p className="text-xs text-stone-500 font-light mt-1">Configurar alertas e agendamentos.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-amber-600 font-extrabold uppercase tracking-widest mt-4">
            {pendingMaintenances} Alertas Pendentes Ativos
          </span>
        </div>

      </div>

      {/* MODAL MOUNTS */}
      <AnimatePresence>
        {showContract && (
          <ContractModal
            contracts={contracts}
            onSaveContract={saveContracts}
            currentUser={user}
            onClose={() => setShowContract(false)}
            contractSequence={contractSequence}
            saveContractSequence={saveContractSequence}
            activeLogo={activeLogo}
            maintenanceReminders={maintenanceReminders}
            onSaveMaintenance={saveMaintenanceReminders}
          />
        )}

        {showMaintenance && (
          <MaintenanceModal
            maintenanceReminders={maintenanceReminders}
            onSaveMaintenance={saveMaintenanceReminders}
            currentUser={user}
            onClose={() => setShowMaintenance(false)}
          />
        )}

        {showShowroomConfig && (
          <ShowroomManagementModal user={user} onClose={() => setShowShowroomConfig(false)} />
        )}
      </AnimatePresence>

    </motion.div>
  );
}
