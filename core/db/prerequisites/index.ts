import { CouchDB } from '../couchdb';

import slippyDesign from './slippyDesign.json';
import mockUser from './user_mockname.json';

export async function createView() {
  const couchdb = new CouchDB();

  const docs = []

  if ( !await couchdb.checkDatabaseExists(slippyDesign._id)) {
    docs.push(slippyDesign);
  }

  if ( !await couchdb.checkDatabaseExists(mockUser._id)) {
    docs.push(mockUser);
  }

  if (docs.length != 0)
    couchdb.upsertDocuments({docs});
}