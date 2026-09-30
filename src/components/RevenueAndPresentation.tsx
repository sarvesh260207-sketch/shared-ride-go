import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";
import {
  Download,
  ExternalLink,
  FileSliders,
  FileSpreadsheet,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Presentation,
  Trash2,
  Upload,
  Video as VideoIcon,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FileSlot, getLocalFile, LocalFile, removeLocalFile, saveLocalFile } from "@/lib/localFiles";
import { toast } from "sonner";

const BUCKET = "user-presentations";
const PPT_MAX_SIZE = 20 * 1024 * 1024;
const VIDEO_MAX_SIZE = 200 * 1024 * 1024;
const SHEET_MAX_SIZE = 20 * 1024 * 1024;
const SHEET_LINK_KEY = "zhoop-google-sheet-link";

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const extensionOf = (file: File) => file.name.split(".").pop()?.toLowerCase() ?? "";
const isPowerPoint = (file: File) => ["ppt", "pptx"].includes(extensionOf(file));
const isVideo = (file: File) =>
  file.type.startsWith("video/") || ["mp4", "mov", "webm", "mkv", "avi", "m4v"].includes(extensionOf(file));
const isSpreadsheet = (file: File) => ["xls", "xlsx", "csv", "ods"].includes(extensionOf(file));

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function isGoogleSheetsLink(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "docs.google.com" && url.pathname.startsWith("/spreadsheets");
  } catch {
    return false;
  }
}

interface PublishedFile {
  label: string;
  href: string;
  fileName: string;
  kind?: "video";
}

const PUBLISHED_DECK: PublishedFile = {
  label: "Zhoop Pitch Deck",
  href: "/files/zhoop-pitch-deck.pdf",
  fileName: "Zhoop_Pitch_Deck.pdf",
};

const PUBLISHED_VIDEO: PublishedFile = {
  label: "Problem Statement Video",
  href: "/files/problem-statement.mp4",
  fileName: "Zhoop_Problem_Statement.mp4",
  kind: "video",
};

const PUBLISHED_SURVEY: PublishedFile = {
  label: "Chennai Ride Sharing Survey",
  href: "/files/chennai-ride-sharing-survey.pdf",
  fileName: "Chennai_Ride_Sharing_Survey.pdf",
};

