"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  Copy,
  Download,
  FileText,
  Loader2,
  Scissors,
  Search,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";

// Mock process data for when not running in Electron
const mockProcesses = [
  {
    id: 1,
    name: "File Download",
    type: "download",
    progress: 45,
    estimatedTimeRemaining: "01:23:45",
    cpu: 2.5,
    memory: 125.4,
    selected: false,
  },
  {
    id: 2,
    name: "Large File Deletion",
    type: "delete",
    progress: 78,
    estimatedTimeRemaining: "00:12:30",
    cpu: 1.2,
    memory: 45.7,
    selected: false,
  },
  {
    id: 3,
    name: "Backup Copy",
    type: "copy",
    progress: 23,
    estimatedTimeRemaining: "00:45:10",
    cpu: 3.7,
    memory: 210.3,
    selected: false,
  },
  {
    id: 4,
    name: "Video File Cut",
    type: "cut",
    progress: 67,
    estimatedTimeRemaining: "00:08:15",
    cpu: 5.1,
    memory: 345.8,
    selected: false,
  },
  {
    id: 5,
    name: "Document Export",
    type: "export",
    progress: 92,
    estimatedTimeRemaining: "00:02:45",
    cpu: 0.8,
    memory: 78.2,
    selected: false,
  },
];

interface Process {
  id: number;
  name: string;
  type: string;
  progress: number;
  estimatedTimeRemaining: string;
  cpu: number;
  memory: number;
  selected: boolean;
}

interface ProcessListProps {
  waitForProcesses: boolean;
  isElectron: boolean;
  onProcessSelection: (processIds: number[]) => void;
  modernUI?: boolean;
}

export default function ProcessList({
  waitForProcesses,
  isElectron,
  onProcessSelection,
  modernUI = false,
}: ProcessListProps) {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Get process icon based on type
  const getProcessIcon = (type: string) => {
    switch (type) {
      case "download":
        return isMounted && <Download className="h-4 w-4" />;
      case "delete":
        return isMounted && <Trash className="h-4 w-4" />;
      case "copy":
        return isMounted && <Copy className="h-4 w-4" />;
      case "cut":
        return isMounted && <Scissors className="h-4 w-4" />;
      case "export":
        return isMounted && <FileText className="h-4 w-4" />;
      default:
        return isMounted && <FileText className="h-4 w-4" />;
    }
  };

  // Load processes
  useEffect(() => {
    const loadProcesses = async () => {
      setLoading(true);
      setError(null);

      try {
        let processData: Process[];

        if (isElectron) {
          // Get real processes from Electron
          processData = await window.electron.getProcesses();
        } else {
          // Use mock data when not in Electron
          processData = [...mockProcesses];
        }

        setProcesses(processData);
      } catch (err) {
        console.error("Error loading processes:", err);
        setError("Failed to load system processes. Please try again.");
        setProcesses([...mockProcesses]); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    loadProcesses();

    // Refresh processes every 10 seconds if in Electron
    const interval = isElectron ? setInterval(loadProcesses, 10000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isElectron]);

  useEffect(() => {
    // Mark component as mounted to prevent hydration mismatch
    setIsMounted(true);
  }, []);

  // Handle process selection
  const handleProcessSelect = (id: number) => {
    const updatedProcesses = processes.map((process) =>
      process.id === id ? { ...process, selected: !process.selected } : process
    );

    setProcesses(updatedProcesses);

    // Notify parent component of selected process IDs
    const selectedIds = updatedProcesses
      .filter((p) => p.selected)
      .map((p) => p.id);

    onProcessSelection(selectedIds);
  };

  // Filter processes based on search term
  const filteredProcesses = processes.filter((process) =>
    process.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Active System Processes</h3>
        <Badge
          variant="outline"
          className={modernUI ? "bg-[#2a2a2a] border-[#3a3a3a]" : ""}
        >
          {processes.filter((p) => p.selected).length} selected
        </Badge>
      </div>

      <div className="relative mb-4">
        {isMounted && (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
        <Input
          placeholder="Search processes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={
            modernUI
              ? "pl-10 bg-[#2a2a2a] border-[#3a3a3a] text-white focus:border-[#4a4a4a] focus:ring-[#4a4a4a]"
              : "pl-10"
          }
        />
      </div>

      {!isElectron && (
        <Alert className={modernUI ? "bg-[#1a1a1a] border-[#2a2a2a]" : ""}>
          <AlertDescription className={modernUI ? "text-gray-400" : ""}>
            Running in demo mode. Process data is simulated. Install as an
            Electron app to access real system processes.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert
          variant="destructive"
          className={modernUI ? "bg-[#3a1a1a] border-[#4a2a2a]" : ""}
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-[400px]">
          {isMounted && (
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          )}
        </div>
      ) : (
        <ScrollArea
          className={`h-[400px] rounded-lg ${
            modernUI ? "border border-[#2a2a2a]" : "border"
          } p-4`}
        >
          <div className="space-y-3">
            {filteredProcesses.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No active processes found
              </div>
            ) : (
              filteredProcesses.map((process) => (
                <div
                  key={process.id}
                  className={`p-4 rounded-lg ${
                    modernUI
                      ? `border border-[#2a2a2a] ${
                          process.selected ? "bg-[#2a2a2a]" : "bg-[#1a1a1a]"
                        }`
                      : `border ${process.selected ? "bg-muted" : ""}`
                  } ${waitForProcesses ? "cursor-pointer" : ""}`}
                  onClick={() =>
                    waitForProcesses && handleProcessSelect(process.id)
                  }
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {waitForProcesses && (
                        <Checkbox
                          checked={process.selected}
                          onCheckedChange={() =>
                            handleProcessSelect(process.id)
                          }
                          id={`process-${process.id}`}
                          className={
                            modernUI
                              ? "border-[#4a4a4a] data-[state=checked]:bg-[#4a4a4a]"
                              : ""
                          }
                        />
                      )}
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            modernUI
                              ? "bg-[#2a2a2a] text-gray-300"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {getProcessIcon(process.type)}
                        </div>
                        <div>
                          <p className="font-medium">{process.name}</p>
                          <p
                            className={
                              modernUI
                                ? "text-sm text-gray-400"
                                : "text-sm text-muted-foreground"
                            }
                          >
                            Type: {process.type}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className={
                        modernUI
                          ? "flex items-center gap-1 text-sm text-gray-400"
                          : "flex items-center gap-1 text-sm text-muted-foreground"
                      }
                    >
                      {isMounted && <Clock className="h-3 w-3" />}
                      <span>{process.estimatedTimeRemaining}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{process.progress}%</span>
                    </div>
                    <Progress
                      value={process.progress}
                      className={`h-2 ${modernUI ? "bg-[#2a2a2a]" : ""}`}
                      indicatorClassName={modernUI ? "bg-[#4a4a4a]" : ""}
                    />
                  </div>
                  <div
                    className={`mt-2 flex justify-between text-xs ${
                      modernUI ? "text-gray-400" : "text-muted-foreground"
                    }`}
                  >
                    <span>CPU: {process.cpu.toFixed(1)}%</span>
                    <span>Memory: {process.memory.toFixed(1)} MB</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      )}

      {waitForProcesses && (
        <p
          className={
            modernUI ? "text-sm text-gray-400" : "text-sm text-muted-foreground"
          }
        >
          Select processes that should complete before shutdown/restart is
          executed
        </p>
      )}
    </div>
  );
}
