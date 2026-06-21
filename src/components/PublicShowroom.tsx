import React, { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ShowroomMotorcycle } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  ArrowLeft,
  Zap,
  Fuel,
  Gauge,
  Disc,
  ShieldCheck,
  FileText,
  Compass,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Phone,
  MapPin,
  Mail,
  Smartphone,
  BatteryCharging,
  X,
  Volume2,
  VolumeX,
  Music,
  Play,
  Pause,
  Shuffle,
  Image as ImageIcon,
} from "lucide-react";
import ProfessionalFooter from "./ProfessionalFooter";

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
        {
          label: "Consumo Médio",
          value: "Faz até 45 km por litro de combustível",
        },
      ],
      techSpecs: {
        Motorização: "Monocilíndrico, 4 tempos, OHC",
        Transmissão: "4 velocidades semiautomática rotativa",
        Partida: "Elétrica e pedal para emergências",
        "Freio Dianteiro": "Tambor mecânico confiável",
        "Freio Traseiro": "Tambor mecânico com lona macia",
        "Capacidade de Carga": "Suporta com segurança até 140 kg",
        "Painel de instrumentos": "Analógico clássico com indicador de marchas",
      },
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
        { label: "Marchas", value: "Semiautomática rotativa suave" },
      ],
      techSpecs: {
        Motorização: "Monocilíndrico, 4T, OCH, refrigerador a ar",
        Transmissão: "4 velocidades sem embreagem manual",
        "Suspensão Dianteira": "Garfo telescópico hidráulico macio",
        "Suspensão Traseira": "Balança oscilante com duplo amortecimento",
        Pneus: "Dianteiro Aro 17 e Traseiro Aro 14",
        "Espaço Interno": "Pequeno porta-objetos abaixo do banco",
      },
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
        {
          label: "Potência do Cubo",
          value: "Motor elétrico reforçado de 2000W",
        },
        {
          label: "Autonomia por carga",
          value: "Até 45 km por recarga elétrica completa",
        },
        {
          label: "Bateria Tracionária",
          value: "60V 20Ah Chumbo-Ácido de alto ciclo",
        },
        {
          label: "Modo de Marcha",
          value: "Avanço e marcha ré com sinal sonoro",
        },
      ],
      techSpecs: {
        Motorização: "Elétrico de cubo traseiro Brushless",
        Bateria: "Conjunto de 5 baterias de 12V em série",
        "Tempo de Recarga": "6 a 8 horas para carregamento de 0 a 100%",
        "Freio Dianteiro":
          "Disco hidráulico ventilado com pinça de duplo pistão",
        "Freio Traseiro": "Tambor hidráulico com acionamento unificado",
        "Baú Traseiro": "Grade metálica integrada para sacolas e carga",
        Iluminação: "Farol redondo clássico e lanternas traseiras",
      },
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
        {
          label: "Cilindrada real",
          value: "123.6cc com alto torque de arrancada",
        },
        { label: "Partida", value: "Elétrica moderna e pedal auxiliar" },
        {
          label: "Tecnologia",
          value: "Entrada USB frontal integrada para celular",
        },
        {
          label: "Freio Hidráulico",
          value: "Disco de alta resposta e ventilação",
        },
      ],
      techSpecs: {
        Motor: "Monocilíndrico, 4 tempos, OHC, Refrigerado a ar",
        "Taxa de Compressão": "9.0:1 de alta confiabilidade",
        "Freio Dianteiro": "Disco hidráulico de pistão duplo",
        "Freio Traseiro": "Lona expansora mecânica clássica",
        "Capacidade de Carga": "150 kg (Piloto + garupa + acessórios)",
        "Porta-objetos": "Porta capacete útil abaixo do banco",
      },
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
        {
          label: "Injeção Eletrônica",
          value: "Módulo EFI calibrado para o Brasil",
        },
        {
          label: "Segurança",
          value: "Pneus originais Pirelli de alta durabilidade",
        },
        { label: "Iluminação", value: "Farol principal em bloco de LED" },
        {
          label: "Segurança Ativa",
          value: "Freio dianteiro a disco ventilado orbital",
        },
      ],
      techSpecs: {
        "Tipo de Motor": "Monocilíndrico de 4 tempos, OHC, refrigerado a ar",
        Alimentação: "Injeção eletrônica multiponto inteligente",
        "Painel principal": "Totalmente digital com hodômetro digital",
        Rodas: "Liga leve em tom grafite moderno premium",
        Transmissão: "Automática rotativa de 4 marchas sem manete",
        "Protetor térmico":
          "Incluso no escapamento em acabamento preto acetinado",
      },
    };
  }

  // General default fallback
  const fuelLower = motoFuel?.toLowerCase() || "";
  const isElectric =
    fuelLower.includes("energia") || fuelLower.includes("elétrica");

  return {
    power: "Elétrica / Combustão",
    speed: "65 km/h",
    tank: "Eficiente",
    fuel: "Energia / Flex",
    transmission: isElectric ? "Automática" : "Automática / Semiautomática",
    highlights: [
      {
        label: "Performance",
        value: "Desenvolvida para o trânsito urbano ágil",
      },
      { label: "Economia", value: "Baixo índice de fricção e manutenção" },
      { label: "Design", value: "Aerodinâmica projetada para conforto" },
      {
        label: "Garantia",
        value: "Qualidade revisada e validada na concessionária",
      },
    ],
    techSpecs: {
      Motorização: isElectric
        ? "Motorização elétrica"
        : "Motorização otimizada para o dia a dia",
      Transmissão: isElectric
        ? "Automática"
        : "Câmbio automático ou semiautomático simplificado",
      Chassis: "Monobloco reforçado de alta resistência",
      Freio: "Combinação otimizada para respostas curtas",
      Consumo: "Nível A de eficiência urbana",
    },
  };
}

