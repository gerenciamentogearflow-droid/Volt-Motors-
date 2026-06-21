import { Info, ShieldCheck, Mail, Phone } from "lucide-react";

interface ProfessionalFooterProps {
  className?: string;
  isLight?: boolean;
}

export default function ProfessionalFooter({ className = "", isLight = false }: ProfessionalFooterProps) {
  return (
    <footer 
      id="professional-site-footer"
      className={`w-full max-w-lg mx-auto px-6 py-12 border-t text-center select-none rounded-[2rem] shadow-2xl transition-all duration-300 ${
        isLight 
          ? "border-stone-200 bg-stone-50/90 text-stone-700" 
          : "border-[#2e261a]/40 bg-[#0a0a0a]/95 text-[#a8a192]"
      } ${className}`}
    >
      <div className="flex flex-col gap-6 text-center">
        {/* Catálogo Disclaimer */}
        <div id="catalog-disclaimer" className="space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-widest uppercase font-bold text-[#d4af37]">
            <Info className="w-3.5 h-3.5 text-[#d4af37]" />
            Catálogo Digital Demonstrativo
          </div>
          <p className="text-[11px] sm:text-xs leading-relaxed font-light text-stone-400">
            Este site funciona como um catálogo virtual exclusivo de consulta e demonstração técnica. 
            Nossa plataforma <span className="font-semibold text-rose-400">não realiza vendas diretas</span> ou transações financeiras online. 
            Para efetuar qualquer compra, simulação de parcelamento ou tirar dúvidas, por favor, entre em contato diretamente com nossos representantes autorizados no WhatsApp: 
            fale com o <span className={`font-semibold ${isLight ? "text-stone-900" : "text-[#d4af37]"}`}>Bruno</span> ou o <span className={`font-semibold ${isLight ? "text-stone-900" : "text-[#d4af37]"}`}>Fabiano</span>.
            <br /><br />
            <span className="font-semibold text-rose-400/90">Aviso de Segurança:</span> Todos os pagamentos referentes às compras são realizados <span className="font-semibold text-rose-400/90">exclusivamente de forma presencial</span> em nossa loja física, a fim de evitar qualquer tipo de golpe ou fraude. A Volt Transportes Elétricos não se responsabiliza por eventuais prejuízos financeiros decorrentes de transações externas ou golpes virtuais.
          </p>
        </div>

        {/* Separador Elegant */}
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent mx-auto"></div>

        {/* Corporate S.A. Info */}
        <div id="corporate-info" className="space-y-3">
          <p className={`text-xs font-bold font-serif tracking-wide ${isLight ? "text-stone-900" : "text-white"}`}>
            VOLT TRANSPORTES ELÉTRICOS E IMPORTAÇÕES
          </p>
          <p className="text-[11px] font-mono font-medium tracking-wide">
            CNPJ: <span className="font-bold select-all">63.586.302/0001-03</span>
          </p>
          <p className="text-[11px] font-sans leading-tight">
            Avenida Rui Barbosa, 819 — Patrocínio, MG
          </p>
          <p className="text-[10px] text-stone-500 mt-4 uppercase font-mono tracking-widest">
            © 2026 Volt Motors. Todos os direitos reservados.
          </p>
        </div>

        {/* Separador Elegant */}
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent mx-auto my-2"></div>

        {/* Creator / Developer Credits (Mafran Souza Junior) */}
        <div id="developer-credits" className="space-y-1.5 pt-2 opacity-70">
          <p className="text-[7px] font-sans text-stone-500 uppercase tracking-widest">
            Desenvolvido por
          </p>
          <p className={`text-[9px] font-sans font-bold tracking-wider uppercase ${isLight ? "text-stone-900" : "text-[#eedec2]"}`}>
            Mafran Souza Junior
          </p>
          <div className="flex items-center justify-center gap-0.5 text-[8px] font-mono text-[#d4af37] font-medium opacity-80">
            <Phone className="w-2 h-2" />
            <span className="select-all">(31) 98613-8576</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
