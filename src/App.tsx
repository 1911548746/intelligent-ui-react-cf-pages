import "@openuidev/react-ui/styles/index.css";

import {
  AgentInterface,
  fetchLLM,
  openAIAdapter,
  openAIMessageFormat,
  useThemeModePreference,
} from "@openuidev/react-ui";
import type { ActionEvent } from "@openuidev/react-lang";
import { useEffect } from "react";
import { Brain, Calculator, ChartNoAxesCombined, Compass, Gamepad2, MapPinned, ReceiptText, UtensilsCrossed } from "lucide-react";
import { runLibraryAction } from "@/lib/actions";
import { withBase } from "@/lib/base-path";
import { localChatStorage, SaveMessages } from "@/lib/chat-storage";
import { webUrl } from "@/lib/components/style";
import { library } from "@/lib/library";

const starters = [
  { displayText: "规划一日游", prompt: "我会在上海待一天，请帮我规划观光路线", icon: <MapPinned size={16} /> },
  { displayText: "探索一座城市", prompt: "请规划一段轻松的洛杉矶半日游，安排三个停留点并附上地图", icon: <Compass size={16} /> },
  { displayText: "规划一顿晚餐", prompt: "请为六个人安排一顿简单的素食晚餐", icon: <UtensilsCrossed size={16} /> },
  { displayText: "分摊一下账单", prompt: "制作一个与朋友聚餐时使用的账单分摊工具", icon: <ReceiptText size={16} /> },
  { displayText: "制作数据看板", prompt: "构建网站流量仪表盘，展示各来源的访问量和注册量、转化率以及累计注册量。", icon: <ChartNoAxesCombined size={16} /> },
  { displayText: "制作一个计算器", prompt: "请制作一个带显示屏和按键、可以实际使用的计算器", icon: <Calculator size={16} /> },
  { displayText: "玩一款掌机游戏", prompt: "请制作一款可以玩的 Game Boy 风格掌机游戏，包含屏幕、方向键和 A/B 按钮", icon: <Gamepad2 size={16} /> },
  { displayText: "趣味知识问答", prompt: "请用五道有趣的知识题考考我，并记录得分", icon: <Brain size={16} /> },
];

const llm = fetchLLM({
  url: withBase("/api/chat"),
  streamAdapter: openAIAdapter(),
  messageFormat: openAIMessageFormat,
});

const storage = typeof window === "undefined" ? undefined : localChatStorage();

function onAction(event: ActionEvent) {
  void runLibraryAction(event);
}

// OpenUI's @OpenUrl action calls window.open. Restrict it to http(s) URLs.
if (typeof window !== "undefined") {
  const open = window.open.bind(window);
  window.open = (url?: string | URL) => {
    const safe = webUrl(String(url ?? ""));
    return safe ? open(safe, "_blank", "noopener,noreferrer") : null;
  };
}

export default function App() {
  const { setPreference, mode } = useThemeModePreference();

  useEffect(() => {
    document.documentElement.setAttribute("data-openui-theme", mode);
  }, [mode]);

  return (
    <div className="chat-shell">
      <AgentInterface
        llm={llm}
        storage={storage}
        componentLibrary={library}
        onAction={onAction}
        agentName="Intelligent UI"
        logoUrl={withBase("/shiro-face.svg")}
        theme={{ mode }}
        starters={starters}
      >
        <AgentInterface.SidebarFooter>
          <AgentInterface.ThemeModeToggle mode={mode} onModeChange={setPreference} />
        </AgentInterface.SidebarFooter>
        <AgentInterface.ThreadHeader showChatTitle={false} />
        <AgentInterface.Welcome
          image={<img src={withBase("/shiro-woodworker.svg")} alt="" className="welcome-mascot" />}
          title="What can I help with?"
          starterVariant="card"
          glowAnimation
        />
        <SaveMessages />
      </AgentInterface>
    </div>
  );
}
