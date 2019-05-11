import { Router } from 'express';

import * as fs from 'fs';
import { CouchDB } from '../../core/db/couchdb';
import { Config } from '../../core/config';

let router: Router = Router();

router.post('/create', async (req, res, next) => {
  const app = req.body;
  const filename = app.name + '.zip';
  const timestamp = Date.now() / 1000 | 0;

  fs.writeFile(Config.marketplace.app_data_path + '/' + app.name+'_'+timestamp+'.zip',app.data,'base64',(err) => console.log(err));
  const db = new CouchDB();

  const r = await db.create(['app',app.name].join('_'),{
    name: app.name,
    createAt: timestamp,
    desc: app.desc,
    creator : app.creator
  });

  res.send(r);
});

router.get('/retrieve/:appName', async (req, res, next) => {
  const appName = req.params.appName;

  const db = new CouchDB();

  const r = await db.retrieve(['app',appName].join('_'));

  res.send(r);
});

router.post('/update/:appName', async (req, res, next) => {
  const appName = req.params.appName;

  const app = req.body;

  const db = new CouchDB();

  const r = await db.update(['app', appName].join('_'), app);

  res.send(r);
});

router.get('/getAll', async (req, res, next) => {
  const param = {
    "_id" : {
      "$regex" : "app_.*"
    }
  }

  const db = new CouchDB();

  const r = await db.find(param);

  res.send(r);
});

router.post('/delete/:appName', async (req, res, next) => {
  const appName = req.params.appName;

  const db = new CouchDB();

  const r = await db.delete(['app', appName].join('_'));
  res.send(r);
});

export const marketplaceRouter: Router = router;