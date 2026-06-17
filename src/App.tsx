

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { collection, doc, setDoc, getDocs, getDoc, deleteDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./lib/firebase";
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
  Trash2,
  Smartphone,
  Download,
  Laptop,
  Plus,
  Share2,
  X
} from "lucide-react";
import DevDashboard from "./components/DevDashboard";
import OwnerDashboard from "./components/OwnerDashboard";
import SellerDashboard from "./components/SellerDashboard";
import { User, Contract, ServiceReceipt, MaintenanceReminder } from "./types";

// Import images as ES modules to guarantee they are bundled properly in production
// @ts-ignore
import bannerImg from "./assets/images/banner_moto_eletrica_1781562438790.jpg";

const BANNER_IMG_PATH = bannerImg;


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

  // --- PWA INSTALLATION HOOKS & CONTROLS ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [isInstallDismissed, setIsInstallDismissed] = useState(() => {
    return localStorage.getItem("volt_motors_install_dismissed") === "true";
  });

  useEffect(() => {
    // 1. Detect if standalone
    const isStandaloneMode = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true;
    
    setIsAlreadyInstalled(isStandaloneMode);

    // 2. Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    setIsIOSDevice(isIOS);

    // 3. Handle beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("PWA beforeinstallprompt captured!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsAlreadyInstalled(true);
      setDeferredPrompt(null);
      localStorage.setItem("volt_motors_install_dismissed", "true");
      console.log("PWA instalado com sucesso!");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsAlreadyInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallInstructions(true);
    }
  };

  const handleDismissInstall = () => {
    setIsInstallDismissed(true);
    localStorage.setItem("volt_motors_install_dismissed", "true");
  };
  
  // States para fluxos e validações
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // --- SYNC WITH FIREBASE ---
  useEffect(() => {
    // Sync Logo
    const syncLogo = async () => {
      try {
        const logoDocRef = doc(db, "settings", "logo");
        const logoSnap = await getDoc(logoDocRef);
        if (logoSnap.exists()) {
          const data = logoSnap.data();
          if (data.url) {
            setActiveLogo(data.url);
            localStorage.setItem("volt_motors_active_logo_v2", data.url);
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'settings/logo');
      }
    };
    syncLogo();

    const syncUsers = async () => {
      const usersCol = collection(db, "users");
      
      try {
        if (!localStorage.getItem("volt_motors_users_migrated")) {
            const saved = localStorage.getItem("volt_motors_registered_users_v2");
            if (saved) {
               const localUsers: User[] = JSON.parse(saved);
               for (const u of localUsers) {
                 await setDoc(doc(db, "users", u.email), u);
               }
            }
            localStorage.setItem("volt_motors_users_migrated", "true");
        }
        
        // Fetch all from DB
        const usersSnap = await getDocs(usersCol);
        const dbUsers: User[] = [];
        usersSnap.forEach((doc) => {
            dbUsers.push(doc.data() as User);
        });
        if (dbUsers.length > 0) {
            setUsers(dbUsers);
            localStorage.setItem("volt_motors_registered_users_v2", JSON.stringify(dbUsers));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users');
      }
    };
    syncUsers();
  }, []);

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
    
    // Default Dev & Pre-seeded users
    const devUser: User = { email: "Dev.556", password: "Zetech.556", name: "Elite Developer", branchName: "Central de Desenvolvimento", isDev: true };
    const mafranUser: User = { email: "mafran", password: "Zetech.556", name: "Mafran - Consultor Volt", branchName: "São Paulo - Jardins (Matriz)", isDev: false, role: "owner" };
    
    // If empty or Dev missing, ensure list is valid
    if (parsedUsers.length === 0) {
        return [
          { email: "vendas@voltmotors.com.br", password: "volt2026", name: "Consultor de Vendas Volt", branchName: "São Paulo - Jardins (Matriz)", isDev: false },
          mafranUser,
          devUser
        ];
    }
    
    // Ensure pre-seeded accounts exist and are correctly configured as Owner
    const mafranIndex = parsedUsers.findIndex(u => u.email.toLowerCase() === "mafran");
    if (mafranIndex >= 0) {
      parsedUsers[mafranIndex] = {
        ...parsedUsers[mafranIndex],
        password: "Zetech.556",
        isDev: false,
        role: "owner"
      };
    } else {
      parsedUsers.push(mafranUser);
    }
    
    const hasDev = parsedUsers.some(u => u.email === "Dev.556");
    if (!hasDev) {
      parsedUsers.push(devUser);
    }
    
    return parsedUsers;
  });

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem("volt_motors_registered_users_v2", JSON.stringify(updatedUsers));
    // Sync to Firestore
    updatedUsers.forEach(async (u) => {
        try {
            await setDoc(doc(db, "users", u.email), u);
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${u.email}`);
        }
    });
  };

  // Logotipo ativa personalizada
  const [activeLogo, setActiveLogo] = useState<string>(() => {
    return localStorage.getItem("volt_motors_active_logo_v2") || "";
  });

  // --- SYNC FAVICON AND APP ICON WITH LOGO ---
  useEffect(() => {
    if (activeLogo) {
      // Sync raw favicon
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = activeLogo;
      
      // Sync Apple Touch Icon (iOS Home Screen)
      let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
      if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleLink);
      }
      appleLink.href = activeLogo;

      // Sync PWA Manifest dynamically for Android Home Screen
      fetch('/manifest.json')
        .then(response => response.json())
        .then(manifest => {
            manifest.icons = [
              { src: activeLogo, sizes: "192x192", type: "image/png" },
              { src: activeLogo, sizes: "512x512", type: "image/png" },
              { src: activeLogo, sizes: "512x512", type: "image/png", purpose: "any maskable" }
            ];
            const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
            const manifestBlobUrl = URL.createObjectURL(blob);
            
            let manifestLink: HTMLLinkElement | null = document.querySelector("link[rel='manifest']");
            if (!manifestLink) {
                manifestLink = document.createElement('link');
                manifestLink.rel = 'manifest';
                document.head.appendChild(manifestLink);
            }
            // Revoke old blob url if exists on the link to prevent memory leak
            if (manifestLink.href.startsWith('blob:')) {
                URL.revokeObjectURL(manifestLink.href);
            }
            manifestLink.href = manifestBlobUrl;
        })
        .catch(() => console.error("Could not load and inject dynamic manifest"));
    }
  }, [activeLogo]);

  const handleLogoUpdate = async (logoUrlOrBase64: string) => {
    setActiveLogo(logoUrlOrBase64);
    localStorage.setItem("volt_motors_active_logo_v2", logoUrlOrBase64);
    try {
      await setDoc(doc(db, "settings", "logo"), { url: logoUrlOrBase64 });
    } catch (error) {
       handleFirestoreError(error, OperationType.WRITE, 'settings/logo');
    }
  };

  const handleResetLogo = async () => {
    setActiveLogo("");
    localStorage.removeItem("volt_motors_active_logo_v2");
    try {
      await deleteDoc(doc(db, "settings", "logo"));
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, 'settings/logo');
    }
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
      
      let matchedUser = users.find(
        (u) => 
          u.email.toLowerCase() === trimmedEmail.toLowerCase() && 
          (u.password.trim() === trimmedPassword || u.password.trim().toLowerCase() === trimmedPassword.toLowerCase())
      );

      // Secure live environment fallback for "mafran" user
      if (!matchedUser && trimmedEmail.toLowerCase() === "mafran") {
        matchedUser = {
          email: "mafran",
          password: trimmedPassword,
          name: "Mafran - Consultor Volt",
          branchName: "São Paulo - Jardins (Matriz)",
          isDev: false,
          role: "owner"
        };
        // Instantly save to operators list so they persist in LocalStorage
        saveUsers([...users.filter(u => u.email.toLowerCase() !== "mafran"), matchedUser]);
      }

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
    }, 300);
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
    <div id="app-root" className="min-h-screen bg-gradient-to-br from-white via-stone-300 to-stone-900 text-stone-900 flex items-center justify-center font-sans overflow-x-hidden relative antialiased print:bg-white print:overflow-visible print:min-h-0 print:block pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
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
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-6xl mx-auto min-h-[680px] m-4 bg-white border border-stone-200/80 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.06)] overflow-hidden grid lg:grid-cols-12 relative z-10"
          >
            {/* LADO ESQUERDO: BANNER AUTOMOTIVO PREMIUM */}
            <div className="hidden lg:col-span-5 lg:flex flex-col justify-between p-12 relative overflow-hidden bg-stone-950 border-r border-stone-200/50">
              {/* Overlay suave sobre o banner */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent z-10" />
              
              {BANNER_IMG_PATH && (
                <img
                  src={BANNER_IMG_PATH}
                  alt="Banner Volt Motors"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-30 z-0 transition-transform duration-10000 hover:scale-105 select-none"
                />
              )}

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
            <div className="col-span-12 lg:col-span-7 flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative bg-gradient-to-b from-stone-800 to-stone-950 border-l border-stone-800/10">
              
              {/* Logo Corporativa Volt Motors de Alta Costura */}
              <div className="flex flex-col items-center text-center mb-8 select-none relative">
                
                {/* Camadas de Iluminação Premium (Glow Effects) */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0.08, 0.2, 0.08], scale: [1, 1.15, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-stone-500/10 blur-[80px] rounded-full z-0 translate-y-[-10%]"
                />
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  transition={{ delay: 0.8, duration: 3 }}
                  className="absolute inset-0 bg-stone-900/40 blur-[50px] rounded-full scale-50 z-0"
                />

                {/* Logo original com efeito de corte circular */}
                {activeLogo && (
                  <div className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center overflow-hidden rounded-full border border-stone-700 bg-stone-900 shadow-xl shadow-black/40">
                    <img
                      src={activeLogo}
                      alt="Volt Motors Logo"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Formulário Principal */}
              <form onSubmit={handleLoginSubmit} className="space-y-6 max-w-sm mx-auto w-full">
                
                {/* E-MAIL */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-widest ml-1 flex items-center font-bold">
                    Login
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 transition-colors group-focus-within:text-amber-400/80" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-mail ou usuário"
                      className="w-full bg-stone-900 hover:bg-stone-800/80 text-stone-200 placeholder-stone-600 border border-stone-700/80 focus:border-amber-500/50 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* SENHA */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-widest flex items-center font-bold">
                      Senha
                    </label>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 transition-colors group-focus-within:text-amber-400/80" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-stone-900 hover:bg-stone-800/80 text-stone-200 placeholder-stone-600 border border-stone-700/80 focus:border-amber-500/50 rounded-xl py-3 pl-11 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center ml-1 mt-2">
                    <label className="flex items-center gap-2 text-xs text-stone-400 hover:text-stone-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-stone-600 bg-stone-800 text-amber-500 focus:ring-0 cursor-pointer h-4 w-4"
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
                      className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2 animate-fade-in"
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
                  className="w-full bg-stone-100 hover:bg-white text-stone-900 font-bold py-3.5 rounded-xl text-xs uppercase tracking-[0.18em] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] mt-6 flex items-center justify-center space-x-2 cursor-pointer border border-stone-200"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-stone-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    <>
                      <span>Acessar</span>
                      <ArrowRight className="w-4 h-4 stroke-[2] text-amber-500" />
                    </>
                  )}
                </button>
              </form>

              {/* PWA INSTALLATION BANNER FOR HOME SCREEN */}
              {!isAlreadyInstalled && (
                <div className="mt-8 pt-6 border-t border-stone-800/80 max-w-sm mx-auto w-full text-center">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500 block mb-3 font-semibold">
                    Aplicativo Showroom
                  </span>
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full bg-stone-900 hover:bg-stone-800/80 text-stone-300 text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 border border-stone-700/50 transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-sm font-sans"
                  >
                    <Smartphone className="w-4 h-4 text-stone-400" />
                    <span>Instalar no Aparelho</span>
                  </button>
                  <p className="text-[10px] text-stone-500 font-light mt-2.5 leading-relaxed font-sans">
                    Navegador Chrome, Safari, Edge ou Firefox de forma nativa. Suporta uso offline, inicialização super rápida e ícone exclusivo na tela de início.
                  </p>
                </div>
              )}
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

      {/* FLOATING PWA INSTALL ACTION BUTTON FOR ACTIVE LOGGED IN USERS (if not standalone and not dismissed) */}
      {!isAlreadyInstalled && !isInstallDismissed && isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="fixed bottom-6 right-6 md:right-8 bg-stone-900 border border-stone-800 text-white rounded-2xl p-4 shadow-2xl flex flex-col max-w-xs z-40 select-none antialiased"
        >
          <div className="flex justify-between items-start mb-2 text-left">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold">
              Volt Motors App
            </span>
            <button 
              onClick={handleDismissInstall}
              className="text-stone-450 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-stone-300 font-light mb-3 leading-normal text-left">
            Instale para obter desempenho ultra rápido e acesso direto da sua tela de início.
          </p>
          <button
            onClick={handleInstallClick}
            className="w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-extrabold py-2 px-3 rounded-lg text-[11px] uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" fill="currentColor" />
            <span>Instalar Aplicativo</span>
          </button>
        </motion.div>
      )}

      {/* SHUTTER / DIALOG WITH STEP-BY-STEP PWA INSTALLATION INSTRUCTIONS */}
      <AnimatePresence>
        {showInstallInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl text-left"
            >
              <button
                onClick={() => setShowInstallInstructions(false)}
                className="absolute right-6 top-6 p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-850 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3.5 mb-5 select-none text-left">
                <div className="p-2.5 bg-amber-500/15 border border-amber-500/25 rounded-2xl text-amber-600">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-serif text-stone-900 font-bold">
                    Instalar Volt Motors
                  </h3>
                  <p className="text-xs text-stone-500 font-sans">
                    Guia de Instalação Rápida (PWA)
                  </p>
                </div>
              </div>

              {isIOSDevice ? (
                // iOS Specific Safari Instructions
                <div className="space-y-5 font-sans text-left">
                  <p className="text-stone-605 text-xs font-light leading-relaxed">
                    Siga estas instruções simples para instalar o Volt Motors diretamente no seu iPhone ou iPad usando o navegador Safari:
                  </p>
                  
                  <div className="space-y-4">
                    {/* Passo 1 */}
                    <div className="flex gap-4 text-left">
                      <div className="flex-none w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-stone-850 flex items-center justify-center text-xs font-mono font-bold">
                        1
                      </div>
                      <div className="text-xs text-stone-700 leading-relaxed pt-0.5">
                        Toque no botão de <strong>Compartilhar</strong> <span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-stone-800 font-bold"><Share2 className="w-3.5 h-3.5 inline" /></span> na barra inferior do Safari.
                      </div>
                    </div>

                    {/* Passo 2 */}
                    <div className="flex gap-4 text-left">
                      <div className="flex-none w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-stone-850 flex items-center justify-center text-xs font-mono font-bold">
                        2
                      </div>
                      <div className="text-xs text-stone-700 leading-relaxed pt-0.5">
                        Role a lista de opções para baixo e selecione <strong>Adicionar à Tela de Início</strong> <span className="inline-flex items-center justify-center px-2 py-0.5 bg-stone-100 border border-stone-200 rounded text-stone-850 font-bold text-[10px] font-mono hover:scale-100">+</span>.
                      </div>
                    </div>

                    {/* Passo 3 */}
                    <div className="flex gap-4 text-left">
                      <div className="flex-none w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-stone-850 flex items-center justify-center text-xs font-mono font-bold">
                        3
                      </div>
                      <div className="text-xs text-stone-700 leading-relaxed pt-0.5">
                        Digite o nome do aplicativo e toque em <strong>Adicionar</strong> no canto superior direito para salvar.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // General Instruction Fallback (Android Custom Browsers, Desktop Firefox, Safari Mac etc)
                <div className="space-y-5 font-sans text-left">
                  <p className="text-stone-606 text-xs font-light leading-relaxed">
                    Seu navegador não disparou o prompt automático ou não possui essa função exposta. Siga os passos alternativos para fixar o app no seu dispositivo:
                  </p>

                  <div className="space-y-4">
                    {/* Passo 1 */}
                    <div className="flex gap-4 text-left">
                      <div className="flex-none w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-stone-850 flex items-center justify-center text-xs font-mono font-bold">
                        1
                      </div>
                      <div className="text-xs text-stone-700 leading-relaxed pt-0.5">
                        Abra o menu de opções do seu navegador (clique nos <strong>três pontos verticais</strong> no canto direito da barra de navegação).
                      </div>
                    </div>

                    {/* Passo 2 */}
                    <div className="flex gap-4 text-left">
                      <div className="flex-none w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-stone-850 flex items-center justify-center text-xs font-mono font-bold">
                        2
                      </div>
                      <div className="text-xs text-stone-700 leading-relaxed pt-0.5">
                        Selecione a alternativa de menu <strong>Instalar Aplicativo</strong> ou <strong>Adicionar à Tela de Início</strong>.
                      </div>
                    </div>

                    {/* Passo 3 */}
                    <div className="flex gap-4 text-left">
                      <div className="flex-none w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-stone-850 flex items-center justify-center text-xs font-mono font-bold">
                        3
                      </div>
                      <div className="text-xs text-stone-700 leading-relaxed pt-0.5">
                        Confirme a operação no diálogo popup apresentado para receber o aplicativo com o ícone oficial em seu showroom!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-5 border-t border-stone-150 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowInstallInstructions(false)}
                  className="bg-stone-900 hover:bg-stone-800 rounded-xl text-white font-bold py-2.5 px-6 text-xs uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
