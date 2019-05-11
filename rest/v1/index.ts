import { Router } from 'express';

import { testingRouter } from './testing';
import { marketplaceRouter } from './marketplace';
import { purchaseRouter } from './purchase';

let router: Router = Router();

router.use('/testing', testingRouter);
router.use('/marketplace', marketplaceRouter);
router.use('/purchase', purchaseRouter);

export const v1Router: Router = router;
