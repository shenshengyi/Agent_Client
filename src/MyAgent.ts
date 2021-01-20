import { BriefcaseManager } from "@bentley/imodeljs-backend";
import { config } from "./AgentConfig";
import { AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { BasicAccessToken } from "@bentley/imodelhub-client/lib/imodelbank/IModelBankBasicAuthorizationClient";

export class MyAgent {
  private _requestContext: AuthorizedClientRequestContext;
  public constructor() {
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
    const contextId = "9374a302-8743-403e-ad03-6c49ef13c15e";
    this._requestContext.enter();
    const hg = await BriefcaseManager.imodelClient.iModels.get(
      this._requestContext,
      contextId
    );
    console.log(hg);
  }
}
