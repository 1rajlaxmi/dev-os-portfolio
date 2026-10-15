import React from 'react';
import { Folder, FileText, Code, ChevronRight, Home } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useStore';
import { openWindow } from '../../store/slices/windowManagerSlice';
import { sound } from '../../utils/sound';

export const Explorer = () => {
  const dispatch = useAppDispatch();
  const allFiles = useAppSelector((state) => state.vfs.files);
  const [currentParentId, setCurrentParentId] = React.useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = React.useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'home' },
  ]);

  const visibleFiles = allFiles.filter((f) => f.parentId === currentParentId);

  const getFileIcon = (name: string) => {
    if (name.endsWith('.json')) return Code;
    return FileText;
  };

  const handleDoubleClick = (file: (typeof allFiles)[number]) => {
    if (file.type === 'folder') {
      sound.playClick();
      setCurrentParentId(file.id);
      setBreadcrumbs((prev) => [...prev, { id: file.id, name: file.name }]);
    } else {
      sound.playWindowOpen();
      dispatch(
        openWindow({
          id: `notes-${file.id}`,
          appId: 'notes',
          title: file.name,
          fileId: file.id,
        })
      );
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    sound.playTabSwitch();
    const crumb = breadcrumbs[index];
    setCurrentParentId(crumb.id);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300">
      {/* Path / Breadcrumb Bar */}
      <div className="flex items-center gap-1 px-4 py-2 bg-[#2d2d2d] border-b border-black/50 text-xs select-none">
        <Home size={12} className="text-gray-500 mr-1" />
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} className="text-gray-600" />}
            <button
              onClick={() => navigateToBreadcrumb(i)}
              className={`transition-colors hover:text-white ${
                i === breadcrumbs.length - 1 ? 'text-gray-200 font-medium' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {visibleFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500 text-sm">
            <Folder size={32} className="opacity-30" />
            <span>This directory is empty</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 content-start">
            {visibleFiles.map((file) => {
              const Icon = file.type === 'folder' ? Folder : getFileIcon(file.name);
              return (
                <div
                  key={file.id}
                  onDoubleClick={() => handleDoubleClick(file)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/8 cursor-pointer transition-all duration-150 group select-none"
                  title={`Double-click to ${file.type === 'folder' ? 'open' : 'view'} ${file.name}`}
                >
                  <Icon
                    size={40}
                    className={`transition-colors ${
                      file.type === 'folder'
                        ? 'text-blue-400 group-hover:text-blue-300'
                        : 'text-gray-400 group-hover:text-gray-200'
                    }`}
                  />
                  <span className="text-xs text-center truncate w-full text-gray-400 group-hover:text-white transition-colors leading-tight">
                    {file.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};