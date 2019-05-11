import kafka, { KafkaClient } from "kafka-node";
import { Config } from "../../../core/config";

export class Commander {
  client: KafkaClient;
  producer: kafka.Producer;

  constructor() {
    const host = Config.kafka.host;
    const port = Config.kafka.port;
    const conn = `${host}:${port}`;
    this.client = new KafkaClient({ kafkaHost: conn });
    this.producer = new kafka.Producer(this.client);
  }

  async createCommand(topic: any): Promise<any> {
    return new Promise((res, rej) => {
      this.client.createTopics(
        [
          topic
        ],
        (error, result) => {
          if (error) {
            console.error(error);
            rej(error)
          } else {
            res(result);
          }
        });
    });
  }

  async sendCommand(topic: any, msg: any): Promise<any> {
    return new Promise((res, rej) => {
      this.producer.send(
        [
          {
            topic: topic,
            partition: 0,
            messages: [JSON.stringify(msg)]
          }
        ],
        (error, result) => {
          if (error) {
            console.error(error);
            rej(error)
          } else {
            res(result);
          }
        });
    });
  }
}
