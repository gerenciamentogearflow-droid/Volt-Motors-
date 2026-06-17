import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, LogOut, Wrench, DollarSign } from "lucide-react";
import { Contract, ServiceReceipt, MaintenanceReminder } from "../types";
import ContractModal from "./ContractModal";
import MaintenanceModal from "./MaintenanceModal";
import FinanceDashboardModal from "./FinanceDashboardModal";

interface OwnerDashboardProps {
  handleLogout: () => void;
  user: { name: string; email: string; branchName?: string; password?: string };
  contracts: Contract[];
  saveContracts: (contracts: Contract[]) => void;
  serviceReceipts: ServiceReceipt[];
  saveServiceReceipts: (services: ServiceReceipt[]) => void;
  maintenanceReminders: MaintenanceReminder[];
  saveMaintenanceReminders: (maintenances: MaintenanceReminder[]) => void;
  contractSequence: number;
  saveContractSequence: (seq: number) => void;
  activeLogo: string;
}

export default function OwnerDashboard({
  handleLogout,
  user,
  contracts,
  saveContracts,
  serviceReceipts,
  saveServiceReceipts,
  maintenanceReminders,
  saveMaintenanceReminders,
  contractSequence,
  saveContractSequence,
  activeLogo
}: OwnerDashboardProps) {
  const [showContract, setShowContract] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [showFinance, setShowFinance] = useState(false);

  // Financial total calculation to show directly on the panel
  const totalSalesRevenue = contracts.reduce((sum, c) => sum + c.valor, 0);
  const totalServicesRevenue = serviceReceipts.reduce((sum, s) => sum + s.valor, 0);
  const grossInflow = totalSalesRevenue + totalServicesRevenue;

  const pendingMaintenances = maintenanceReminders.filter(m => m.status === "pending").length;

  return (
    <motion.div
      key="owner-dashboard"
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-4xl mx-auto m-4 bg-white border border-stone-200/80 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative z-10 text-left"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8 select-none">
        <div>
          <h1 className="text-2xl font-serif text-stone-900 tracking-wide font-extrabold">Painel do Proprietário</h1>
          <p className="text-sm text-stone-500 mt-1 font-sans">
            Proprietário: <span className="font-bold text-amber-600">{user.name}</span>
          </p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-stone-400 hover:text-stone-800 transition-colors mt-1 cursor-pointer">
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-widest">Sair</span>
        </button>
      </div>

      {/* Grid of Interactive Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
        
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
              <h2 className="text-sm font-mono text-stone-900 uppercase tracking-widest font-bold">Emitir Contratos</h2>
              <p className="text-xs text-stone-500 font-light mt-1">Gerar e imprimir novo contrato oficial.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-amber-600 font-extrabold uppercase tracking-widest mt-4">
            {contracts.length} Contratos Registrados
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
              <h2 className="text-sm font-mono text-stone-900 uppercase tracking-widest font-bold">Manutenção</h2>
              <p className="text-xs text-stone-500 font-light mt-1">Configurar alertas e agendamentos.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-amber-600 font-extrabold uppercase tracking-widest mt-4">
            {pendingMaintenances} Alertas Pendentes
          </span>
        </div>

        {/* CARD: FATURAMENTO */}
        <div
          onClick={() => setShowFinance(true)}
          className="bg-stone-50 border border-stone-200/60 rounded-3xl p-6 hover:border-amber-500/40 hover:bg-stone-100/55 transition-all cursor-pointer flex flex-col justify-between min-h-[160px] group shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-700 group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-mono text-stone-900 uppercase tracking-widest font-bold">Faturamento</h2>
              <p className="text-xs text-stone-500 font-light mt-1">Verificar vendas, receitas e fluxo.</p>
            </div>
          </div>
          <span className="text-xs font-mono text-stone-900 font-bold leading-none mt-4 transition-colors group-hover:text-amber-700">
            R$ {grossInflow.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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

        {showFinance && (
          <FinanceDashboardModal
            contracts={contracts}
            serviceReceipts={serviceReceipts}
            onSaveServiceReceipts={saveServiceReceipts}
            currentUser={user}
            onClose={() => setShowFinance(false)}
          />
        )}
      </AnimatePresence>

    </motion.div>
  );
}
