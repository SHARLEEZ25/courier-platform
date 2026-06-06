import { Loader2 } from "lucide-react";

const PageLoader = ({ message = "Loading…" }: { message?: string }) => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  </div>
);

export default PageLoader;
