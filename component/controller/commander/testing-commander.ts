import { Commander } from "./commander";
import { CouchDB } from "../../../core/db/couchdb";
import * as fs from "fs";
import { Config } from "../../../core/config";

export class TestingCommander extends Commander {
    async sendExcuteCommand(appName: string, topic: string): Promise<any> {
        try {
            const code = await this.getTestCode(appName);
            const message = {
                cmd: "execute",
                data: code
            };
            const result = await this.sendCommand(topic, message);
            return result;
        } catch (err) {
            throw err;
        }
    }

    async sendTestCode(appName: string, topic: string, codeId: string): Promise<any> {
        return new Promise(async (res, rej) => {
            try {
                const code = await this.getTestCode(appName);
                const message = {
                    cmd: "prepare",
                    id: codeId,
                    data: code
                };
                const result = await this.sendCommand(topic, message);
                res(result);
            } catch (err) {
                rej(err)
            }
        });
    }

    async sendStartCommand(topic: string, codeId: string): Promise<any> {
        const message = {
            cmd: "start",
            id: codeId
        };
        return this.sendCommand(topic, message);
    }

    async getTestCode(appName: string): Promise<string> {
        return new Promise(async (res, rej) => {
            const db = new CouchDB();

            const doc = await db.find({
                "_id": {
                    "$regex": `^app_${appName}$`
                }
            });
            if (!doc[0]) {
                rej('could not find document');
                return;
            }
            const app = doc[0];
            const data = fs.readFileSync(`${Config.marketplace.app_data_path}/${app.name}_${app.createAt}.zip`);
            res(data.toString('base64'));
        });
    }
}
