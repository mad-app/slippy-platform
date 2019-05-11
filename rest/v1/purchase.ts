import { Router } from 'express';

import { CouchDB } from '../../core/db/couchdb';

let router: Router = Router();

router.post('/buy', async (req, res, next) => {
  const app = req.body;
  const user = app.user;
  const appName = app.app;

  const item = {
    name : appName,
    boughtAt : Date.now() / 1000 | 0,
  }

  const db = new CouchDB();

  const userData = await db.retrieve(['user',user].join('_'));

  // check if bought
  for (let x in userData.purchase) {
    if (userData.purchase[x].name == appName)
      return res.send({ ok : false, error : "Already Bought" });
  }

  const newPurchaseList = { purchase : [...userData.purchase, item ] };

  const r = await db.update(['user',user].join('_'), newPurchaseList);
  res.send(r);
});

router.get('/myApps/:userName', async (req, res, next) => {
  const user = req.params.userName;
  const id = ['user',user].join('_');
  const param = {
    key: `"${id}"`,
    include_docs : true
  }

  const db = new CouchDB();

  const userData = await db.retrieveDocOnView('slippyDesign', 'getMyApp-view', param);
  const rows = userData.rows;
  let apps = [];
  for(var i in rows) {
    const app = {...rows[i].doc, PurchaseInfo : rows[i].value["Purchase Info"]}
    apps.push(app);
  }

  res.send(apps);
});

export const purchaseRouter: Router = router;
