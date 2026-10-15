export type FileType = 'folder' | 'file' | 'link';

export interface VFSNode {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null;
  appId?: string; // If it's a file, what app opens it? (e.g., 'notes', 'resume')
  content?: string; // For simple markdown files
  icon?: 'folder' | 'document' | 'image' | 'code';
}