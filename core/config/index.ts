import * as yaml from 'yamljs';
import * as path from 'path';

export var Config:any;

export function load(file:string) {
  Config = yaml.load(file);
  Config.database.host = process.env.DB_HOST;
  Config.database.username = process.env.DB_USER;
  Config.database.password = process.env.DB_PASSWORD;
  Config.kafka.host = process.env.KAFKA_HOST;
  console.log(Config);
  return Config;
}

