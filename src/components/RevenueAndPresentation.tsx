import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Download, FileSliders, Image as ImageIcon, Loader2, LogIn, Presentation, Trash2, Upload } from "lucide-react";
import revenueModel from "@/assets/zhoop-revenue-model.jpeg.asset.json";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  getOfflinePresentation,
  OfflinePresentation,
  removeOfflinePresentation,
  saveOfflinePresentation,
} from "@/lib/offlinePresentation";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const BUCKET = "user-presentations";
const MAX_FILE_SIZE = 20 * 1024 * 1024;

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isPowerPoint(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension === "ppt" || extension === "pptx";
}

export default function RevenueAndPresentation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [storedPath, setStoredPath] = useState<string | null>(null);
  const [storedName, setStoredName] = useState<string | null>(null);
  const [offlineFile, setOfflineFile] = useState<OfflinePresentation | null>(null);
  const [busy, setBusy] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    let active = true;
    getOfflinePresentation().then((file) => {
      if (active) setOfflineFile(file);
    });

    if (!user || !navigator.onLine) {
      setStoredPath(null);
      setStoredName(null);
      return () => { active = false; };
    }

    supabase.storage.from(BUCKET).list(user.id, { limit: 1 }).then(({ data, error }) => {
      if (!active) return;
      if (error) {
        toast.error("Could not check your saved presentation.");
        return;
      }
      const file = data?.[0];
      setStoredPath(file ? `${user.id}/${file.name}` : null);
      setStoredName(file?.name ?? null);
    });
    return () => { active = false; };
  }, [user]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;
    if (!isPowerPoint(file)) {
      toast.error("Choose a .ppt or .pptx PowerPoint file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("The presentation must be 20 MB or smaller.");
      return;
    }
    if (!navigator.onLine) {
      toast.error("Reconnect to upload a new presentation.");
      return;
    }

    setBusy(true);
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "pptx";
    const path = `${user.id}/presentation.${extension}`;
    try {
      if (storedPath && storedPath !== path) {
        const { error: removeError } = await supabase.storage.from(BUCKET).remove([storedPath]);
        if (removeError) throw removeError;
      }
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        upsert: true,
        contentType: file.type || "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });
      if (error) throw error;
      await saveOfflinePresentation(file, file.name);
      setStoredPath(path);
      setStoredName(file.name);
      setOfflineFile(await getOfflinePresentation());
      toast.success("PowerPoint saved and available offline on this device.");
    } catch (error) {
      console.error("Presentation upload failed", error);
      toast.error("The PowerPoint could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async () => {
    if (offlineFile) {
      downloadBlob(offlineFile.blob, offlineFile.name);
      return;
    }
    if (!storedPath || !user || !navigator.onLine) {
      toast.error("This presentation is not available offline on this device yet.");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.storage.from(BUCKET).download(storedPath);
      if (error) throw error;
      const name = storedName ?? "Zhoop_Presentation.pptx";
      await saveOfflinePresentation(data, name);
      setOfflineFile(await getOfflinePresentation());
      downloadBlob(data, name);
    } catch (error) {
      console.error("Presentation download failed", error);
      toast.error("The PowerPoint could not be downloaded.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!user || !storedPath || !navigator.onLine) return;
    setBusy(true);
    try {
      const { error } = await supabase.storage.from(BUCKET).remove([storedPath]);
      if (error) throw error;
      await removeOfflinePresentation();
      setStoredPath(null);
      setStoredName(null);
      setOfflineFile(null);
      toast.success("PowerPoint removed.");
    } catch (error) {
      console.error("Presentation removal failed", error);
      toast.error("The PowerPoint could not be removed.");
    } finally {
      setBusy(false);
    }
  };

  const hasPresentation = Boolean(storedPath || offlineFile);

  return (
    <section className="border-t border-border bg-card/60 py-10" aria-label="Revenue model and presentation files">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="revenue-model-button h-16 justify-start gap-3 px-5 text-base font-bold">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-foreground/15">
                  <ImageIcon className="h-5 w-5" />
                </span>
                Revenue Model
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto p-3 sm:p-5">
              <DialogHeader className="px-2 pt-2">
                <DialogTitle>Zhoop Revenue Model</DialogTitle>
                <DialogDescription>Daily revenue model at 1% Chennai market capture.</DialogDescription>
              </DialogHeader>
              <img
                src={revenueModel.url}
                alt="Zhoop Chennai daily revenue model showing carbon credits and platform fee revenue"
                className="h-auto w-full rounded-md border border-border"
              />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-16 justify-start gap-3 px-5 text-base font-bold">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Presentation className="h-5 w-5" />
                </span>
                <span className="min-w-0 text-left">
                  <span className="block">PowerPoint Drive</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {hasPresentation ? offlineFile?.name ?? storedName ?? "1 presentation saved" : "Upload and keep one file"}
                  </span>
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Your PowerPoint</DialogTitle>
                <DialogDescription>Keep one private presentation, up to 20 MB.</DialogDescription>
              </DialogHeader>

              {!user ? (
                <div className="rounded-md border border-border bg-muted/50 p-5 text-center">
                  <LogIn className="mx-auto mb-3 h-7 w-7 text-primary" />
                  <p className="mb-4 text-sm text-muted-foreground">Sign in to keep your presentation private and synced.</p>
                  <Button onClick={() => navigate("/auth")}><LogIn /> Sign in</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    className="sr-only"
                    onChange={handleUpload}
                  />
                  <div className="flex items-start gap-3 rounded-md border border-border p-4">
                    <FileSliders className="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{offlineFile?.name ?? storedName ?? "No presentation uploaded"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {!isOnline
                          ? "Offline — your device copy remains available."
                          : offlineFile
                            ? "Saved online and available offline on this device."
                            : storedPath
                              ? "Saved online. Download once to keep it offline."
                              : "Upload a .ppt or .pptx file."}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button onClick={() => inputRef.current?.click()} disabled={busy || !isOnline}>
                      {busy ? <Loader2 className="animate-spin" /> : <Upload />}
                      {hasPresentation ? "Replace" : "Upload"}
                    </Button>
                    <Button variant="outline" onClick={handleDownload} disabled={busy || !hasPresentation}>
                      <Download /> Download
                    </Button>
                  </div>
                </div>
              )}

              {user && hasPresentation && (
                <DialogFooter>
                  <Button variant="destructive" onClick={handleRemove} disabled={busy || !isOnline}>
                    <Trash2 /> Remove
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
