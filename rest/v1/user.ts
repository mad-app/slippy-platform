import { Router } from 'express';

import { CouchDB } from '../../core/db/couchdb';

let router: Router = Router();

router.post('/retrieve/:userName', async (req, res, next) => {
    const appName = req.params.userName;

    const db = new CouchDB();

    const r = await db.retrieve(['user',appName].join('_'));

    res.send(r);
});

export const purchaseRouter: Router = router;
