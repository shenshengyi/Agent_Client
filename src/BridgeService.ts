import * as path from "path";
import * as fs from "fs-extra";
import { fork } from "child_process";
import {
  IModelCreateOptions,
  IModelQuery,
  ChangeSetQuery,
  VersionQuery,
} from "@bentley/imodelhub-client";
import { MyAgent } from "./MyAgent";
import { AppSettings } from "./AppSettings";
import { IModelJsFs } from "@bentley/imodeljs-backend";

export class BridgeService {
  public static async createIModel(
    contextId: string,
    name: string,
    createOptions?: IModelCreateOptions
  ) {
    const requestContext = MyAgent.Agent().requestContext;

    name = encodeURIComponent(name);

    try {
      return await MyAgent.Agent().bankClient.iModels.create(
        requestContext,
        contextId,
        name,
        createOptions
      );
    } catch (error) {
      console.log(error);
    }

    return undefined;
  }

  public static async getIModelByName(contextId: string, name: string) {
    const requestContext = MyAgent.Agent().requestContext;

    name = encodeURIComponent(name);

    try {
      return await MyAgent.Agent().bankClient.iModels.get(
        requestContext,
        contextId,
        new IModelQuery().byName(name)
      );
    } catch (error) {
      console.log(error);
    }

    return undefined;
  }

  public static async getIModelById(contextId: string, iModelId: string) {
    const requestContext = MyAgent.Agent().requestContext;

    try {
      return await MyAgent.Agent().bankClient.iModels.get(
        requestContext,
        contextId,
        new IModelQuery().byId(iModelId)
      );
    } catch (error) {
      console.log(error);
    }

    return undefined;
  }

  public static async getIModels(contextId: string) {
    const requestContext = MyAgent.Agent().requestContext;

    try {
      return await MyAgent.Agent().bankClient.iModels.get(
        requestContext,
        contextId
      );
    } catch (error) {
      console.log(error);
    }

    return undefined;
  }

  public static async createJobConfig(
    jobDir: string,
    iModelId: string,
    contextId: string
  ): Promise<boolean> {
    console.log(iModelId);
    console.log(contextId);
    console.log(AppSettings.assetsDir);

    try {
      if (!(await fs.pathExists(jobDir))) {
        await fs.mkdir(jobDir);
      }

      const bridgeAssignExePath = path.resolve(
        AppSettings.assetsDir,
        "imodelbridgeassign",
        "iModelBridgeAssign.exe"
      );
      if (!(await fs.pathExists(bridgeAssignExePath))) {
        return false;
      }
      // configuration.json
      const jobConfig = {
        contextId,
        iModelId,
        storageType: "localhost",
        accessToken: AppSettings.gatewayToken,
        iModelBankUrl: AppSettings.gatewayUrl,
        assignExe: bridgeAssignExePath,
        isIModelHub: false,
        shouldShowOutput: AppSettings.shouldShowOutput,
        dispatchUrl: AppSettings.dispatchUrl + iModelId,
      };

      await fs.writeFile(
        path.resolve(jobDir, "configuration.json"),
        JSON.stringify(jobConfig),
        "utf8"
      );
      const bridgeArgs = [
        {
          bridge: "IModelBridgeForMstn",
          args: [],
        },
      ];
      const inputDir = path.resolve(jobDir, "input");
      if (!(await fs.pathExists(inputDir))) {
        await fs.mkdir(inputDir);
      }

      await fs.writeFile(
        path.resolve(jobDir, "input/bridgeArgs.json"),
        JSON.stringify(bridgeArgs),
        "utf8"
      );

      // logging.config.xml
      const src = path.resolve(AppSettings.assetsDir, "logging.config.xml");
      const dest = path.resolve(jobDir, "logging.config.xml");

      await fs.copy(src, dest);
      //添加rootFile;
      await this.appendRootFile(jobDir);
      return true;
    } catch (error) {
      // ###TODO log
      console.log(error);
      return false;
    }
  }
  public static async appendRootFile(jobDir: string) {
    const filesDir = path.resolve(jobDir, "input", "files");
    if (!(await fs.pathExists(filesDir))) {
      await fs.mkdir(filesDir);
    }
    //临时
    const data = "D:/Agent_Client/DGN_Data/v8.dgn";
    const dataFiles = path.resolve(filesDir, "v8.dgn");
    await fs.copy(data, dataFiles, { overwrite: true });
    const rootTxtPath = path.resolve(jobDir, "input", "rootfiles.txt");
    const rootTxt = "v8.dgn";
    await fs.writeFile(rootTxtPath, rootTxt, "utf8");
  }
  public static async runBridgeJob(
    jobDir: string,
    success: () => Promise<void>,
    rec: (msg: string) => void,
    fail: (msg: string) => Promise<void>
  ) {
    const args = [path.resolve(jobDir, "configuration.json"), jobDir];
    const modulePath = require.resolve(
      "@bentley/imodel-bank-bridge-job/lib/runBridgeJob"
    );

    const child = fork(modulePath, args);

    child.on("message", async (data: any) => {
      if (data.err) {
        await fail(data.err);
      } else if (!data.done) {
        rec(data.message);
      } else {
        await success();
      }
    });
  }

