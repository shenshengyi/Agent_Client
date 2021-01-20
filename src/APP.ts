import { IModelBankClient } from "@bentley/imodelhub-client";
import {
  ApplicationType,
  IModelHost,
  IModelHostConfiguration,
} from "@bentley/imodeljs-backend";

class APP {
  public static async startup() {
    const url = "http://localhost:4000";
    let hubClient: IModelBankClient = new IModelBankClient(url, undefined);
    const hostConfig = new IModelHostConfiguration();
    hostConfig.applicationType = ApplicationType.WebAgent;
    hostConfig.imodelClient = hubClient;
    await IModelHost.startup(hostConfig);
  }
  public static async terminate() {
    await IModelHost.shutdown();
  }
}

export { APP };
