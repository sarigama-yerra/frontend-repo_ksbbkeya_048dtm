import { useEffect, useRef, useState } from "react";
import { Users, CheckCircle2, AlertTriangle } from "lucide-react";

export default function TechnicianAssignModal({ lang='en', open, onClose, technicians=[], initialSelected=[], initialPrimary=null, onSave }){
  const [selected, setSelected] = useState(new Set(initialSelected));
  const [primary, setPrimary] = useState(initialPrimary || null);

  useEffect(()=>{
    setSelected(new Set(initialSelected));
    setPrimary(initialPrimary || null);
  }, [initialSelected, initialPrimary, open]);

  const t = (k) => {
    const dict = {
      title: lang==='ar'? 'تعيين الفنيين' : 'Assign Technicians',
      capacity: lang==='ar'? 'السعة' : 'Capacity',
      remaining: lang==='ar'? 'المتبقي' : 'Remaining',
      primary: lang==='ar'? 'رئيسي' : 'Primary',
      save: lang==='ar'? 'حفظ' : 'Save',
      cancel: lang==='ar'? 'إلغاء' : 'Cancel',
      atCapacity: lang==='ar'? 'ممتلئ' : 'At capacity',
      tip: lang==='ar'? 'اختر فنيًا رئيسيًا واحدًا' : 'Select one primary technician',
    };
    return dict[k];
  };

  const toggle = (id, rem) => {
    const copy = new Set(selected);
    if(copy.has(id)){
      copy.delete(id);
      if(primary === id){
        setPrimary(null);
      }
    } else {
      if(rem <= 0){
        return; // cannot add over capacity locally
      }
      copy.add(id);
    }
    setSelected(copy);
  };

  const handleSave = () => {
    if(onSave){
      onSave(Array.from(selected), primary || null);
    }
    onClose && onClose();
  };

  if(!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl mx-4 rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="flex items-center gap-2 text-slate-200 mb-3">
          <Users className="w-5 h-5"/> {t('title')}
        </div>
        <div className="text-xs text-slate-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {t('tip')}</div>
        <div className="max-h-[50vh] overflow-auto space-y-2 pr-1">
          {technicians.map(tech => {
            const selectedFlag = selected.has(tech.id);
            const rem = tech.remaining_capacity ?? 0;
            return (
              <div key={tech.id} className={`grid grid-cols-12 gap-2 items-center rounded-lg border ${selectedFlag? 'border-blue-500 bg-blue-950/20':'border-slate-800 bg-slate-950/40'} p-2`}>
                <div className="col-span-6 flex items-center gap-2">
                  <button onClick={()=>toggle(tech.id, rem)} className={`px-2 py-1 rounded border ${selectedFlag? 'bg-blue-600 border-blue-500':'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}>{selectedFlag? <CheckCircle2 className="w-4 h-4"/> : ''}</button>
                  <div className="text-sm">{tech.name}</div>
                </div>
                <div className="col-span-3 text-xs text-slate-400">
                  {t('capacity')}: <span className="text-slate-300">{tech.capacity}</span> · {t('remaining')}: <span className={`font-semibold ${rem>0? 'text-emerald-300':'text-amber-300'}`}>{rem>0? rem : t('atCapacity')}</span>
                </div>
                <div className="col-span-3 flex justify-end">
                  <label className={`px-2 py-1 rounded border cursor-pointer ${primary===tech.id? 'bg-emerald-700 border-emerald-500 text-white':'bg-slate-800 border-slate-700 text-slate-300'}`}>
                    <input type="radio" name="primaryTech" className="hidden" disabled={!selectedFlag} checked={primary===tech.id} onChange={()=> setPrimary(tech.id)} />
                    {t('primary')}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700">{t('cancel')}</button>
          <button onClick={handleSave} className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500">{t('save')}</button>
        </div>
      </div>
    </div>
  );
}
