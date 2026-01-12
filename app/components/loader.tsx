import { Loader2 } from "lucide-react";

import { cn } from "../libs/utils";

export const Loader = ({ className }: { className?: string }) => {
  return (
    <div className={cn("h-screen w-screen ", className)}>
      <div className="w-full h-full flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
      </div>
    </div>
  );
};
