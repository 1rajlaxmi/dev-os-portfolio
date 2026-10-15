import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Code2, Link } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { useAppDispatch } from '../../hooks/useStore';
import { addProject, updateProject, type ProjectItem } from '../../store/slices/adminSlice';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: ProjectItem | null;
}

export const ProjectEditModal = ({ isOpen, onClose, projectToEdit }: Props) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techString, setTechString] = useState('');
  const [github, setGithub] = useState('');
  const [live, setLive] = useState('');

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title);
      setDescription(projectToEdit.description);
      setTechString(projectToEdit.tech.join(', '));
      setGithub(projectToEdit.github || '');
      setLive(projectToEdit.live || '');
    } else {
      setTitle('');
      setDescription('');
      setTechString('');
      setGithub('');
      setLive('');
    }
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please enter a title and description.');
      return;
    }

    const techArray = techString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const projectData: ProjectItem = {
      id: projectToEdit ? projectToEdit.id : `proj-${Date.now()}`,
      title,
      description,
      tech: techArray.length ? techArray : ['React.js', 'Node.js'],
      github,
      live,
      color: projectToEdit?.color || 'from-indigo-600/30 to-purple-600/30',
      borderColor: projectToEdit?.borderColor || 'border-indigo-500/30',
    };

    if (projectToEdit) {
      dispatch(updateProject(projectData));
      toast.success('Project updated successfully! ✏️');
    } else {
      dispatch(addProject(projectData));
      toast.success('New Project created! 🚀');
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9700] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#16161a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Code2 size={18} />
            </div>
            <h3 className="text-base font-bold text-white">
              {projectToEdit ? 'Edit Project' : 'Add New Project'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-gray-300 font-semibold mb-1 block">Project Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Task Queue"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm outline-none focus:border-indigo-500/60"
            />
          </div>

          <div>
            <label className="text-gray-300 font-semibold mb-1 block">Description *</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key achievements, technical architecture, features..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm outline-none resize-none focus:border-indigo-500/60"
            />
          </div>

          <div>
            <label className="text-gray-300 font-semibold mb-1 block">Tech Stack (comma separated)</label>
            <input
              type="text"
              value={techString}
              onChange={(e) => setTechString(e.target.value)}
              placeholder="React.js, Node.js, Socket.io, MongoDB"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm outline-none focus:border-indigo-500/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-300 font-semibold mb-1 block flex items-center gap-1">
                <FaGithub size={12} /> GitHub Repository URL
              </label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-200 outline-none focus:border-indigo-500/60"
              />
            </div>
            <div>
              <label className="text-gray-300 font-semibold mb-1 block flex items-center gap-1">
                <Link size={12} /> Live Demo URL
              </label>
              <input
                type="text"
                value={live}
                onChange={(e) => setLive(e.target.value)}
                placeholder="https://my-app.vercel.app"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-200 outline-none focus:border-indigo-500/60"
              />
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
              {projectToEdit ? <Edit2 size={14} /> : <Plus size={14} />}
              {projectToEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
