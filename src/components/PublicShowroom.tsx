import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ShowroomMotorcycle } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Zap, Fuel, Gauge, Disc, ShieldCheck, FileText, Compass, Sparkles, CheckCircle2, ChevronRight, Phone, MapPin, Mail, Smartphone, Leaf, BatteryCharging, Wind, Globe2 } from "lucide-react";

// Spec mapping function helper based on model/brand name
function getMotoSpecifications(name: string, brand: string, motoFuel?: string) {
  const normalized = (brand + " " + name).toLowerCase();
  
  if (normalized.includes("phoenix")) {
    return {
      power: "49 cc",
      speed: "50 km/h",
      tank: "3.5 L",
      fuel: "Gasolina",
      transmission: "Semiautomática",
      highlights: [
        { label: "Cilindrada", value: "49cc de economia inacreditável" },
        { label: "Partida", value: "Elétrica / Pedal integrado" },
        { label: "Rodas de Aro", value: "Raiadas clássicas de 17 polegadas" },
        { label: "Consumo Médio", value: "Faz até 45 km por litro de combustível" }
      ],
      techSpecs: {
        "Motorização": "Monocilíndrico, 4 tempos, OHC",
        "Transmissão": "4 velocidades semiautomática rotativa",
        "Partida": "Elétrica e pedal para emergências",
        "Freio Dianteiro": "Tambor mecânico confiável",
        "Freio Traseiro": "Tambor mecânico com lona macia",
        "Capacidade de Carga": "Suporta com segurança até 140 kg",
        "Painel de instrumentos": "Analógico clássico com indicador de marchas"
      }
    };
  }
  
  if (normalized.includes("jet 50")) {
    return {
      power: "49 cc",
      speed: "50 km/h",
      tank: "3.0 L",
      fuel: "Gasolina",
      transmission: "Semiautomática",
      highlights: [
        { label: "Cilindrada", value: "49cc - Dispensa CNH Categoria A" },
        { label: "Iniciação", value: "Painel intuitivo completo" },
        { label: "Rodas Premium", value: "Liga leve com pintura escura fosca" },
        { label: "Marchas", value: "Semiautomática rotativa suave" }
      ],
      techSpecs: {
        "Motorização": "Monocilíndrico, 4T, OCH, refrigerador a ar",
        "Transmissão": "4 velocidades sem embreagem manual",
        "Suspensão Dianteira": "Garfo telescópico hidráulico macio",
        "Suspensão Traseira": "Balança oscilante com duplo amortecimento",
        "Pneus": "Dianteiro Aro 17 e Traseiro Aro 14",
        "Espaço Interno": "Pequeno porta-objetos abaixo do banco"
      }
    };
  }

  if (normalized.includes("triciclo") || normalized.includes("pt3")) {
    return {
      power: "2000 W",
      speed: "45 km/h",
      tank: "60V 20Ah",
      fuel: "Bateria de Chumbo",
      transmission: "Automática",
      highlights: [
        { label: "Potência do Cubo", value: "Motor elétrico reforçado de 2000W" },
        { label: "Autonomia por carga", value: "Até 45 km por recarga elétrica completa" },
        { label: "Bateria Tracionária", value: "60V 20Ah Chumbo-Ácido de alto ciclo" },
        { label: "Modo de Marcha", value: "Avanço e marcha ré com sinal sonoro" }
      ],
      techSpecs: {
        "Motorização": "Elétrico de cubo traseiro Brushless",
        "Bateria": "Conjunto de 5 baterias de 12V em série",
        "Tempo de Recarga": "6 a 8 horas para carregamento de 0 a 100%",
        "Freio Dianteiro": "Disco hidráulico ventilado com pinça de duplo pistão",
        "Freio Traseiro": "Tambor hidráulico com acionamento unificado",
        "Baú Traseiro": "Grade metálica integrada para sacolas e carga",
        "Iluminação": "Farol redondo clássico e lanternas traseiras"
      }
    };
  }

  if (normalized.includes("jet 125")) {
    return {
      power: "125 cc",
      speed: "80 km/h",
      tank: "3.0 L",
      fuel: "Gasolina",
      transmission: "Semiautomática",
      highlights: [
        { label: "Cilindrada real", value: "123.6cc com alto torque de arrancada" },
        { label: "Partida", value: "Elétrica moderna e pedal auxiliar" },
        { label: "Tecnologia", value: "Entrada USB frontal integrada para celular" },
        { label: "Freio Hidráulico", value: "Disco de alta resposta e ventilação" }
      ],
      techSpecs: {
        "Motor": "Monocilíndrico, 4 tempos, OHC, Refrigerado a ar",
        "Taxa de Compressão": "9.0:1 de alta confiabilidade",
        "Freio Dianteiro": "Disco hidráulico de pistão duplo",
        "Freio Traseiro": "Lona expansora mecânica clássica",
        "Capacidade de Carga": "150 kg (Piloto + garupa + acessórios)",
        "Porta-objetos": "Porta capacete útil abaixo do banco"
      }
    };
  }

  if (normalized.includes("rio 125") || normalized.includes("rio")) {
    return {
      power: "125 cc",
      speed: "85 km/h",
      tank: "3.2 L",
      fuel: "Gasolina (Injeção)",
      transmission: "Semiautomática",
      highlights: [
        { label: "Injeção Eletrônica", value: "Módulo EFI calibrado para o Brasil" },
        { label: "Segurança", value: "Pneus originais Pirelli de alta durabilidade" },
        { label: "Iluminação", value: "Farol principal em bloco de LED" },
        { label: "Segurança Ativa", value: "Freio dianteiro a disco ventilado orbital" }
      ],
      techSpecs: {
        "Tipo de Motor": "Monocilíndrico de 4 tempos, OHC, refrigerado a ar",
        "Alimentação": "Injeção eletrônica multiponto inteligente",
        "Painel principal": "Totalmente digital com hodômetro digital",
        "Rodas": "Liga leve em tom grafite moderno premium",
        "Transmissão": "Automática rotativa de 4 marchas sem manete",
        "Protetor térmico": "Incluso no escapamento em acabamento preto acetinado"
      }
    };
  }

  // General default fallback
  const fuelLower = motoFuel?.toLowerCase() || "";
  const isElectric = fuelLower.includes("energia") || fuelLower.includes("elétrica");

  return {
    power: "Elétrica / Combustão",
    speed: "65 km/h",
    tank: "Eficiente",
    fuel: "Energia / Flex",
    transmission: isElectric ? "Automática" : "Automática / Semiautomática",
    highlights: [
      { label: "Performance", value: "Desenvolvida para o trânsito urbano ágil" },
      { label: "Economia", value: "Baixo índice de fricção e manutenção" },
      { label: "Design", value: "Aerodinâmica projetada para conforto" },
      { label: "Garantia", value: "Qualidade revisada e validada na concessionária" }
    ],
    techSpecs: {
      "Motorização": isElectric ? "Motorização elétrica" : "Motorização otimizada para o dia a dia",
      "Transmissão": isElectric ? "Automática" : "Câmbio automático ou semiautomático simplificado",
      "Chassis": "Monobloco reforçado de alta resistência",
      "Freio": "Combinação otimizada para respostas curtas",
      "Consumo": "Nível A de eficiência urbana"
    }
  };
}

