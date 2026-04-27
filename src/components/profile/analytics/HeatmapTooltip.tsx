import { motion, AnimatePresence } from "framer-motion";

interface HeatmapTooltipProps {
  isVisible: boolean;
  targetRect: DOMRect | null;
  containerRect: DOMRect | null;
  data: {
    date: string;
    count: number;
    level: number;
  } | null;
}

// Format the date string like "May 9th"
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();

  // Get suffix
  let suffix = "th";
  if (day % 10 === 1 && day !== 11) suffix = "st";
  else if (day % 10 === 2 && day !== 12) suffix = "nd";
  else if (day % 10 === 3 && day !== 13) suffix = "rd";

  return `${month} ${day}${suffix}`;
}

const HeatmapTooltip = ({
  isVisible,
  targetRect,
  data,
}: HeatmapTooltipProps) => {
  if (!targetRect || !data) return null;

  // Center above the square
  const tooltipX = targetRect.left + targetRect.width / 2;
  const tooltipY = targetRect.top - 8; // 8px above the square

  const text = `${data.count === 0 ? "No" : data.count} ${data.count === 1 ? "trade" : "trades"} on ${formatDate(data.date)}.`;

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          style={{
            position: "fixed",
            top: tooltipY,
            left: tooltipX,
            zIndex: 10000,
            pointerEvents: "none",
            transform: "translate(-50%, -100%)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            <div className="bg-[#24292f] text-gray-100 text-xs py-2 px-3 rounded-md shadow-lg whitespace-nowrap relative font-medium">
              {text}
              <div
                className="absolute left-1/2 -bottom-[6px] w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#24292f]"
                style={{
                  transform: "translateX(-50%)"
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HeatmapTooltip;