  public static async getChangeSets(iModelId: string) {
    const requestContext = MyAgent.Agent().requestContext;

    try {
      return await MyAgent.Agent().bankClient.changeSets.get(
        requestContext,
        iModelId,
        new ChangeSetQuery().latest()
      );
    } catch (error) {
      console.log(error);
    }

    return undefined;
  }

  public static async getNamedVersionByName(
    iModelId: string,
    versionName: string
  ) {
    const requestContext = MyAgent.Agent().requestContext;

    versionName = encodeURIComponent(versionName);

    try {
      return await MyAgent.Agent().bankClient.versions.get(
        requestContext,
        iModelId,
        new VersionQuery().byName(versionName)
      );
    } catch (error) {
      console.log(error);
    }

    return undefined;
  }

  public static async getNamedVersionByChangeSet(
    iModelId: string,
    changeSetId: string
  ) {
    const requestContext = MyAgent.Agent().requestContext;

    try {
      return await MyAgent.Agent().bankClient.versions.get(
        requestContext,
        iModelId,
        new VersionQuery().byChangeSet(changeSetId)
      );
    } catch (error) {
      console.log(error);
    }

    return undefined;
  }

  public static async getNamedVersionById(iModelId: string, id: string) {
    const requestContext = MyAgent.Agent().requestContext;

    try {
      return await MyAgent.Agent().bankClient.versions.get(
        requestContext,
        iModelId,
        new VersionQuery().byId(id)
      );
    } catch (error) {
      console.log(error);
    }

    return undefined;
  }

  public static async getNamedVersions(iModelId: string) {
    const requestContext = MyAgent.Agent().requestContext;

    try {
      return await MyAgent.Agent().bankClient.versions.get(
        requestContext,
        iModelId
      );
    } catch (error) {
      console.log(error);
    }

    return undefined;
  }

  public static async createNamedVersion(
    iModelId: string,
    changeSetId: string,
    versionName: string,
    description: string
  ) {
    const requestContext = MyAgent.Agent().requestContext;

    versionName = encodeURIComponent(versionName);

    try {
      return await MyAgent.Agent().bankClient.versions.create(
        requestContext,
        iModelId,
        changeSetId,
        versionName,
        description
      );
    } catch (error) {}

    return undefined;
  }
  public static async onSuccess(
    iModelId: string,
    versionName: string,
    description: string
  ) {
    const changeSets = await BridgeService.getChangeSets(iModelId);
    if (!changeSets || !changeSets.length) {
      console.log("Failed to get latest change set.");
      return;
    }

    // ###TODO thumbnail
    const thumbnail = "";

    const changeSetId = changeSets[0].id ?? changeSets[0].wsgId;
    const result = await BridgeService.getNamedVersionByChangeSet(
      iModelId,
      changeSetId
    );
    if (result === undefined) {
      console.log("getNamedVersionByChangeSet is undefined.");
      return;
    }
    // Create named version
    const namedVersion = await BridgeService.createNamedVersion(
      iModelId,
      changeSetId,
      versionName,
      description
    );
    if (!namedVersion) {
      console.log("Failed to create named version.");
      return;
    }
    console.log("named version create success! ");
  }
}
