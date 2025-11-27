"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, TrendingUp } from "lucide-react";
import { InsightItem } from "@/lib/types";

interface InsightCardProps {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  items: InsightItem[];
  emptyMessage?: string;
}

export default function InsightCard({
  title,
  icon,
  iconColor,
  items,
  emptyMessage = "No insights found in this category",
}: InsightCardProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {items.length > 0 && (
          <span className="ml-auto text-sm text-[#525252] bg-[#1f1f1f] px-2 py-1 rounded-full">
            {items.length} found
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-[#525252] text-sm italic">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-[#1f1f1f] rounded-xl overflow-hidden border border-[#262626] hover:border-[#363636] transition-colors"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-4 py-3 flex items-start gap-3 text-left"
              >
                <div className="flex-1">
                  <p className="text-[#fafafa] text-sm leading-relaxed">
                    {item.text}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    {item.frequency && (
                      <span className="text-xs text-[#525252] flex items-center gap-1">
                        <TrendingUp size={12} />
                        ~{item.frequency} mentions
                      </span>
                    )}
                    {item.engagement_score && (
                      <span className="text-xs text-[#525252] flex items-center gap-1">
                        <TrendingUp size={12} />
                        Score: {item.engagement_score}/10
                      </span>
                    )}
                    {item.examples && item.examples.length > 0 && (
                      <span className="text-xs text-[#525252] flex items-center gap-1">
                        <MessageSquare size={12} />
                        {item.examples.length} example{item.examples.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                {item.examples && item.examples.length > 0 && (
                  <span className="text-[#525252] mt-1">
                    {expandedItems.has(index) ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </span>
                )}
              </button>

              {expandedItems.has(index) && item.examples && item.examples.length > 0 && (
                <div className="px-4 pb-4 space-y-2">
                  <p className="text-xs text-[#525252] uppercase tracking-wide mb-2">
                    Example Comments
                  </p>
                  {item.examples.map((example, i) => (
                    <div
                      key={i}
                      className="bg-[#171717] rounded-lg p-3 border-l-2 border-[#363636]"
                    >
                      <p className="text-sm text-[#a3a3a3] italic">"{example}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
