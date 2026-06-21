import React, { useState, ChangeEvent } from "react";
import { LogOut, UserPlus, Trash2, Users, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";
import { setDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

interface DevDashboardProps {
  handleLogout: () => void;
  users: User[];
  saveUsers: (users: User[]) => void;
  onResetSales: () => void;
  isMaintenanceMode?: boolean;
  toggleMaintenanceMode?: (state: boolean) => void;
}

export default function DevDashboard({ 
  handleLogout, 
  users, 
  saveUsers,
  onResetSales,
  isMaintenanceMode = false,
  toggleMaintenanceMode
}: DevDashboardProps) {
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<'owner' | 'seller'>('seller');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUsersList, setShowUsersList] = useState(false);
  const [showLogoForm, setShowLogoForm] = useState(false);
  
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deletePassword, setDeletePassword] = useState("");

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          await setDoc(doc(db, "settings", "logo"), { url: base64String });
          alert("Logotipo atualizado com sucesso para todos os usuários!");
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, "settings/logo");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    saveUsers([...users, { name: newUserName, email: newUserEmail, password: newUserPassword.trim(), branchName: "Central", isDev: false, role: newUserRole }]);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserRole('seller');
    setShowAddForm(false);
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    if (deletePassword.trim() !== userToDelete.password.trim()) {
      alert("Senha incorreta.");
      return;
    }
    // Filter using unique property (email)
    saveUsers(users.filter(u => u.email !== userToDelete.email));
    setUserToDelete(null);
    setDeletePassword("");
  };

  return (
    <motion.div
      key="dev-dashboard"
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-5xl mx-auto m-4 bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-lg relative z-10 text-left"
    >
        {/* Header Área Dev */}
        <div className="flex flex-col gap-4 pb-4 border-b border-stone-200 mb-6 select-none">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-800 border border-amber-500/20 rounded-full text-[10px] font-mono tracking-[0.2em] uppercase font-bold">
                Admin • Dev.556
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            </div>
            <h1 className="text-2xl font-serif text-stone-900 tracking-wide font-bold">
              Dev <span className="italic font-normal text-amber-600">Volt Motors</span>
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-5 py-4 bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 font-bold text-sm rounded-2xl transition-all border border-stone-200 flex items-center justify-center gap-3 uppercase tracking-widest cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Desconectar</span>
          </button>
        </div>

        {/* --- GERENCIAMENTO DE CONSULTORES (Folders) --- */}
        <div className="space-y-4">
          
          {/* FOLDER: ADICIONAR CONSULTOR */}
          <div className="bg-stone-50 border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
            <button
              onClick={() => { setShowAddForm(!showAddForm); }}
              className="w-full p-6 flex items-center justify-between hover:bg-stone-100 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-700">
                    <UserPlus className="w-5 h-5" />
                </div>
                <div>
                   <h2 className="text-sm font-mono text-stone-900 uppercase tracking-widest font-bold">Adicionar Consultor</h2>
                   <p className="text-xs text-stone-500 font-semibold mt-1">Gerenciar novos cadastros.</p>
                </div>
              </div>
              <div className="text-stone-400 font-bold">{showAddForm ? '▼' : '▶'}</div>
            </button>
            {showAddForm && (
              <div className="p-5 pt-0 border-t border-stone-200/80 animate-in fade-in slide-in-from-top-2 duration-200">
                <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-stone-500 uppercase ml-1 font-bold">Nome</label>
                    <input type="text" required placeholder="Nome do usuário" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="w-full bg-white text-stone-900 border border-stone-200 rounded-2xl px-4 py-4 text-sm focus:border-amber-500/50 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-stone-500 uppercase ml-1 font-bold">Login</label>
                    <input type="text" required placeholder="Nome de login" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full bg-white text-stone-900 border border-stone-200 rounded-2xl px-4 py-4 text-sm focus:border-amber-500/50 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                     <label className="block text-[10px] font-mono text-stone-500 uppercase ml-1 font-bold">Senha</label>
                     <input type="password" required placeholder="••••••••" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} className="w-full bg-white text-stone-900 border border-stone-200 rounded-2xl px-4 py-4 text-sm focus:border-amber-500/50 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-stone-500 uppercase ml-1 font-bold">Cargo</label>
                    <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewUserRole('seller')}
                          className={`flex-1 py-4 text-xs font-mono uppercase tracking-widest rounded-2xl border transition-all font-bold ${newUserRole === 'seller' ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-200 text-stone-500'}`}
                        >
                          Consultor
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewUserRole('owner')}
                          className={`flex-1 py-4 text-xs font-mono uppercase tracking-widest rounded-2xl border transition-all font-bold ${newUserRole === 'owner' ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-200 text-stone-500'}`}
                        >
                          Proprietário
                        </button>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-stone-950 hover:bg-stone-900 text-white font-bold text-sm uppercase tracking-widest rounded-2xl shadow-sm transition-all">Cadastrar</button>
                </form>
              </div>
            )}
          </div>

          {/* FOLDER: USUÁRIOS ATIVOS */}
          <div className="bg-stone-50 border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
            <button
               onClick={() => setShowUsersList(!showUsersList)}
               className="w-full p-6 flex items-center justify-between hover:bg-stone-100 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-stone-500/10 rounded-full border border-stone-500/20 text-stone-700">
                    <Users className="w-5 h-5" />
                 </div>
                 <div>
                    <h2 className="text-sm font-mono text-stone-900 uppercase tracking-widest font-bold">Usuários Ativos</h2>
                    <p className="text-xs text-stone-500 font-semibold mt-1">
                        {users.filter(u => u.name !== "Consultor de Vendas Volt" && u.name !== "Elite Developer").length} usuários registrados.
                    </p>
                 </div>
              </div>
              <div className="text-stone-400 font-bold">{showUsersList ? '▼' : '▶'}</div>
            </button>
            {showUsersList && (
              <div className="p-5 pt-0 border-t border-stone-200/80 animate-in fade-in slide-in-from-top-2 duration-200">
                {users.length === 0 ? (
                  <div className="text-center p-6 mt-4 border border-stone-200 rounded-3xl border-dashed">
                      <p className="text-sm text-stone-500 font-light">Nenhum usuário registrado.</p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-4">
                      {users.filter(u => u.name !== "Consultor de Vendas Volt" && u.name !== "Elite Developer").map((user, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-stone-200 rounded-2xl gap-4 shadow-sm">
                              <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                      <span className="text-sm text-stone-900 font-bold">{user.name}</span>
                                      <span className={`px-2 py-0.5 text-[9px] font-mono rounded border uppercase font-bold ${user.role === 'owner' ? 'bg-amber-100 border-amber-200 text-amber-800' : 'bg-stone-100 border-stone-200 text-stone-600'}`}>
                                          {user.role === 'owner' ? 'Proprietário' : 'Consultor'}
                                      </span>
                                  </div>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500 font-mono font-medium">
                                      <span>Login: <strong className="text-stone-800 font-semibold">{user.email}</strong></span>
                                      <span>Senha: <strong className="text-stone-800 font-semibold">{user.password}</strong></span>
                                  </div>
                              </div>
                              <button 
                                  onClick={() => setUserToDelete(user)}
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all self-end sm:self-auto shrink-0 border border-transparent hover:border-red-200"
                              >
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FOLDER: CONFIGURAÇÕES DA MARCA */}
          <div className="bg-stone-50 border border-stone-200 rounded-3xl overflow-hidden shadow-sm mt-4">
            <button
               onClick={() => setShowLogoForm(!showLogoForm)}
               className="w-full p-6 flex items-center justify-between hover:bg-stone-100 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-stone-900 rounded-full border border-stone-950 text-white">
                    <ImageIcon className="w-5 h-5" />
                 </div>
                 <div>
                    <h2 className="text-sm font-mono text-stone-900 uppercase tracking-widest font-bold">Alterar Logotipo da Empresa</h2>
                    <p className="text-xs text-stone-500 font-semibold mt-1">Carregar logotipo. Salva e sincroniza em todos os dispositivos.</p>
                 </div>
              </div>
              <div className="text-stone-400 font-bold">{showLogoForm ? '▼' : '▶'}</div>
            </button>
            {showLogoForm && (
              <div className="p-5 pt-0 border-t border-stone-200/80 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="pt-4 space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-stone-500 uppercase ml-1 font-bold">Upload de nova logotipo (Máx 2MB)</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload} 
                      className="w-full bg-white text-stone-900 border border-stone-200 rounded-2xl px-4 py-4 text-sm focus:border-stone-500/50 outline-none transition-all cursor-pointer file:cursor-pointer file:bg-stone-900 file:text-white file:border-0 file:rounded-xl file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-widest file:mr-4 hover:file:bg-stone-800"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOLDER: CONFIGURAÇÕES DO SISTEMA */}
          <div className="bg-stone-50 border border-stone-200 rounded-3xl overflow-hidden mt-4 shadow-sm">
            <div className="p-6">
              
              {/* Maintenance Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-8 border-b border-stone-200">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full border ${isMaintenanceMode ? 'bg-amber-100 border-amber-200 text-amber-600' : 'bg-green-100 border-green-200 text-green-600'}`}>
                    {isMaintenanceMode ? <Trash2 className="w-5 h-5 hidden" /> : <Trash2 className="w-5 h-5 hidden" />}
                    <div className="w-5 h-5 flex items-center justify-center font-bold font-serif text-lg">!</div>
                  </div>
                  <div>
                    <h2 className="text-sm font-mono text-stone-900 uppercase tracking-widest font-bold">Status do Showroom Público</h2>
                    <p className="text-xs text-stone-500 font-semibold mt-1 max-w-sm">
                      {isMaintenanceMode ? "O site está ATUALMENTE OFFLINE para visitantes." : "O site está ATUALMENTE ONLINE para visitantes."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleMaintenanceMode?.(!isMaintenanceMode)}
                  className={`w-full sm:w-auto px-6 py-3 font-bold text-xs uppercase tracking-widest rounded-xl transition-all border cursor-pointer shadow-sm ${
                    isMaintenanceMode 
                      ? 'bg-green-600 hover:bg-green-700 text-white border-green-700' 
                      : 'bg-stone-900 hover:bg-stone-800 text-white border-stone-950'
                  }`}
                >
                  {isMaintenanceMode ? "Colocar Site No Ar" : "Tirar Site do Ar"}
                </button>
              </div>

              {/* Reset Database */}
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-red-100 rounded-full border border-red-200 text-red-655">
                    <Trash2 className="w-5 h-5 text-red-600" />
                 </div>
                 <div>
                    <h2 className="text-sm font-mono text-stone-900 uppercase tracking-widest font-bold">Apagar Base de Dados (Zerar Vendas)</h2>
                    <p className="text-xs text-stone-500 font-semibold mt-1">
                        Use para limpar todos os contratos e zerar a contagem de ID.
                    </p>
                 </div>
              </div>
              <button 
                onClick={onResetSales}
                className="w-full sm:w-auto px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-red-200 cursor-pointer shadow-sm"
              >
                Resetar Vendas e Sequence ID
              </button>
            </div>
          </div>
        </div>

        {/* Confirmação de Exclusão */}
        <AnimatePresence>
            {userToDelete && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                >
                    <div className="bg-white border border-stone-250 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
                        <h3 className="text-lg text-stone-900 font-serif font-bold">Excluir {userToDelete.name}?</h3>
                        <p className="text-sm text-stone-500 font-light">Para confirmar a exclusão, digite a senha do usuário cadastrado.</p>
                        <input 
                            type="password"
                            placeholder="Senha do usuário"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="w-full bg-stone-50 text-stone-900 border border-stone-250 rounded-2xl px-4 py-3 text-sm focus:border-red-500/50 outline-none"
                        />
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => {setUserToDelete(null); setDeletePassword("")}} className="flex-1 py-3 text-sm text-stone-500 font-semibold hover:text-stone-800">Cancelar</button>
                            <button onClick={handleDeleteUser} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-bold shadow-sm">Excluir</button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
  );
}
