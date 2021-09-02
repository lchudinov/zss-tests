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
const contents = `Hello cruel world!`;
const url = process.env['ZSS_URL'];
const username = process.env['ZSS_USER'];
const password = process.env['ZSS_PASSWORD'];

describe('Memory API', function () {
  this.timeout(0);
  this.bail(true);
  const n = 10;

  before('login', async function () {
    req = request(url);
    const res = await req.post('/login').send({ username, password });
    cookie = res.header['set-cookie'];
    expect(res.status, JSON.stringify(res.body)).to.equal(200);
  });

  describe(`Getting contents of tagged file with unknown extension`, () => {
    const file = `/tmp/random.` + Math.ceil(Math.random() * 10000);

    before('it should create unix file', async function () {
      const res = await req.put(`/unixfile/contents${file}?sourceEncoding=utf-8&targetEncoding=ibm-1047&forceOverwrite=true`).set('Cookie', cookie).send(contents);
      expect(res.status, JSON.stringify(res.text)).to.equal(200);
      const sessionID = res.body.sessionID;
      const b64Contents = Buffer.from(contents, 'utf-8').toString('base64');
      const res2 = await req.put(`/unixfile/contents${file}?lastChunk=true&sessionID=${sessionID}`).set('Cookie', cookie).send(b64Contents);
      expect(res2.status, JSON.stringify(res2.text)).to.equal(200);
    });

    it(`it should get unix file ${n} times`, async function () {
      for (let i = 0; i < n; i++) {
        const res = await req.get(`/unixfile/contents${file}`).set('Cookie', cookie).send();
        expect(res.status, JSON.stringify(res.text)).to.equal(200);
        const buf = Buffer.from(res.text, 'base64');
        const text = buf.toString('utf-8');
        expect(text).to.equal(contents);
      }
    });

    after('it should delete unix file', async function () {
      const res = await req.delete(`/unixfile/contents${file}`).set('Cookie', cookie).send(contents);
      expect(res.status, JSON.stringify(res.text)).to.equal(200);
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