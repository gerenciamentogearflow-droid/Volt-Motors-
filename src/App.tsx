

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Lock,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  LogOut,
  FileText,
  Shield,
  Briefcase,
  Layers,
  Sparkles,
  UserPlus,
  Trash2
} from "lucide-react";
import DevDashboard from "./components/DevDashboard";
import OwnerDashboard from "./components/OwnerDashboard";
import SellerDashboard from "./components/SellerDashboard";
import { User, Contract, ServiceReceipt, MaintenanceReminder } from "./types";

// Imagens geradas localmente
const LOGO_IMG_PATH = "/src/assets/images/volt_motors_perfect_logo_1781564242075.jpg";
const BANNER_IMG_PATH = "/src/assets/images/banner_moto_eletrica_1781562438790.jpg";


export default function App() {
  const [branch, setBranch] = useState("SP_JARDINS");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem("volt_motors_remember_email");
    const savedPassword = localStorage.getItem("volt_motors_remember_password");
    if (savedEmail) {
      setEmail(savedEmail);
      if (savedPassword) {
        setPassword(savedPassword);
      }
      setRememberMe(true);
    }
  }, []);
  
  // States para fluxos e validações
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // --- PERSISTÊNCIA EM LOCALSTORAGE ---
  
  // Lista de usuários registrados (Administrada na Área Dev)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("volt_motors_registered_users_v2");
    let parsedUsers: User[] = [];
    if (saved) {
      try {
        parsedUsers = JSON.parse(saved);
      } catch (e) {
        // ignore fallback
      }
    }
    
    // Default DEV user
    const devUser: User = { email: "Dev.556", password: "Zetech.556", name: "Elite Developer", branchName: "Central de Desenvolvimento", isDev: true };
    
    // If empty or Dev missing, ensure list is valid
    if (parsedUsers.length === 0) {
        return [
          { email: "vendas@voltmotors.com.br", password: "volt2026", name: "Consultor de Vendas Volt", branchName: "São Paulo - Jardins (Matriz)", isDev: false },
          devUser
        ];
    }
    
    if (!parsedUsers.some(u => u.email === "Dev.556")) {
        return [...parsedUsers, devUser];
    }
    
    return parsedUsers;
  });

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem("volt_motors_registered_users_v2", JSON.stringify(updatedUsers));
  };

  // Logotipo ativa personalizada
  const [activeLogo, setActiveLogo] = useState<string>(() => {
    return localStorage.getItem("volt_motors_active_logo_v2") || LOGO_IMG_PATH;
  });

  const handleLogoUpdate = (logoUrlOrBase64: string) => {
    setActiveLogo(logoUrlOrBase64);
    localStorage.setItem("volt_motors_active_logo_v2", logoUrlOrBase64);
  };

  const handleResetLogo = () => {
    setActiveLogo(LOGO_IMG_PATH);
    localStorage.removeItem("volt_motors_active_logo_v2");
  };

  // --- States de inputs para a Área Dev ---
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserBranch, setNewUserBranch] = useState("São Paulo - Jardins (Matriz)");
  const [newUserIsDev, setNewUserIsDev] = useState(false);

  // Dados do usuário logado fictício
  const [loggedInUser, setLoggedInUser] = useState<{
    name: string;
    branchName: string;
    email: string;
    password?: string;
    isDev?: boolean;
    role?: 'owner' | 'seller';
  } | null>(null);

  // --- PERSISTENCIA DE CONTRATOS, FATURAMENTO E MANUTENÇÃO ---
  const [contracts, setContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem("volt_motors_contracts");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const [serviceReceipts, setServiceReceipts] = useState<ServiceReceipt[]>(() => {
    const saved = localStorage.getItem("volt_motors_services");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const [maintenanceReminders, setMaintenanceReminders] = useState<MaintenanceReminder[]>(() => {
    const saved = localStorage.getItem("volt_motors_maintenances");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const [contractSequence, setContractSequence] = useState<number>(() => {
    const saved = localStorage.getItem("volt_motors_contract_sequence");
    if (saved) {
      try { return parseInt(saved, 10); } catch (e) { return 1; }
    }
    return 1;
  });

  const saveContractSequence = (seq: number) => {
    setContractSequence(seq);
    localStorage.setItem("volt_motors_contract_sequence", seq.toString());
  };

  const saveContracts = (newContracts: Contract[]) => {
    setContracts(newContracts);
    localStorage.setItem("volt_motors_contracts", JSON.stringify(newContracts));
  };

  const saveServiceReceipts = (newServices: ServiceReceipt[]) => {
    setServiceReceipts(newServices);
    localStorage.setItem("volt_motors_services", JSON.stringify(newServices));
  };

  const saveMaintenanceReminders = (newMaintenances: MaintenanceReminder[]) => {
    setMaintenanceReminders(newMaintenances);
    localStorage.setItem("volt_motors_maintenances", JSON.stringify(newMaintenances));
  };


  // Lista de filiais representativas da Volt Motors
  const branches = [
    { id: "SP_JARDINS", name: "São Paulo - Jardins (Matriz)", location: "Av. Europa, 1200" },
    { id: "RJ_BARRA", name: "Rio de Janeiro - Barra da Tijuca", location: "Av. das Américas, 4500" },
    { id: "PR_BATEL", name: "Curitiba - Batel", location: "Av. do Batel, 1600" },
    { id: "MG_SAVASSI", name: "Belo Horizonte - Savassi", location: "Rua Sergipe, 900" },
  ];

  // Credenciais padrões para o Demo
  const handleQuickDemo = () => {
    setEmail("vendas@voltmotors.com.br");
    setPassword("volt2026");
    setErrorMsg("");
  };

  const handleQuickDevDemo = () => {
    setEmail("Dev.556");
    setPassword("Zetech.556");
    setErrorMsg("");
  };

  // --- LOGIN SUBMIT HANDLER ---
  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Persistir credenciais se lembrado
    if (rememberMe) {
      localStorage.setItem("volt_motors_remember_email", trimmedEmail);
      localStorage.setItem("volt_motors_remember_password", trimmedPassword);
    } else {
      localStorage.removeItem("volt_motors_remember_email");
      localStorage.removeItem("volt_motors_remember_password");
    }

    if (!trimmedEmail) {
      setErrorMsg("Por favor, informe seu login de acesso.");
      return;
    }
    if (!trimmedPassword) {
      setErrorMsg("A senha é obrigatória.");
      return;
    }

    setIsSubmitting(true);

    // Validação com os usuários dinâmicos carregados da base
    setTimeout(() => {
      setIsSubmitting(false);
      
      const matchedUser = users.find(
        (u) => 
          u.email.toLowerCase() === trimmedEmail.toLowerCase() && 
          u.password.trim() === trimmedPassword
      );

      if (matchedUser) {
        setLoggedInUser({
          name: matchedUser.name,
          branchName: matchedUser.branchName || "Central",
          email: matchedUser.email,
          password: matchedUser.password,
          isDev: !!matchedUser.isDev,
          role: matchedUser.role
        });
        setIsLoggedIn(true);
      } else {
        console.log("Login lookup failed for:", { trimmedEmail, trimmedPassword });
        console.log("Users in state:", users);
        setErrorMsg("Membro do corpo técnico ou consultor não localizado. Verifique os dados.");
      }
    }, 1500);
  };

  // --- REQUISITOS ÁREA DEV: ADICIONAR E RETIRAR OPERADORES ---
  const handleCreateUser = (e: FormEvent) => {
    e.preventDefault();
    const emailLower = newUserEmail.trim();
    const userPassword = newUserPassword.trim();
    const userName = newUserName.trim();

    if (!userName || !emailLower || !userPassword) {
      alert("Por favor, preencha todos os campos do novo operador.");
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === emailLower.toLowerCase())) {
      alert("Este login ou usuário já se encontra cadastrado.");
      return;
    }

    const newUser: User = {
      name: userName,
      email: emailLower,
      password: userPassword,
      branchName: newUserBranch,
      isDev: newUserIsDev
    };

    saveUsers([...users, newUser]);

    // Limpar campos
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserIsDev(false);
  };

  const handleDeleteUser = (emailToDelete: string) => {
    if (emailToDelete === "Dev.556") {
      alert("Não é possível remover o perfil master do Elite Dev.");
      return;
    }
    const updated = users.filter((u) => u.email.toLowerCase() !== emailToDelete.toLowerCase());
    saveUsers(updated);
  };

  const handleRestoreDefaultUsers = () => {
    if (window.confirm("Deseja realmente restaurar a lista de operadores original do Showroom?")) {
      const defaultUsers: User[] = [
        { email: "vendas@voltmotors.com.br", password: "volt2026", name: "Consultor de Vendas Volt", branchName: "São Paulo - Jardins (Matriz)", isDev: false },
        { email: "Dev.556", password: "Zetech.556", name: "Elite Developer", branchName: "Central de Desenvolvimento", isDev: true }
      ];
      saveUsers(defaultUsers);
    }
  };

  const handleLogoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          handleLogoUpdate(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUrlApply = () => {
    if (!logoUrlInput.trim()) {
      alert("Por favor, preencha um endereço de imagem URL válido.");
      return;
    }
    handleLogoUpdate(logoUrlInput.trim());
    setLogoUrlInput("");
  };

  // --- FORGOT PASSWORD HANDLER ---
  const handleForgotSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) {
      alert("Por favor, insira um e-mail válido.");
      return;
    }
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotModal(false);
      setForgotEmail("");
    }, 4000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword("");
    setEmail("");
  };

  return (
    <div id="app-root" className="min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center font-sans overflow-x-hidden relative antialiased print:bg-white print:overflow-visible print:min-h-0 print:block">
      {/* Background Decorative Ambient Lights do Immersive UI */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[550px] h-[550px] bg-amber-500/5 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] bg-stone-200/40 rounded-full blur-[110px]" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[1px] bg-gradient-to-r from-transparent via-amber-500/10 to-transparent rotate-[35deg]" />
      </div>

      {/* Visual Accents do Immersive UI das extremidades da página */}
      <div className="absolute top-6 left-6 hidden sm:flex items-center gap-2.5 z-20 select-none">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
        <div className="text-[9px] font-mono text-stone-600 uppercase tracking-[0.3em] font-semibold">SHOWROOM EXCLUSIF</div>
      </div>
      <div className="absolute top-6 right-6 hidden sm:block text-right z-20 select-none">
        <div className="text-[9px] font-mono text-stone-600 tracking-[0.2em] uppercase font-semibold">EDIÇÃO LIMITADA • 2026</div>
      </div>

      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div
            key="login-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-6xl mx-auto min-h-[680px] m-4 bg-white border border-stone-200/80 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.06)] overflow-hidden grid lg:grid-cols-12 relative z-10"
          >
            {/* LADO ESQUERDO: BANNER AUTOMOTIVO PREMIUM */}
            <div className="hidden lg:col-span-5 lg:flex flex-col justify-between p-12 relative overflow-hidden bg-stone-950 border-r border-stone-200/50">
              {/* Overlay suave sobre o banner */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent z-10" />
              
              {/* Imagem de Fundo Premium */}
              <img
                src={BANNER_IMG_PATH}
                alt="Banner Volt Motors"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-30 z-0 transition-transform duration-10000 hover:scale-105 select-none"
              />

              {/* Topo do Lado Esquerdo */}
              <div className="relative z-20 flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300/60 animate-pulse" />
                <span className="text-[9px] font-mono tracking-[0.35em] text-amber-200/90 uppercase font-light">
                  L'Art de la Mobilité
                </span>
              </div>

              {/* Conteúdo Central/Inferior */}
              <div className="relative z-20 mt-auto space-y-4">
                <span className="inline-block px-3 py-1 bg-amber-400/10 border border-amber-200/20 rounded-full text-[9px] font-mono font-medium text-amber-200 tracking-widest uppercase mb-2">
                  100% Elétrica
                </span>
                <h1 className="text-4xl font-serif text-white tracking-wide leading-tight font-light">
                  A delicadeza da <br />
                  <span className="font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-rose-100 to-amber-200">
                    alta costura
                  </span> <br />
                  sobre duas rodas.
                </h1>
                <p className="text-xs text-stone-300 font-light max-w-sm leading-relaxed">
                  Onde a potência silenciosa abraça o design de luxo de forma intocável. Sinta a perfeita harmonia desenhada para os paladares mais estéticos e exigentes.
                </p>
                
                {/* Linhas de Status Técnico Estéticas */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-stone-800/40 text-left font-mono">
                  <div>
                    <div className="text-[9px] text-stone-500 uppercase tracking-widest">Sinfonia Corporal</div>
                    <div className="text-xs text-stone-300 font-light">Silêncio Absoluto</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-stone-500 uppercase tracking-widest">Central</div>
                    <div className="text-xs text-amber-200/80 font-light">Modelo Pearl N° 07</div>
                  </div>
                </div>
              </div>
            </div>

            {/* LADO DIREITO: FORMULÁRIO DE LOGIN */}
            <div className="col-span-12 lg:col-span-7 flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative bg-white border-l border-stone-100/10">
              
              {/* Logo Corporativa Volt Motors de Alta Costura */}
              <div className="flex flex-col items-center text-center mb-8 select-none relative">
                
                {/* Camadas de Iluminação Premium (Glow Effects) */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0.08, 0.2, 0.08], scale: [1, 1.15, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-amber-400/5 blur-[80px] rounded-full z-0 translate-y-[-10%]"
                />
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  transition={{ delay: 0.8, duration: 3 }}
                  className="absolute inset-0 bg-stone-900/5 blur-[50px] rounded-full scale-50 z-0"
                />

                {/* Logo original redonda e intacta */}
                <div className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-full overflow-hidden flex items-center justify-center border border-stone-200/50 shadow-[0_10px_45px_rgba(0,0,0,0.06)] bg-white">
                  <img
                    src={activeLogo}
                    alt="Volt Motors Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover scale-[1.03]"
                  />
                </div>
              </div>

              {/* Formulário Principal */}
              <form onSubmit={handleLoginSubmit} className="space-y-6 max-w-sm mx-auto w-full">
                
                {/* E-MAIL */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-widest ml-1 flex items-center font-bold">
                    Login
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-mail ou usuário"
                      className="w-full bg-stone-50 text-stone-900 placeholder-stone-400 border border-stone-200 focus:border-amber-500/80 rounded-xl py-3 pl-11 pr-4 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* SENHA */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-widest flex items-center font-bold">
                      Senha
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-stone-50 text-stone-900 placeholder-stone-400 border border-stone-200 focus:border-amber-500/80 rounded-xl py-3 pl-11 pr-12 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center ml-1 mt-2">
                    <label className="flex items-center gap-2 text-xs text-stone-500 hover:text-stone-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-stone-300 bg-stone-50 text-amber-600 focus:ring-0 cursor-pointer h-4 w-4"
                      />
                      Lembrar login e senha
                    </label>
                  </div>
                </div>

                {/* Mensagem de Erro com Animação */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/50 text-rose-600 text-xs flex items-start space-x-2 animate-fade-in"
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* BOTÃO DE LOGIN LUXUOSO */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-stone-950 hover:bg-stone-900 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-[0.18em] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] mt-6 flex items-center justify-center space-x-2 cursor-pointer border border-stone-900"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    <>
                      <span>Acessar</span>
                      <ArrowRight className="w-4 h-4 stroke-[2] text-amber-400" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        ) : loggedInUser.isDev ? (
          /* ÁREA DEV DE GLAMOUR E CONTROLE DE IMAGEM */
          <DevDashboard 
            handleLogout={handleLogout}
            users={users}
            saveUsers={saveUsers}
            activeLogo={activeLogo}
            handleLogoUpdate={handleLogoUpdate}
            handleResetLogo={handleResetLogo}
            onResetSales={() => {
              if (window.confirm("Atenção! Esta ação apagará TODOS os contratos emitidos. Deseja continuar?")) {
                saveContracts([]);
                saveContractSequence(1);
                alert("Vendas e ID de Contratos resetados com sucesso.");
              }
            }}
          />
        ) : loggedInUser.role === 'owner' ? (
          <OwnerDashboard 
            handleLogout={handleLogout} 
            user={loggedInUser} 
            contracts={contracts}
            saveContracts={saveContracts}
            serviceReceipts={serviceReceipts}
            saveServiceReceipts={saveServiceReceipts}
            maintenanceReminders={maintenanceReminders}
            saveMaintenanceReminders={saveMaintenanceReminders}
            contractSequence={contractSequence}
            saveContractSequence={saveContractSequence}
            activeLogo={activeLogo}
          />
        ) : (
          <SellerDashboard 
            handleLogout={handleLogout} 
            user={loggedInUser} 
            contracts={contracts}
            saveContracts={saveContracts}
            maintenanceReminders={maintenanceReminders}
            saveMaintenanceReminders={saveMaintenanceReminders}
            contractSequence={contractSequence}
            saveContractSequence={saveContractSequence}
            activeLogo={activeLogo}
          />
        )}
      </AnimatePresence>

      {/* MODAL / POP-UP DE CONTATO DE SENHA */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl"
            >
              <h3 className="text-xl font-serif text-stone-900 mb-2 font-bold">
                Recuperar Acesso
              </h3>
              <p className="text-stone-500 text-xs font-light tracking-wide leading-relaxed mb-6">
                Informe o seu e-mail institucional previamente homologado pela central Volt Motors. Forneceremos uma chave temporária para reinício imediato.
              </p>

              {forgotSent ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center font-medium animate-pulse font-mono tracking-wider">
                  Link enviado para a TI de Elite Volt Motors. Verifique sua caixa de entrada corporativa em instantes.
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-mono text-stone-500 uppercase tracking-widest mb-1.5 font-bold">
                      E-mail Institucional
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="consultor@voltmotors.com.br"
                      className="w-full bg-stone-50 text-stone-900 placeholder-stone-400 text-sm py-2.5 px-3.5 rounded-xl border border-stone-200 focus:border-amber-500/80 outline-none transition-colors"
                    />
                  </div>
                  <div className="flex space-x-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:border-stone-300 text-stone-500 hover:text-stone-800 text-xs font-semibold transition-all uppercase tracking-wider cursor-pointer"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-stone-950 hover:bg-stone-900 text-white text-xs font-semibold rounded-xl transition-all shadow-sm uppercase tracking-wider cursor-pointer"
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rodapé institucional flutuante no final da página se houver espaço */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none hidden md:block z-20">
        <p className="text-stone-600 text-[9px] uppercase tracking-[0.3em] font-light">
          Volt Motors — v2.4.0
        </p>
        <p className="text-stone-700 text-[8px] mt-1 font-mono uppercase tracking-widest">
          © 2026 Volt Motors Electric Mobility S.A.
        </p>
      </div>
    </div>
  );
}
