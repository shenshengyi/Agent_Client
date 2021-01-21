import { APP } from "./APP";
import { MyAgent } from "./MyAgent";
(async () => {
  await APP.startup();
  await MyAgent.Agent().runJob();
})();
