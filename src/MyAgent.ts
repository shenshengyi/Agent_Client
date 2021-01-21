import { BriefcaseManager } from "@bentley/imodeljs-backend";
import { config } from "./AgentConfig";
import { AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { BasicAccessToken } from "@bentley/imodelhub-client/lib/imodelbank/IModelBankBasicAuthorizationClient";
import * as path from "path";
import * as fs from "fs-extra";
import { BridgeService } from "./BridgeService";
import { AppSettings } from "./AppSettings";
export class MyAgent {
  public get requestContext() {
    this._requestContext.enter();
    return this._requestContext;
  }
  private _requestContext: AuthorizedClientRequestContext;
  private constructor() {
    this._requestContext = this.createRequestContext();
  }
  private createRequestContext() {
    const email = config.email;
    const password = config.password;
    return new AuthorizedClientRequestContext(
      BasicAccessToken.fromCredentials({
        email,
        password,
      })
    );
  }
  //test;version = IModelVersion.latest()
  public async run() {
    const contextId = config.CONTEXT_ID!;
    this._requestContext.enter();
    const hg = await BriefcaseManager.imodelClient.iModels.get(
      this._requestContext,
      contextId
    );
    console.log(hg);
  }
  public async CreateIModel(
    imodelName: string,
    description?: string
  ): Promise<string | undefined> {
    const contextId = config.CONTEXT_ID!;
    const imodels = await BridgeService.getIModelByName(contextId, imodelName);
    if (imodels && imodels.length !== 0) {
      console.log(imodelName + "already exists,Please choose a new name.");
      return undefined;
    }
    const imodel = await BridgeService.createIModel(contextId, imodelName, {
      description: description,
    });
    return imodel?.id;
  }
  public async runJob() {
    const iModelId = await this.CreateIModel("huren2031", "This is huren2031.");
    if (iModelId === undefined) {
      console.log("iModel does not exist, please check");
      return;
    }
    //const iModelId = "36a83345-ed74-4599-9415-b4fe29dfc95e";
    const versionName = "v1";
    const description = "This is " + versionName;
    const jobDir = path.resolve(AppSettings.dataDir, "jobs", iModelId);
    const contextId = config.CONTEXT_ID!;
    if (!(await BridgeService.createJobConfig(jobDir, iModelId, contextId))) {
      console.log("Failed to generate work configuration");
      return;
    }
    await BridgeService.runBridgeJob(
      jobDir,
      async () => BridgeService.onSuccess(iModelId, versionName, description),
      rec,
      fail
    );
  }
  public get bankClient() {
    return BriefcaseManager.imodelClient;
  }
  public static Agent(): MyAgent {
    if (this._agent === undefined) {
      this._agent = new MyAgent();
    }
    return this._agent;
  }
  private static _agent: MyAgent | undefined = undefined;
}

async function rec(msg: string) {
  console.log(msg);
}
async function fail(msg: string) {
  console.log(msg);
}
