import { useState } from "react";
import {
  ExternalLink,
  X,
  ChevronRight,
  Code2,
  Zap,
  Layers,
  FileText,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../hooks/useStore";
import {
  deleteProject,
  type ProjectItem,
} from "../../store/slices/adminSlice";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { ProjectEditModal } from "./ProjectEditModal";
import { toast } from "sonner";
import { sound } from "../../utils/sound";

export const Projects = () => {
  const dispatch = useAppDispatch();
  const projects = useAppSelector((state) => state.admin.projects);
  const isAuthenticated = useAppSelector((state) => state.admin.isAuthenticated);

  const [selected, setSelected] = useState<ProjectItem | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  const handleCreateNew = () => {
    if (!isAuthenticated) return;
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEdit = (proj: ProjectItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    setEditingProject(proj);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      sound.playDeleteSound();
      dispatch(deleteProject(id));
      if (selected?.id === id) setSelected(null);
      toast.success(`Project "${title}" deleted.`);
    }
  };

  return (
    <div className="flex h-full bg-[#111111] text-gray-200 overflow-hidden min-h-0">
      {/* Project Grid */}
      <div
        className={`flex flex-col h-full transition-all duration-300 ${
          selected ? "w-1/2" : "w-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#1a1a1a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Code2 size={18} className="text-indigo-400" />
            </div>

            <div>
              <h1 className="text-base font-semibold text-white">
                Projects
              </h1>
              <p className="text-xs text-gray-500">
                {projects.length} projects · click to explore
              </p>
            </div>
          </div>

          {isAuthenticated && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus size={14} />
              Add Project
            </button>
          )}
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 gap-5 content-start">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => {
                sound.playClick();
                setSelected(project);
              }}
              className={`group relative text-left w-full rounded-2xl border border-t-white/20 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99]
                bg-gradient-to-br ${project.color} ${project.borderColor} shadow-lg
                ${
                  selected?.id === project.id
                    ? "ring-2 ring-indigo-400/60 shadow-xl shadow-indigo-900/40"
                    : "hover:shadow-2xl hover:shadow-black/40"
                }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="font-extrabold text-white text-base tracking-tight group-hover:text-indigo-200 transition-colors">
                    {project.title}
                  </h2>

                  <div className="flex items-center gap-1.5">
                    {isAuthenticated && (
                      <div className="flex items-center gap-1 mr-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <span
                          onClick={(e) => handleEdit(project, e)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-indigo-500/40 text-gray-300 hover:text-white transition-all cursor-pointer"
                          title="Edit Project"
                        >
                          <Edit2 size={13} />
                        </span>
                        <span
                          onClick={(e) => handleDelete(project.id, project.title, e)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/40 text-gray-300 hover:text-red-300 transition-all cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 size={13} />
                        </span>
                      </div>
                    )}

                    <ChevronRight
                      size={18}
                      className={`text-gray-400 transition-all duration-200 shrink-0 mt-0.5 ${
                        selected?.id === project.id
                          ? "text-indigo-400 rotate-90"
                          : "group-hover:translate-x-1"
                      }`}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-5 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-gray-200 border border-white/15 font-mono shadow-sm"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div
          className="flex flex-col h-full w-1/2 border-l border-white/10 bg-[#161616]
          animate-in slide-in-from-right duration-200"
        >
          {/* Panel Header */}
          <div className="flex flex-col border-b border-white/10">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-indigo-400" />
                <span className="font-semibold text-white text-sm">
                  {selected.title}
                </span>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex items-center gap-2 px-6 pb-2 text-xs border-t border-white/5 pt-2 bg-black/20">
              <button
                onClick={() => {
                  sound.playTabSwitch();
                  setActiveTab('overview');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <FileText size={13} />
                Overview & Links
              </button>
              <button
                onClick={() => {
                  sound.playTabSwitch();
                  setActiveTab('architecture');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'architecture'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <Layers size={13} />
                System Architecture
              </button>
            </div>
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'architecture' ? (
              <ArchitectureDiagram projectId={selected.id} />
            ) : (
              <>
                {/* Description */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Overview
              </h3>

              <p className="text-sm text-gray-300 leading-relaxed">
                {selected.description}
              </p>
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Tech Stack
              </h3>

              <div className="flex flex-wrap gap-2">
                {selected.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Links
              </h3>

              <div className="flex flex-col gap-2">
                {selected.github ? (
                  <a
                    href={selected.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
                  >
                    <FaGithub
                      size={16}
                      className="text-gray-400 group-hover:text-white"
                    />

                    <span className="text-sm text-gray-300 group-hover:text-white">
                      View Source Code
                    </span>

                    <ExternalLink
                      size={12}
                      className="ml-auto text-gray-500 group-hover:text-gray-300"
                    />
                  </a>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/3 border border-white/5 opacity-50">
                    <FaGithub
                      size={16}
                      className="text-gray-600"
                    />

                    <span className="text-sm text-gray-500">
                      Private / Not publicly available
                    </span>
                  </div>
                )}

                {selected.live ? (
                  <a
                    href={selected.live}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600/15 border border-indigo-500/25 hover:bg-indigo-600/25 transition-all duration-200 group"
                  >
                    <ExternalLink
                      size={16}
                      className="text-indigo-400 group-hover:text-indigo-300"
                    />

                    <span className="text-sm text-indigo-300 group-hover:text-indigo-200">
                      Live Demo
                    </span>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/3 border border-white/5 opacity-50">
                    <ExternalLink
                      size={16}
                      className="text-gray-600"
                    />

                    <span className="text-sm text-gray-500">
                      No live demo available
                    </span>
                  </div>
                )}
              </div>
            </div>
            </>
            )}
          </div>
        </div>
      )}

      <ProjectEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectToEdit={editingProject}
      />
    </div>
  );
};