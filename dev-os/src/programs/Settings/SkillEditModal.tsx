import { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useStore';
import { addSkill } from '../../store/slices/adminSlice';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_OPTIONS = [
  { label: 'Cyan / Blue', value: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  { label: 'Indigo / Purple', value: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  { label: 'Green / Emerald', value: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { label: 'Orange / Amber', value: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  { label: 'Pink / Rose', value: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
];

export const SkillEditModal = ({ isOpen, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a skill name.');
      return;
    }

    dispatch(addSkill({ name: name.trim(), color: selectedColor }));
    toast.success(`Added skill "${name}" to Tech Stack! 🚀`);
    setName('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9700] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#16161a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles size={18} />
            </div>
            <h3 className="text-base font-bold text-white">Add Tech Skill</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-gray-300 font-semibold mb-1 block">Skill / Technology Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. GraphQL / Docker / Redis"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm outline-none focus:border-indigo-500/60"
              autoFocus
            />
          </div>

          <div>
            <label className="text-gray-300 font-semibold mb-1.5 block">Badge Color Scheme</label>
            <div className="space-y-1.5">
              {COLOR_OPTIONS.map((opt) => (
                <label
                  key={opt.label}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedColor === opt.value
                      ? 'bg-indigo-500/20 border-indigo-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="text-gray-300 font-medium">{opt.label}</span>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full border font-mono font-bold ${opt.value}`}>
                    Preview Badge
                  </span>
                  <input
                    type="radio"
                    name="skillColor"
                    value={opt.value}
                    checked={selectedColor === opt.value}
                    onChange={() => setSelectedColor(opt.value)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-900/40"
            >
              <Plus size={14} />
              Add Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