function MotoListItemCard({
  moto,
  onClick,
}: {
  moto: ShowroomMotorcycle;
  onClick: (colorIndex: number) => void;
}) {
  const [localColorIndex, setLocalColorIndex] = useState(0);
  const specs = getMotoSpecifications(moto.name, moto.brand, moto.fuel);

  const activeVariant =
    moto.variants && moto.variants.length > 0
      ? moto.variants[localColorIndex]
      : { photoBase64: moto.photoBase64 || "" };

  // If there's no photo on current variant, fallback to primary photo or empty
  const mainPhoto = activeVariant.photoBase64 || moto.photoBase64 || "";

  const hasMultipleColors = moto.variants && moto.variants.length > 1;

  const nextColor = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!moto.variants) return;
    setLocalColorIndex((prev) =>
      prev === moto.variants!.length - 1 ? 0 : prev + 1,
    );
  };

  const prevColor = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!moto.variants) return;
    setLocalColorIndex((prev) =>
      prev === 0 ? moto.variants!.length - 1 : prev - 1,
    );
  };

  return (
    <div
      onClick={() => onClick(localColorIndex)}
      className="bg-gradient-to-b from-[#141414] to-[#0d0d0d] rounded-3xl overflow-hidden border border-[#2e261a]/70 cursor-pointer transition-all duration-500 hover:border-[#d4af37]/90 active:scale-[0.99] group shadow-[0_10px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)] relative"
    >
      {/* Elegant Border Top glow effect */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Imagem Cover - Sem cortes e com fundo bem integrado */}
      <div className="w-full bg-white relative overflow-hidden flex items-center justify-center border-b border-[#241f16] group-hover:bg-[#f8f8f8] transition-colors duration-500">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={moto.name}
            className="w-full h-auto max-h-[340px] sm:max-h-[380px] md:max-h-[420px] object-contain mix-blend-multiply block group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full aspect-[4/3] flex flex-col items-center justify-center text-stone-600 bg-stone-900/50 gap-2">
            <Sparkles className="w-6 h-6 text-stone-700" />
            <span className="text-[10px] uppercase tracking-widest text-[#a8a192]/60 font-mono font-bold">
              Sem Foto Oficial
            </span>
          </div>
        )}

        {/* Navigation Arrows for Variants */}
        {hasMultipleColors && (
          <>
            <button
              onClick={prevColor}
              className="absolute left-1 top-1/2 -translate-y-1/2 p-2 text-[#d4af37] drop-shadow-md transition-opacity z-20"
            >
              <ChevronLeft className="w-8 h-8 stroke-1" />
            </button>
            <button
              onClick={nextColor}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-[#d4af37] drop-shadow-md transition-opacity z-20"
            >
              <ChevronRight className="w-8 h-8 stroke-1" />
            </button>

            {/* Color indicator dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {moto.variants!.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${localColorIndex === idx ? "bg-[#d4af37] w-3 shadow-md" : "bg-black/30"}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Warm Spotlight Overlay Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

        {/* Year / Specs Tag */}
        <div className="absolute top-4 left-4 bg-black/80 border border-[#d4af37]/30 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-[#f4efe6] font-mono tracking-wider z-20">
          Ano {moto.year}
        </div>

        {/* Detail hover badge */}
        <div className="absolute bottom-4 right-4 bg-gradient-to-r from-[#b59344] to-[#d4af37] text-black px-4 py-2 rounded-xl text-[10px] font-mono tracking-widest font-black uppercase opacity-90 group-hover:opacity-100 transition-all flex items-center gap-1.5 shadow-lg shadow-black/50 z-20">
          Ver Ficha Técnica
          <ChevronRight className="w-3 h-3 stroke-[3px]" />
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
            <h3 className="text-xl font-serif font-extrabold text-white tracking-wide group-hover:text-[#d4af37] transition-colors line-clamp-1">
              {moto.name}{" "}
              {hasMultipleColors && (
                <span className="text-stone-500 text-sm font-sans font-light hidden sm:inline-block ml-1">
                  ({moto.variants![localColorIndex].colorName})
                </span>
              )}
            </h3>
          </div>

          {/* Accent badge */}
          <div className="w-8 h-8 rounded-full shrink-0 bg-[#1b1710] border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] group-hover:border-[#d4af37]/50 transition-colors">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        {moto.range && (
          <p className="text-xs text-stone-400 font-light leading-relaxed mb-4 italic line-clamp-2">
            Autonomia: {moto.range}
          </p>
        )}

        {/* Quick Spec Highlights Pills */}
        <div className={`grid ${moto.batteryType ? 'grid-cols-3' : 'grid-cols-2'} gap-2.5 mb-5 mt-2 bg-black/40 p-2.5 rounded-xl border border-[#211d16]`}>
          <div className="text-center py-1 overflow-hidden">
            <span className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider">
              Potência
            </span>
            <span className="text-[11px] font-mono text-white font-bold truncate block">
              {moto.power || specs.power}
            </span>
          </div>
          <div className="text-center py-1 border-l border-[#211d16] overflow-hidden">
            <span className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider">
              Km
            </span>
            <span className="text-[11px] font-mono text-white font-bold truncate block">
              {moto.mileage}
            </span>
          </div>
          {moto.batteryType && (
            <div className="text-center py-1 border-l border-[#211d16] overflow-hidden">
              <span className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider">
                Bateria
              </span>
              <span className="text-[11px] font-mono text-[#d4af37] font-bold truncate block max-w-full">
                {moto.batteryType}
              </span>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <span className="block text-[9px] font-mono text-stone-500 uppercase tracking-wider">
              A partir de
            </span>
            <div className="text-2xl font-serif font-black text-white tracking-wide">
              {moto.price.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          </div>

          {moto.installments && (
            <div className="text-right">
              <span className="block text-[9px] font-mono text-[#d4af37] uppercase tracking-wider font-extrabold">
                Parcelado
              </span>
              <div className="text-sm font-mono font-bold text-[#d4af37]">
                {moto.installments}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PublicShowroom({ activeLogo }: { activeLogo: string }) {
  const [motorcycles, setMotorcycles] = useState<ShowroomMotorcycle[]>(() => {
    try {
      const saved = localStorage.getItem("volt_motors_showroom_cached");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedMoto, setSelectedMoto] = useState<ShowroomMotorcycle | null>(
    null,
  );
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Swipe detection states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const activeVariant =
    selectedMoto?.variants && selectedMoto.variants.length > 0
      ? selectedMoto.variants[selectedColorIndex]
      : {
          colorName: selectedMoto?.color || "",
          photoBase64: selectedMoto?.photoBase64 || "",
          gallery: selectedMoto?.gallery || [],
        };

  const allPhotos = activeVariant?.photoBase64
    ? [activeVariant.photoBase64, ...(activeVariant.gallery || [])]
    : activeVariant?.gallery || [];

  const totalPhotos = allPhotos.length;

  useEffect(() => {
    if (selectedMoto) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [selectedMoto]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      // Always reset so auto slide can continue
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }
    const minSwipeDistance = 50;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      if (isLeftSwipe) {
        // Next image
        setCurrentGalleryIndex((prev) =>
          prev >= totalPhotos - 1 ? 0 : prev + 1,
        );
      } else {
        // Previous image
        setCurrentGalleryIndex((prev) =>
          prev <= 0 ? totalPhotos - 1 : prev - 1,
        );
      }
    }
    // Always reset after resolving swipe
    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    const colRef = collection(db, "showroom");
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data: ShowroomMotorcycle[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as ShowroomMotorcycle);
      });
      // Sort by newest and only available
      const sorted = data
        .filter((m) => m.status === "available")
        .sort((a, b) => {
          const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
          if (orderA !== orderB) return orderA - orderB;
          return b.createdAt - a.createdAt;
        });
      setMotorcycles(sorted);
      try {
        localStorage.setItem("volt_motors_showroom_cached", JSON.stringify(sorted));
      } catch (e) {
        console.error("Erro ao salvar cache do showroom:", e);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Erro ao carregar showroom em tempo real do Firestore - usando local cache backup:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedMoto && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }
  }, [selectedMoto]);

  // Auto-slide gallery every 5 seconds
  useEffect(() => {
    if (!selectedMoto || totalPhotos <= 1) return;

    // Clear the interval if dragging to avoid jumping while user is swiping
    if (touchStart !== null) return;

    const interval = setInterval(() => {
      setCurrentGalleryIndex((prev) =>
        prev >= totalPhotos - 1 ? 0 : prev + 1,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedMoto, touchStart, totalPhotos]);

  return (
    <div
      ref={scrollContainerRef}
      className="min-h-screen text-white font-sans w-full absolute inset-0 overflow-y-auto relative selection:bg-[#d4af37] selection:text-black overflow-x-hidden"
      style={{
        backgroundColor: "#08080a",
        backgroundImage: `
          radial-gradient(ellipse at 30% 0%, rgba(255, 180, 100, 0.12) 0%, transparent 60%),
          radial-gradient(ellipse at 70% 0%, rgba(255, 160, 80, 0.10) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 100%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
          linear-gradient(to bottom, rgba(50, 50, 54, 0.90) 0%, rgba(20, 20, 23, 0.96) 30%, rgba(8, 8, 10, 1) 100%), 
          url('https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?q=80&w=2000&auto=format&fit=crop')`,
        backgroundSize: "100% 100%, 100% 100%, 100% 100%, cover, cover",
        backgroundPosition: "top, top, bottom, center, center",
        backgroundAttachment: "fixed, fixed, fixed, fixed, fixed",
        backgroundBlendMode: "screen, screen, screen, normal, normal",
      }}
    >
      {/* Decorative Floating Background Elements Removed */}

      {/* Faixa Branca do Cabeçalho - Largura Total */}
      {!selectedMoto && (
        <header className="w-full bg-white border-b border-stone-200 py-3 px-4 relative z-20 shadow-sm">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo e Nome da Marca */}
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              {activeLogo ? (
                <img
                  src={activeLogo}
                  alt="Volt Motors Logo"
                  className="w-16 h-16 md:w-20 md:h-20 object-contain block mx-auto mix-blend-multiply filter brightness-150 contrast-125"
                  onError={(e) => {
                    const imgEl = e.currentTarget;
                    if (imgEl.src !== window.location.origin + "/logo.jpg" && imgEl.src !== "/logo.jpg") {
                      imgEl.src = "/logo.jpg";
                    }
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-stone-950 flex items-center justify-center shadow-md mx-auto">
                  <span className="text-[#d4af37] font-serif font-black text-xl italic">
                    V
                  </span>
                </div>
              )}
              <div>
                <span className="block text-lg md:text-xl font-mono font-black tracking-[0.2em] text-stone-900 uppercase">
                  VOLT MOTORS
                </span>
                <span className="block text-[9px] md:text-[10px] font-mono tracking-widest text-[#a8a192] uppercase mt-0.5">
                  Mobilidade Elétrica & Inovação
                </span>
              </div>
            </div>

            {/* Vertical Divider (Visible on desktop) */}
            <div className="hidden md:block w-[1px] h-10 bg-stone-200" />

            {/* Endereço e Contatos das Lojas */}
            <div className="flex flex-col gap-2.5 text-center md:text-left text-stone-800 font-sans w-full md:w-auto mt-2 md:mt-0">
              {/* Matriz Address */}
              <div className="flex items-center gap-3 justify-center md:justify-start text-left">
                <div className="p-1.5 border border-stone-200/60 bg-stone-50 rounded-full shrink-0 shadow-sm hidden sm:block">
                  <MapPin className="w-3.5 h-3.5 text-stone-700" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <div>
                    <span className="block text-[8px] font-sans tracking-widest text-stone-500 uppercase font-bold sm:mb-0.5">
                      MATRIZ
                    </span>
                    <p className="font-medium text-stone-800 text-xs tracking-tight">
                      Av. Rui Barbosa, 819 - Patrocínio, MG
                    </p>
                  </div>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Av.+Rui+Barbosa,+819,+Patrocínio,+Minas+Gerais"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[8px] uppercase tracking-widest font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md transition-colors border border-amber-200/60 mt-1 sm:mt-0 self-center hidden sm:flex"
                  >
                    <MapPin className="w-2.5 h-2.5" />
                    Maps
                  </a>
                </div>
              </div>

              {/* Email & Contact Rows */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 justify-center md:justify-start pt-1">
                {/* E-mail */}
                <div className="flex items-center gap-1.5 hidden sm:flex">
                  <Mail className="w-3 h-3 text-stone-400" />
                  <a
                    href="mailto:volttransportes@yahoo.com"
                    className="text-[9px] text-stone-600 font-medium hover:text-stone-900 transition-colors"
                  >
                    volttransportes@yahoo.com
                  </a>
                </div>

                {/* WhatsApp Contacts */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-2 text-[9px] font-mono font-bold uppercase tracking-wider text-[#25d366]">
                    <a
                      href="https://wa.me/5534997416132?text=Olá Bruno, tenho interesse em um veículo do showroom."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:bg-[#25d366]/10 px-2.5 py-1 rounded-md transition-colors border border-[#25d366]/30 bg-[#25d366]/5"
                    >
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                      </svg>
                      Bruno
                    </a>
                    <a
                      href="https://wa.me/5534993343463?text=Olá Fabiano, tenho interesse em um veículo do showroom."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:bg-[#25d366]/10 px-2.5 py-1 rounded-md transition-colors border border-[#25d366]/30 bg-[#25d366]/5"
                    >
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                      </svg>
                      Fabiano
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Background elegant golden gradients simulating spot/warm lighting */}
      <div className="absolute top-[150px] left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-0 w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] pointer-events-none z-0" />

      <AnimatePresence mode="wait">
        {!selectedMoto ? (
          /* SHOWROOM PRINCIPAL - DESIGN DE ALTO PADRÃO COM TEMA ESCURO E LUZES QUENTES */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full min-h-[calc(100vh-120px)] flex flex-col relative z-10 pt-8"
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
                Descubra a linha completa de veículos elétricos. Escolha seu
                próximo destino com tecnologia, performance e sustentabilidade.
              </p>
            </div>

            {/* Grid de Veículos */}
            <main className="max-w-md mx-auto px-4 w-full flex flex-col gap-8 mt-4">
              {loading ? (
                <div className="w-full flex flex-col items-center justify-center py-24 gap-3">
                  <div className="w-10 h-10 border-2 border-stone-800 border-t-[#d4af37] rounded-full animate-spin" />
                  <span className="text-xs font-mono text-stone-500 uppercase tracking-widest animate-pulse">
                    Sincronizando Frota...
                  </span>
                </div>
              ) : motorcycles.length === 0 ? (
                <div className="text-center py-16 bg-[#121212]/70 border border-[#262117] rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
                  <Sparkles className="w-8 h-8 text-[#d4af37]/40 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2 font-serif">
                    Vitrine em Preparação
                  </h3>
                  <p className="text-xs text-stone-500 font-light leading-relaxed">
                    Nossos novos modelos estão passando por revisão estética de
                    alta qualidade para o showroom.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-10">
                  {motorcycles.map((moto, index) => (
                    <motion.div
                      key={moto.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.08,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <MotoListItemCard
                        moto={moto}
                        onClick={(colorIndex) => {
                          setSelectedMoto(moto);
                          setSelectedColorIndex(colorIndex);
                          setCurrentGalleryIndex(0);
                          window.scrollTo({ top: 0, behavior: "instant" });
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </main>

            {/* Rodapé Profissional com Disclaimer e Info Desenvolvedor */}
            <div className="mt-48 pb-24 px-4 w-full flex justify-center">
              <ProfessionalFooter />
            </div>
          </motion.div>
        ) : (
          /* DETALHE DO VEÍCULO - ESTILO MODERN COM TEMA ESCURO E LUZES QUENTES */
          <motion.div
            key="detail"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg mx-auto flex flex-col min-h-screen relative z-10"
          >
            {/* Header fixo da página de produto */}
            <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md py-5 border-b border-[#2e261a]/60 px-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedMoto(null);
                  }}
                  className="flex items-center gap-1.5 text-[#a8a192] hover:text-[#d4af37] font-mono text-xs uppercase tracking-widest transition-colors font-extrabold"
                >
                  <ArrowLeft className="w-4 h-4 text-[#d4af37]" />
                  Voltar
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-[#d4af37]/35 bg-[#141414] flex items-center justify-center">
                    <span className="text-[#d4af37] font-serif font-black text-xs italic">
                      V
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-white uppercase">
                    VOLT
                  </span>
                </div>
              </div>
            </div>

            {/* Carousel de Imagens de Destaque */}
            <div
              className="w-full relative overflow-hidden flex items-center justify-center border-b border-[#2c2214]/60 group h-[380px] sm:h-[450px] md:h-[520px] lg:h-[600px] bg-[#080808]"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {(() => {
                const currentPhotoSrc =
                  totalPhotos > 0
                    ? allPhotos[
                        Math.min(
                          currentGalleryIndex,
                          Math.max(0, totalPhotos - 1),
                        )
                      ]
                    : null;

                return (
                  <>
                    {/* Radial heat glow effect behind the vehicle */}
                    <div className="absolute w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_65%)] pointer-events-none" />

                    {currentPhotoSrc ? (
                      <>
                        <AnimatePresence>
                          {/* Main Image Layer */}
                          <motion.img
                            key={currentGalleryIndex}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            src={currentPhotoSrc}
                            alt={`${selectedMoto.name} - Foto ${currentGalleryIndex + 1}`}
                            onClick={() => setFullscreenImage(currentPhotoSrc)}
                            className="absolute w-full h-full object-contain cursor-pointer"
                          />
                        </AnimatePresence>

                        {/* Navegação Sutil do Carousel */}
                        {totalPhotos > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentGalleryIndex((prev) =>
                                  prev <= 0 ? totalPhotos - 1 : prev - 1,
                                );
                              }}
                              className="absolute left-1 top-1/2 -translate-y-1/2 p-2 text-[#d4af37] drop-shadow-md transition-opacity z-20 cursor-pointer"
                            >
                              <ChevronLeft className="w-8 h-8 stroke-1" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentGalleryIndex((prev) =>
                                  prev >= totalPhotos - 1 ? 0 : prev + 1,
                                );
                              }}
                              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-[#d4af37] drop-shadow-md transition-opacity z-20 cursor-pointer"
                            >
                              <ChevronRight className="w-8 h-8 stroke-1" />
                            </button>

                            {/* Dots */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                              {Array.from({ length: totalPhotos }).map(
                                (_, idx) => (
                                  <div
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentGalleryIndex(idx);
                                    }}
                                    className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${currentGalleryIndex === idx ? "bg-[#d4af37] w-3 scale-110 shadow-sm" : "bg-black/20 hover:bg-black/40"}`}
                                  />
                                ),
                              )}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-600 bg-stone-900/50">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-30" />
                        <span className="text-xs uppercase tracking-widest text-[#a8a192]/60 font-mono font-bold">
                          Imagem Indisponível
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="px-5 py-8 bg-[#0c0c0c] border-b border-[#231a0e] relative">
              {/* Gold gradient top line glow */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />

              {/* Title Block */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono text-[#d4af37] font-bold uppercase tracking-[0.2em]">
                  {selectedMoto.brand || "CONCESSIONÁRIA VOLT"}
                </span>
                <h1 className="text-3xl font-serif font-black text-white uppercase tracking-wide leading-none mt-1">
                  {selectedMoto.name}
                </h1>
                {selectedMoto.range && (
                  <p className="text-[#a49a85] text-xs font-mono font-semibold uppercase mt-2 bg-[#1b1710] px-3 py-1 border border-[#d4af37]/10 w-fit rounded-md flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#d4af37]" /> Autonomia:{" "}
                    {selectedMoto.range}
                  </p>
                )}
              </div>

              {/* Seletor de Cores / Variantes */}
              {selectedMoto.variants && selectedMoto.variants.length > 1 && (
                <div className="mt-6 flex flex-col gap-2">
                  <span className="text-[10px] uppercase text-stone-500 tracking-widest font-mono">
                    Disponível nas Cores:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedMoto.variants.map((v, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedColorIndex(idx);
                          setCurrentGalleryIndex(0);
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase tracking-wider transition-colors border ${
                          selectedColorIndex === idx
                            ? "bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]"
                            : "bg-black/30 text-stone-400 border-stone-800 hover:border-stone-600"
                        }`}
                      >
                        {v.colorName || `Cor ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Callout */}
              <div className="mt-10 pt-8 border-t border-[#2e261a]/60">
                <span className="text-[10px] uppercase text-stone-500 tracking-widest font-mono">
                  Valor especial sob consulta
                </span>
                <div className="text-5xl font-serif font-black text-white mt-3 mb-1 select-all tracking-wide">
                  {selectedMoto.price.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
                {selectedMoto.installments && (
                  <div className="text-lg font-mono font-extrabold text-[#d4af37] mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-ping" />
                    {selectedMoto.installments}
                  </div>
                )}
                <p className="text-[10px] text-stone-500 mt-3 font-mono leading-relaxed">
                  * Financiamento facilitado com taxas de showroom exclusivas.
                  Cadastro digital imediato via WhatsApp.
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
                <div className="bg-[#121212] border border-[#2e261a]/70 p-5 rounded-2xl flex flex-col justify-between shadow-md hover:border-[#d4af37]/30 transition-colors relative transform-gpu">
                  <Zap className="w-6 h-6 text-[#d4af37]" />
                  <div className="mt-4">
                    <span className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider">
                      Potência de Saída
                    </span>
                    <span className="text-sm sm:text-base font-serif font-black text-white uppercase mt-0.5 block leading-tight break-words">
                      {selectedMoto.power ||
                        getMotoSpecifications(
                          selectedMoto.name,
                          selectedMoto.brand,
                          selectedMoto.fuel,
                        ).power}
                    </span>
                  </div>
                </div>

                {/* Velocidade Máx */}
                <div className="bg-[#121212] border border-[#2e261a]/70 p-5 rounded-2xl flex flex-col justify-between shadow-md hover:border-[#d4af37]/30 transition-colors relative transform-gpu">
                  <Gauge className="w-6 h-6 text-[#d4af37]" />
                  <div className="mt-4">
                    <span className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider">
                      Velocidade Máxima
                    </span>
                    <span className="text-sm sm:text-base font-serif font-black text-white uppercase mt-0.5 block leading-tight break-words">
                      {selectedMoto.speed ||
                        getMotoSpecifications(
                          selectedMoto.name,
                          selectedMoto.brand,
                          selectedMoto.fuel,
                        ).speed}
                    </span>
                  </div>
                </div>

                {/* Transmissão */}
                <div className="bg-[#121212] border border-[#2e261a]/70 p-5 rounded-2xl flex flex-col justify-between shadow-md hover:border-[#d4af37]/30 transition-colors relative transform-gpu">
                  <Disc className="w-6 h-6 text-[#d4af37]" />
                  <div className="mt-4">
                    <span className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider">
                      Transmissão
                    </span>
                    <span className="text-sm sm:text-base font-serif font-black text-white uppercase mt-0.5 block leading-tight break-words">
                      {
                        getMotoSpecifications(
                          selectedMoto.name,
                          selectedMoto.brand,
                          selectedMoto.fuel,
                        ).transmission
                      }
                    </span>
                  </div>
                </div>

                {/* Tipo de Bateria */}
                {selectedMoto.batteryType && (
                    <div className="bg-[#121212] border border-[#2e261a]/70 p-5 rounded-2xl flex flex-col justify-between shadow-md hover:border-[#d4af37]/30 transition-colors relative transform-gpu">
                      <BatteryCharging className="w-6 h-6 text-[#d4af37]" />
                      <div className="mt-4">
                        <span className="block text-[10px] text-stone-500 font-mono uppercase tracking-wider">
                          Tipo de Bateria
                        </span>
                        <span className="text-sm sm:text-base font-serif font-black text-white uppercase mt-0.5 block leading-tight break-words">
                          {selectedMoto.batteryType}
                        </span>
                      </div>
                    </div>
                )}
              </div>
            </div>

            {/* List details inspired directly by Shineray's checklist */}
            <div className="bg-[#0b0b0b] px-5 py-8 border-y border-[#2e261a]/40">
              <h3 className="text-white font-serif font-bold text-lg uppercase tracking-wider mb-5 flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#d4af37]" />
                Atributos Principais
              </h3>
              <div className="flex flex-col gap-5">
                {getMotoSpecifications(
                  selectedMoto.name,
                  selectedMoto.brand,
                  selectedMoto.fuel,
                ).highlights.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#1b1710] border border-[#d4af37]/35 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
                    </div>
                    <div>
                      <h4 className="font-mono font-bold text-[11px] text-white uppercase tracking-widest">
                        {item.label}
                      </h4>
                      <p className="text-xs text-[#a8a192] mt-0.5 leading-relaxed font-light">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ficha Técnica completa estruturada em tabelas bicolor premium */}
            <div className="px-5 py-8 bg-black/80 pb-32">
              <h3 className="text-white font-serif font-bold text-lg uppercase tracking-wider mb-5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#d4af37]" />
                Ficha Técnica
              </h3>

              {selectedMoto.description && (
                <p className="text-xs text-stone-400 mb-6 bg-[#0f0f0f] p-4 sm:p-5 border border-[#2e261a]/60 rounded-xl leading-relaxed italic select-none">
                  "{selectedMoto.description}"
                </p>
              )}

              <div className="border border-[#2e261a]/50 rounded-2xl overflow-hidden shadow-2xl bg-[#0b0b0b]">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="bg-[#121212] border-b border-[#1f1a12]">
                      <td className="px-4 py-3.5 text-[10px] font-mono font-bold text-[#d4af37] uppercase w-1/3">
                        Ano do Modelo
                      </td>
                      <td className="px-4 py-3.5 text-xs text-white font-semibold">
                        {selectedMoto.year} / {selectedMoto.year}
                      </td>
                    </tr>
                    <tr className="bg-[#0b0b0b] border-b border-[#1f1a12]">
                      <td className="px-4 py-3.5 text-[10px] font-mono font-bold text-[#d4af37] uppercase">
                        Odômetro
                      </td>
                      <td className="px-4 py-3.5 text-xs text-white font-semibold">
                        {selectedMoto.mileage} KM
                      </td>
                    </tr>
                    {selectedMoto.color && (
                      <tr className="bg-[#121212] border-b border-[#1f1a12]">
                        <td className="px-4 py-3.5 text-[10px] font-mono font-bold text-[#d4af37] uppercase">
                          Cor
                        </td>
                        <td className="px-4 py-3.5 text-xs text-white font-semibold">
                          {selectedMoto.color}
                        </td>
                      </tr>
                    )}
                    {Object.entries(
                      getMotoSpecifications(
                        selectedMoto.name,
                        selectedMoto.brand,
                        selectedMoto.fuel,
                      ).techSpecs,
                    ).map(([key, val], idx) => (
                      <tr
                        key={key}
                        className={`${(selectedMoto.color ? idx + 1 : idx) % 2 === 0 ? "bg-[#121212]" : "bg-[#0b0b0b]"} border-b border-[#1f1a12] last:border-none`}
                      >
                        <td className="px-4 py-3.5 text-[10px] font-mono font-bold text-[#d4af37] uppercase">
                          {key}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#eedec2] font-medium">
                          {val}
                        </td>
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
                  <h4 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#d4af37]">
                    Garantia Assegurada Volt
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                    Este veículo foi submetido a um rigoroso protocolo de testes
                    em nossa matriz técnica antes de ser catalogado. Inclui
                    suporte pós-venda premium.
                  </p>
                </div>
              </div>

              {/* Rodapé Profissional com Disclaimer e Info Desenvolvedor */}
              <ProfessionalFooter className="!mb-8 border-none bg-transparent shadow-none !mt-12 !px-0" />
            </div>

            {/* CTA Negociação Bar */}
            <div className="bg-[#050505]/95 backdrop-blur-xl p-4 sm:p-5 border-t border-[#2e261a]/60 shadow-2xl fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-50">
              <p className="text-center text-[10px] text-stone-400 font-mono tracking-widest uppercase mb-3 font-semibold">
                Falar com Consultor
              </p>
              <div className="flex gap-3">
                <a
                  href={`https://wa.me/5534997416132?text=${encodeURIComponent(`Olá Bruno, tenho interesse no veículo *${selectedMoto.brand} ${selectedMoto.name}* do showroom.\nAno: *${selectedMoto.year}*.\nParcelas informadas: *${selectedMoto.installments || "A Consultar"}*.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-center py-4 rounded-xl font-mono font-black uppercase text-[11px] tracking-widest shadow-[0_4px_25px_rgba(16,185,129,0.35)] hover:shadow-[0_4px_35px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98]"
                >
                  <Phone className="w-4 h-4 text-white shrink-0 fill-current" />
                  Bruno
                </a>
                <a
                  href={`https://wa.me/5534993343463?text=${encodeURIComponent(`Olá Fabiano, tenho interesse no veículo *${selectedMoto.brand} ${selectedMoto.name}* do showroom.\nAno: *${selectedMoto.year}*.\nParcelas informadas: *${selectedMoto.installments || "A Consultar"}*.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-center py-4 rounded-xl font-mono font-black uppercase text-[11px] tracking-widest shadow-[0_4px_25px_rgba(16,185,129,0.35)] hover:shadow-[0_4px_35px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98]"
                >
                  <Phone className="w-4 h-4 text-white shrink-0 fill-current" />
                  Fabiano
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          >
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all z-[110]"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="w-full h-full" onClick={(e) => {
              // Only close if clicking the backdrop, not the image itself
              if (e.target === e.currentTarget) {
                setFullscreenImage(null);
              }
            }}>
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={5}
                centerOnInit={true}
                wheel={{ step: 0.1 }}
                pinch={{ step: 5 }}
                doubleClick={{ mode: "zoomIn" }}
              >
                <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                  <motion.img
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    src={fullscreenImage}
                    alt="Fullscreen view"
                    className="max-w-[100vw] max-h-[100vh] object-contain cursor-move"
                  />
                </TransformComponent>
              </TransformWrapper>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
