import kafka, { KafkaClient, Consumer } from "kafka-node";
import { setCode, startNodeCode } from './testing'

const KAFKA_HOST = process.env.KAFKA_HOST || "172.30.100.108";
const KAFKA_PORT = process.env.KAFKA_PORT || "9092";
const KAFKA_TOPIC = process.env.KAFKA_TOPIC || "t1";
const KAFKA_PARTITION = process.env.KAFKA_PARTITION || 0;
const KAFKA_AUTO_COMMIT = process.env.KAFKA_AUTO_COMMIT || "false";
const KAFKA_FETCH_MAX_WAIT_MS = process.env.KAFKA_FETCH_MAX_WAIT_MS || 1000;
const KAFKA_FETCH_MAX_BYTES = process.env.KAFKA_FETCH_MAX_BYTES || 1024 * 1024;

const kClient = new KafkaClient({ kafkaHost: `${KAFKA_HOST}:${KAFKA_PORT}` });
const topics = [{ topic: KAFKA_TOPIC, partition: +KAFKA_PARTITION }];
const options = {
    autoCommit: KAFKA_AUTO_COMMIT == "true",
    fetchMaxWaitMs: +KAFKA_FETCH_MAX_WAIT_MS,
    fetchMaxBytes: +KAFKA_FETCH_MAX_BYTES
};

const KAFKA_EVENT = {
    MESSAGE: "message",
    ERROR: "error",
};

type Message = {
    cmd: string
    id: string
    data: string
}

const kConsumer = new kafka.Consumer(kClient, topics, options);

const MESSAGE_FUNCTIONS: { [key: string]: (m: Message) => Promise<any> } = {
    execute: async (m: Message) => {
        const id = generateId(10);
        const success = await setCode(m.data, id);
        if (success) {
            return startNodeCode(id);
        } else {
            throw success;
        }
    },
    prepare: async (m: Message) => {
        return setCode(m.data, m.id);
    },
    start: async (m: Message) => {
        return startNodeCode(m.id);
    },
};

kConsumer.on(KAFKA_EVENT.MESSAGE, async (message: kafka.Message) => {
    try {
        // m from producer what has json format
        const m: Message = JSON.parse(<string>message.value);
        console.log(m.cmd + " : " + m.data);

        const fun = MESSAGE_FUNCTIONS[m.cmd];
        if (fun) {
            await fun(m);
        } else {
            console.error("incorrect command");
        }
    } catch (e) {
        console.error("incorrect json");
    }
});

kConsumer.on(KAFKA_EVENT.ERROR, function (err) {
    console.error(`consumer error`, err);
    process.exit();
});

function generateId(length: number): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}