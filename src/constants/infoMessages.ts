// src/constants/infoMessages.ts

import type { InfoArr } from "@/components/dashboard/chart.types";

export const infoArr: InfoArr = {
  "Total Profit/Loss": [
    { title: "What is it:", desc: "Shows how your money has changed after all trades.\nIt adds up every win and every loss." },
    { title: "How to read it:", desc: "Positive number → You made money.\nNegative number → You lost money." },
  ],
  "Win Rate": [
    { title: "What is it:", desc: "Shows how often your trades make money.\nThink of it as wins out of 100 trades." },
    { title: "How to read it:", desc: "60% → 60 trades won, 40 lost.\nHigher percentage is better." },
  ],
  "Expectancy Rate": [
    { title: "What is it:", desc: "Shows what one trade earns or loses on average.\nIt tells if your strategy works in the long run." },
    { title: "How to read it:", desc: "Positive number → Strategy makes money.\nNegative number → Strategy loses money." },
  ],
  "Drawdown": [
    { title: "What is it:", desc: "Shows the biggest fall in your money.\nThis is the worst phase you went through." },
    { title: "How to read it:", desc: "Smaller number → Less damage.\nBigger number → More damage." },
  ],
  "Kelly Ratio Score": [
    { title: "What is it:", desc: "Suggests how much money to use per trade.\nBased on your past performance." },
    { title: "How to read it:", desc: "Higher number → Can trade bigger.\nLower or negative → Trade smaller or stop." },
  ],
}