import express from 'express';
import bodyParser from 'body-parser';

import { CouchDB } from './core/db/couchdb';
import { createView } from './core/db/prerequisites'

import { Config,load } from './core/config';
import { v1Router } from './rest/v1';

const args = process.argv.slice(2);

load(args[0] || 'config.yaml');
const couchdb = new CouchDB();

async function main(){
  if ( !await couchdb.checkDatabaseExists(Config.database.dbname) ) {
    couchdb.createDatabase(Config.database.dbname);
  }

  createView();

  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use('/rest/v1', v1Router);

  app.listen(8000, () => console.log('slippy REST server was started on 8000'));
}

main();