/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { expect } from 'chai';
import request from 'supertest';

let req: request.SuperTest<request.Test>;
let cookie: string[];
const url = process.env['ZSS_URL'];
const username = process.env['ZSS_USER'];
const password = process.env['ZSS_PASSWORD'];

describe('Dataset API', function () {
  this.timeout(0);
  this.bail(true);


  before('login', async function () {
    req = request(url);
    const res = await req.post('/login').send({ username, password });
    cookie = res.header['set-cookie'];
    expect(res.status, JSON.stringify(res.body)).to.equal(200);
  });

  describe(`Dataset contents`, () => {

    it(`it should get dataset contents`, async function () {
      const url = `/datasetContents/${username!.toUpperCase()}.DEV.TEST(NEW)`;
      const res = await req.get(url).set('Cookie', cookie).send();
      expect(res.status, JSON.stringify(res.text)).to.equal(200);
      const contents = res.body as {records: string[]};
      expect(contents.records).to.be.an('array');
    });

  })

});

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/