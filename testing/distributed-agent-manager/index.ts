import { DockerOptions, ContainerCreateOptions, EndpointsConfig } from 'dockerode';
import { runDockerContainer } from '../app-builder'

const DEFAULT_AGENT_IMAGE = "registry.smartm2m.co.kr/slippy-agent:latest";
class ContainerInformation {
    public createOptions: ContainerCreateOptions;
    constructor(
        public image: string,
        public dockerOptions: {},
        containerEnv: string[],
        networkEndpoint?: string) {
        this.createOptions = {
            Env: containerEnv,
        }
        if (networkEndpoint) {
            const endpointsConfig: EndpointsConfig = {};
            endpointsConfig[networkEndpoint] = {};
            this.createOptions.NetworkingConfig = {
                EndpointsConfig: endpointsConfig
            };
            console.log(this.createOptions);
        }
    }
};
interface CoreJson {
    [key: string]: ContainerInformation
}
/**
 * 
 * @param imageName agent image name with version
 * @param count agent count. default: 1
 * @param dockerOptions default: local docker
 */
//TODO support only distribute continer option
export async function runAgents(agentImageName: string = DEFAULT_AGENT_IMAGE, count = 1, containerEnv: string[] = [],
    networkEndpoint?: string, dockerOptions: DockerOptions = {}): Promise<number> {
    return new Promise((res, rej) => {
        const containerCreateOptions = new ContainerInformation(
            agentImageName,
            dockerOptions,
            containerEnv,
            networkEndpoint
        );
        const coreJson: CoreJson = {};
        coreJson[DEFAULT_AGENT_IMAGE] = containerCreateOptions;

        let errCount = count;
        let runDockerCount = 1;
        let runCount = count;
        while (runCount-- > 0) {
            runDockerContainer(coreJson, DEFAULT_AGENT_IMAGE)
                .then((err) => {
                    if (err) {
                        console.log(err)
                    } else {
                        errCount--;
                    }
                })
                .catch((err) => {
                    // console.log(err);
                })
                .finally(() => {
                    if (runDockerCount == count) {
                        res(errCount);
                    } else {
                        runDockerCount++;
                    }
                });
        }
    });
}
