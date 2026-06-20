import React, { useState } from "react";
import { X, UserPlus, Users, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";

interface UsersManagementModalProps {
  onClose: () => void;
  users: User[];
  saveUsers: (users: User[]) => void;
}

export default function UsersManagementModal({ onClose, users, saveUsers }: UsersManagementModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUsersList, setShowUsersList] = useState(false);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewRole] = useState<'seller' | 'owner'>('seller');

  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deletePassword, setDeletePassword] = useState("");

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) return;

    if (users.find(u => u.email === newUserEmail)) {
      alert("Login já existe!");
      return;
    }

    const newUser: User = {
      name: newUserName,
      email: newUserEmail,
      password: newUserPassword,
      role: newUserRole,
      branchName: "Volt Motors"
    };

    saveUsers([...users, newUser]);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewRole('seller');
    setShowAddForm(false);
    alert("Usuário criado com sucesso!");
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    if (deletePassword.trim() !== userToDelete.password.trim()) {
      alert("Senha incorreta.");
      return;
    }
    saveUsers(users.filter(u => u.email !== userToDelete.email));
    setUserToDelete(null);
    setDeletePassword("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 overflow-y-auto bg-stone-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white border-t sm:border border-stone-200/80 sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] w-full max-w-xl mx-auto flex flex-col mt-auto sm:mt-0 max-h-[90vh] absolute bottom-0 sm:relative rounded-t-3xl"
      >
        <div className="p-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 sm:rounded-t-3xl rounded-t-3xl">
          <div className="flex flex-col">
            <h2 className="text-xl font-serif text-stone-900 tracking-wide font-bold">Gestão de Acessos</h2>
            <p className="text-xs text-stone-500 mt-1 font-mono uppercase">Controle de Usuários</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {/* Adicionar Consultor */}
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
                   <h2 className="text-sm font-mono text-stone-900 uppercase tracking-widest font-bold">Criar Acesso</h2>
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
                          onClick={() => setNewRole('seller')}
                          className={`flex-1 py-4 text-xs font-mono uppercase tracking-widest rounded-2xl border transition-all font-bold ${newUserRole === 'seller' ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-200 text-stone-500'}`}
                        >
                          Consultor
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewRole('owner')}
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

          {/* Usuários Ativos */}
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
                  <div className="flex flex-col gap-3 mt-4">
                      {users.map((user, idx) => {
                          if (user.name === "Consultor de Vendas Volt" || user.name === "Elite Developer") return null;
                          return (
                          <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-white border border-stone-200 rounded-2xl gap-3 hover:border-amber-500/30 transition-colors">
                              <div>
                                  <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                                    {user.name} 
                                    <span className="text-[9px] font-mono text-stone-400 border border-stone-200 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                        {user.role === "seller" ? "Consultor" : user.role === "owner" ? "Proprietário" : "Usuário"}
                                    </span>
                                  </h3>
                                  <div className="flex gap-4 mt-1.5 text-xs text-stone-500">
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
                      )})}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
          {userToDelete && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm"
              >
                  <div className="bg-white p-6 rounded-3xl max-w-sm w-full shadow-2xl border border-red-100">
                      <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">Excluir usuário?</h3>
                      <p className="text-sm text-stone-600 mb-4">
                          Para confirmar a exclusão do usuário <strong>{userToDelete.name}</strong>, digite a senha atual do mesmo abaixo:
                      </p>
                      <input 
                          type="text" 
                          placeholder="Senha do usuário"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          className="w-full bg-stone-50 text-stone-900 border border-stone-250 rounded-2xl px-4 py-3 text-sm focus:border-red-500/50 outline-none"
                      />
                      <div className="flex gap-3 pt-2 mt-4">
                          <button onClick={() => {setUserToDelete(null); setDeletePassword("")}} className="flex-1 py-3 text-sm text-stone-500 font-semibold hover:text-stone-800">Cancelar</button>
                          <button onClick={handleDeleteUser} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-bold shadow-sm">Excluir</button>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
