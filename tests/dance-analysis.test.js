const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { handler } = require('../serverless/fc-analyze-dance/index.js');
const config = require('../config/api.js');
const api = require('../utils/danceAnalyzeApi.js');
const video = require('../utils/video.js');

const initial = {
  fetch: global.fetch, wx: global.wx, key: process.env.DASHSCOPE_API_KEY,
  endpoint: config.DANCE_ANALYZE_API_URL
};
afterEach(() => {
  global.fetch = initial.fetch;
  global.wx = initial.wx;
  config.DANCE_ANALYZE_API_URL = initial.endpoint;
  if (initial.key === undefined) delete process.env.DASHSCOPE_API_KEY;
  else process.env.DASHSCOPE_API_KEY = initial.key;
});

const videoUrl = 'https://video.example.test/practice.mp4?sign=test';
const fileID = 'cloud://test-env/ai-coach/video/test.mp4';
const endpoint = 'https://fc.example.test/api/dance/analyze';
const resultData = {
  summary: '上身稳定，摆臂时留意沉肩。',
  problems: [{ time: '00:04-00:07', problem: '右侧耸肩', suggestion: '放慢摆臂，保持肩部下沉。' }],
  goodPoints: ['重心平稳'], practiceAdvice: ['慢速练习四组摆臂']
};
function event(body = { videoUrl, actionType: '摆臂与沉肩' }, method = 'POST', urlPath = '/api/dance/analyze') {
  return { rawPath: urlPath, requestContext: { http: { method, path: urlPath } },
    isBase64Encoded: false, body: JSON.stringify(body) };
}
function mockModel(content = JSON.stringify(resultData)) {
  process.env.DASHSCOPE_API_KEY = 'test-only-key';
  global.fetch = async () => ({ ok: true, json: async () => ({ choices: [{ message: { content } }] }) });
}

test('FC accepts HTTP event string/Buffer/object, base64 body and all three actions', async () => {
  mockModel();
  let captured;
  const model = global.fetch;
  global.fetch = async (url, options) => {
    captured = { url, options, body: JSON.parse(options.body) };
    return model();
  };
  const actions = ['摆臂与沉肩', '踏步与颤膝', '转身与亮相'];
  for (const [i, actionType] of actions.entries()) {
    const req = event({ videoUrl, actionType });
    if (i === 2) {
      req.body = Buffer.from(req.body).toString('base64');
      req.isBase64Encoded = true;
    }
    const response = await handler(i === 0 ? Buffer.from(JSON.stringify(req)) :
      (i === 1 ? JSON.stringify(req) : req));
    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body).data, resultData);
    assert.equal(captured.url, 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions');
    assert.equal(captured.options.headers.Authorization, 'Bearer test-only-key');
    assert.equal(captured.body.model, 'qwen3-vl-flash');
    assert.deepEqual(captured.body.messages[0].content[0], {
      type: 'video_url', video_url: { url: videoUrl, fps: 4 }
    });
    const prompt = captured.body.messages[0].content[1].text;
    for (const text of [actionType, '无法判断', '不评价外貌', '不打分', '00:04-00:07', '改进建议']) {
      assert.ok(prompt.includes(text));
    }
  }
  assert.equal((await handler(event({ videoUrl: 'http://video.example.test/a.mp4', actionType: '自选动作' }))).statusCode, 200);
});

test('FC rejects invalid request/path/method/video/action without calling Qwen', async () => {
  global.fetch = async () => assert.fail('must not call Qwen');
  for (const url of ['cloud://env/a.mp4', 'file:///a.mp4', 'ftp://host/a.mp4', 'https://', '', null, 123]) {
    assert.equal((await handler(event({ videoUrl: url, actionType: '摆臂与沉肩' }))).statusCode, 400);
  }
  for (const actionType of ['', '   ', null, {}, 'a'.repeat(101)]) {
    assert.equal((await handler(event({ videoUrl, actionType }))).statusCode, 400);
  }
  assert.equal((await handler('not JSON')).statusCode, 400);
  assert.equal((await handler({ ...event(), body: '{' })).statusCode, 400);
  assert.equal((await handler({ ...event(), body: '[]' })).statusCode, 400);
  assert.equal((await handler(event(undefined, 'GET'))).statusCode, 405);
  assert.equal((await handler(event(undefined, 'POST', '/'))).statusCode, 404);
  delete process.env.DASHSCOPE_API_KEY;
  assert.equal((await handler(event())).statusCode, 500);
});

test('FC parses fences, preserves raw text on malformed output, allows empty problems', async () => {
  const noProblems = { ...resultData, problems: [] };
  mockModel('```json\n' + JSON.stringify(noProblems) + '\n```');
  let response = JSON.parse((await handler(event())).body);
  assert.equal(response.format, 'json');
  assert.deepEqual(response.data.problems, []);
  for (const content of ['原文：视频模糊，无法判断。', 'null', '{"summary":"bad"}', '{']) {
    mockModel(content);
    response = JSON.parse((await handler(event())).body);
    assert.equal(response.format, 'text');
    assert.equal(response.data.summary, content);
  }
  mockModel([{ type: 'text', text: JSON.stringify(resultData) }]);
  assert.equal(JSON.parse((await handler(event())).body).format, 'json');
  mockModel('');
  assert.equal((await handler(event())).statusCode, 502);
});

