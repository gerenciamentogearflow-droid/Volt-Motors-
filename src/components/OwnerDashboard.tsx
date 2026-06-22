import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, LogOut, Wrench, DollarSign, Users, Eye, Settings, Briefcase, Award, Share2, AlertCircle } from "lucide-react";
import { Contract, ServiceReceipt, MaintenanceReminder, User } from "../types";
import ContractModal from "./ContractModal";
import MaintenanceModal from "./MaintenanceModal";
import FinanceDashboardModal from "./FinanceDashboardModal";
import UsersManagementModal from "./UsersManagementModal";
import ShowroomManagementModal from "./ShowroomManagementModal";

interface OwnerDashboardProps {
  handleLogout: () => void;
  user: User;
  contracts: Contract[];
  saveContracts: (contracts: Contract[]) => void;
  serviceReceipts: ServiceReceipt[];
  saveServiceReceipts: (services: ServiceReceipt[]) => void;
  maintenanceReminders: MaintenanceReminder[];
  saveMaintenanceReminders: (maintenances: MaintenanceReminder[]) => void;
  contractSequence: number;
  saveContractSequence: (seq: number) => void;
  activeLogo: string;
  users: User[];
  saveUsers: (users: User[]) => void;
  isMaintenanceMode?: boolean;
  toggleMaintenanceMode?: (state: boolean) => void;
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
  activeLogo,
  users,
  saveUsers,
  isMaintenanceMode,
  toggleMaintenanceMode
}: OwnerDashboardProps) {
  const [showContract, setShowContract] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [showFinance, setShowFinance] = useState(false);
  const [showUsersManagement, setShowUsersManagement] = useState(false);
  const [showShowroomConfig, setShowShowroomConfig] = useState(false);

  // Financial calculations
  const totalSalesRevenue = contracts.reduce((sum, c) => sum + c.valor, 0);
  const totalServicesRevenue = serviceReceipts.reduce((sum, s) => sum + s.valor, 0);
  const grossInflow = totalSalesRevenue + totalServicesRevenue;
  const pendingMaintenances = maintenanceReminders.filter(m => m.status === "pending").length;

  return (
    <motion.div
      key="owner-dashboard"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto my-6 bg-black border border-[#2e261a] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative z-10 text-left overflow-hidden"
    >
      {/* Top Header section: White background as requested */}
      <div className="bg-white border-b border-stone-200 p-8 sm:p-10 select-none relative overflow-hidden">
        {/* Gold Border Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Title branding block */}
          <div className="flex items-center gap-4">
            {activeLogo ? (
              <img 
                src={activeLogo} 
                alt="Volt Motors Logo" 
                className="w-14 h-14 object-cover rounded-full border-2 border-[#d4af37] bg-white shadow-md" 
              />
            ) : (
              <div className="w-14 h-14 rounded-full border-2 border-[#d4af37] bg-stone-100 flex items-center justify-center shadow-sm">
                <span className="text-[#d4af37] font-serif font-extrabold text-lg italic">V</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-serif text-stone-900 tracking-wide font-extrabold">
                  Painel do Proprietário
                </h1>
                <Award className="w-5 h-5 text-[#d4af37] animate-pulse" />
              </div>
              <p className="text-xs text-stone-500 mt-1 font-sans tracking-wide uppercase">
                Gerente Geral: <span className="font-extrabold text-[#94721a] bg-[#fbf8f2] px-2.5 py-1 rounded border border-[#eeddbb]">{user.name}</span>
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex gap-2.5 w-full sm:w-auto">
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
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono text-stone-700 hover:text-black hover:bg-stone-50 hover:border-[#d4af37] transition-all cursor-pointer uppercase tracking-wider font-bold shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5 text-[#d4af37]" />
                Link
              </button>
              <button 
                onClick={() => setShowShowroomConfig(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#b59344] to-[#d4af37] text-white rounded-xl text-xs font-mono hover:brightness-105 transition-all cursor-pointer uppercase tracking-wider font-extrabold shadow-[0_2px_12px_rgba(212,175,55,0.2)]"
              >
                <Settings className="w-3.5 h-3.5" />
                Editar
              </button>
              <button 
                onClick={() => toggleMaintenanceMode?.(!isMaintenanceMode)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer uppercase tracking-wider font-extrabold shadow-[0_2px_12px_rgba(0,0,0,0.1)] ${isMaintenanceMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                title={isMaintenanceMode ? "Colocar Site No Ar" : "Tirar Site do Ar"}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {isMaintenanceMode ? "Publicar Site" : "Tirar do Ar"}
              </button>
            </div>

            <button 
              onClick={handleLogout} 
              className="flex items-center justify-center gap-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50/50 transition-all cursor-pointer border border-stone-100 px-3 py-2 rounded-xl w-full sm:w-auto bg-white"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-widest font-bold">Encerrar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Main Content section: Dark background as requested */}
      <div className="p-8 sm:p-10 bg-[#080808] relative overflow-hidden">
        {/* Background radial gold glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.04)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.02)_0%,transparent_70%)] pointer-events-none" />

        {/* Grid of Interactive Modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
        
        {/* CARD: EMITIR CONTRATO */}
        <div
          onClick={() => setShowContract(true)}
          className="bg-[#0f0f0f] border border-[#2e261a] rounded-2.5xl p-6 hover:border-[#d4af37] hover:bg-[#1a1610] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[180px] group shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_30px_rgba(212,175,55,0.06)]"
        >
          <div className="space-y-4">
            <div className="p-3 bg-gradient-to-br from-[#1c1811] to-[#2b2214] rounded-2xl border border-[#4d3f27] text-[#d4af37] w-fit group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-mono text-white uppercase tracking-widest font-bold">Emitir Contratos</h2>
              <p className="text-xs text-stone-400 font-light mt-1.5 leading-relaxed">Gerar, emitir e imprimir contratos de compra e venda oficiais.</p>
            </div>
          </div>
          <div className="pt-4 border-t border-[#221c12] mt-4 flex justify-between items-center">
            <span className="text-[10px] font-mono text-[#d4af37] font-bold uppercase tracking-wider">
              {contracts.length} Emitidos
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </div>
        </div>

        {/* CARD: MANUTENÇÃO */}
        <div
          onClick={() => setShowMaintenance(true)}
          className="bg-[#0f0f0f] border border-[#2e261a] rounded-2.5xl p-6 hover:border-[#d4af37] hover:bg-[#1a1610] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[180px] group shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_30px_rgba(212,175,55,0.06)]"
        >
          <div className="space-y-4">
            <div className="p-3 bg-gradient-to-br from-[#1c1811] to-[#2b2214] rounded-2xl border border-[#4d3f27] text-[#d4af37] w-fit group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-mono text-white uppercase tracking-widest font-bold">Manutenções</h2>
              <p className="text-xs text-stone-400 font-light mt-1.5 leading-relaxed">Configurar e gerenciar revisões técnicas e alertas de frota.</p>
            </div>
          </div>
          <div className="pt-4 border-t border-[#221c12] mt-4 flex justify-between items-center">
            <span className="text-[10px] font-mono text-[#d4af37] font-bold uppercase tracking-wider">
              {pendingMaintenances} Pendentes
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${pendingMaintenances > 0 ? "bg-[#d4af37] shadow-[0_0_8px_#d4af37]" : "bg-[#25d366]"}`} />
          </div>
        </div>

        {/* CARD: FATURAMENTO */}
        <div
          onClick={() => setShowFinance(true)}
          className="bg-[#0f0f0f] border border-[#2e261a] rounded-2.5xl p-6 hover:border-[#d4af37] hover:bg-[#1a1610] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[180px] group shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_30px_rgba(212,175,55,0.06)]"
        >
          <div className="space-y-4">
            <div className="p-3 bg-gradient-to-br from-[#1c1811] to-[#2b2214] rounded-2xl border border-[#4d3f27] text-[#d4af37] w-fit group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-mono text-white uppercase tracking-widest font-bold">Faturamento</h2>
              <p className="text-xs text-stone-400 font-light mt-1.5 leading-relaxed">Relatório financeiro, balanço geral e faturamento de vendas.</p>
            </div>
          </div>
          <div className="pt-4 border-t border-[#221c12] mt-4 flex items-center justify-between">
            <span className="text-xs font-mono font-extrabold text-white leading-none">
              {grossInflow.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </div>
        </div>

        {/* CARD: ACESSOS */}
        <div
          onClick={() => setShowUsersManagement(true)}
          className="bg-[#0f0f0f] border border-[#2e261a] rounded-2.5xl p-6 hover:border-[#d4af37] hover:bg-[#1a1610] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[180px] group shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_30px_rgba(212,175,55,0.06)]"
        >
          <div className="space-y-4">
            <div className="p-3 bg-gradient-to-br from-[#1c1811] to-[#2b2214] rounded-2xl border border-[#4d3f27] text-[#d4af37] w-fit group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-mono text-white uppercase tracking-widest font-bold">Acessos</h2>
              <p className="text-xs text-stone-400 font-light mt-1.5 leading-relaxed">Administração de usuários, permissões de equipe e chaves de acesso.</p>
            </div>
          </div>
          <div className="pt-4 border-t border-[#221c12] mt-4 flex justify-between items-center">
            <span className="text-[10px] font-mono text-[#d4af37] font-bold uppercase tracking-wider">
              {users.filter(u => u.name !== "Consultor de Vendas Volt" && u.name !== "Elite Developer").length} Usuários
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          </div>
        </div>

      </div>

      {/* Footer Branding Text */}
      <div className="mt-10 pt-6 border-t border-[#1a1610] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-[10px] font-mono text-stone-500 uppercase tracking-[0.2em]">
          Volt Motors S.A. • Protocolo de Gerenciamento
        </span>
        <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-widest font-semibold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] inline-block animate-ping" /> Connection Authenticated
        </span>
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

        {showUsersManagement && (
          <UsersManagementModal
            onClose={() => setShowUsersManagement(false)}
            users={users}
            saveUsers={saveUsers}
          />
        )}

        {showShowroomConfig && (
          <ShowroomManagementModal user={user} onClose={() => setShowShowroomConfig(false)} />
        )}
      </AnimatePresence>

      </div>
    </motion.div>
  );
}