// A file bundled with the site, so it is visible on every device with no sign-in.
function PublishedFileCard({ file }: { file: PublishedFile }) {
  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Available for everyone</p>
      <p className="mt-1 truncate text-sm font-semibold">{file.label}</p>
      {file.kind === "video" && (
        <video
          src={file.href}
          controls
          playsInline
          preload="metadata"
          className="mt-3 max-h-64 w-full rounded-md border border-border bg-black"
        />
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Button asChild>
          <a href={file.href} target="_blank" rel="noopener noreferrer"><ExternalLink /> {file.kind === "video" ? "Open full screen" : "View"}</a>
        </Button>
        <Button variant="outline" asChild>
          <a href={file.href} download={file.fileName}><Download /> Download</a>
        </Button>
      </div>
    </div>
  );
}

interface LocalFileDialogProps {
  slot: FileSlot;
  title: string;
  description: string;
  triggerTitle: string;
  triggerEmpty: string;
  icon: ReactNode;
  accept: string;
  maxSize: number;
  validate: (file: File) => boolean;
  invalidMessage: string;
  emptyHint: string;
  preview?: "video";
  published?: PublishedFile;
  children?: ReactNode;
}

// Upload / download / remove for one file, stored on this device (no sign-in needed).
function LocalFileDialog({
  slot,
  title,
  description,
  triggerTitle,
  triggerEmpty,
  icon,
  accept,
  maxSize,
  validate,
  invalidMessage,
  emptyHint,
  preview,
  published,
  children,
}: LocalFileDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<LocalFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getLocalFile(slot)
      .then((saved) => { if (active) setFile(saved); })
      .catch((error) => console.error(`Could not read saved ${slot}`, error));
    return () => { active = false; };
  }, [slot]);

  useEffect(() => {
    if (preview !== "video" || !file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file.blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, preview]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;
    if (!validate(selected)) {
      toast.error(invalidMessage);
      return;
    }
    if (selected.size > maxSize) {
      toast.error(`The file must be ${formatSize(maxSize)} or smaller.`);
      return;
    }
    setBusy(true);
    try {
      await saveLocalFile(slot, selected, selected.name);
      setFile(await getLocalFile(slot));
      toast.success("Saved on this device.");
    } catch (error) {
      console.error(`Saving ${slot} failed`, error);
      toast.error("The file could not be saved. Your browser storage may be full or blocked.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      await removeLocalFile(slot);
      setFile(null);
      toast.success("File removed.");
    } catch (error) {
      console.error(`Removing ${slot} failed`, error);
      toast.error("The file could not be removed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-16 justify-start gap-3 px-5 text-base font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</span>
          <span className="min-w-0 text-left">
            <span className="block">{triggerTitle}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">{file?.name ?? triggerEmpty}</span>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {published && <PublishedFileCard file={published} />}
          <input ref={inputRef} type="file" accept={accept} className="sr-only" onChange={handleUpload} />
          {previewUrl && <video src={previewUrl} controls className="max-h-64 w-full rounded-md border border-border bg-black" />}
          <div className="flex items-start gap-3 rounded-md border border-border p-4">
            <span className="mt-0.5 flex-shrink-0 text-primary">{icon}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{file?.name ?? "Nothing uploaded yet"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {file ? `${formatSize(file.size)} · saved on this device` : emptyHint}
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <Upload />}
              {file ? "Replace" : "Upload"}
            </Button>
            <Button variant="outline" onClick={() => file && downloadBlob(file.blob, file.name)} disabled={busy || !file}>
              <Download /> Download
            </Button>
          </div>
          {children}
        </div>
        {file && (
          <DialogFooter>
            <Button variant="destructive" onClick={handleRemove} disabled={busy}>
              <Trash2 /> Remove
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GoogleSheetLink() {
  const [link, setLink] = useState("");
  const [savedLink, setSavedLink] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSavedLink(localStorage.getItem(SHEET_LINK_KEY));
    } catch {
      setSavedLink(null);
    }
  }, []);

  const save = () => {
    const value = link.trim();
    if (!isGoogleSheetsLink(value)) {
      toast.error("Paste a Google Sheets link (https://docs.google.com/spreadsheets/...).");
      return;
    }
    try {
      localStorage.setItem(SHEET_LINK_KEY, value);
    } catch {
      toast.error("Your browser blocked saving the link.");
      return;
    }
    setSavedLink(value);
    setLink("");
    toast.success("Google Sheets link saved on this device.");
  };

  const clear = () => {
    try {
      localStorage.removeItem(SHEET_LINK_KEY);
    } catch {
      /* ignore */
    }
    setSavedLink(null);
  };

  return (
    <div className="space-y-2 border-t border-border pt-4">
      <p className="text-sm font-semibold">Or link a Google Sheet</p>
      {savedLink && (
        <div className="flex items-center gap-2 rounded-md border border-border p-3">
          <LinkIcon className="h-4 w-4 flex-shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{savedLink}</span>
          <Button size="sm" variant="outline" asChild>
            <a href={savedLink} target="_blank" rel="noopener noreferrer"><ExternalLink /> Open</a>
          </Button>
          <Button size="sm" variant="ghost" onClick={clear} aria-label="Remove Google Sheets link">
            <Trash2 />
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={link}
          onChange={(event) => setLink(event.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          aria-label="Google Sheets link"
        />
        <Button variant="secondary" onClick={save}>Save</Button>
      </div>
      <p className="text-xs text-muted-foreground">Make sure the sheet's sharing is set so the people who need it can open it.</p>
    </div>
  );
}

export default function RevenueAndPresentation() {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [storedPath, setStoredPath] = useState<string | null>(null);
  const [storedName, setStoredName] = useState<string | null>(null);
  const [offlineFile, setOfflineFile] = useState<LocalFile | null>(null);
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
    getLocalFile("presentation")
      .then((file) => { if (active) setOfflineFile(file); })
      .catch((error) => console.error("Could not read saved presentation", error));

    // Cloud sync is optional and only for signed-in users.
    if (!user || !navigator.onLine) {
      setStoredPath(null);
      setStoredName(null);
      return () => { active = false; };
    }

    supabase.storage.from(BUCKET).list(user.id, { limit: 1 }).then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error("Could not check cloud presentation", error);
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
    if (!file) return;
    if (!isPowerPoint(file)) {
      toast.error("Choose a .ppt or .pptx PowerPoint file.");
      return;
    }
    if (file.size > PPT_MAX_SIZE) {
      toast.error("The presentation must be 20 MB or smaller.");
      return;
    }

    setBusy(true);
    try {
      // 1) Always save on this device: works with no sign-in and offline.
      await saveLocalFile("presentation", file, file.name);
      setOfflineFile(await getLocalFile("presentation"));

      // 2) If signed in and online, also back it up to the user's private cloud folder.
      if (user && navigator.onLine) {
        try {
          const path = `${user.id}/presentation.${extensionOf(file) || "pptx"}`;
          if (storedPath && storedPath !== path) {
            const { error: removeError } = await supabase.storage.from(BUCKET).remove([storedPath]);
            if (removeError) throw removeError;
          }
          const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
            upsert: true,
            contentType: file.type || "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          });
          if (error) throw error;
          setStoredPath(path);
          setStoredName(file.name);
          toast.success("PowerPoint saved on this device and synced to your account.");
        } catch (cloudError) {
          console.error("Cloud sync failed", cloudError);
          toast.success("PowerPoint saved on this device. Cloud sync failed.");
        }
      } else {
        toast.success("PowerPoint saved on this device.");
      }
    } catch (error) {
      console.error("Presentation upload failed", error);
      toast.error("The PowerPoint could not be saved. Your browser storage may be full or blocked.");
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
      toast.error("This presentation is not available on this device yet.");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.storage.from(BUCKET).download(storedPath);
      if (error) throw error;
      const name = storedName ?? "Zhoop_Presentation.pptx";
      await saveLocalFile("presentation", data, name);
      setOfflineFile(await getLocalFile("presentation"));
      downloadBlob(data, name);
    } catch (error) {
      console.error("Presentation download failed", error);
      toast.error("The PowerPoint could not be downloaded.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      if (user && storedPath && navigator.onLine) {
        const { error } = await supabase.storage.from(BUCKET).remove([storedPath]);
        if (error) throw error;
        setStoredPath(null);
        setStoredName(null);
      }
      await removeLocalFile("presentation");
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
                <DialogDescription>
                  Keep one presentation, up to 20 MB. No sign-in needed.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <PublishedFileCard file={PUBLISHED_DECK} />
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
                      {offlineFile
                        ? storedPath
                          ? "Saved on this device and synced to your account."
                          : "Saved on this device. Sign in if you want it synced to your account."
                        : storedPath
                          ? isOnline
                            ? "Saved in your account. Download once to keep it on this device."
                            : "Saved in your account. Reconnect to download it."
                          : "Upload a .ppt or .pptx file."}
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button onClick={() => inputRef.current?.click()} disabled={busy}>
                    {busy ? <Loader2 className="animate-spin" /> : <Upload />}
                    {hasPresentation ? "Replace" : "Upload"}
                  </Button>
                  <Button variant="outline" onClick={handleDownload} disabled={busy || !hasPresentation}>
                    <Download /> Download
                  </Button>
                </div>
              </div>

              {hasPresentation && (
                <DialogFooter>
                  <Button variant="destructive" onClick={handleRemove} disabled={busy}>
                    <Trash2 /> Remove
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>

          <LocalFileDialog
            slot="video"
            title="Your Video"
            description="Keep one video, up to 200 MB. No sign-in needed."
            triggerTitle="Video Drive"
            triggerEmpty="Upload and keep one video"
            icon={<VideoIcon className="h-5 w-5" />}
            accept="video/*,.mp4,.mov,.webm,.mkv,.avi,.m4v"
            maxSize={VIDEO_MAX_SIZE}
            validate={isVideo}
            invalidMessage="Choose a video file (mp4, mov, webm, mkv, avi)."
            emptyHint="Upload an .mp4, .mov or .webm video."
            preview="video"
            published={PUBLISHED_VIDEO}
          />

          <LocalFileDialog
            slot="spreadsheet"
            title="Your Spreadsheet"
            description="Keep one Excel or Google Sheets file, up to 20 MB. No sign-in needed."
            triggerTitle="Excel / Google Sheet"
            triggerEmpty="Upload a file or add a link"
            icon={<FileSpreadsheet className="h-5 w-5" />}
            accept=".xls,.xlsx,.csv,.ods,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            maxSize={SHEET_MAX_SIZE}
            published={PUBLISHED_SURVEY}
            validate={isSpreadsheet}
            invalidMessage="Choose an Excel file (.xls, .xlsx), .csv or .ods."
            emptyHint="Upload .xlsx, .xls or .csv. In Google Sheets use File > Download > Excel (.xlsx)."
          >
            <GoogleSheetLink />
          </LocalFileDialog>
        </div>
      </div>
    </section>
  );
}
