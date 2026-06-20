import React, { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { ShowroomMotorcycle } from "../types";
import { motion } from "motion/react";
import { X, Plus, Trash2, Edit2, CheckCircle, Image as ImageIcon } from "lucide-react";

interface ShowroomManagementModalProps {
  onClose: () => void;
}

export default function ShowroomManagementModal({ onClose }: ShowroomManagementModalProps) {
  const [motorcycles, setMotorcycles] = useState<ShowroomMotorcycle[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editingMoto, setEditingMoto] = useState<Partial<ShowroomMotorcycle> | null>(null);
  
  // Utilizar um ref para o input de arquivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const colRef = collection(db, "showroom");
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data: ShowroomMotorcycle[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as ShowroomMotorcycle);
      });
      setMotorcycles(data.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddClick = () => {
    setEditingMoto({
      status: 'available',
      price: 0,
      year: new Date().getFullYear(),
      mileage: 0,
      fuel: 'Energia'
    });
    setIsEditing(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resolução profissional HD: máxima largura ou altura de 1440px
          const maxDimension = 1440;
          let width = img.width;
          let height = img.height;
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Habilitar anti-aliasing e suavização de altíssima qualidade
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, width, height);
            
            // Gerar base64 inteligente com 92% de qualidade para fotografia profissional de motos
            const highQualityBase64 = canvas.toDataURL("image/jpeg", 0.92);
            setEditingMoto(prev => prev ? { ...prev, photoBase64: highQualityBase64 } : null);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMotorcycle = async () => {
    if (!editingMoto?.name || !editingMoto?.brand || editingMoto.price === undefined) {
      alert("Por favor, preencha nome, marca e valor.");
      return;
    }

    try {
      const id = editingMoto.id || `MOTO_${Date.now()}`;
      const docRef = doc(db, "showroom", id);
      
      const payload: ShowroomMotorcycle = {
        id,
        name: editingMoto.name,
        brand: editingMoto.brand,
        price: Number(editingMoto.price),
        year: Number(editingMoto.year),
        mileage: Number(editingMoto.mileage || 0),
        description: editingMoto.description || "",
        subtitle: editingMoto.subtitle || "",
        installments: editingMoto.installments || "",
        fuel: editingMoto.fuel || "Energia",
        power: editingMoto.power || "",
        speed: editingMoto.speed || "",
        color: editingMoto.color || "",
        photoBase64: editingMoto.photoBase64 || "",
        status: editingMoto.status as 'available' | 'sold',
        createdAt: editingMoto.createdAt || Date.now()
      };

      await setDoc(docRef, payload);
      setIsEditing(false);
      setEditingMoto(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "showroom");
    }
  };

  const toggleStatus = async (moto: ShowroomMotorcycle) => {
    try {
      const docRef = doc(db, "showroom", moto.id);
      await setDoc(docRef, { ...moto, status: moto.status === 'available' ? 'sold' : 'available' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "showroom");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja realmente remover esta moto do showroom público?")) return;
    try {
      await deleteDoc(doc(db, "showroom", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "showroom");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#f8f9fa] flex flex-col z-50 overflow-y-auto pointer-events-auto w-full h-full"
    >
      {/* Header */}
      <div className="bg-white pt-10 pb-4 shadow-sm sticky top-0 z-40 shrink-0">
        <div className="flex justify-between items-center max-w-md mx-auto px-4">
          <button onClick={onClose} className="p-2 text-stone-500 hover:text-stone-900 rounded-full bg-stone-100 shrink-0">
             <X className="w-5 h-5" />
          </button>
          <h1 className="text-center font-bold text-lg md:text-xl tracking-wide uppercase text-stone-900">
            GESTÃO SHOWROOM
          </h1>
          <div className="w-9 h-9"></div> {/* Spacer for centering */}
        </div>
        <div className="mt-4 border-b-4 border-[#ea1d24]"></div>
      </div>

      <div className="bg-white py-6 mb-6 shadow-sm shrink-0">
        <h2 className="text-center font-bold text-xl uppercase tracking-wider text-stone-900 px-4">
          MÓDULO DE EDIÇÃO
        </h2>
        <div className="mt-4 border-b-2 border-[#ea1d24]"></div>
      </div>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 md:px-0 w-full flex-grow pb-24">
          {isEditing && editingMoto ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <h4 className="font-serif font-bold text-lg mb-4 text-stone-900">
                {editingMoto.id ? 'Editar Veículo' : 'Novo Veículo no Catálogo'}
              </h4>
              <div className="flex flex-col gap-6">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Título / Modelo</label>
                    <input 
                      type="text" 
                      value={editingMoto.name || ''} 
                      onChange={e => setEditingMoto({...editingMoto, name: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Marca</label>
                      <input 
                        type="text" 
                        value={editingMoto.brand || ''} 
                        onChange={e => setEditingMoto({...editingMoto, brand: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Ano</label>
                      <input 
                        type="number" 
                        value={editingMoto.year || 2026} 
                        onChange={e => setEditingMoto({...editingMoto, year: Number(e.target.value)})}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Investimento (R$)</label>
                      <input 
                        type="number" 
                        value={editingMoto.price || 0} 
                        onChange={e => setEditingMoto({...editingMoto, price: Number(e.target.value)})}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Quilometragem</label>
                      <input 
                        type="number" 
                        value={editingMoto.mileage || 0} 
                        onChange={e => setEditingMoto({...editingMoto, mileage: Number(e.target.value)})}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Foto e Descrição */}
                <div className="space-y-4 flex flex-col">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Foto do Veículo</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full min-h-32 bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-stone-100 hover:border-stone-400 transition-colors overflow-hidden group relative"
                    >
                      {editingMoto.photoBase64 ? (
                        <>
                          <img src={editingMoto.photoBase64} alt="Preview" className="w-full h-auto max-h-48 object-contain" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold">Alterar Imagem</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-stone-400">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40 group-hover:opacity-60 transition-opacity" />
                          <span className="text-xs font-medium">Selecione uma imagem</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                <div className="flex-1 flex flex-col">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Subtítulo (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: S, EFI, 2000 w"
                      value={editingMoto.subtitle || ''} 
                      onChange={e => setEditingMoto({...editingMoto, subtitle: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none mb-4"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Parcelamento (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 48x De R$ 399,00"
                      value={editingMoto.installments || ''} 
                      onChange={e => setEditingMoto({...editingMoto, installments: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none mb-4"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Combustível</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Energia, Gasolina, etc."
                        value={editingMoto.fuel || ''} 
                        onChange={e => setEditingMoto({...editingMoto, fuel: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Potência</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 1000 W"
                        value={editingMoto.power || ''} 
                        onChange={e => setEditingMoto({...editingMoto, power: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Velocidade Máxima</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 50 km/h"
                        value={editingMoto.speed || ''} 
                        onChange={e => setEditingMoto({...editingMoto, speed: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Cor</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Cinza"
                      value={editingMoto.color || ''} 
                      onChange={e => setEditingMoto({...editingMoto, color: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Descrição Curta</label>
                    <textarea 
                      value={editingMoto.description || ''} 
                      onChange={e => setEditingMoto({...editingMoto, description: e.target.value})}
                      className="w-full flex-1 min-h-[80px] bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none resize-none"
                    />
                  </div>
                </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-stone-100">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-stone-50 border border-stone-200 text-stone-600 rounded-xl text-sm font-medium hover:bg-stone-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveMotorcycle}
                  className="px-6 py-2.5 bg-stone-900 border border-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 hover:border-stone-800 transition-colors shadow-sm"
                >
                  Salvar Veículo
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <button 
                  onClick={handleAddClick}
                  className="bg-[#ea1d24] text-white px-5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center justify-center gap-2 w-full shadow-md"
                >
                  <Plus className="w-5 h-5" /> Adicionar Veículo
                </button>
              </div>

              {loading ? (
                 <div className="w-full flex items-center justify-center py-20">
                   <div className="w-8 h-8 border-4 border-stone-300 border-t-[#ea1d24] rounded-full animate-spin" />
                 </div>
              ) : motorcycles.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                    <ImageIcon className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-500 font-light">Nenhum veículo cadastrado no momento.</p>
                 </div>
              ) : (
                <div className="flex flex-col gap-10">
                  {motorcycles.map(moto => (
                    <div key={moto.id} className="bg-white overflow-hidden shadow-md flex flex-col relative">
                      
                      {/* Status / Ações Obscurecendo a imagem */}
                      <div className="absolute top-2 left-2 z-10">
                        <button 
                          onClick={() => toggleStatus(moto)}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm transition-colors backdrop-blur-sm ${moto.status === 'available' ? 'bg-emerald-500/90 text-white border-emerald-600 hover:bg-emerald-600' : 'bg-stone-800/90 text-white border-stone-900 hover:bg-stone-900'}`}
                        >
                          {moto.status === 'available' ? 'Ativo' : 'Oculto'}
                        </button>
                      </div>

                      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
                        <button 
                          onClick={() => { setEditingMoto(moto); setIsEditing(true); }}
                          className="p-2 bg-white/90 text-stone-700 hover:bg-white hover:text-blue-600 rounded-full shadow-sm backdrop-blur-sm transition-colors border border-stone-200"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(moto.id)}
                          className="p-2 bg-white/90 text-stone-700 hover:bg-white hover:text-red-600 rounded-full shadow-sm backdrop-blur-sm transition-colors border border-stone-200"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Imagem Cover */}
                      <div className="w-full bg-stone-50 relative overflow-hidden flex items-center justify-center animate-fade-in">
                        {moto.photoBase64 ? (
                          <img 
                            src={moto.photoBase64} 
                            alt={moto.name}
                            className={`w-full h-auto object-contain block ${moto.status === 'sold' ? 'opacity-50 grayscale' : ''}`}
                          />
                        ) : (
                          <div className="w-full aspect-[4/3] flex items-center justify-center text-stone-400 bg-stone-200">
                            <span className="text-xs uppercase tracking-widest text-stone-500">Sem Imagem</span>
                          </div>
                        )}
                      </div>

                      {/* Conteúdo Info (Clonado do PublicShowroom) */}
                      <div className="p-4 flex flex-col items-center text-center">
                        <div className="flex items-center justify-center gap-2 mb-2 w-full">
                          <div className="w-10 h-7 border-2 border-[#ea1d24] rounded-[50%] flex items-center justify-center shrink-0">
                            <div className="w-4 h-4 border-t-2 border-b-2 border-r-2 border-[#ea1d24] border-l-transparent rounded-full transform -rotate-45"></div>
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-[#ea1d24]">
                            {moto.brand} {moto.name}
                          </h3>
                        </div>

                        {moto.subtitle && (
                          <p className="text-lg text-stone-800 mb-6 font-medium">
                            {moto.subtitle}
                          </p>
                        )}

                        <div className="text-base text-stone-800">A partir de</div>
                        
                        <div className="text-2xl font-extrabold text-stone-900 mb-1">
                          {moto.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </div>

                        {moto.installments && (
                          <div className="text-xl font-bold text-[#ea1d24] mb-1">
                            {moto.installments}
                          </div>
                        )}

                        <div className="text-sm font-medium text-[#ea1d24] mb-6">
                          * Sujeito à análise de crédito.
                        </div>

                        <div className="w-full flex justify-between items-center px-4 mt-2">
                          <span className="text-xl font-medium text-stone-800">
                            {moto.mileage} KM
                          </span>
                          <span className="text-xl font-medium text-stone-800">
                            {moto.year}/{moto.year}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
      </main>
    </motion.div>
  );
}
