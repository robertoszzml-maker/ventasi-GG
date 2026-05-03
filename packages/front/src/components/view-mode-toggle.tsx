import React from "react";
import { Switch } from "@/components/ui/switch";
import { Grid3x3, Table } from "lucide-react";
import { useConfigStore } from "@/stores/config-store";

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useConfigStore();

  return (
    <div className="flex items-center justify-between w-full">
      {viewMode === "table" ? (
        <Table className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Grid3x3 className="h-[1.2rem] w-[1.2rem]" />
      )}
      <Switch
        checked={viewMode === "grid"}
        onCheckedChange={(checked) => setViewMode(checked ? "grid" : "table")}
      />
    </div>
  );
}