test('FC returns controlled errors for vendor HTTP, invalid JSON, network and deadline', async () => {
  mockModel();
  for (const status of [401, 429, 500]) {
    global.fetch = async () => ({ ok: false, status });
    const response = await handler(event());
    assert.equal(response.statusCode, 502);
    assert.ok(!response.body.includes('test-only-key'));
  }
  global.fetch = async () => ({ ok: true, json: async () => { throw new Error('bad JSON'); } });
  assert.equal((await handler(event())).statusCode, 502);
  global.fetch = async () => { throw new Error('network'); };
  assert.equal((await handler(event())).statusCode, 502);

  // Execute the actual deadline branch immediately, without a 90-second test wait.
  const filename = path.resolve(__dirname, '../serverless/fc-analyze-dance/index.js');
  const context = {
    exports: {}, process: { env: { DASHSCOPE_API_KEY: 'test-only-key' } }, Buffer, URL, AbortController,
    setTimeout(fn, ms) { assert.equal(ms, 90000); fn(); return 1; },
    clearTimeout() {}, fetch: async (url, options) => {
      assert.equal(options.signal.aborted, true);
      throw new Error('aborted');
    }
  };
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), context);
  assert.equal((await context.exports.handler(event())).statusCode, 504);
});

test('FC preserves upstream 400 diagnostics and request IDs without exposing secrets', async () => {
  mockModel();
  const originalError = console.error;
  const logs = [];
  console.error = (...args) => logs.push(args.join(' '));
  try {
    for (const flat of [false, true]) {
      const error = {
        code: 'InvalidParameter',
        message: `Cannot download ${videoUrl}; encoded=${encodeURIComponent(videoUrl)}; key=test-only-key`
      };
      global.fetch = async () => ({ ok: false, status: 400,
        headers: new Headers({ 'x-request-id': 'header-request-123' }),
        json: async () => flat ? { ...error, request_id: 'body-request-456' } : { error }
      });
      const response = await handler(event());
      const body = JSON.parse(response.body);
      assert.equal(response.statusCode, 502);
      assert.equal(body.upstream.status, 400);
      assert.equal(body.upstream.code, 'InvalidParameter');
      assert.equal(body.upstream.requestId, flat ? 'body-request-456' : 'header-request-123');
      assert.match(body.message, /Cannot download/);
      for (const secret of [videoUrl, encodeURIComponent(videoUrl), 'test-only-key']) {
        assert.ok(!response.body.includes(secret));
        assert.ok(!logs.join('').includes(secret));
      }
    }
    global.fetch = async () => ({ ok: false, status: 400,
      json: async () => ({ error: { code: 'InvalidParameter', message: 'x'.repeat(2000) } }) });
    assert.equal(JSON.parse((await handler(event())).body).upstream.message.length, 600);
    global.fetch = async () => ({ ok: false, status: 502,
      json: async () => { throw new SyntaxError('private HTML body'); } });
    const response = await handler(event());
    assert.match(JSON.parse(response.body).message, /未返回可解析的错误详情/);
    assert.ok(!response.body.includes('private HTML'));
    global.fetch = async () => ({ ok: false, status: 400,
      json: async () => ({ error: { message: `Invalid video ${JSON.stringify(videoUrl).slice(1, -1)} https://other.test/?token=hidden sk-secret123 Bearer secret456` } }) });
    const redacted = (await handler(event())).body;
    for (const secret of [videoUrl, 'hidden', 'sk-secret123', 'secret456']) {
      assert.ok(!redacted.includes(secret));
    }
  } finally {
    console.error = originalError;
  }
});

test('wx.request uses JSON POST, 100-second timeout, and handles service/network errors', async () => {
  config.DANCE_ANALYZE_API_URL = endpoint;
  global.wx = { request(options) {
    assert.equal(options.url, endpoint);
    assert.equal(options.timeout, 100000);
    assert.equal(options.method, 'POST');
    assert.equal(options.header['content-type'], 'application/json');
    assert.deepEqual(options.data, { videoUrl, actionType: '摆臂与沉肩' });
    options.success({ statusCode: 200, data: JSON.stringify({ success: true, data: resultData }) });
  } };
  assert.deepEqual((await api.analyzeDance(videoUrl, '摆臂与沉肩')).data, resultData);
  for (const statusCode of [400, 500, 502, 504]) {
    wx.request = options => options.success({ statusCode, data: { success: false, message: '服务错误' } });
    await assert.rejects(api.analyzeDance(videoUrl, '摆臂与沉肩'), /服务错误/);
  }
  for (const data of ['<html>error</html>', { success: false }, { success: true, data: {} }]) {
    wx.request = options => options.success({ statusCode: 200, data });
    await assert.rejects(api.analyzeDance(videoUrl, '摆臂与沉肩'));
  }
  for (const errMsg of ['request:fail timeout', 'request:fail url not in domain list', 'request:fail network']) {
    wx.request = options => options.fail({ errMsg });
    await assert.rejects(api.analyzeDance(videoUrl, '摆臂与沉肩'));
  }
  wx.request = () => assert.fail('invalid input must not be sent');
  await assert.rejects(api.analyzeDance(fileID, '摆臂与沉肩'));
  await assert.rejects(api.analyzeDance(videoUrl, ' '));
  config.DANCE_ANALYZE_API_URL = '';
  await assert.rejects(api.analyzeDance(videoUrl, '摆臂与沉肩'), /config\/api.js/);
});

