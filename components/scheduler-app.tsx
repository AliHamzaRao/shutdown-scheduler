"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Clock,
  Info,
  Moon,
  Power,
  RefreshCw,
  Settings,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import ProcessList from "./process-list";

// Type definitions for Electron API
declare global {
  interface Window {
    electron: {
      getProcesses: () => Promise<any[]>;
      scheduleShutdown: (options: any) => Promise<any>;
      scheduleRestart: (options: any) => Promise<any>;
      cancelScheduledAction: () => Promise<any>;
      platform: string;
    };
  }
}

export default function SchedulerApp() {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [waitForProcesses, setWaitForProcesses] = useState<boolean>(false);
  const [selectedProcessIds, setSelectedProcessIds] = useState<number[]>([]);
  const [scheduledAction, setScheduledAction] = useState<
    "shutdown" | "restart" | null
  >(null);
  const { theme, setTheme } = useTheme();
  const [isElectron, setIsElectron] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("scheduler");

  useEffect(() => {
    // Check if running in Electron
    setIsElectron(window.electron !== undefined);
    // Mark component as mounted to prevent hydration mismatch
    setIsMounted(true);
  }, []);

  // Format time as HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle preset time selection
  const handlePreset = (preset: number) => {
    const h = Math.floor(preset / 3600);
    const m = Math.floor((preset % 3600) / 60);
    const s = preset % 60;

    setHours(h);
    setMinutes(m);
    setSeconds(s);
  };

  // Schedule shutdown/restart
  const scheduleAction = async (action: "shutdown" | "restart") => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if ((totalSeconds > 0 || waitForProcesses) && isElectron) {
      try {
        const options = {
          delaySeconds: totalSeconds,
          waitForProcesses,
          selectedProcessIds,
        };

        let result;
        if (action === "shutdown") {
          result = await window.electron.scheduleShutdown(options);
        } else {
          result = await window.electron.scheduleRestart(options);
        }

        if (result.scheduled) {
          setRemainingTime(totalSeconds);
          setIsScheduled(true);
          setScheduledAction(action);
        }
      } catch (error) {
        console.error(`Error scheduling ${action}:`, error);
      }
    } else if (!isElectron) {
      // Demo mode when not running in Electron
      setRemainingTime(totalSeconds);
      setIsScheduled(true);
      setScheduledAction(action);
    }
  };

  // Cancel scheduled action
  const cancelSchedule = async () => {
    if (isElectron) {
      try {
        const result = await window.electron.cancelScheduledAction();

        if (result.cancelled) {
          setIsScheduled(false);
          setRemainingTime(0);
          setScheduledAction(null);
        }
      } catch (error) {
        console.error("Error cancelling scheduled action:", error);
      }
    } else {
      // Demo mode
      setIsScheduled(false);
      setRemainingTime(0);
      setScheduledAction(null);
    }
  };

  // Handle process selection
  const handleProcessSelection = (processIds: number[]) => {
    setSelectedProcessIds(processIds);
  };

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isScheduled && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
    } else if (
      isScheduled &&
      remainingTime === 0 &&
      !waitForProcesses &&
      !isElectron
    ) {
      // In demo mode, we simulate completion
      setIsScheduled(false);
      setScheduledAction(null);
    }

    return () => clearInterval(interval);
  }, [
    isScheduled,
    remainingTime,
    waitForProcesses,
    scheduledAction,
    isElectron,
  ]);

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-medium">System Scheduler</h1>
          {!isElectron && (
            <Badge
              variant="outline"
              className="bg-[#2a2a2a] border-[#3a3a3a] text-gray-300 text-xs"
            >
              Demo Mode
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-8 h-8 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300"
                >
                  {isMounted && <Info className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>About System Scheduler</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-8 h-8 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300"
                >
                  {isMounted && <Settings className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="rounded-full w-8 h-8 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300"
                >
                  {theme === "dark"
                    ? isMounted && <Sun className="h-4 w-4" />
                    : isMounted && <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex mb-6">
          <div className="flex flex-col space-y-2 w-48 pr-6 border-r border-[#2a2a2a]">
            <button
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors",
                activeTab === "scheduler"
                  ? "bg-[#2a2a2a] text-white"
                  : "text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-300"
              )}
              onClick={() => setActiveTab("scheduler")}
            >
              {isMounted && <Clock className="h-4 w-4" />}
              <span>Scheduler</span>
            </button>
            <button
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors",
                activeTab === "processes"
                  ? "bg-[#2a2a2a] text-white"
                  : "text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-300"
              )}
              onClick={() => setActiveTab("processes")}
            >
              {isMounted && <Settings className="h-4 w-4" />}
              <span>Active Processes</span>
            </button>
          </div>

          <div className="flex-1 pl-6">
            {activeTab === "scheduler" && (
              <div className="space-y-6">
                {isScheduled ? (
                  <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] text-center space-y-6">
                    <div className="text-5xl font-bold font-mono tracking-wider">
                      {formatTime(remainingTime)}
                    </div>
                    <Badge
                      variant="outline"
                      className="px-4 py-2 text-base bg-[#2a2a2a] border-[#3a3a3a]"
                    >
                      {waitForProcesses
                        ? `Waiting for selected processes to complete before ${scheduledAction}`
                        : `Time remaining until ${scheduledAction}`}
                    </Badge>
                    <Button
                      variant="destructive"
                      className="w-full bg-[#3a1a1a] hover:bg-[#4a2a2a] border border-[#5a3a3a] text-white"
                      onClick={cancelSchedule}
                    >
                      {isMounted && <X className="mr-2 h-4 w-4" />} Cancel
                      Scheduled Action
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] mb-6">
                      <h3 className="text-lg font-medium mb-4">Custom Timer</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hours" className="text-gray-300">
                            Hours
                          </Label>
                          <Input
                            id="hours"
                            type="number"
                            min="0"
                            value={hours}
                            onChange={(e) =>
                              setHours(Number.parseInt(e.target.value) || 0)
                            }
                            className="bg-[#2a2a2a] border-[#3a3a3a] text-white focus:border-[#4a4a4a] focus:ring-[#4a4a4a]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="minutes" className="text-gray-300">
                            Minutes
                          </Label>
                          <Input
                            id="minutes"
                            type="number"
                            min="0"
                            max="59"
                            value={minutes}
                            onChange={(e) =>
                              setMinutes(Number.parseInt(e.target.value) || 0)
                            }
                            className="bg-[#2a2a2a] border-[#3a3a3a] text-white focus:border-[#4a4a4a] focus:ring-[#4a4a4a]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="seconds" className="text-gray-300">
                            Seconds
                          </Label>
                          <Input
                            id="seconds"
                            type="number"
                            min="0"
                            max="59"
                            value={seconds}
                            onChange={(e) =>
                              setSeconds(Number.parseInt(e.target.value) || 0)
                            }
                            className="bg-[#2a2a2a] border-[#3a3a3a] text-white focus:border-[#4a4a4a] focus:ring-[#4a4a4a]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] mb-6">
                      <h3 className="text-lg font-medium mb-4">
                        Quick Presets
                      </h3>
                      <div className="grid grid-cols-4 gap-3">
                        <Button
                          variant="outline"
                          onClick={() => handlePreset(900)}
                          className="bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a] text-white"
                        >
                          15 Minutes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePreset(1800)}
                          className="bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a] text-white"
                        >
                          30 Minutes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePreset(3600)}
                          className="bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a] text-white"
                        >
                          1 Hour
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handlePreset(7200)}
                          className="bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a] text-white"
                        >
                          2 Hours
                        </Button>
                      </div>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] mb-6">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="wait-processes"
                          checked={waitForProcesses}
                          onCheckedChange={setWaitForProcesses}
                          className="data-[state=checked]:bg-[#4a4a4a]"
                        />
                        <Label
                          htmlFor="wait-processes"
                          className="text-gray-300"
                        >
                          Wait for selected processes to complete
                        </Label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        className="bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#3a3a3a] text-white flex items-center justify-center h-12"
                        onClick={() => scheduleAction("shutdown")}
                      >
                        {isMounted && <Power className="mr-2 h-5 w-5" />}{" "}
                        Schedule Shutdown
                      </Button>
                      <Button
                        className="bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#3a3a3a] text-white flex items-center justify-center h-12"
                        onClick={() => scheduleAction("restart")}
                      >
                        {isMounted && <RefreshCw className="mr-2 h-5 w-5" />}{" "}
                        Schedule Restart
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "processes" && (
              <ProcessList
                waitForProcesses={waitForProcesses}
                isElectron={isElectron}
                onProcessSelection={handleProcessSelection}
                modernUI={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
