import * as builder from './builder';
import { ContainerCreateOptions, DockerOptions } from 'dockerode';


interface ContainerConfig {
    image: string,
    command: string[],
    createOptions: ContainerCreateOptions,
    dockerOptions: DockerOptions
};

function convertContainerConfig(json: {}): Map<string, ContainerConfig> {
    const configs = new Map<string, ContainerConfig>();
    for (const name in json) {
        configs.set(name, (<any>json)[name]);
    }
    return configs;
}

// TODO corePath will be located in the image
export async function runDockerContainer(
    coreJson: {},
    imageName: string,
    command: string[] = [],
    createOptinos: ContainerCreateOptions = {},
    dockerOptions: DockerOptions = {}): Promise<any> {
    const containerConfigs = convertContainerConfig(coreJson);

    if (containerConfigs.has(imageName)) {
        const containerConfig = containerConfigs.get(imageName);
        if (command.length != 0) {
            containerConfig.command = command;
        }
        containerConfig.createOptions = {
            ...containerConfig.createOptions,
            ...createOptinos
        };
        containerConfig.dockerOptions = {
            ...containerConfig.dockerOptions,
            ...dockerOptions
        };

        let err = await builder.runDockerContainer(
            containerConfig.image,
            containerConfig.command,
            containerConfig.createOptions,
            containerConfig.dockerOptions);
        if (err) {
            return err;
        }
        return;
    }
    return "invalid imageName";
}