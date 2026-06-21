import { FileDown } from "lucide-react";
import workflowPdf from "@/assets/zhoop-workflow.pdf.asset.json";
import { Button } from "@/components/ui/button";

const WorkflowDownload = ({ floating = false }: { floating?: boolean }) => {
  if (floating) {
    return (
      <a
        href={workflowPdf.url}
        download="Zhoop_Ride_Matching_Workflow.pdf"
        className="fixed bottom-4 right-4 z-40 group flex items-center gap-2 px-3 py-2.5 rounded-full bg-card border border-border shadow-lg hover:shadow-xl hover:border-primary/40 transition-all"
        title="Download Zhoop workflow architecture"
      >
        <FileDown className="w-4 h-4 text-primary" />
        <span className="text-xs font-display font-semibold text-foreground hidden group-hover:inline">
          Workflow PDF
        </span>
      </a>
    );
  }
  return (
    <Button asChild variant="outline" size="sm" className="gap-1.5 font-display text-xs rounded-lg">
      <a href={workflowPdf.url} download="Zhoop_Ride_Matching_Workflow.pdf">
        <FileDown className="w-3.5 h-3.5" />
        Workflow
      </a>
    </Button>
  );
};

export default WorkflowDownload;
