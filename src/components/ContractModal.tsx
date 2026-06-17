import React, { useState, useRef, useEffect } from "react";
import { X, Calendar, FileText, CheckCircle, ShieldCheck, Printer, ArrowLeft, Trash2, Key, Award, Share2, Loader, Eye, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Contract, MaintenanceReminder } from "../types";

interface ContractModalProps {
  onClose: () => void;
  contracts: Contract[];
  onSaveContract: (contracts: Contract[]) => void;
  currentUser: { name: string; email: string; password?: string };
  contractSequence: number;
  saveContractSequence: (seq: number) => void;
  activeLogo: string;
  maintenanceReminders: MaintenanceReminder[];
  onSaveMaintenance: (maintenances: MaintenanceReminder[]) => void;
}



export default function ContractModal({ onClose, contracts, onSaveContract, currentUser, contractSequence, saveContractSequence, activeLogo, maintenanceReminders, onSaveMaintenance }: ContractModalProps) {
  const [activeTab, setActiveTab] = useState<"issue" | "list">("issue");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Form states
  const [marca, setMarca] = useState("VOLT MOTORS");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  const [cor, setCor] = useState("");
  const [chassi, setChassi] = useState("");
  const [acessorios, setAcessorios] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [cpfCliente, setCpfCliente] = useState("");
  const [enderecoCliente, setEnderecoCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [tempoGarantia, setTempoGarantia] = useState("3 Meses");
  const [formaPagamento, setFormaPagamento] = useState("Pix");
  const [valor, setValor] = useState<number | "">("");
  const [valorInput, setValorInput] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [nomeVendedor, setNomeVendedor] = useState(currentUser.name || "");
  const [isSigned, setIsSigned] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [contractReady, setContractReady] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  // Deletion logic
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  
  // A senha de exclusão é a mesma de acesso ao sistema
  const SYSTEM_ACCESS_PASSWORD = currentUser.password || "728"; 

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);
  const [fullScreenScale, setFullScreenScale] = useState(1);

  useEffect(() => {
    if (!showFullScreenPreview || !selectedContract) return;

    const updateFullScreenScale = () => {
      const winWidth = window.innerWidth;
      
      const paddingX = winWidth < 640 ? 16 : 48;
      const availableWidth = winWidth - paddingX;
      
      const scaleX = availableWidth / 794;
      
      // We don't restrict by height (scaleY) anymore, allowing vertical scrolling.
      // And we allow a minimum scale so it's readable on mobile, which encourages panning.
      const fitScale = winWidth < 640 ? Math.max(0.6, scaleX) : Math.min(scaleX, 1.25);
      
      setFullScreenScale(fitScale);
    };

    updateFullScreenScale();
    window.addEventListener("resize", updateFullScreenScale);

    return () => {
      window.removeEventListener("resize", updateFullScreenScale);
    };
  }, [showFullScreenPreview, selectedContract]);

  useEffect(() => {
    if (!selectedContract) return;
    
    const updateScale = () => {
      const winWidth = window.innerWidth;
      // Provide adequate horizontal margins on small viewports
      const padding = winWidth < 640 ? 24 : 64;
      const availableWidth = winWidth - padding;
      const targetWidth = 794; // A4 proportional base width
      if (availableWidth < targetWidth) {
        setScale(Math.max(0.25, availableWidth / targetWidth));
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, [selectedContract]);

  const renderActiveContractPage = (elementId: string, currentScale: number, isPrintMode = false) => {
    if (!selectedContract) return null;

    // Split customHtml into two pages if it exists
    let p1Html = "";
    let p2Html = "";
    if (selectedContract.customHtml) {
      if (selectedContract.customHtml.includes("<!-- PAGE_SPLIT -->")) {
        const parts = selectedContract.customHtml.split("<!-- PAGE_SPLIT -->");
        p1Html = parts[0];
        p2Html = parts[1] || "";
      } else {
        // Old contract dynamic fallback split
        const html = selectedContract.customHtml;
        const match = html.match(/<strong[^>]*>[^<]*CL[ÁA]USULA QU[AÁ]RTA.*?<\/strong>/i) 
                   || html.match(/<strong[^>]*>[^<]*CL[ÁA]USULA QU[AÁ]RTA/i)
                   || html.match(/CL[ÁA]USULA QU[AÁ]RTA – DA GARANTIA/i);

        if (match && match.index !== undefined) {
          const splitIndex = match.index;
          const lastOpenTagIndex = html.lastIndexOf("<div", splitIndex);
          if (lastOpenTagIndex !== -1 && lastOpenTagIndex > html.lastIndexOf("</div>", splitIndex)) {
            p1Html = html.substring(0, lastOpenTagIndex);
            p2Html = html.substring(lastOpenTagIndex);
          } else {
            p1Html = html.substring(0, splitIndex);
            p2Html = html.substring(splitIndex);
          }
        } else {
          p1Html = html;
          p2Html = "";
        }
      }
    }

    const renderWarrantyClause = () => {
      if (selectedContract.tempoGarantia === "3 Meses") {
        return (
          <p className="text-justify">
            A garantia contratual de <strong className="text-stone-950">3 (três) meses</strong> está condicionada à realização das manutenções preventivas recomendadas pela empresa, devendo o veículo retornar para inspeção técnica a cada 30 dias dentro do tempo de garantia. A garantia não cobrirá defeitos decorrentes da falta de manutenção, uso inadequado, acidentes, modificações não autorizadas ou desgaste natural dos componentes.
          </p>
        );
      }
      
      if (selectedContract.tempoGarantia === "1 Ano") {
        return (
          <div className="space-y-2 text-justify">
            <p>
              A garantia contratual de <strong className="text-stone-950">12 (doze) meses</strong> concedida pela empresa está condicionada à realização das inspeções e manutenções preventivas periódicas previstas neste contrato.
            </p>
            <p>O comprador compromete-se a apresentar o veículo para inspeção técnica nos seguintes períodos:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>30 dias após a entrega do veículo;</li>
              <li>90 dias após a entrega do veículo;</li>
              <li>A cada 3 (três) meses durante todo o período de garantia.</li>
            </ul>
            <p>
              As inspeções e manutenções serão realizadas mediante cobrança dos valores vigentes na tabela de serviços da empresa na data do atendimento. As revisões têm como finalidade verificar o estado geral do veículo, reaperto de fixações, sistema de freios, suspensão, conexões elétricas, bateria, pneus e demais componentes relacionados à segurança e ao correto funcionamento do produto.
            </p>
            <p>
              A garantia não cobrirá defeitos decorrentes de falta de manutenção preventiva, utilização inadequada, acidentes, modificações não autorizadas, instalação de acessórios incompatíveis, infiltração de água, danos causados por terceiros ou desgaste natural dos componentes. O não comparecimento às revisões obrigatórias poderá resultar na perda da cobertura de garantia para os componentes cuja falha esteja relacionada à ausência da manutenção preventiva recomendada.
            </p>
          </div>
        );
      }

      if (selectedContract.tempoGarantia === "2 Anos") {
        return (
          <div className="space-y-2 text-justify">
            <p>
              A garantia contratual de <strong className="text-stone-950">24 (vinte e quatro) meses</strong> concedida pela empresa está condicionada à realização das inspeções e manutenções preventivas periódicas previstas neste contrato.
            </p>
            <p>O comprador compromete-se a apresentar o veículo para inspeção técnica nos seguintes períodos:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>30 dias após a entrega do veículo;</li>
              <li>3 meses após a entrega do veículo;</li>
              <li>A cada 3 (três) meses até o término da garantia de 24 (vinte e quatro) meses.</li>
            </ul>
            <p>
              As inspeções e manutenções serão realizadas mediante cobrança dos valores vigentes na tabela de serviços da empresa na data do atendimento. As revisões têm como finalidade verificar o estado geral do veículo, reaperto de fixações, sistema de freios, suspensão, conexões elétricas, bateria, carregador, pneus e demais componentes relacionados à segurança e ao correto funcionamento do produto.
            </p>
            <p>
              A garantia não cobrirá defeitos decorrentes de falta de manutenção preventiva, utilização inadequada, acidentes, modificações não autorizadas, instalação de acessórios incompatíveis, infiltração de água, danos causados por terceiros ou desgaste natural dos componentes. O não comparecimento às revisões obrigatórias poderá resultar na perda da cobertura de garantia para os componentes cuja falha esteja relacionada à ausência da manutenção preventiva recomendada.
            </p>
          </div>
        );
      }

      // Default fallback
      return (
        <p className="text-justify">
          O veículo elétrico indicado gozará de garantia técnica de fábrica e showroom pelo período improrrogável de <strong className="text-stone-950 font-semibold">{selectedContract.tempoGarantia}</strong> a contar da data de entrega final. A entrega física do bem está programada para ocorrer no showroom no dia <strong className="text-stone-800 font-sans font-bold">{(() => { try { const d = new Date(selectedContract.dataEntrega + "T00:00:00"); return isNaN(d.getTime()) ? selectedContract.dataEntrega : d.toLocaleDateString("pt-BR"); } catch (e) { return selectedContract.dataEntrega; } })()}</strong>.
        </p>
      );
    };

    return (
      <div
        id={elementId}
        style={{
          transform: isPrintMode ? "none" : `scale(${currentScale})`,
          transformOrigin: "top left",
          width: "794px",
          display: "flex",
          flexDirection: "column",
          gap: isPrintMode ? "0px" : "32px",
          backgroundColor: "transparent",
        }}
        className="select-text print:!transform-none print:!gap-0 print:!w-full"
      >
        {/* PAGE 1 */}
        <div
          id={`${elementId}-page1`}
          style={{
            width: "794px",
            height: "1123px",
            backgroundColor: "#ffffff",
            color: "#1c1917",
            padding: "2cm",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            fontFamily: "Georgia, 'Times New Roman', serif",
            lineHeight: "1.4",
            fontSize: "11px",
            boxSizing: "border-box",
            justifyContent: "space-between"
          }}
          className="border border-stone-300 shadow-2xl relative shrink-0 print:border-0 print:shadow-none print:break-after-page print:w-full"
        >
          {/* Watermark 1 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none text-center">
            <div style={{ borderColor: "#1c1917" }} className="w-[500px] h-[500px] border-8 rounded-full flex items-center justify-center p-8">
              <span className="text-5xl font-sans tracking-widest font-black uppercase rotate-[-30deg]">VOLT MOTORS</span>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            {/* Official Document Header */}
            <div style={{ borderBottomColor: "#1c1917" }} className="text-center space-y-4 pb-6 border-b-2 font-sans">
              <div className="mx-auto flex flex-col items-center justify-center select-none py-1 pb-3">
                <div className="flex flex-col items-center select-none leading-none">
                  {/* Styled precisely like the brand logomarca */}
                  <span className="font-display italic font-black text-5xl tracking-tighter text-stone-950">
                    Volt
                  </span>
                  <span className="font-display text-[10px] tracking-[0.55em] text-stone-500 uppercase font-black mr-[-0.55em] mt-1.5">
                    MOTORS
                  </span>
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-stone-950 mb-1">
                Instrumento Particular de Contrato de Compra e Venda
              </h1>
            </div>

            {/* Clauses Page 1 */}
            {selectedContract.customHtml ? (
              <div 
                id={`${elementId}-editable-body1`}
                contentEditable={isDraft}
                suppressContentEditableWarning={true}
                className={`space-y-5 flex-1 ${isDraft ? 'focus:outline-none focus:ring-1 focus:ring-amber-500/30 rounded-lg p-2 -m-2' : ''}`}
                dangerouslySetInnerHTML={{ __html: p1Html }} 
              />
            ) : (
              <div id={`${elementId}-editable-body1`} contentEditable={isDraft} suppressContentEditableWarning={true} className={`space-y-5 flex-1 ${isDraft ? 'focus:outline-none focus:ring-1 focus:ring-amber-500/30 rounded-lg p-2 -m-2' : ''}`}>
                
                {/* Part 1: Parties */}
                <div className="space-y-1.5">
                  <strong style={{ borderBottomColor: "#e5e5e5" }} className="text-stone-950 uppercase font-sans text-[10px] tracking-widest block mb-1 border-b pb-1">CLÁUSULA PRIMEIRA – DAS PARTES CONTRATANTES</strong>
                  <p className="text-justify text-[11px] leading-[1.4]">
                    <strong className="font-bold text-stone-950 uppercase">VENDEDOR:</strong> <span className="font-semibold">VOLT TRANSPORTES ELÉTRICOS E IMPORTAÇÕES</span>, sociedade devidamente inscrita no CNPJ/ME sob o nº <span className="font-bold font-sans font-semibold">63.586.302/0001-03</span>, com sede estabelecida na Avenida Rui Barbosa, nº 819, Patrocínio-MG, e-mail institucional <span className="font-sans text-stone-950 italic">volttransportes@yahoo.com</span>, neste ato representada por seu consultor e representante legal <span className="font-semibold underline">{selectedContract.sellerName}</span>.
                  </p>
                  <p className="text-justify text-[11px] leading-[1.4]">
                    <strong className="font-bold text-stone-950 uppercase">COMPRADOR:</strong> Sr.(a) <span className="font-bold text-stone-950 underline">{selectedContract.nomeCliente}</span>, portador(a) do CPF/MF sob o nº <span className="font-bold text-stone-950 font-sans font-semibold">{selectedContract.cpfCliente}</span>, residente e domiciliado(a) no endereço <span className="italic underline">{selectedContract.enderecoCliente || "não informado"}</span>, contato telefônico <span className="font-sans font-semibold">{selectedContract.telefoneCliente || "não informado"}</span>.
                  </p>
                </div>

                {/* Part 2: Object */}
                <div className="space-y-1.5">
                  <strong style={{ borderBottomColor: "#e5e5e5" }} className="text-stone-950 uppercase font-sans text-[10px] tracking-widest block mb-1 border-b pb-1">CLÁUSULA SEGUNDA – DO OBJETO E CARACTERÍSTICAS DO BEM</strong>
                  <div className="space-y-1.5">
                    <p className="text-justify text-[11px] leading-[1.4]">
                      O presente instrumento possui como objeto a transação comercial de um veículo elétrico, em perfeitas condições de uso, conservação e funcionamento, com as seguintes especificações técnicas:
                    </p>
                    <div style={{ backgroundColor: "#faf9f6", borderColor: "#dbd8d3", color: "#1c1917" }} className="grid grid-cols-2 gap-x-8 gap-y-1 p-3.5 rounded-xl border font-sans font-semibold text-[9px] uppercase">
                      <div style={{ borderColor: "#dbd8d3" }} className="flex justify-between border-b pb-0.5">
                        <span className="text-stone-500">Marca:</span>
                        <span className="text-stone-950 font-bold">{selectedContract.marca}</span>
                      </div>
                      <div style={{ borderColor: "#dbd8d3" }} className="flex justify-between border-b pb-0.5">
                        <span className="text-stone-500">Modelo:</span>
                        <span className="text-stone-950 font-bold">{selectedContract.modelo}</span>
                      </div>
                      <div style={{ borderColor: "#dbd8d3" }} className="flex justify-between border-b pb-0.5">
                        <span className="text-stone-500">Ano:</span>
                        <span className="text-stone-950 font-bold">{selectedContract.ano}</span>
                      </div>
                      <div style={{ borderColor: "#dbd8d3" }} className="flex justify-between border-b pb-0.5">
                        <span className="text-stone-500">Cor:</span>
                        <span className="text-stone-950 font-bold">{selectedContract.cor}</span>
                      </div>
                      <div style={{ borderColor: "#dbd8d3" }} className="flex justify-between border-b pb-0.5">
                        <span className="text-stone-500">Núm. Chassi:</span>
                        <span className="text-stone-950 font-bold">{selectedContract.chassi}</span>
                      </div>
                      <div style={{ borderColor: "#dbd8d3" }} className="flex justify-between items-start border-b pb-0.5 col-span-2">
                        <span className="text-stone-500 shrink-0 mr-2">Acessórios:</span>
                        <span className="text-stone-950 font-bold text-right break-words max-w-[550px]">{selectedContract.acessorios || "Padrão"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Part 3: Value */}
                <div className="space-y-1.5">
                  <strong style={{ borderBottomColor: "#e5e5e5" }} className="text-stone-950 uppercase font-sans text-[10px] tracking-widest block mb-1 border-b pb-1">CLÁUSULA TERCEIRA – DO PREÇO E INTEGRALIZAÇÃO DO PAGAMENTO</strong>
                  <p className="text-justify text-[11px] leading-[1.4]">
                    Pelo objeto acima descrito, o <strong className="text-stone-950">COMPRADOR</strong> obriga-se a pagar ao <strong className="text-stone-950">VENDEDOR</strong> a quantia líquida, certa e exigível de <strong className="text-stone-950 text-sm">R$ {selectedContract.valor?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>, a ser integralizada mediante a modalidade de <strong className="text-stone-950 underline decoration-amber-600 decoration-2">{selectedContract.formaPagamento}</strong>, respeitando os prazos e condições estabelecidas no fluxo financeiro desta empresa.
                  </p>
                </div>

              </div>
            )}
          </div>
          <div className="text-[9px] font-sans text-stone-400 flex justify-between self-end w-full select-none pt-2 border-t border-stone-100">
            <span>VOLT MOTORS — Contrato {selectedContract.id}</span>
            <span>Folha 1 de 2</span>
          </div>
        </div>

        {/* PAGE 2 */}
        <div
          id={`${elementId}-page2`}
          style={{
            width: "794px",
            height: "1123px",
            backgroundColor: "#ffffff",
            color: "#1c1917",
            padding: "2cm",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            fontFamily: "Georgia, 'Times New Roman', serif",
            lineHeight: "1.4",
            fontSize: "11px",
            boxSizing: "border-box",
            justifyContent: "space-between"
          }}
          className="border border-stone-300 shadow-2xl relative shrink-0 print:border-0 print:shadow-none print:w-full"
        >
          {/* Watermark 2 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none text-center">
            <div style={{ borderColor: "#1c1917" }} className="w-[500px] h-[500px] border-8 rounded-full flex items-center justify-center p-8">
              <span className="text-5xl font-sans tracking-widest font-black uppercase rotate-[-30deg]">VOLT MOTORS</span>
            </div>
          </div>

          <div className="space-y-5 flex-1">
            {selectedContract.customHtml ? (
              <div 
                id={`${elementId}-editable-body2`}
                contentEditable={isDraft}
                suppressContentEditableWarning={true}
                className={`space-y-5 flex-1 ${isDraft ? 'focus:outline-none focus:ring-1 focus:ring-amber-500/30 rounded-lg p-2 -m-2' : ''}`}
                dangerouslySetInnerHTML={{ __html: p2Html }} 
              />
            ) : (
              <div id={`${elementId}-editable-body2`} contentEditable={isDraft} suppressContentEditableWarning={true} className={`space-y-5 flex-1 ${isDraft ? 'focus:outline-none focus:ring-1 focus:ring-amber-500/30 rounded-lg p-2 -m-2' : ''}`}>
                {/* Part 4: Warranty */}
                <div className="space-y-1.5">
                  <strong style={{ borderBottomColor: "#e5e5e5" }} className="text-stone-950 uppercase font-sans text-[10px] tracking-widest block mb-1 border-b pb-1">CLÁUSULA QUARTA – DA GARANTIA E MANUTENÇÕES OBRIGATÓRIAS</strong>
                  {renderWarrantyClause()}
                  <p style={{ backgroundColor: "#faf9f6", borderLeftColor: "#1c1917", borderLeftWidth: "4px" }} className="mt-3 border-l pl-4 py-2 italic text-[11px] leading-[1.3]">
                    A entrega física do bem está programada para ocorrer nas dependências do showroom em <strong className="text-stone-950 font-sans font-bold tracking-tight underline">{(() => { try { const d = new Date(selectedContract.dataEntrega + "T00:00:00"); return isNaN(d.getTime()) ? selectedContract.dataEntrega : d.toLocaleDateString("pt-BR"); } catch (e) { return selectedContract.dataEntrega; } })()}</strong>.
                  </p>
                </div>

                {/* Part 5: Clauses of agreement */}
                <div className="space-y-1.5">
                  <strong style={{ borderBottomColor: "#e5e5e5" }} className="text-stone-950 uppercase font-sans text-[10px] tracking-widest block mb-1 border-b pb-1">CLÁUSULA QUINTA – DO FORO E DISPOSIÇÕES FINAIS</strong>
                  <p className="text-justify text-[11px] leading-[1.4]">
                    Este contrato é regido pelas leis da República Federativa do Brasil. Para dirimir quaisquer controvérsias oriundas deste instrumento, as partes elegem, com exclusão de qualquer outro por mais privilegiado que seja, o foro da comarca da sede da empresa vendedora situada em Patrocínio-MG.
                  </p>
                </div>
              </div>
            )}

            {/* Contacts Section */}
            {(!selectedContract.customHtml || !p2Html.includes("CANAIS OFICIAIS")) && (
              <div style={{ borderTopColor: "#1c1917" }} className="pt-4 border-t-2">
                <strong className="text-stone-950 uppercase font-sans text-[9px] tracking-[0.2em] font-black block mb-2 opacity-90">CANAIS OFICIAIS DE ATENDIMENTO E SUPORTE TÉCNICO</strong>
                <div className="grid grid-cols-2 gap-4 font-sans font-semibold text-[9px] uppercase">
                  <div style={{ backgroundColor: "#faf9f6", borderColor: "#dbd8d3" }} className="flex flex-col p-2.5 rounded-xl border">
                    <span style={{ borderColor: "#dbd8d3" }} className="text-stone-500 mb-1 border-b pb-1">Diretoria Estratégica / Bruno:</span>
                    <span className="text-stone-950 font-black text-xs">34 9 9741-6132</span>
                  </div>
                  <div style={{ backgroundColor: "#faf9f6", borderColor: "#dbd8d3" }} className="flex flex-col p-2.5 rounded-xl border">
                    <span style={{ borderColor: "#dbd8d3" }} className="text-stone-500 mb-1 border-b pb-1">Diretoria Estratégica / Fabiano:</span>
                    <span className="text-stone-950 font-black text-xs">34 9 9334-3463</span>
                  </div>
                </div>
              </div>
            )}

            {/* Local Date */}
            <div className="text-right font-sans text-[10px] py-1">
              Patrocínio-MG, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Signatures section */}
          {(!selectedContract.customHtml || !p2Html.includes("VOLT TRANSPORTES ELÉTRICOS")) && (
            <div style={{ borderTopColor: "#1c1917" }} className="pt-8 border-t-2 grid grid-cols-2 gap-8 font-sans text-xs text-center select-none">
              <div className="space-y-4">
                <div className="h-12 flex flex-col justify-end items-center relative">
                  {isSigned && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute -top-4 w-full flex flex-col items-center">
                      <CheckCircle className="w-6 h-6 text-green-600 mb-0.5 opacity-20" />
                      <span style={{ backgroundColor: "#fff9f2", borderColor: "#fbebd8", color: "#b45309" }} className="font-sans tracking-[0.2em] font-black text-[8px] px-2.5 py-1.5 rounded-lg border-2 uppercase shadow-sm text-center block">
                        ✓ ASSINADO DIGITALMENTE
                      </span>
                    </motion.div>
                  )}
                  <div className="h-[2px] w-full bg-stone-900 max-w-[220px] mx-auto" />
                </div>
                <div className="space-y-0.5">
                  <strong className="text-stone-950 block font-black uppercase text-[9px]">VOLT TRANSPORTES ELÉTRICOS</strong>
                  <div className="text-stone-400 text-[8px] uppercase tracking-wider space-y-0.5">
                    <span className="block font-sans font-semibold">CNPJ: 63.586.302/0001-03</span>
                    <span className="block font-semibold text-stone-600">Representante: {selectedContract.sellerName}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-12 flex flex-col justify-end items-center relative">
                  {isSigned && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute -top-4 w-full flex flex-col items-center">
                      <ShieldCheck className="w-6 h-6 text-amber-600 mb-0.5 opacity-20" />
                      <span style={{ backgroundColor: "#fff9f2", borderColor: "#fbebd8", color: "#b45309" }} className="font-sans tracking-[0.2em] font-black text-[8px] px-2.5 py-1.5 rounded-lg border-2 uppercase shadow-sm text-center block">
                        ✓ CLIENTE DE ACORDO
                      </span>
                    </motion.div>
                  )}
                  <div className="h-[2px] w-full bg-stone-900 max-w-[220px] mx-auto" />
                </div>
                <div className="space-y-0.5">
                  <strong className="text-stone-950 block font-black uppercase text-[9px] underline">{selectedContract.nomeCliente}</strong>
                  <div className="text-stone-400 text-[8px] uppercase tracking-wider space-y-0.5">
                    <span className="block font-sans font-semibold">CPF: {selectedContract.cpfCliente}</span>
                    <span className="block italic text-stone-500">Contratante</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-[9px] font-sans text-stone-400 flex justify-between self-end w-full select-none mt-4 pt-2 border-t border-stone-100">
            <span>VOLT MOTORS — Contrato {selectedContract.id}</span>
            <span>Folha 2 de 2</span>
          </div>
        </div>

      </div>
    );
  };

  const handleShare = async (elementId = "a4-contract-page") => {
    if (!selectedContract) return;
    setIsSharing(true);

    const wrapperElement = document.getElementById(`${elementId}-wrapper`);
    const parentElement = document.getElementById(elementId);

    // Save live DOM styles to restore later
    const originalWrapperWidth = wrapperElement ? wrapperElement.style.width : "";
    const originalWrapperHeight = wrapperElement ? wrapperElement.style.height : "";
    const originalParentTransform = parentElement ? parentElement.style.transform : "";
    const originalParentGap = parentElement ? parentElement.style.gap : "";

    // Temporarily set to perfect unscaled 1:1 screen layout for capturing
    if (wrapperElement) {
      wrapperElement.style.width = "794px";
      wrapperElement.style.height = "2246px"; // (1123 * 2)
    }
    if (parentElement) {
      parentElement.style.transform = "none";
      parentElement.style.gap = "0px";
    }

    try {
      const p1Element = document.getElementById(`${elementId}-page1`);
      const p2Element = document.getElementById(`${elementId}-page2`);
      if (!p1Element || !p2Element) {
        throw new Error("Elementos de visualização do contrato não foram localizados.");
      }

      const options = {
        scale: 4, // Extremely high resolution for print perfection
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794, 
        onclone: (clonedDoc) => {
          // 1. Reset scale / transform styling of parent document so html2canvas computes original A4 dimensions flawlessly
          const parentElementClone = clonedDoc.getElementById(elementId);
          if (parentElementClone) {
            parentElementClone.style.transform = "none";
            parentElementClone.style.width = "794px";
            parentElementClone.style.height = "auto";
            parentElementClone.style.display = "flex";
            parentElementClone.style.flexDirection = "column";
            parentElementClone.style.gap = "0px";
            parentElementClone.style.transformOrigin = "top left";
          }

          // Force page elements inside the clone to be visible, fully unscaled, and static
          const p1Clone = clonedDoc.getElementById(`${elementId}-page1`);
          const p2Clone = clonedDoc.getElementById(`${elementId}-page2`);
          if (p1Clone) {
            p1Clone.style.transform = "none";
            p1Clone.style.position = "relative";
            p1Clone.style.boxSizing = "border-box";
          }
          if (p2Clone) {
            p2Clone.style.transform = "none";
            p2Clone.style.position = "relative";
            p2Clone.style.boxSizing = "border-box";
          }

          // 2. Fix for html2canvas not supporting oklch colors (common in Tailwind v4)
          // Parse any oklch(...) declaration, extract the lightness value 'L', and convert it to its hex grayscale representation
          const mapOklchToHex = (match: string, inner: string) => {
            try {
              // Split inner by spaces, slashes, or commas to extract lightness value
              const parts = inner.trim().split(/[\s/]+/);
              if (parts.length >= 1) {
                let lVal = parts[0];
                let l = 0;
                if (lVal.endsWith("%")) {
                  l = parseFloat(lVal) / 100;
                } else {
                  l = parseFloat(lVal);
                }
                if (!isNaN(l)) {
                  // Clamp L between 0 and 1
                  l = Math.max(0, Math.min(1, l));
                  let value = Math.round(l * 255);
                  // Ensure background/foreground high contrasts are preserved and don't muddy down
                  if (l > 0.85) {
                    value = 255; // White backgrounds stay white
                  } else if (l < 0.2) {
                    value = 28; // Deep colors stay dark charcoal #1c1917
                  }
                  const hex = value.toString(16).padStart(2, '0');
                  return `#${hex}${hex}${hex}`;
                }
              }
            } catch (e) {
              console.error("Error converting oklch value:", e);
            }
            return "#78716c"; // Fallback stone-500
          };

          const styleTags = clonedDoc.getElementsByTagName("style");
          for (let i = 0; i < styleTags.length; i++) {
            try {
              let cssText = styleTags[i].innerHTML;
              if (cssText.toLowerCase().includes("oklch")) {
                cssText = cssText.replace(/oklch\s*\(([^)]+)\)/gi, (m, inner) => mapOklchToHex(m, inner));
                styleTags[i].innerHTML = cssText;
              }
            } catch (err) {
              console.error("Error processing style tag in clone:", err);
            }
          }

          const allClonedElements = clonedDoc.getElementsByTagName("*");
          for (let i = 0; i < allClonedElements.length; i++) {
            const el = allClonedElements[i] as HTMLElement;
            const inlineStyle = el.getAttribute("style");
            if (inlineStyle && inlineStyle.toLowerCase().includes("oklch")) {
              const fixedStyle = inlineStyle.replace(/oklch\s*\(([^)]+)\)/gi, (m, inner) => mapOklchToHex(m, inner));
              el.setAttribute("style", fixedStyle);
            }
          }
        }
      };

      const canvas1 = await html2canvas(p1Element, options);
      const canvas2 = await html2canvas(p2Element, options);

      const imgData1 = canvas1.toDataURL("image/png");
      const imgData2 = canvas2.toDataURL("image/png");

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // Standard A4 height in mm

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      pdf.addImage(imgData1, "PNG", 0, 0, imgWidth, pageHeight, undefined, 'FAST');
      
      pdf.addPage();
      pdf.addImage(imgData2, "PNG", 0, 0, imgWidth, pageHeight, undefined, 'FAST');

      // Force direct download
      pdf.save(`Contrato_VoltMotors_${selectedContract.id}.pdf`);
      
    } catch (error) {
      console.error("Erro ao gerar/compartilhar o PDF:", error);
      alert("Houve um erro técnico ao gerar o PDF. Executando o fallback do sistema para impressão.");
      window.print();
    } finally {
      // Restore live DOM styles after capture completes
      if (wrapperElement) {
        wrapperElement.style.width = originalWrapperWidth;
        wrapperElement.style.height = originalWrapperHeight;
      }
      if (parentElement) {
        parentElement.style.transform = originalParentTransform;
        parentElement.style.gap = originalParentGap;
      }
      setIsSharing(false);
    }
  };

  // CPF formatter (000.000.000-00)
  const handleCpfChange = (val: string) => {
    const raw = val.replace(/\D/g, "");
    if (raw.length <= 11) {
      let formatted = raw;
      if (raw.length > 9) {
        formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6, 9)}-${raw.slice(9)}`;
      } else if (raw.length > 6) {
        formatted = `${raw.slice(0, 3)}.${raw.slice(3, 6)}.${raw.slice(6)}`;
      } else if (raw.length > 3) {
        formatted = `${raw.slice(0, 3)}.${raw.slice(3)}`;
      }
      setCpfCliente(formatted);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelo || !nomeCliente || !cpfCliente || !dataEntrega) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsGenerating(true);

    // Parse valorInput carefully for PT-BR (15.000,00 -> 15000.00)
    let finalValor = 0;
    if (valorInput) {
      const cleanVal = valorInput.replace(/\./g, "").replace(",", ".");
      finalValor = parseFloat(cleanVal) || 0;
    } else if (typeof valor === "number") {
      finalValor = valor;
    }

    // Simulate PDF creation / processing delay for professional feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    const paddedSequence = contractSequence.toString().padStart(4, "0");
    const newContract: Contract = {
      id: "CTR-" + paddedSequence,
      marca,
      modelo,
      ano,
      cor,
      chassi,
      acessorios,
      nomeCliente,
      cpfCliente,
      enderecoCliente,
      telefoneCliente,
      tempoGarantia,
      formaPagamento,
      dataEntrega,
      valor: finalValor,
      date: new Date().toLocaleDateString("pt-BR"),
      sellerName: nomeVendedor,
      sellerEmail: currentUser.email
    };

    setSelectedContract(newContract);
    setIsGenerating(false);
    setIsDraft(true);
    setFormSuccess(true);
    setShowFullScreenPreview(true);
  };

  const handleOpenContract = () => {
    setFormSuccess(true);
    setShowFullScreenPreview(true);
  };

  const resetForm = () => {
    setMarca("VOLT MOTORS");
    setModelo("");
    setAno(new Date().getFullYear().toString());
    setCor("");
    setChassi("");
    setAcessorios("");
    setNomeCliente("");
    setCpfCliente("");
    setEnderecoCliente("");
    setTelefoneCliente("");
    setTempoGarantia("3 Meses");
    setFormaPagamento("Pix");
    setValor("");
    setValorInput("");
    setDataEntrega("");
    setNomeVendedor(currentUser.name || "");
    setFormSuccess(false);
    setContractReady(false);
    setIsGenerating(false);
    setSelectedContract(null);
  };

  const handleDeleteContract = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    setShowPasswordPrompt(true);
    setDeletePassword("");
  };

  const confirmSaveDraft = () => {
    if (selectedContract) {
      let contentNode1 = document.getElementById("a4-contract-page-fullscreen-editable-body1");
      let contentNode2 = document.getElementById("a4-contract-page-fullscreen-editable-body2");
      
      if (!contentNode1) {
        contentNode1 = document.getElementById("a4-contract-page-editable-body1");
      }
      if (!contentNode2) {
        contentNode2 = document.getElementById("a4-contract-page-editable-body2");
      }
      
      let customHtml = undefined;
      
      // Save content from both editable pages when edited
      if (contentNode1 && contentNode2) {
        customHtml = contentNode1.innerHTML + "<!-- PAGE_SPLIT -->" + contentNode2.innerHTML;
      } else if (contentNode1) {
        customHtml = contentNode1.innerHTML;
      } else {
        const contentNode = document.getElementById("a4-contract-page-fullscreen-editable-body") || document.getElementById("a4-contract-page-editable-body");
        if (contentNode) {
          customHtml = contentNode.innerHTML;
        }
      }
      
      const finishedContract = { ...selectedContract, customHtml };
      const updated = [finishedContract, ...contracts];
      onSaveContract(updated);
      
      // If it's a new contract being issued (ID has padded value), increment sequence
      if (activeTab === "issue") {
        saveContractSequence(contractSequence + 1);

        // Calculate maintenance date (30 days after dataEntrega or today)
        let baseDate = new Date();
        if (selectedContract.dataEntrega) {
          const parts = selectedContract.dataEntrega.split("-");
          if (parts.length === 3) {
            baseDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          }
        }
        
        baseDate.setDate(baseDate.getDate() + 30);
        const nextMonthStr = baseDate.getFullYear() + "-" + String(baseDate.getMonth() + 1).padStart(2, "0") + "-" + String(baseDate.getDate()).padStart(2, "0");

        const mntItem: MaintenanceReminder = {
          id: "MNT-" + Math.floor(Math.random() * 90000 + 10000),
          cliente: selectedContract.nomeCliente,
          telefoneCliente: selectedContract.telefoneCliente,
          modelo: selectedContract.modelo,
          data: nextMonthStr,
          descricao: "Revisão de Fábrica Geral - 30 dias",
          status: "pending",
          createdAt: new Date().toLocaleDateString("pt-BR")
        };

        onSaveMaintenance([mntItem, ...maintenanceReminders]);
      }

      setSelectedContract(null);
      setIsDraft(false);
      setFormSuccess(false);
      setContractReady(false);
      setShowFullScreenPreview(false);
      setActiveTab("list");
      resetForm();
    }
  };

  const confirmDelete = () => {
    if (deletePassword === SYSTEM_ACCESS_PASSWORD) {
      const updated = contracts.filter(c => c.id !== deletingId);
      onSaveContract(updated);
      if (selectedContract?.id === deletingId) {
        setSelectedContract(null);
      }
      setShowPasswordPrompt(false);
      setDeletingId(null);
      setDeletePassword("");
      setDeleteError(false);
    } else {
      setDeleteError(true);
      setDeletePassword("");
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden pointer-events-auto print:absolute print:overflow-visible print:bg-white print:z-[9999]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.3 }}
        className={`w-full h-full bg-white flex flex-col overflow-hidden ${showFullScreenPreview ? 'print:hidden' : ''}`}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-stone-200 select-none shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif text-stone-900 font-bold">Contratos de Compra e Venda</h2>
              <p className="text-xs text-stone-500 font-mono font-bold">MÓDULO DE EMISSÃO OFICIAL</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        {!formSuccess && (
          <div className="flex border-b border-stone-200 shrink-0 select-none">
            <button
              onClick={() => { setActiveTab("issue"); resetForm(); }}
              className={`flex-1 py-4 text-xs font-mono uppercase tracking-widest border-b-2 text-center transition-all font-bold ${activeTab === "issue" ? "border-amber-600 text-amber-800 bg-amber-50" : "border-transparent text-stone-500 hover:text-stone-850"}`}
            >
              Emitir Novo Contrato
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`flex-1 py-4 text-xs font-mono uppercase tracking-widest border-b-2 text-center transition-all font-bold ${activeTab === "list" ? "border-amber-600 text-amber-800 bg-amber-50" : "border-transparent text-stone-500 hover:text-stone-850"}`}
            >
              Contratos Emitidos ({contracts.length})
            </button>
          </div>
        )}

        {/* Content area */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8">
          
          {/* TAB 1: EMITIR NOVO CONTRATO & SUCESSO/ASSINATURA */}
          {activeTab === "issue" && (
            <AnimatePresence mode="wait">
              {!formSuccess ? (
                <motion.form
                  key="issue-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >


                  <div className="space-y-8">
                    
                    {/* SEÇÃO 1: DADOS DO CLIENTE */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-4 bg-amber-600 rounded-full" />
                        <h3 className="text-xs font-mono font-black text-stone-800 uppercase tracking-widest">Informações do Comprador</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider ml-1 font-bold">Nome Completo *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: João da Silva Sauro"
                            value={nomeCliente}
                            onChange={(e) => setNomeCliente(e.target.value)}
                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-2xl px-4 py-3.5 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider ml-1 font-bold">CPF do Cliente *</label>
                          <input
                            type="text"
                            required
                            placeholder="000.000.000-00"
                            value={cpfCliente}
                            onChange={(e) => handleCpfChange(e.target.value)}
                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-2xl px-4 py-3.5 text-sm outline-none transition-all font-sans"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1">
                          <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider ml-1 font-bold">Endereço Residencial</label>
                          <input
                            type="text"
                            placeholder="Rua, Número, Bairro, Cidade-UF"
                            value={enderecoCliente}
                            onChange={(e) => setEnderecoCliente(e.target.value)}
                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-2xl px-4 py-3.5 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider ml-1 font-bold">Contato Telefônico</label>
                          <input
                            type="text"
                            placeholder="(00) 0 0000-0000"
                            value={telefoneCliente}
                            onChange={(e) => setTelefoneCliente(e.target.value)}
                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-2xl px-4 py-3.5 text-sm outline-none transition-all font-sans"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SEÇÃO 2: DADOS DO VEÍCULO */}
                    <div className="space-y-4 pt-4 border-t border-stone-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-4 bg-amber-600 rounded-full" />
                        <h3 className="text-xs font-mono font-black text-stone-800 uppercase tracking-widest">Especificações do Objeto (Veículo)</h3>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider ml-1 font-bold">Marca *</label>
                          <input
                            type="text"
                            required
                            value={marca}
                            onChange={(e) => setMarca(e.target.value)}
                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider ml-1 font-bold">Modelo *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Roadster Edition"
                            value={modelo}
                            onChange={(e) => setModelo(e.target.value)}
                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider ml-1 font-bold">Ano *</label>
                          <input
                            type="text"
                            required
                            value={ano}
                            onChange={(e) => setAno(e.target.value)}
                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-2xl px-4 py-3 text-sm outline-none transition-all font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider ml-1 font-bold">Cor Predominante *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Preto Fosco"
                            value={cor}
                            onChange={(e) => setCor(e.target.value)}
                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider ml-1 font-bold">Número do Chassi</label>
                          <input
                            type="text"
                            placeholder="Opcional"
                            value={chassi}
                            onChange={(e) => setChassi(e.target.value)}
                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-2xl px-4 py-3 text-sm outline-none transition-all font-sans"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider ml-1 font-bold">Acessórios Inclusos</label>
                        <textarea
                          placeholder="Liste acessórios extras caso existam..."
                          value={acessorios}
                          onChange={(e) => setAcessorios(e.target.value)}
                          className="w-full bg-stone-50 text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-2xl px-4 py-3 text-sm outline-none transition-all min-h-[60px]"
                        />
                      </div>
                    </div>

                    {/* SEÇÃO 3: CONDIÇÕES COMERCIAIS */}
                    <div className="space-y-4 pt-4 border-t border-stone-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-4 bg-amber-600 rounded-full" />
                        <h3 className="text-xs font-mono font-black text-stone-800 uppercase tracking-widest">Condições de Fechamento</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider ml-1 font-bold">Valor do Bem (R$) *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: 15.000,00"
                            value={valorInput}
                            onChange={(e) => setValorInput(e.target.value)}
                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-2xl px-4 py-3 text-sm outline-none transition-all font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider ml-1 font-bold">Garantia Selecionada *</label>
                          <select
                            value={tempoGarantia}
                            onChange={(e) => setTempoGarantia(e.target.value)}
                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-2xl px-4 py-3 text-sm outline-none transition-all cursor-pointer"
                          >
                            <option value="3 Meses">3 Meses (Trimestral)</option>
                            <option value="1 Ano">1 Ano (Anual)</option>
                            <option value="2 Anos">2 Anos (Bienal)</option>
                            <option value="3 Anos">3 Anos</option>
                            <option value="Sem Garantia">Sem Garantia Especial</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider ml-1 font-bold">Forma de Pagamento *</label>
                          <select
                            value={formaPagamento}
                            onChange={(e) => setFormaPagamento(e.target.value)}
                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-2xl px-4 py-3 text-sm outline-none transition-all cursor-pointer"
                          >
                            <option value="Pix">Pix (Imediato)</option>
                            <option value="Cartão de Crédito">Cartão de Crédito</option>
                            <option value="Financiamento">Financiamento</option>
                            <option value="TED / Dinheiro">TED / Dinheiro</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider ml-1 font-bold">Data de Entrega *</label>
                          <input
                            type="date"
                            required
                            value={dataEntrega}
                            onChange={(e) => setDataEntrega(e.target.value)}
                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-2xl px-4 py-3 text-sm outline-none transition-all font-sans"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider ml-1 font-bold">Assinatura do Consultor / Vendedor *</label>
                        <input
                          type="text"
                          required
                          value={nomeVendedor}
                          onChange={(e) => setNomeVendedor(e.target.value)}
                          className="w-full bg-stone-50 text-stone-900 border border-stone-200 focus:border-amber-500/50 rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-6">
                      {contractReady ? (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          type="button"
                          onClick={handleOpenContract}
                          className="w-full py-5 bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3 group"
                        >
                          <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          Visualizar Minuta Jurídica do Contrato
                        </motion.button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isGenerating}
                          className="w-full py-5 bg-stone-950 hover:bg-stone-900 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                          {isGenerating ? (
                            <>
                              <Loader className="w-5 h-5 animate-spin text-white" />
                              Validando Dados e Gerando PDF...
                            </>
                          ) : (
                            "Protocolar & Gerar Contrato Oficial"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.form>
              ) : (
                /* CONTRACT DOCUMENT PREVIEW / SIGNATURE & ACTIONS */
                <motion.div
                  key="contract-document"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8 select-none"
                >
                  <div className="flex flex-wrap gap-3 items-center mb-4 select-none shrink-0 no-print">
                    <button
                      onClick={resetForm}
                      className="flex items-center gap-2 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 hover:text-stone-950 rounded-xl text-xs font-mono uppercase transition-colors"
                      disabled={isSharing}
                    >
                      <ArrowLeft className="w-4 h-4" /> Voltar / Editar Contrato
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowFullScreenPreview(true)}
                      className="flex items-center gap-2 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-amber-800 hover:text-stone-950 rounded-xl text-xs font-mono uppercase transition-colors"
                      disabled={isSharing}
                    >
                      <Eye className="w-4 h-4" /> Tela Cheia (Editar e Ver PDF)
                    </button>

                    {isDraft ? (
                      <button
                        type="button"
                        onClick={confirmSaveDraft}
                        className="flex items-center gap-2 py-2.5 px-5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl text-xs font-mono uppercase transition-all shadow-md mt-2 md:mt-0 md:ml-auto"
                      >
                        <CheckCircle className="w-4 h-4" /> Finalizar Oficial
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="flex items-center gap-2 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-amber-800 hover:text-stone-950 rounded-xl text-xs font-mono uppercase transition-colors"
                          disabled={isSharing}
                        >
                          <Printer className="w-4 h-4" /> Imprimir Documento
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShare("a4-contract-page")}
                          disabled={isSharing}
                          className="flex items-center gap-2 py-2.5 px-5 bg-stone-950 hover:bg-stone-900 text-white font-bold rounded-xl text-xs font-mono uppercase transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                        >
                          {isSharing ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" /> Gerando PDF...
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4" /> Baixar PDF
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>

                  {isSharing && (
                    <div className="bg-amber-100 border border-amber-200 rounded-2xl p-4 text-center text-amber-900 text-xs font-mono uppercase animate-pulse select-none no-print">
                      ⚙️ PROCESSANDO EXPORTAÇÃO A4 DE ALTA RESOLUÇÃO... POR FAVOR, AGUARDE UM MOMENTO.
                    </div>
                  )}

                  {/* LEGALLY STYLED DOCUMENT CONTAINER (A4 PREVIEW SHEET) */}
                  <div 
                    ref={containerRef}
                    className="w-full bg-stone-100 py-6 md:py-12 select-none rounded-[2rem] border border-stone-200 max-w-full print:bg-transparent print:p-0 print:border-0 print:shadow-none print:block overflow-auto text-center"
                  >
                    <div 
                      id="a4-contract-page-wrapper"
                      style={{ 
                        width: `${794 * scale}px`, 
                        height: `${(1123 * 2 + 32) * scale}px`,
                        position: "relative",
                        display: "inline-block",
                        textAlign: "left"
                      }}
                      className="print:w-full print:h-auto shrink-0 transition-all duration-150"
                    >
                      {renderActiveContractPage("a4-contract-page", scale)}
                    </div>
                  </div>

                  {/* Bottom Success / Sign interactive segment */}
                  <div className="bg-stone-50 border border-stone-200 p-6 rounded-3xl max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 no-print select-none font-sans">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-700">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-stone-900 font-serif">O contrato eletrônico está estruturado</h4>
                        <p className="text-xs text-stone-550 font-normal max-w-md">Para finalizar e registrar a venda para fins de faturamento e auditoria, aplique as assinaturas de showroom.</p>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                      {!isSigned ? (
                        <button
                          onClick={() => setIsSigned(true)}
                          className="flex-1 sm:flex-none px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                        >
                          Aplicar Assinaturas
                        </button>
                      ) : (
                        <button
                          onClick={resetForm}
                          className="flex-1 sm:flex-none px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" /> Finalizar & Sair
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* TAB 2: LISTA DE CONTRATOS EMITIDOS */}
          {activeTab === "list" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-mono text-stone-500 uppercase tracking-[0.2em] font-bold">Base de Registros Local</h3>
              </div>
              {contracts.length === 0 ? (
                <div className="text-center py-12 border border-stone-200 rounded-3xl border-dashed bg-stone-50">
                  <FileText className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <p className="text-sm text-stone-550 font-light">Nenhum contrato foi registrado nesta filial ainda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contracts.map((contract) => (
                    <div
                      key={contract.id}
                      onClick={() => { 
                        setSelectedContract(contract); 
                        setIsDraft(false);
                        setShowFullScreenPreview(true); 
                      }}
                      className="p-5 bg-stone-50 border border-stone-200 hover:border-amber-500 rounded-2xl cursor-pointer hover:bg-amber-50/50 transition-all flex justify-between gap-4 group shadow-sm"
                    >
                      <div className="space-y-3 truncate">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-amber-800 uppercase tracking-widest font-bold">{contract.id} • {contract.date}</span>
                          <h3 className="text-sm font-serif text-stone-900 font-bold group-hover:text-amber-800 transition-colors truncate">{contract.modelo}</h3>
                        </div>
                        <div className="text-xs text-stone-600 font-normal space-y-0.5">
                          <p>Cliente: <span className="font-semibold text-stone-800">{contract.nomeCliente}</span></p>
                          <p>Forma: <span className="font-semibold text-stone-800">{contract.formaPagamento}</span></p>
                        </div>
                        <p className="text-xs font-sans text-stone-900 font-bold">R$ {contract.valor.toLocaleString("pt-BR")}</p>
                      </div>
                      <div className="flex flex-col justify-between items-end shrink-0">
                        <div className="w-14 h-14 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-stone-400 shadow-sm">
                          <FileText className="w-6 h-6 opacity-60" />
                        </div>
                        <button
                          onClick={(e) => handleDeleteContract(contract.id, e)}
                          className="p-2 text-stone-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all mt-2 border border-transparent hover:border-red-200"
                          title="Apagar este registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </motion.div>

      {/* Password Prompt for Deletion */}
      <AnimatePresence>
        {showPasswordPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white border border-stone-250 p-8 rounded-3xl max-w-xs w-full shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 border border-red-250">
                <Key className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-stone-900 font-serif text-lg font-bold">Área Restrita</h3>
                {deleteError ? (
                  <p className="text-red-600 text-xs font-bold animate-shake uppercase tracking-tighter">Senha Incorreta! Tente novamente.</p>
                ) : (
                  <p className="text-stone-500 text-xs font-medium">Insira sua senha de login para confirmar a exclusão do contrato.</p>
                )}
              </div>
              <input
                type="password"
                autoFocus
                placeholder="Senha de Acesso"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && confirmDelete()}
                className={`w-full bg-stone-50 text-stone-900 border ${deleteError ? 'border-red-500' : 'border-stone-200'} rounded-2xl px-4 py-3.5 text-center font-sans tracking-widest outline-none focus:border-red-500/50 transition-all placeholder:text-stone-400 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm`}
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowPasswordPrompt(false)}
                  className="py-3 text-xs font-mono uppercase text-stone-500 hover:text-stone-900 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN PREVIEW OVERLAY */}
      <AnimatePresence>
        {showFullScreenPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-stone-100 z-[100] flex flex-col overflow-hidden select-none pointer-events-auto print:bg-white print:absolute print:inset-0 print:overflow-visible print:z-[9999]"
          >
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center px-6 py-4 bg-white border-b border-stone-200 shrink-0 gap-4 print:hidden">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700 font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-stone-900 flex items-center gap-2 font-bold">
                    Visualização do Contrato Oficial
                    <span className="text-[9px] font-mono text-amber-800 py-0.5 px-2 bg-amber-50 border border-amber-300 rounded font-bold">PDF A4</span>
                  </h3>
                  <p className="text-[10px] text-stone-550 font-sans mt-0.5 font-medium">Real-Time Vector Map • {selectedContract?.modelo}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isDraft ? (
                    <button
                      type="button"
                      onClick={confirmSaveDraft}
                      className="flex items-center gap-1.5 px-4.5 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg text-xs font-mono uppercase tracking-widest transition-all shadow-md"
                    >
                      <CheckCircle className="w-4 h-4" /> Finalizar e Gerar Oficial
                    </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex items-center gap-1 px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 hover:text-stone-950 rounded-lg text-xs font-mono uppercase transition-colors font-bold"
                    >
                      <Printer className="w-3.5 h-3.5" /> Imprimir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare("a4-contract-page-fullscreen")}
                      disabled={isSharing}
                      className="flex items-center gap-1.5 px-4.5 py-2 bg-stone-950 hover:bg-stone-900 text-white font-bold rounded-lg text-xs font-mono uppercase transition-all shadow-md"
                    >
                      {isSharing ? (
                        <>
                          <Loader className="w-3.5 h-3.5 animate-spin" /> Gerando...
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5" /> Baixar PDF
                        </>
                      )}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setShowFullScreenPreview(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-all ml-1"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable sheet viewport */}
            <div className="flex-1 overflow-auto bg-stone-200/50 p-4 md:p-8 print:p-0 print:overflow-visible print:bg-transparent text-center">
              <div
                id="a4-contract-page-fullscreen-wrapper"
                style={{
                  width: `${794 * fullScreenScale}px`,
                  height: `${(1123 * 2 + 32) * fullScreenScale}px`,
                  position: "relative",
                  display: "inline-block",
                  textAlign: "left"
                }}
                className="shrink-0 bg-transparent print:border-0 print:shadow-none print:!w-full print:!min-h-0 print:!h-auto print:rounded-none print:my-0"
              >
                {renderActiveContractPage("a4-contract-page-fullscreen", fullScreenScale)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
