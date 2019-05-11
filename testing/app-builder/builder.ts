import Dockerode from 'dockerode';

export async function runDockerContainer(repoTag: string, cmd: string[] = [], containerCreateOptions: Dockerode.ContainerCreateOptions = {}, dockerOptions: Dockerode.DockerOptions = {}): Promise<any> {
    try {
        if (!repoTag.includes(':')) {
            return "invalied repoTag";
        }
        const dockerode = new Dockerode(dockerOptions);
        const image = await dockerode.listImages({
            filter: repoTag
        });

        if (image.length == 0) {
            let err = await pullDockerImage(dockerode, repoTag);
            if (!!err) {
                return err;
            }
        }
        containerCreateOptions.Image = repoTag;
        containerCreateOptions.Cmd = cmd;

        const container = await dockerode.createContainer(containerCreateOptions)

        const info = await container.start();
        return;
    } catch (e) {
        return e;
    }
}


function pullDockerImage(dockerode: Dockerode, repoTag: string): Promise<any> {
    return new Promise((res) => {
        console.log(`pull ${repoTag} image`)
        dockerode.pull(repoTag, {}, (err, stream) => {
            if (err) {
                res(err);
            } else {
                (<any>dockerode.modem).followProgress(stream, (e: any, onFinish: any, _: any) => {
                    if (e) {
                        res(e);
                    } else {
                        console.log("docker pull finished");
                        res();
                    }
                });
            }
        });
    });
}