"use client";

interface Tab {
  id: string;
  label: string;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-120 ${
            activeTab === tab.id
              ? "text-cyan"
              : "text-text-faint hover:text-text-dim"
          }`}
        >
          <span className="flex items-center gap-2">
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber/20 text-amber text-xs font-mono">
                {tab.badge}
              </span>
            )}
          </span>
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan" />
          )}
        </button>
      ))}
    </div>
  );
}
