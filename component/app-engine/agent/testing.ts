import { Extract } from 'unzipper';
import { Readable } from "stream";
import { spawn } from "child_process";

interface ProcessResult {
    code: number,
    out: string,
    err: string,
}

const PROCESS_COMMAND: { [key: string]: string[] } = {
    start: ["start"],
    build: ["run", "build"],
    install: ["install"],
};

// run js code with package.js
export async function startNodeCode(id: string): Promise<boolean> {
    try {
        const filePath = makePathName(id);
        const result = await spawnNpm(filePath, PROCESS_COMMAND.start);
        if (result.code == 0) {
            console.log(`npm start success: \n- code: ${result.code}\n- out:${result.out}`);
            return true;
        } else {
            throw result;
        }
    } catch (e) {
        console.error(`npm start error: \n- code: ${e.code}\n- out: ${e.out}\n- err: ${e.err}`);
        return false;
    }
}

export async function setCode(base64Zip: string, id: string): Promise<boolean> {
    try {
        const filePath = makePathName(id);
        await decompress(base64Zip, filePath);
        await installNpm(filePath);
        await buildNpm(filePath);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

async function buildNpm(filePath: string): Promise<any> {
    const result = await spawnNpm(filePath, PROCESS_COMMAND.build);
    if (result.code == 0) {
        return result.out;
    } else {
        console.error(`npm build error: \n- code: ${result.code}\n- out: ${result.out}\n- err: ${result.err}`);
        throw result;
    }
}

async function installNpm(filePath: string): Promise<any> {
    const result = await spawnNpm(filePath, PROCESS_COMMAND.install);
    if (result.code == 0) {
        return result.out;
    } else {
        console.error(`npm install error: \n- code: ${result.code}\n- out: ${result.out}\n- err: ${result.err}`);
        throw result;
    }
}

async function spawnNpm(filePath: string, subcommand: string[]): Promise<ProcessResult> {
    return new Promise((res) => {
        let err = "";
        let out = "";
        const npm = spawn(`npm`, subcommand, { cwd: filePath });
        npm.stdout.on('data', data => {
            out += data;
        });
        npm.stderr.on(`data`, data => {
            err += data;
        });
        npm.on(`exit`, code => {
            res({
                code: code,
                out: out,
                err: err,
            });
        });
    });
}

async function decompress(base64Zip: string, filePath: string): Promise<any> {
    return new Promise((res, rej) => {
        const stream = new Readable();
        stream.push(base64Zip, 'base64');
        stream.push(null);
        stream.pipe(Extract({ path: filePath })).on(`finish`, () => {
            res();
        });
    });
}

function makePathName(id: string) {
    return '.code/' + id;
}