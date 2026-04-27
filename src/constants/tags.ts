export interface FixedTag {
  id: string;
  label: string;
  category: string;
}

export const FIXED_TAGS: FixedTag[] = [
  // Setup Tags
  { id: "ST001", label: "Breakout", category: "Setup" },
  { id: "ST002", label: "Pullback", category: "Setup" },
  { id: "ST003", label: "Reversal", category: "Setup" },
  { id: "ST004", label: "Range Trade", category: "Setup" },
  { id: "ST005", label: "Momentum", category: "Setup" },
  { id: "ST006", label: "News/Event Trade", category: "Setup" },

  // Quality Tags
  { id: "QT001", label: "Setup Score (1–5)", category: "Quality" },
  { id: "QT002", label: "Clean Structure", category: "Quality" },
  { id: "QT003", label: "Low Volume Setup", category: "Quality" },

  // Entry Tags
  { id: "EN001", label: "Early Entry", category: "Entry" },
  { id: "EN002", label: "Chased Price", category: "Entry" },
  { id: "EN003", label: "No Confirmation", category: "Entry" },
  { id: "EN004", label: "No Setup", category: "Entry" },

  // Risk Tags
  { id: "RD001", label: "No Stop Loss", category: "Risk" },
  { id: "RD002", label: "Oversized Position", category: "Risk" },
  { id: "RD003", label: "Undersized Position", category: "Risk" },
  { id: "RD004", label: "Stop Loss Modified", category: "Risk" },
  { id: "RD005", label: "Loss Escalation", category: "Risk" },
  { id: "RD006", label: "Win Overconfidence", category: "Risk" },

  // Exit Tags
  { id: "ED001", label: "Exited Early", category: "Exit" },
  { id: "ED002", label: "Held Beyond Target", category: "Exit" },
  { id: "ED003", label: "Target Modified", category: "Exit" },
  { id: "ED004", label: "Let Loss Run", category: "Exit" },

  // Trading Flow Tags
  { id: "TF001", label: "Overtrading", category: "Trading Flow" },
  { id: "TF002", label: "Revenge Trading", category: "Trading Flow" },

  // Emotion Tags
  { id: "ET001", label: "Confident", category: "Emotion" },
  { id: "ET002", label: "Calm", category: "Emotion" },
  { id: "ET003", label: "Hesitant", category: "Emotion" },
  { id: "ET004", label: "Fearful", category: "Emotion" },
  { id: "ET005", label: "Frustrated", category: "Emotion" },
  { id: "ET006", label: "Overconfident", category: "Emotion" },
  { id: "ET007", label: "FOMO", category: "Emotion" },
  { id: "ET008", label: "Distracted", category: "Emotion" },
];

export const getTagsByCategory = () => {
  return FIXED_TAGS.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, FixedTag[]>);
};