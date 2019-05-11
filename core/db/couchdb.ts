import { CouchDb } from '@teammaestro/node-couchdb-client';
import { Config } from '../config';
import { create } from 'domain';

const request = require("request-promise");

/*
  APIs for accessing CouchDB

  Documentation can be found on following link :
  https://www.npmjs.com/package/@teammaestro/node-couchdb-client
*/


export class CouchDB extends CouchDb {
  constructor() {
    super({
      host: Config.database.host,
      port: Config.database.port,
      auth: {
        username: Config.database.username,
        password: Config.database.password
      },
      logging: false,
      defaultDatabase: Config.database.dbname
    });
  }

  sendRequest(method:string,path:string,postData?:any) {
    const startTime = Date.now();
    const requestOptions = {
      uri: `${Config.database.host}:${Config.database.port}`,
      auth: {
        username: Config.database.username,
        password: Config.database.password
      },
      method: method,
      json: true,
      headers: {
        'user-agent': 'couchdb-promises',
        'accept': 'application/json'
      },
      resolveWithFullResponse: true,
      body: postData
    };
    requestOptions.uri += `/${path}`;

    return request(requestOptions).then((response:any) => {
      return response.body;
    });
  }

  /*
    Create a document with given key(id)
  */
  create(key:string, obj:any) {
    const dbName = this.defaultDatabase;

    return this.sendRequest('PUT',`${encodeURIComponent(dbName)}/${encodeURIComponent(key)}`, obj);
  }

  /*
    Search a document with given key(id)
  */
  async retrieve(key:string) {
    const data = await this.getDocument({docId:key});
    return data;
  }

  /*
    Given the selector, returns the matching documents

    An example of paramters is as follows :
    const param =
      { "$and" : [
        { "_id" : { "$gte" : "app_" }},
        { "_id" : { "$lte" : "apq" }}
      ]},
      ['name', 'desc', 'creator', 'createAt', 'config']
  */
  async find(selector:any, fields?:any) {
    const query={
      findOptions:{
        selector: selector,
        fields: fields,
        limit: 100,
        skip: 0
      }
    };

    const data = await this.findDocuments(query);

    return data.docs;
  }

  /*
    Given the id(key), an update is made with given data(obj).
    The previous data is preserved, if obj contains the data with the same key.

    An example is shown as following :
    - previous document :
        {
          "a" : 123,
          "b" : { "c" : 456, "d" : 789 }
        }
    - obj :
        {
          "b" : { "c" : "new data" }
        }
    - new document :
        {
          "a" : 123,
          "b" : { "c" : "new data" }
        }
  */
  async update(key:string, obj:any) {
    const data = await this.retrieve(key);
    const r = await this.create(key, {...data, ...obj});

    return r;
  }

  /*
    Delete a document with given key(id)
  */
  async delete(key:string) {
    const data = await this.retrieve(key);

    const dbName = this.defaultDatabase;
    return this.sendRequest('DELETE', `${encodeURIComponent(dbName)}/${data._id}?rev=${data._rev}`);
  }

  /*
    Call on desgin documents
    For query parameters, look at the following :
    http://docs.couchdb.org/en/2.2.0/api/ddoc/views.html#db-design-design-doc-view-view-name

    TODO : reduce not implemented
  */
  async retrieveDocOnView(designName:string, viewName:string, param?: any) {
    const dbName = this.defaultDatabase;

    let request = `${encodeURIComponent(dbName)}/_design/${designName}/_view/${viewName}?`;

    for (let key in param)
      request += (key + "=" + param[key] + "&");

    return this.sendRequest('GET', request);
  }
}
