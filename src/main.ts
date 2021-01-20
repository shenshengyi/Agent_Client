import { loadAgentConfig } from "./AgentConfig";
import { APP } from "./APP";
import { MyAgent } from "./MyAgent";

(async () => {
  await APP.startup();
  const config = loadAgentConfig();
  const agent = new MyAgent(config);
  await agent.run();
  await APP.terminate();
})();
