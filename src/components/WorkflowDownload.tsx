import { FileDown } from "lucide-react";

/**
 * Floating button in the bottom-right corner — downloads the Zhoop
 * workflow architecture PDF. The file lives in /public/workflow-architecture.pdf
 * so the host can replace it at any time without a code change.
 */
const WorkflowDownload = () => {
  return (
    <a
      href="/workflow-architecture.pdf"
      download="Zhoop-Workflow-Architecture.pdf"
      target="_blank"
      rel="noopener"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl px-3.5 py-2.5 text-xs font-display font-semibold transition-all hover:scale-105"
      title="Download Zhoop Workflow Architecture"
      aria-label="Download workflow architecture PDF"
    >
      <FileDown className="w-4 h-4" />
      <span className="hidden sm:inline">Workflow PDF</span>
    </a>
  );
};

export default WorkflowDownload;
