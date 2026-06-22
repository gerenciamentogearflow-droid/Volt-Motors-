import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { ShowroomMotorcycle, User } from "../types";
import { motion } from "motion/react";
import {
  X,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface ShowroomManagementModalProps {
  onClose: () => void;
  user: User;
}

export default function ShowroomManagementModal({
  onClose,
  user,
}: ShowroomManagementModalProps) {
  const [motorcycles, setMotorcycles] = useState<ShowroomMotorcycle[]>(() => {
    try {
      const saved = localStorage.getItem("volt_motors_showroom_cached_all");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editingMoto, setEditingMoto] =
    useState<Partial<ShowroomMotorcycle> | null>(null);

  const [motoToDeleteId, setMotoToDeleteId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Utilizar um ref para o input de arquivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const colRef = collection(db, "showroom");
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data: ShowroomMotorcycle[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as ShowroomMotorcycle);
      });
      const sorted = data.sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return b.createdAt - a.createdAt;
      });
      setMotorcycles(sorted);
      try {
        localStorage.setItem("volt_motors_showroom_cached_all", JSON.stringify(sorted));
      } catch (e) {
        console.error("Erro ao salvar cache completo do showroom:", e);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Erro ao ouvir coleção showroom do Firestore - utilizando backup local do painel:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddClick = () => {
    setEditingMoto({
      status: "available",
      price: 0,
      year: new Date().getFullYear(),
      mileage: 0,
      fuel: "Energia",
      variants: [{ colorName: "Preto", photoBase64: "", gallery: [] }],
    });
    setIsEditing(true);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    variantIndex: number = -1,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file, (base64) => {
        setEditingMoto((prev) => {
          if (!prev) return null;
          if (variantIndex === -1) {
            return { ...prev, photoBase64: base64 };
          }
          const variants = [...(prev.variants || [])];
          variants[variantIndex] = {
            ...variants[variantIndex],
            photoBase64: base64,
          };
          return { ...prev, variants };
        });
      });
    }
  };

  const handleGalleryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    variantIndex: number = -1,
  ) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach((file) => {
      processImage(file, (base64) => {
        setEditingMoto((prev) => {
          if (!prev) return null;
          if (variantIndex === -1) {
            const currentGallery = prev.gallery || [];
            return { ...prev, gallery: [...currentGallery, base64] };
          }
          const variants = [...(prev.variants || [])];
          const currentGallery = variants[variantIndex].gallery || [];
          variants[variantIndex] = {
            ...variants[variantIndex],
            gallery: [...currentGallery, base64],
          };
          return { ...prev, variants };
        });
      });
    });
  };

  const processImage = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Reducing dimensions and quality significantly to fit multiple photos (variants + gallery)
        // into Firestore's 1MB single-document limit.
        const maxDimension = 800; // Reduced from 1440
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
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "medium";
          ctx.drawImage(img, 0, 0, width, height);
          callback(canvas.toDataURL("image/jpeg", 0.75)); // Reduced from 0.92
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removeGalleryImage = (
    indexToRemove: number,
    variantIndex: number = -1,
  ) => {
    setEditingMoto((prev) => {
      if (!prev) return null;
      if (variantIndex === -1) {
        const currentGallery = prev.gallery || [];
        return {
          ...prev,
          gallery: currentGallery.filter((_, idx) => idx !== indexToRemove),
        };
      }
      const variants = [...(prev.variants || [])];
      const currentGallery = variants[variantIndex].gallery || [];
      variants[variantIndex] = {
        ...variants[variantIndex],
        gallery: currentGallery.filter((_, idx) => idx !== indexToRemove),
      };
      return { ...prev, variants };
    });
  };

  const saveMotorcycle = async () => {
    if (
      !editingMoto?.name ||
      !editingMoto?.brand ||
      editingMoto.price === undefined
    ) {
      alert("Por favor, preencha nome, marca e valor.");
      return;
    }

    try {
      const id = editingMoto.id || `MOTO_${Date.now()}`;
      const docRef = doc(db, "showroom", id);

      const parsedPrice =
        typeof editingMoto.price === "string"
          ? parseFloat(
              (editingMoto.price as string)
                .replace(/\./g, "")
                .replace(",", "."),
            ) || 0
          : Number(editingMoto.price || 0);
      const parsedMileage =
        typeof editingMoto.mileage === "string"
          ? parseFloat(
              (editingMoto.mileage as string)
                .replace(/\./g, "")
                .replace(",", "."),
            ) || 0
          : Number(editingMoto.mileage || 0);

      const hasVariants =
        editingMoto.variants && editingMoto.variants.length > 0;

      const payload: ShowroomMotorcycle = {
        id,
        name: editingMoto.name,
        brand: editingMoto.brand,
        price: parsedPrice,
        year: Number(editingMoto.year),
        mileage: parsedMileage,
        description: editingMoto.description || "",
        range: editingMoto.range || "",
        installments: editingMoto.installments || "",
        fuel: editingMoto.fuel || "Energia",
        power: editingMoto.power || "",
        speed: editingMoto.speed || "",
        batteryType: editingMoto.batteryType || "",
        color: hasVariants ? "" : editingMoto.color || "",
        photoBase64: hasVariants ? "" : editingMoto.photoBase64 || "",
        gallery: hasVariants ? [] : editingMoto.gallery || [],
        variants: editingMoto.variants || [],
        status: editingMoto.status as "available" | "sold",
        createdAt: editingMoto.createdAt || Date.now(),
        order: editingMoto.order ?? motorcycles.length,
      };

      const payloadString = JSON.stringify(payload);
      // Firebase document maximum allowed size is 1,048,576 bytes
      if (payloadString.length > 1000000) {
        alert(
          "O tamanho de todas as fotos juntas excedeu o limite máximo (1MB). Por favor, remova algumas imagens ou variações de cor.",
        );
        return;
      }

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
      await setDoc(docRef, {
        ...moto,
        status: moto.status === "available" ? "sold" : "available",
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "showroom");
    }
  };

  const confirmDelete = async () => {
    if (!motoToDeleteId) return;

    if (!user) {
      setDeleteError("Usuário não autenticado.");
      return;
    }

    const SYSTEM_ACCESS_PASSWORD = user.password || "728";

    if (deletePassword !== SYSTEM_ACCESS_PASSWORD) {
      setDeleteError("Senha incorreta.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteDoc(doc(db, "showroom", motoToDeleteId));
      
      setMotoToDeleteId(null);
      setDeletePassword("");
    } catch (error: any) {
      setDeleteError("Erro ao excluir. Tente novamente.");
      handleFirestoreError(error, OperationType.DELETE, "showroom");
    } finally {
      setIsDeleting(false);
    }
  };

  const moveReorder = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === motorcycles.length - 1) return;
    
    const newList = [...motorcycles];
    newList.forEach((m, idx) => {
      if (m.order === undefined) m.order = idx;
    });

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap in array
    const temp = newList[index];
    newList[index] = newList[swapIndex];
    newList[swapIndex] = temp;
    
    // Update order values sequentially to guarantee correct sorting
    newList.forEach((m, idx) => {
      m.order = idx;
    });
    
    // Optimistic update
    setMotorcycles(newList);
    
    try {
      const promises = newList.map(m => 
        setDoc(doc(db, "showroom", m.id), { order: m.order }, { merge: true })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error("Failed to reorder", error);
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
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-900 rounded-full bg-stone-100 shrink-0"
          >
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
              {editingMoto.id ? "Editar Veículo" : "Novo Veículo no Catálogo"}
            </h4>
            <div className="flex flex-col gap-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                    Título / Modelo
                  </label>
                  <input
                    type="text"
                    value={editingMoto.name || ""}
                    onChange={(e) =>
                      setEditingMoto({ ...editingMoto, name: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                      Marca
                    </label>
                    <input
                      type="text"
                      value={editingMoto.brand || ""}
                      onChange={(e) =>
                        setEditingMoto({
                          ...editingMoto,
                          brand: e.target.value,
                        })
                      }
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                      Ano
                    </label>
                    <input
                      type="number"
                      value={editingMoto.year || 2026}
                      onChange={(e) =>
                        setEditingMoto({
                          ...editingMoto,
                          year: Number(e.target.value),
                        })
                      }
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                      Investimento (R$)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Ex: 10.000,00"
                      value={
                        editingMoto.price === 0 ? "" : editingMoto.price || ""
                      }
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.,]/g, "");
                        setEditingMoto({
                          ...editingMoto,
                          price: val as unknown as number,
                        });
                      }}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                      Quilometragem
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Ex: 0"
                      value={
                        editingMoto.mileage === 0
                          ? ""
                          : editingMoto.mileage || ""
                      }
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.,]/g, "");
                        setEditingMoto({
                          ...editingMoto,
                          mileage: val as unknown as number,
                        });
                      }}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Foto e Descrição */}
              <div className="space-y-4 flex flex-col">
                {/* Cores e Variantes */}
                {(editingMoto.variants && editingMoto.variants.length > 0
                  ? editingMoto.variants
                  : [
                      {
                        colorName: editingMoto.color || "",
                        photoBase64: editingMoto.photoBase64 || "",
                        gallery: editingMoto.gallery || [],
                      },
                    ]
                ).map((variant, index, variantsArray) => (
                  <div
                    key={index}
                    className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-4 relative"
                  >
                    {variantsArray.length > 1 && (
                      <button
                        onClick={() => {
                          const newVariants = [...variantsArray];
                          newVariants.splice(index, 1);
                          setEditingMoto((prev) =>
                            prev ? { ...prev, variants: newVariants } : null,
                          );
                        }}
                        className="absolute top-2 right-2 p-1.5 text-stone-400 hover:text-red-500 hover:bg-stone-200 rounded-md transition-colors shadow-sm bg-white border border-stone-200"
                        title="Remover variante"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <div className="mb-4 pr-8">
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                        Cor do Veículo{" "}
                        {index > 0 ? `(Adicional ${index})` : "(Principal)"}
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Preto, Branco, Cinza..."
                        value={variant.colorName || ""}
                        onChange={(e) => {
                          const newVariants = [...variantsArray];
                          newVariants[index].colorName = e.target.value;
                          setEditingMoto((prev) =>
                            prev ? { ...prev, variants: newVariants } : null,
                          );
                        }}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                        Foto Principal ({variant.colorName || "Cor Sem Nome"})
                      </label>
                      <div
                        onClick={() => {
                          const el = document.getElementById(
                            `file-input-var-${index}`,
                          );
                          if (el) el.click();
                        }}
                        className="w-full bg-white border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-stone-50 hover:border-stone-400 transition-colors overflow-hidden group relative p-4"
                      >
                        {variant.photoBase64 ? (
                          <>
                            <img
                              src={variant.photoBase64}
                              alt="Preview"
                              className="w-full h-40 object-contain rounded-lg drop-shadow-sm"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-white text-sm font-bold tracking-wide">
                                Alterar Imagem Única
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center text-stone-400 py-6">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40 group-hover:opacity-60 transition-opacity" />
                            <span className="text-sm font-medium">
                              Selecione uma imagem principal
                            </span>
                          </div>
                        )}
                        <input
                          id={`file-input-var-${index}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, index)}
                        />
                      </div>
                    </div>

                    {/* Galeria de Fotos da Variante */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wide">
                        Galeria Adicional ({variant.colorName || "Cor Sem Nome"}
                        )
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(variant.gallery || []).map((imgBase64, idxImg) => (
                          <div
                            key={idxImg}
                            className="relative group w-full h-24 border border-stone-200 rounded-lg overflow-hidden bg-white flex items-center justify-center p-2"
                          >
                            <img
                              src={imgBase64}
                              alt={`Gallery ${idxImg}`}
                              className="w-full h-full object-contain rounded drop-shadow-sm"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeGalleryImage(idxImg, index);
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500/90 hover:bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <div
                          onClick={() => {
                            const el = document.getElementById(
                              `gallery-input-var-${index}`,
                            );
                            if (el) el.click();
                          }}
                          className="relative w-full h-24 border-2 border-dashed border-stone-200 rounded-lg bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 hover:border-stone-400 transition-colors"
                        >
                          <Plus className="w-5 h-5 text-stone-400 mb-1" />
                          <span className="text-[10px] font-medium text-stone-500 uppercase">
                            Adicionar
                          </span>
                          <input
                            id={`gallery-input-var-${index}`}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleGalleryChange(e, index)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() =>
                    setEditingMoto((prev) => {
                      if (!prev) return null;
                      const currentVars =
                        prev.variants && prev.variants.length > 0
                          ? prev.variants
                          : [
                              {
                                colorName: prev.color || "",
                                photoBase64: prev.photoBase64 || "",
                                gallery: prev.gallery || [],
                              },
                            ];
                      return {
                        ...prev,
                        variants: [
                          ...currentVars,
                          { colorName: "", photoBase64: "", gallery: [] },
                        ],
                      };
                    })
                  }
                  className="w-full py-3 mb-2 border-2 border-dashed border-[#d4af37]/50 rounded-xl text-[#d4af37] font-bold text-sm uppercase tracking-wider hover:bg-[#d4af37]/5 hover:border-[#d4af37] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Adicionar Outra Cor / Modelo
                </button>

                <div className="flex-1 flex flex-col mt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                      Autonomia (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 50 km"
                      value={editingMoto.range || ""}
                      onChange={(e) =>
                        setEditingMoto({
                          ...editingMoto,
                          range: e.target.value,
                        })
                      }
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none mb-4"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                      Parcelamento (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 48x De R$ 399,00"
                      value={editingMoto.installments || ""}
                      onChange={(e) =>
                        setEditingMoto({
                          ...editingMoto,
                          installments: e.target.value,
                        })
                      }
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none mb-4"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                        Tipo de Bateria
                      </label>
                      <select
                        value={editingMoto.batteryType || ""}
                        onChange={(e) =>
                          setEditingMoto({
                            ...editingMoto,
                            batteryType: e.target.value,
                          })
                        }
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                      >
                        <option value="">Não informado</option>
                        <option value="Lítio">Bateria de Lítio</option>
                        <option value="Chumbo">Bateria de Chumbo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                        Potência
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 1000 W"
                        value={editingMoto.power || ""}
                        onChange={(e) =>
                          setEditingMoto({
                            ...editingMoto,
                            power: e.target.value,
                          })
                        }
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                        Velocidade Máxima
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 50 km/h"
                        value={editingMoto.speed || ""}
                        onChange={(e) =>
                          setEditingMoto({
                            ...editingMoto,
                            speed: e.target.value,
                          })
                        }
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                      Descrição Curta
                    </label>
                    <textarea
                      value={editingMoto.description || ""}
                      onChange={(e) =>
                        setEditingMoto({
                          ...editingMoto,
                          description: e.target.value,
                        })
                      }
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
                <p className="text-stone-500 font-light">
                  Nenhum veículo cadastrado no momento.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {motorcycles.map((moto, index) => (
                  <div
                    key={moto.id}
                    className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-5 items-center md:items-start relative"
                  >
                    {/* Order Controls */}
                    <div className="flex flex-row md:flex-col gap-1 items-center justify-center -mb-2 md:mb-0 shrink-0">
                      <button
                        onClick={() => moveReorder(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => moveReorder(index, 'down')}
                        disabled={index === motorcycles.length - 1}
                        className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Imagem Thumbnail */}
                    <div className="w-full md:w-40 h-32 bg-stone-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-stone-100 relative group">
                      {(() => {
                        const mainPhotoInfo =
                          moto.photoBase64 || moto.variants?.[0]?.photoBase64;
                        return mainPhotoInfo ? (
                          <img
                            src={mainPhotoInfo}
                            alt={moto.name}
                            className={`w-full h-full object-contain transition-all ${moto.status === "sold" ? "opacity-50 grayscale" : "group-hover:scale-105"}`}
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-stone-300" />
                        );
                      })()}
                      {moto.status === "sold" && (
                        <div className="absolute inset-0 bg-stone-900/10 flex items-center justify-center">
                          <span className="bg-stone-800 text-white text-xs font-bold px-2 py-1 rounded">
                            OCULTO
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-stone-900 uppercase tracking-tight">
                          {moto.brand} {moto.name}
                        </h3>
                      </div>
                      <p className="text-sm font-medium text-stone-500 mb-2">
                        {moto.year} • {moto.mileage} km
                      </p>
                      <div className="font-extrabold text-lg text-[#ea1d24] mb-3">
                        {moto.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </div>

                      {/* Status Toggle */}
                      <button
                        onClick={() => toggleStatus(moto)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${moto.status === "available" ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"}`}
                      >
                        {moto.status === "available" ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" /> Visível no
                            Site
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5" /> Oculto do Site
                          </>
                        )}
                      </button>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto justify-center md:justify-start pt-4 md:pt-0 border-t md:border-t-0 border-stone-100 shrink-0">
                      <button
                        onClick={() => {
                          setEditingMoto(moto);
                          setIsEditing(true);
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 bg-stone-50 text-stone-700 hover:bg-stone-100 hover:text-blue-600 rounded-xl transition-colors border border-stone-200 text-sm font-semibold"
                      >
                        <Edit2 className="w-4 h-4" /> Editar
                      </button>
                      <button
                        onClick={() => {
                          setMotoToDeleteId(moto.id);
                          setDeletePassword("");
                          setDeleteError("");
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 bg-stone-50 text-stone-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl transition-colors border border-stone-200 text-sm font-semibold"
                      >
                        <Trash2 className="w-4 h-4" /> Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Confirmação de Exclusão */}
      {motoToDeleteId && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                if (!isDeleting) setMotoToDeleteId(null);
              }}
              className="absolute top-4 right-4 p-1 text-stone-400 hover:text-stone-900 rounded-full transition-colors bg-stone-100"
              disabled={isDeleting}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mb-5 text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1">Confirmar Exclusão</h3>
              <p className="text-sm text-stone-500">
                Esta ação apagará definitivamente o modelo do aplicativo e do site. Insira sua senha para confirmar.
              </p>
            </div>
            
            <div className="mb-5">
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide text-center">
                Sua Senha
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError("");
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-center"
                placeholder="******"
                disabled={isDeleting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmDelete();
                }}
              />
              {deleteError && (
                <p className="text-red-500 text-xs text-center mt-2 font-medium">{deleteError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMotoToDeleteId(null)}
                className="flex-1 py-3 bg-stone-100 text-stone-700 rounded-xl text-sm font-bold hover:bg-stone-200 transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-[1.5] py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={isDeleting || !deletePassword}
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Excluir O Modelo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
