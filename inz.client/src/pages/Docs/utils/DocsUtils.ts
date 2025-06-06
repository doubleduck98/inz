export const stripExtension = (filename: string | undefined) => {
  if (!filename) return filename;
  const dot = filename.lastIndexOf('.');
  if (dot < 0) return filename;
  return filename.slice(0, dot);
};