export default function PublicShowroom({ activeLogo }: { activeLogo: string }) {
  const [motorcycles, setMotorcycles] = useState<ShowroomMotorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMoto, setSelectedMoto] = useState<ShowroomMotorcycle | null>(null);

  useEffect(() => {
    const colRef = collection(db, "showroom");
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data: ShowroomMotorcycle[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as ShowroomMotorcycle);
      });
      // Sort by newest and only available
      setMotorcycles(data.filter(m => m.status === 'available').sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div 
      className="min-h-screen text-[#f4efe6] font-sans w-full absolute inset-0 overflow-y-auto pb-28 relative selection:bg-[#d4af37] selection:text-black overflow-x-hidden"
      style={{
        backgroundColor: '#101012',
        backgroundImage: `
          radial-gradient(ellipse at 30% 0%, rgba(255, 180, 100, 0.15) 0%, transparent 60%),
          radial-gradient(ellipse at 70% 0%, rgba(255, 160, 80, 0.12) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 100%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
          linear-gradient(to bottom, rgba(60, 60, 64, 0.85) 0%, rgba(25, 25, 28, 0.95) 30%, rgba(12, 12, 14, 1) 100%), 
          url('https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?q=80&w=2000&auto=format&fit=crop')`,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, cover, cover',
        backgroundPosition: 'top, top, bottom, center, center',
        backgroundAttachment: 'fixed, fixed, fixed, fixed, fixed',
        backgroundBlendMode: 'screen, screen, screen, normal, normal'
      }}
    >
      {/* Decorative Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[25%] left-[5%] md:left-[10%] flex flex-col items-center gap-2 opacity-30 select-none"
        >
          <div className="w-12 h-12 rounded-full border border-[#d4af37]/20 flex items-center justify-center bg-[#d4af37]/5 backdrop-blur-sm">
            <Leaf className="w-5 h-5 text-[#d4af37]" />
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-[#a8a192]">Zero Emissão</span>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[45%] right-[5%] md:right-[15%] flex flex-col items-center gap-2 opacity-30 select-none"
        >
          <div className="w-16 h-16 rounded-full border border-emerald-500/20 flex items-center justify-center bg-emerald-500/5 backdrop-blur-sm">
            <BatteryCharging className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-emerald-500/70">Baixo Custo</span>
        </motion.div>

        <motion.div 
          animate={{ y: [0, -10, 0], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          className="absolute top-[75%] left-[8%] md:left-[20%] flex flex-col items-center gap-2 opacity-30 select-none"
        >
          <div className="w-14 h-14 rounded-full border border-sky-400/20 flex items-center justify-center bg-sky-400/5 backdrop-blur-sm">
            <Wind className="w-6 h-6 text-sky-400" />
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-sky-400/70">Silenciosa</span>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 15, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-[85%] right-[10%] md:right-[25%] flex flex-col items-center gap-2 opacity-30 select-none"
        >
          <div className="w-10 h-10 rounded-full border border-[#d4af37]/20 flex items-center justify-center bg-[#d4af37]/5 backdrop-blur-sm">
            <Globe2 className="w-4 h-4 text-[#d4af37]" />
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-[#a8a192]">Sustentável</span>
        </motion.div>
      </div>

      {/* Faixa Branca do Cabeçalho - Largura Total */}
      <header className="w-full bg-white border-b border-stone-200 py-5 px-4 relative z-20 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo e Nome da Marca */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {activeLogo ? (
              <img 
                src={activeLogo} 
                alt="Volt Motors Logo" 
                className="w-24 h-24 md:w-32 md:h-32 object-contain block mx-auto mix-blend-multiply filter contrast-125 brightness-105 saturate-150" 
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-stone-950 flex items-center justify-center shadow-lg mx-auto">
                <span className="text-[#d4af37] font-serif font-black text-2xl italic">V</span>
              </div>
            )}
            <div>
              <span className="block text-xl font-mono font-black tracking-[0.25em] text-stone-900 uppercase">
                VOLT MOTORS
              </span>
              <span className="block text-[10px] font-mono tracking-widest text-[#a8a192] uppercase mt-1">
                Mobilidade Elétrica & Inovação
              </span>
            </div>
          </div>

          {/* Vertical Divider (Visible on desktop) */}
          <div className="hidden md:block w-[1px] h-14 bg-stone-200" />

          {/* Endereço e Contatos das Lojas */}
          <div className="flex flex-col gap-4 text-center md:text-left text-stone-800 font-sans w-full md:w-auto mt-4 md:mt-0">
            {/* Matriz Address */}
            <div className="flex items-start gap-3 justify-center md:justify-start">
              <div className="p-2 border border-stone-200/60 bg-stone-50 rounded-lg shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-stone-700" />
              </div>
              <div>
                <span className="block text-[9px] font-sans tracking-widest text-stone-500 uppercase font-black mb-1">LOCALIZAÇÃO — MATRIZ</span>
                <p className="font-semibold text-stone-800 text-xs tracking-tight">Av. Rui Barbosa, 819</p>
                <p className="text-stone-500 text-[10px] uppercase tracking-wider">Patrocínio, Minas Gerais</p>
              </div>
            </div>

            {/* Email & Contact Rows */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center md:justify-start border-t border-stone-100 pt-4">
              {/* E-mail */}
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <a href="mailto:volttransportes@yahoo.com" className="text-[10px] text-stone-600 font-medium hover:text-stone-900 transition-colors">
                  volttransportes@yahoo.com
                </a>
              </div>

              {/* Phone Dials */}
              <div className="flex items-center gap-3">
                <Smartphone className="w-3.5 h-3.5 text-stone-400" />
                <div className="flex gap-3 text-[10px] font-mono text-stone-600 font-semibold">
                  <a href="https://wa.me/5534997416132" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 transition-colors flex items-center gap-1">
                    Bruno: (34) 99741-6132
                  </a>
                  <span className="text-stone-300">|</span>
                  <a href="https://wa.me/5534993343463" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 transition-colors flex items-center gap-1">
                    Fabiano: (34) 99334-3463
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Background elegant golden gradients simulating spot/warm lighting */}
      <div className="absolute top-[150px] left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-0 w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] pointer-events-none z-0" />
      
      <AnimatePresence mode="wait">
        {!selectedMoto ? (
          /* SHOWROOM PRINCIPAL - DESIGN DE ALTO PADRÃO COM TEMA ESCURO E LUZES QUENTES */
          <motion.div
            key="list"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col relative z-10 pt-8"
          >
            {/* Título do Showroom no Corpo da Página */}
            <div className="w-full max-w-4xl mx-auto text-center px-4 mb-14 pt-4 flex flex-col items-center">
              <span className="text-[#a8a192] tracking-[0.3em] text-[10px] md:text-xs font-mono font-bold uppercase mb-4 block drop-shadow-md">
                Volt Motors
              </span>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-[5rem] font-medium text-[#f4efe6] tracking-[-0.02em] select-none leading-tight drop-shadow-2xl">
                Showroom
              </h1>
              <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent mx-auto mt-8 mb-6"></div>
              <p className="text-sm md:text-base text-[#c4bcaa] font-sans tracking-wide max-w-lg mx-auto font-light leading-relaxed">
                Descubra a linha completa de veículos elétricos. Escolha seu próximo destino com tecnologia, performance e sustentabilidade.
              </p>
            </div>

            {/* Grid de Veículos */}
            <main className="max-w-md mx-auto px-4 w-full flex flex-col gap-8 mt-4">
              {loading ? (
                <div className="w-full flex flex-col items-center justify-center py-24 gap-3">
                  <div className="w-10 h-10 border-2 border-stone-800 border-t-[#d4af37] rounded-full animate-spin" />
                  <span className="text-xs font-mono text-stone-500 uppercase tracking-widest animate-pulse">Sincronizando Frota...</span>
                </div>
              ) : motorcycles.length === 0 ? (
                <div className="text-center py-16 bg-[#121212]/70 border border-[#262117] rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
                  <Sparkles className="w-8 h-8 text-[#d4af37]/40 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2 font-serif">Vitrine em Preparação</h3>
                  <p className="text-xs text-stone-500 font-light leading-relaxed">Nossos novos modelos estão passando por revisão estética de alta qualidade para o showroom.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-10">
                  {motorcycles.map((moto, index) => {
                    const specs = getMotoSpecifications(moto.name, moto.brand, moto.fuel);
                    return (
                      <motion.div
                        key={moto.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => setSelectedMoto(moto)}
                        className="bg-gradient-to-b from-[#141414] to-[#0d0d0d] rounded-3xl overflow-hidden border border-[#2e261a]/70 cursor-pointer transition-all duration-500 hover:border-[#d4af37]/90 active:scale-[0.99] group shadow-[0_10px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)] relative"
                      >
                        {/* Elegant Border Top glow effect */}
                        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Imagem Cover - Sem cortes e com fundo bem integrado */}
                        <div className="w-full bg-white relative overflow-hidden flex items-center justify-center border-b border-[#241f16] group-hover:bg-[#f8f8f8] transition-colors duration-500">
                          {moto.photoBase64 ? (
                            <img 
                              src={moto.photoBase64} 
                              alt={moto.name}
                              className="w-full h-auto max-h-[340px] sm:max-h-[380px] md:max-h-[420px] object-contain mix-blend-multiply block group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                            />
                          ) : (
                            <div className="w-full aspect-[4/3] flex flex-col items-center justify-center text-stone-600 bg-stone-900/50 gap-2">
                              <Sparkles className="w-6 h-6 text-stone-700" />
                              <span className="text-[10px] uppercase tracking-widest text-[#a8a192]/60 font-mono font-bold">Sem Foto Oficial</span>
                            </div>
                          )}
                          
                          {/* Warm Spotlight Overlay Effect */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
                          
                          {/* Year / Specs Tag */}
                          <div className="absolute top-4 left-4 bg-black/80 border border-[#d4af37]/30 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-[#f4efe6] font-mono tracking-wider">
                            Ano {moto.year}
                          </div>

                          {/* Detail hover badge */}
                          <div className="absolute bottom-3 right-3 bg-gradient-to-r from-[#b59344] to-[#d4af37] text-black px-3 py-1 rounded-lg text-[9px] font-mono tracking-widest font-black uppercase opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-md">
                            Ver Ficha Técnica
                            <ChevronRight className="w-2.5 h-2.5 stroke-[3px]" />
                          </div>
                        </div>

                        {/* Conteúdo Informativo */}
                        <div className="p-6 flex flex-col">
                          
                          {/* Marca & Modelo */}
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <span className="block text-[10px] font-mono text-[#d4af37] font-bold uppercase tracking-widest">
                                {moto.brand || "Concessionária Volt"}
                              </span>
                              <h3 className="text-xl font-serif font-extrabold text-white tracking-wide group-hover:text-[#d4af37] transition-colors">
                                {moto.name}
                              </h3>
                            </div>
                            
                            {/* Accent badge */}
                            <div className="w-8 h-8 rounded-full bg-[#1b1710] border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] group-hover:border-[#d4af37]/50 transition-colors">
                              <Zap className="w-4 h-4" />
                            </div>
                          </div>

                          {moto.subtitle && (
                            <p className="text-xs text-stone-400 font-light leading-relaxed mb-4 italic line-clamp-2">
                              "{moto.subtitle}"
                            </p>
                          )}

                          {/* Quick Spec Highlights Pills */}
                          <div className="grid grid-cols-3 gap-2.5 mb-5 mt-2 bg-black/40 p-2.5 rounded-xl border border-[#211d16]">
                            <div className="text-center py-1">
                              <span className="block text-[8px] font-mono text-stone-500 uppercase tracking-wider">Potência</span>
                              <span className="text-[11px] font-mono text-white font-bold">{moto.power || specs.power}</span>
                            </div>
                            <div className="text-center py-1 border-x border-[#211d16]">
                              <span className="block text-[8px] font-mono text-stone-500 uppercase tracking-wider">Km</span>
                              <span className="text-[11px] font-mono text-white font-bold">{moto.mileage} KM</span>
                            </div>
                            <div className="text-center py-1">
                              <span className="block text-[8px] font-mono text-stone-500 uppercase tracking-wider">Combustível</span>
                              <span className="text-[11px] font-mono text-[#d4af37] font-bold truncate block px-1" title={moto.fuel || specs.fuel}>{moto.fuel || specs.fuel}</span>
                            </div>
                          </div>

                          {/* Divider with spot light glow width */}
                          <div className="w-full h-[1px] bg-[#2E261A]/40 mb-4" />

                          {/* Bloco de Preço */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="block text-[9px] font-mono text-stone-500 uppercase tracking-wider">A partir de</span>
                              <div className="text-2xl font-serif font-black text-white tracking-wide">
                                {moto.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </div>
                            </div>

                            {moto.installments && (
                              <div className="text-right">
                                <span className="block text-[9px] font-mono text-[#d4af37] uppercase tracking-wider font-extrabold">Parcelado</span>
                                <div className="text-sm font-mono font-bold text-[#d4af37] bg-[#221b10] px-2.5 py-1 rounded-lg border border-[#4d3e23]/50">
                                  {moto.installments}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </main>
          </motion.div>
        ) : (
          /* DETALHE DO VEÍCULO - ESTILO MODERN COM TEMA ESCURO E LUZES QUENTES */
          <motion.div
            key="detail"
            initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg mx-auto flex flex-col min-h-screen relative z-10"
          >
            {/* Header fixo da página de produto */}
            <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md py-5 border-b border-[#2e261a]/60 px-4">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setSelectedMoto(null)}
                  className="flex items-center gap-1.5 text-[#a8a192] hover:text-[#d4af37] font-mono text-xs uppercase tracking-widest transition-colors font-extrabold"
                >
                  <ArrowLeft className="w-4 h-4 text-[#d4af37]" />
                  Voltar
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-[#d4af37]/35 bg-[#141414] flex items-center justify-center">
                    <span className="text-[#d4af37] font-serif font-black text-xs italic">V</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-white uppercase">VOLT</span>
                </div>
              </div>
            </div>

            {/* Imagem Grande de Destaque no Topo com spotlight aconchegante */}
            <div className="w-full bg-white relative overflow-hidden flex items-center justify-center border-b border-[#2c2214]/60">
              
              {/* Radial heat glow effect behind the vehicle */}
              <div className="absolute w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_65%)] pointer-events-none mix-blend-multiply" />

              {selectedMoto.photoBase64 ? (
                <img 
                  src={selectedMoto.photoBase64} 
                  alt={selectedMoto.name}
                  className="w-full h-auto max-h-[380px] sm:max-h-[450px] md:max-h-[520px] lg:max-h-[600px] object-contain mix-blend-multiply block z-10"
                />
              ) : (
                <div className="w-full aspect-[4/3] flex items-center justify-center text-stone-600 bg-stone-900/50">
                  <span className="text-xs uppercase tracking-widest text-[#a8a192]/60 font-mono font-bold">Imagem do Modelo</span>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-[#b59344] to-[#d4af37] text-black text-[9px] font-mono font-extrabold tracking-widest px-3 py-1.5 uppercase rounded-lg shadow-lg">
                Showroom Oficial
              </div>
            </div>

            <div className="px-5 py-8 bg-[#0c0c0c] border-b border-[#231a0e] relative">
              {/* Gold gradient top line glow */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />

              {/* Title Block */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono text-[#d4af37] font-bold uppercase tracking-[0.2em]">{selectedMoto.brand || "CONCESSIONÁRIA VOLT"}</span>
                <h1 className="text-3xl font-serif font-black text-white uppercase tracking-wide leading-none mt-1">
                  {selectedMoto.name}
                </h1>
                {selectedMoto.subtitle && (
                  <p className="text-[#a49a85] text-xs font-mono font-semibold uppercase mt-2 bg-[#1b1710] px-3 py-1 border border-[#d4af37]/10 w-fit rounded-md">
                    {selectedMoto.subtitle}
                  </p>
                )}
              </div>

              {/* Price Callout */}
              <div className="mt-8 pt-6 border-t border-[#2e261a]/60">
                <span className="text-[10px] uppercase text-stone-500 tracking-widest font-mono">Valor especial sob consulta</span>
                <div className="text-4xl font-serif font-black text-white mt-1 select-all tracking-wide">
                  {selectedMoto.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
                {selectedMoto.installments && (
                  <div className="text-xl font-mono font-extrabold text-[#d4af37] mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-ping" />
                    {selectedMoto.installments}
                  </div>
                )}
                <p className="text-[10px] text-stone-500 mt-3 font-mono leading-relaxed">
                  * Financiamento facilitado com taxas de showroom exclusivas. Cadastro digital imediato via WhatsApp.
                </p>
              </div>
            </div>

            {/* Destaques Técnicos - Bento Grid Shineray style */}
            <div className="px-5 py-8 bg-black/40">
              <h3 className="text-white font-serif font-bold text-lg uppercase tracking-wider mb-5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                Atributos Mecânicos
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Potência */}
                <div className="bg-[#121212] border border-[#2e261a]/70 p-4.5 rounded-2xl flex flex-col justify-between shadow-lg hover:border-[#d4af37]/30 transition-colors">
                  <Zap className="w-6 h-6 text-[#d4af37]" />
                  <div className="mt-4">
                    <span className="block text-[8px] text-stone-500 font-mono uppercase tracking-wider">Potência de Saída</span>
                    <span className="text-base font-serif font-black text-white uppercase mt-0.5 block">
                      {selectedMoto.power || getMotoSpecifications(selectedMoto.name, selectedMoto.brand, selectedMoto.fuel).power}
                    </span>
                  </div>
                </div>

                {/* Combustível */}
                <div className="bg-[#121212] border border-[#2e261a]/70 p-4.5 rounded-2xl flex flex-col justify-between shadow-lg hover:border-[#d4af37]/30 transition-colors">
                  <Fuel className="w-6 h-6 text-[#d4af37]" />
                  <div className="mt-4">
                    <span className="block text-[8px] text-stone-500 font-mono uppercase tracking-wider">Alimentação</span>
                    <span className="text-base font-serif font-black text-white uppercase mt-0.5 block truncate" title={selectedMoto.fuel || getMotoSpecifications(selectedMoto.name, selectedMoto.brand, selectedMoto.fuel).fuel}>
                      {selectedMoto.fuel || getMotoSpecifications(selectedMoto.name, selectedMoto.brand, selectedMoto.fuel).fuel}
                    </span>
                  </div>
                </div>

                {/* Velocidade Máx */}
                <div className="bg-[#121212] border border-[#2e261a]/70 p-4.5 rounded-2xl flex flex-col justify-between shadow-lg hover:border-[#d4af37]/30 transition-colors">
                  <Gauge className="w-6 h-6 text-[#d4af37]" />
                  <div className="mt-4">
                    <span className="block text-[8px] text-stone-500 font-mono uppercase tracking-wider">Velocidade Máxima</span>
                    <span className="text-base font-serif font-black text-white uppercase mt-0.5 block">
                      {selectedMoto.speed || getMotoSpecifications(selectedMoto.name, selectedMoto.brand, selectedMoto.fuel).speed}
                    </span>
                  </div>
                </div>

                {/* Transmissão */}
                <div className="bg-[#121212] border border-[#2e261a]/70 p-4.5 rounded-2xl flex flex-col justify-between shadow-lg hover:border-[#d4af37]/30 transition-colors">
                  <Disc className="w-6 h-6 text-[#d4af37]" />
                  <div className="mt-4">
                    <span className="block text-[8px] text-stone-500 font-mono uppercase tracking-wider">Transmissão</span>
                    <span className="text-base font-serif font-black text-white uppercase mt-0.5 block truncate">
                      {getMotoSpecifications(selectedMoto.name, selectedMoto.brand, selectedMoto.fuel).transmission}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* List details inspired directly by Shineray's checklist */}
            <div className="bg-[#0b0b0b] px-5 py-8 border-y border-[#2e261a]/40">
              <h3 className="text-white font-serif font-bold text-lg uppercase tracking-wider mb-5 flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#d4af37]" />
                Atributos Principais
              </h3>
              <div className="flex flex-col gap-5">
                {getMotoSpecifications(selectedMoto.name, selectedMoto.brand, selectedMoto.fuel).highlights.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#1b1710] border border-[#d4af37]/35 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
                    </div>
                    <div>
                      <h4 className="font-mono font-bold text-[11px] text-white uppercase tracking-widest">{item.label}</h4>
                      <p className="text-xs text-[#a8a192] mt-0.5 leading-relaxed font-light">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ficha Técnica completa estruturada em tabelas bicolor premium */}
            <div className="px-5 py-8 bg-black/80">
              <h3 className="text-white font-serif font-bold text-lg uppercase tracking-wider mb-5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#d4af37]" />
                Ficha Técnica
              </h3>

              {selectedMoto.description && (
                <p className="text-xs text-stone-400 mb-6 bg-[#0f0f0f] p-4.5 border border-[#2e261a]/60 rounded-xl leading-relaxed italic select-none">
                  "{selectedMoto.description}"
                </p>
              )}

              <div className="border border-[#2e261a]/50 rounded-2xl overflow-hidden shadow-2xl bg-[#0b0b0b]">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="bg-[#121212] border-b border-[#1f1a12]">
                      <td className="px-4 py-3.5 text-[10px] font-mono font-bold text-[#d4af37] uppercase w-1/3">Ano do Modelo</td>
                      <td className="px-4 py-3.5 text-xs text-white font-semibold">{selectedMoto.year} / {selectedMoto.year}</td>
                    </tr>
                    <tr className="bg-[#0b0b0b] border-b border-[#1f1a12]">
                      <td className="px-4 py-3.5 text-[10px] font-mono font-bold text-[#d4af37] uppercase">Odômetro</td>
                      <td className="px-4 py-3.5 text-xs text-white font-semibold">{selectedMoto.mileage} KM</td>
                    </tr>
                    {selectedMoto.color && (
                      <tr className="bg-[#121212] border-b border-[#1f1a12]">
                        <td className="px-4 py-3.5 text-[10px] font-mono font-bold text-[#d4af37] uppercase">Cor</td>
                        <td className="px-4 py-3.5 text-xs text-white font-semibold">{selectedMoto.color}</td>
                      </tr>
                    )}
                    {Object.entries(getMotoSpecifications(selectedMoto.name, selectedMoto.brand, selectedMoto.fuel).techSpecs).map(([key, val], idx) => (
                      <tr 
                        key={key} 
                        className={`${(selectedMoto.color ? idx + 1 : idx) % 2 === 0 ? 'bg-[#121212]' : 'bg-[#0b0b0b]'} border-b border-[#1f1a12] last:border-none`}
                      >
                        <td className="px-4 py-3.5 text-[10px] font-mono font-bold text-[#d4af37] uppercase">{key}</td>
                        <td className="px-4 py-3.5 text-xs text-[#eedec2] font-medium">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Concessionária info */}
              <div className="mt-8 bg-black p-5.5 rounded-2xl border border-[#2e261a] text-white flex gap-4 select-none shadow-xl">
                <div className="p-2.5 bg-gradient-to-br from-[#1c1811] to-[#2b2214] rounded-xl text-[#d4af37] w-fit shrink-0 self-start border border-[#d4af37]/25 animate-pulse">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#d4af37]">Garantia Assegurada Volt</h4>
                  <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                    Este veículo foi submetido a um rigoroso protocolo de testes em nossa matriz técnica antes de ser catalogado. Inclui suporte pós-venda premium.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Negociação Bar */}
            <div className="bg-black/90 backdrop-blur-md p-4 border-t border-[#2e261a]/60 shadow-2xl fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-50 flex gap-3">
              <a 
                href={`https://wa.me/5534997416132?text=Olá, tenho interesse no veículo *${selectedMoto.brand} ${selectedMoto.name}* do showroom. Ano: *${selectedMoto.year}*. Parcelas informadas: *${selectedMoto.installments || 'A Consultar'}*.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-center py-4.5 rounded-2xl font-mono font-black uppercase text-xs tracking-widest shadow-[0_4px_25px_rgba(16,185,129,0.35)] hover:shadow-[0_4px_35px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98]"
              >
                <Phone className="w-4 h-4 text-white shrink-0 fill-current" />
                Chamar no WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão WhatsApp Fixo (mostrado apenas quando na lista geral para conversas diretas) */}
      {!selectedMoto && (
        <a
          href="https://wa.me/5534997416132?text=Olá, tenho interesse em um veículo do showroom."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 w-16 h-16 bg-[#25d366] text-white rounded-full flex items-center justify-center shadow-2xl z-50 hover:scale-110 active:scale-95 transition-transform shadow-emerald-500/20 hover:shadow-emerald-500/40 border border-emerald-400/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
            <path d="M12.031 21.172c-1.854 0-3.649-.5-5.234-1.442l-.375-.224-3.89 1.02 1.04-3.791-.246-.39A11.025 11.025 0 0 1 1.637 11.1c0-6.103 4.966-11.07 11.072-11.07 2.96 0 5.74 1.152 7.828 3.243 2.09 2.091 3.242 4.871 3.242 7.831 0 6.096-4.967 11.068-11.066 11.068zm-5.753-3.136c1.554.919 3.327 1.405 5.176 1.405 5.14 0 9.324-4.184 9.324-9.324 0-2.493-.97-4.838-2.732-6.6a9.262 9.262 0 0 0-6.59-2.723c-5.14 0-9.327 4.184-9.327 9.326 0 1.942.548 3.821 1.583 5.438l1.328-4.856-4.664 1.22c.162-.515.344-.99.55-1.424z" />
            <path d="M8.618 7.37c-.38-.378-.853-.513-1.393-.513-.393 0-.74.122-1.002.355-.664.593-.96 1.55-.845 2.502.162 1.34 1.258 3.195 3.033 4.97 1.986 1.988 3.992 3.013 5.348 3.013.882 0 1.666-.34 2.164-.937.288-.344.417-.745.395-1.205-.03-.586-.33-1.073-.836-1.353l-2.42-1.356c-.503-.284-1.045-.252-1.496.09l-.822.62c-.172.13-.362.155-.55.06-1.424-.716-2.613-1.905-3.328-3.328-.106-.21-.059-.427.086-.606l.666-.8c.328-.396.386-.9.135-1.405L8.618 7.37z" />
          </svg>
        </a>
      )}
    </div>
  );
}
