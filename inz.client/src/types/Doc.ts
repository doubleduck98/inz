export interface Doc {
  id: number;
  fileName: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'txt' | 'unknown';
}
