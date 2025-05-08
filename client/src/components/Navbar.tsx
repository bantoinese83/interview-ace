import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppState } from "@/hooks/useAppState";
import emitter from "@/lib/eventEmitter";
import { Menu, Settings2, Target, Sparkles, Briefcase, Award } from "lucide-react";
import React, { useState } from "react";

const model = "InterviewAce Pro";

const Navbar: React.FC = () => {
  const { conversationType } = useAppState();

  const handleSidebarToggle = () => {
    emitter.emit("toggleSidebar");
  };

  const handleSettingsToggle = () => {
    emitter.emit("toggleSettings");
  };

  const [selectedModel, setSelectedModel] = useState(model);

  return (
    <div className="bg-background flex items-center justify-between p-4 sticky top-0 z-10">
      {/* Sidebar Toggle Button */}
      <button
        className="p-2 rounded-md hover:bg-secondary focus:outline-none lg:hidden"
        onClick={handleSidebarToggle}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* App Title with custom logo - always visible */}
      <div className="flex items-center gap-2 font-bold text-lg md:text-xl">
        <div className="flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg p-1.5">
          <Briefcase className="w-5 h-5" />
          <Award className="w-3 h-3 absolute -right-1 -top-1 text-amber-400" />
        </div>
        <div className="hidden md:flex items-center">
          <span className="text-indigo-600 font-extrabold">Interview</span>
          <span className="text-blue-500 font-extrabold">Ace</span>
        </div>
      </div>

      {!!conversationType && (
        <Select
          disabled
          value={selectedModel}
          onValueChange={(v) => {
            setSelectedModel(v);
            emitter.emit("changeLlmModel", v);
          }}
        >
          <SelectTrigger className="text-base font-semibold max-w-fit rounded-full border-background shadow-none text-muted  transition-all">
            <SelectValue>{model}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={model}>{model}</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Settings Icon */}
      {!!conversationType && (
        <Button
          variant="outline"
          className="rounded-full ms-auto gap-1 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          onClick={handleSettingsToggle}
        >
          <Settings2 size={16} />
          Settings
        </Button>
      )}
    </div>
  );
};

export default Navbar;
