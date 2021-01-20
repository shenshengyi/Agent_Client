import { config, loadAgentConfig } from "./AgentConfig";
import { APP } from "./APP";
import { MyAgent } from "./MyAgent";

(async () => {
  await APP.startup();
  const agent = new MyAgent();
  await agent.run();
  await APP.terminate();
})();