function loadPage() {
  const filename = path.resolve(__dirname, '../pages/ai-coach/ai-coach.js');
  let page;
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
    require: createRequire(filename), wx: global.wx,
    console: { log() {}, error() {} },
    Page(definition) { page = definition; }
  });
  page.setData = patch => Object.assign(page.data, patch);
  return page;
}

test('page upload -> getVideoUrl -> FC -> Qwen -> analysisResult with loading cleanup', async () => {
  config.DANCE_ANALYZE_API_URL = endpoint;
  mockModel();
  let mediaOptions;
  let hideCount = 0;
  const calls = [];
  global.wx = {
    showLoading() {}, hideLoading() { hideCount++; }, showToast() {},
    chooseMedia(options) { mediaOptions = options; },
    cloud: {
      uploadFile(options) {
        calls.push('upload');
        assert.ok(options.cloudPath.startsWith('ai-coach/video/'));
        options.success({ fileID });
      },
      async callFunction(options) {
        calls.push(options.name);
        assert.equal(options.name, 'getVideoUrl');
        assert.equal(options.data.videoUrl, fileID);
        return { result: { success: true, data: { videoUrl } } };
      }
    },
    request(options) {
      calls.push('FC');
      handler(event(options.data)).then(response => options.success({
        statusCode: response.statusCode, data: JSON.parse(response.body)
      })).catch(options.fail);
    }
  };
  const page = loadPage();
  await page.loadActions();
  assert.deepEqual(Array.from(page.data.actions, a => a.name), ['摆臂与沉肩', '踏步与颤膝', '转身与亮相']);
  page.uploadVideo();
  assert.equal(mediaOptions.maxDuration, 30);
  await mediaOptions.success({ tempFiles: [{ tempFilePath: '/tmp/test.mp4', duration: 20, size: 1000 }] });
  assert.equal(page.data.videoFileID, fileID);
  assert.equal(page.data.uploading, false);
  await page.analyzeVideo();
  assert.deepEqual(calls, ['upload', 'getVideoUrl', 'FC']);
  assert.deepEqual(page.data.analysisResult, resultData);
  assert.equal(page.data.resultFormat, 'json');
  assert.equal(page.data.analyzing, false);
  assert.equal(hideCount, 3);
  mockModel('无法判断，请重新录制。');
  await page.analyzeVideo();
  assert.equal(page.data.resultFormat, 'text');
  assert.equal(page.data.analysisResult.summary, '无法判断，请重新录制。');
  const template = fs.readFileSync(filenameForTemplate(), 'utf8');
  assert.ok(template.includes("resultFormat !== 'text'"));
  assert.ok(template.includes('暂未发现明显动作问题。'));
});

function filenameForTemplate() {
  return path.resolve(__dirname, '../pages/ai-coach/ai-coach.wxml');
}

test('page error paths always close loading and do not send cloud:// to FC', async () => {
  config.DANCE_ANALYZE_API_URL = endpoint;
  let hideCount = 0;
  let requestCount = 0;
  global.wx = {
    showLoading() {}, hideLoading() { hideCount++; }, showToast() {},
    cloud: { callFunction: async () => { throw new Error('转换失败'); } },
    request(options) { requestCount++; options.fail({ errMsg: 'request:fail timeout' }); }
  };
  const page = loadPage();
  page.setData({ selectedAction: { id: 1, name: '摆臂与沉肩' }, videoFileID: fileID });
  await page.analyzeVideo();
  assert.equal(requestCount, 0);
  assert.equal(page.data.analyzing, false);
  assert.equal(hideCount, 1);
  wx.cloud.callFunction = async () => ({ result: { success: true, data: { videoUrl: fileID } } });
  await page.analyzeVideo();
  assert.equal(requestCount, 0);
  assert.equal(page.data.analyzing, false);
  wx.cloud.callFunction = async () => ({ result: { success: true, data: { videoUrl } } });
  await page.analyzeVideo();
  assert.equal(page.data.analyzing, false);
  assert.match(page.data.errorMessage, /超时/);
  config.DANCE_ANALYZE_API_URL = '';
  await page.analyzeVideo();
  assert.equal(page.data.analyzing, false);
  assert.equal(hideCount, 4);
  assert.equal(requestCount, 1);
});

test('shared video helper still passes through HTTP/HTTPS course URLs', async () => {
  global.wx = { cloud: { callFunction() { assert.fail('HTTP URLs need no cloud conversion'); } } };
  assert.equal(await video.convertVideoUrl(videoUrl), videoUrl);
  assert.equal(await video.convertVideoUrl('http://video.example.test/a.mp4'), 'http://video.example.test/a.mp4');
});
