import { getLocalFile, LocalFile, removeLocalFile, saveLocalFile } from "@/lib/localFiles";

export type OfflinePresentation = LocalFile;

export const saveOfflinePresentation = (file: Blob, name: string) => saveLocalFile("presentation", file, name);
export const getOfflinePresentation = () => getLocalFile("presentation");
export const removeOfflinePresentation = () => removeLocalFile("presentation");
