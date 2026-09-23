# AI 动作分析：阿里云 FC + Qwen3-VL-Flash

本目录是独立的 FC 3.0 Node.js 20 函数，不依赖微信 SDK，也没有 npm 运行时依赖。
保留微信数据库、微信云存储和 `cloudfunctions/getVideoUrl`。
原 `cloudfunctions/analyzeDance` 保留，但陪练页不再调用它。

## 部署 FC

1. 在阿里云函数计算 FC 3.0 创建使用内置运行时的函数，名称可设为 `fc-analyze-dance`。
2. 运行时选择 **Node.js 20**，代码入口文件为 `index.js`，请求处理程序为 **`index.handler`**，执行超时为 **120 秒**。
3. 将本目录中的 `index.js` 和 `package.json` 上传到函数代码根目录，或在控制台创建这两个文件后部署。压缩包根层应直接包含 `index.js`，不要多套一层目录。无需安装依赖。
4. 在该 FC 函数的配置中新增环境变量 **`DASHSCOPE_API_KEY`**，填入百炼 API Key，然后保存并部署配置。代码通过 `process.env.DASHSCOPE_API_KEY` 读取。不要把真实值写入前端、仓库、测试样例或压缩包。
5. 确保函数能够访问公网的 `dashscope.aliyuncs.com`；本实现使用北京地域的兼容接口，Key 需具备对应地域和 `qwen3-vl-flash` 的调用权限。
6. 创建同步 **HTTP 触发器**，允许方法 **POST**。第一版直连联调使用“无需认证”；因此拿到地址的人也可调用并产生模型费用，上线前需接服务端用户鉴权和限流。不要用写在小程序里的固定密钥充当鉴权，也不要向前端提供阿里云 AccessKey。
7. 复制触发器的公网 **HTTPS** 地址，追加 `/api/dance/analyze`。例如：`https://<trigger>.<region>.fcapp.run/api/dance/analyze`。本实现不需要启动 Express、配置监听端口或运行 `npm start`。

FC 使用内置运行时的 HTTP 事件封装，读取 `requestContext.http.method/path` 和 `body`，支持 Base64 body，返回 `statusCode/headers/body/isBase64Encoded`。这是 FC 3.0 入口，不是旧 FC 2.0 的 `(req, resp, context)` 入口。

## 配置微信小程序

修改 `dance/config/api.js`：

```javascript
module.exports = {
  DANCE_ANALYZE_API_URL: 'https://<你的FC域名>/api/dance/analyze'
};
```

仓库默认留空，未配置时页面给出明确错误，不会悄悄调用旧云函数。
这里放完整 Endpoint 即可，**绝不能放 DASHSCOPE_API_KEY**。
在微信公众平台“小程序 → 开发管理 → 开发设置 → 服务器域名 → request 合法域名”添加 FC 的 HTTPS 域名（只填域名，不带 `/api/dance/analyze` 路径）。若触发器域名无法满足微信域名要求，应先绑定符合微信要求的自定义 HTTPS 域名，再同时更新配置和合法域名。
保留现有云开发环境和 `getVideoUrl` 的部署。`project.config.json` 已把 `serverless/` 和 `tests/` 排除在小程序上传包外。

## HTTP 接口

```http
POST /api/dance/analyze
Content-Type: application/json
```

```json
{
  "videoUrl": "https://你的可访问视频地址.mp4",
  "actionType": "摆臂与沉肩"
}
```

`videoUrl` 必须是合法 HTTP/HTTPS URL，拒绝 `cloud://`；小程序端只传 `getVideoUrl` 返回的 HTTPS 临时链接。`actionType` 必须是非空字符串（最多 100 字符）。内置“摆臂与沉肩”“踏步与颤膝”“转身与亮相”的观察重点，其他动作使用通用观察要求。

返回 HTTP 200：

```json
{
  "success": true,
  "message": "AI动作分析完成",
  "format": "json",
  "data": {
    "summary": "整体评价",
    "problems": [{"time": "00:04-00:07", "problem": "具体问题", "suggestion": "改进建议"}],
    "goodPoints": ["做得好的地方"],
    "practiceAdvice": ["专项练习建议"]
  }
}
```

模型输出先移除首尾 Markdown code fence 再解析 JSON。解析或结构校验失败时返回 `format: "text"`，`data.summary` 保存模型原始文本，三个列表为空。页面在此情况下只展示原文，不显示“暂未发现明显动作问题”。合法结构的 `problems: []` 才显示该空状态。

错误统一返回 `{ "success": false, "message": "可读的原因" }`。状态码：400 参数错误，404 路径错误，405 方法错误，500 缺少 FC 环境变量，502 百炼调用/响应异常，504 模型超时。百炼 HTTP 错误额外返回 `upstream: { status, code, message, requestId }`，只保留经过脱敏和截断的诊断字段，不回传完整原始错误体。

### 小程序 502、百炼 HTTP 400 的排查

这表示小程序已到达 FC，FC 调用百炼时请求被拒绝，不代表数据库故障，也不能仅凭 400 判断密钥错误。
旧版函数丢弃了百炼错误详情，需将本目录最新 `index.js` 重新部署到 **阿里云 FC**；只重新编译小程序或上传微信云函数不会更新 FC。

1. 部署后在小程序重新点击“生成动作建议”，以重新获取视频临时地址。
2. 在微信开发者工具 Network 中打开 `/api/dance/analyze` 的 Response，查看 `upstream.code/message/requestId`。页面错误提示也包含这些信息。
3. FC 日志搜索 `DANCE_ANALYZE_UPSTREAM_ERROR`，可看到同样的脱敏诊断。没有该日志且仍提示旧的“请检查 FC 密钥、模型权限和视频链接有效期”，应确认触发器指向的版本已更新。
4. 根据具体错误再处理：下载失败/URL 失效时检查新生成的 HTTPS 链接能否免登录访问；格式或解码错误时换短 MP4 视频验证；参数错误时按百炼指出的字段修正；鉴权/权限错误时核对 FC 的 Key 与百炼地域和模型权限。

不要把 API Key 或带签名的完整视频链接发到聊天或公开日志。排查时提供脱敏后的 `upstream` 即可。此次诊断增强不代表具体 HTTP 400 根因已经修复，需要新的服务端错误内容确认。

模型请求固定 `qwen3-vl-flash`、`video_url.url`、`video_url.fps: 4`；只评价可见动作，模糊处写“无法判断”，不评价外貌和身材，不打分，尽量给出问题时间段和可执行建议。

## 超时与视频长度

- FC 函数超时：120 秒。
- 百炼请求总耗时上限：90 秒（包含读取响应，超时中止请求）。
- 微信 `wx.request` 超时：100000ms。100 秒内未收到响应会提示重试，不自动重复提交。
- 第一版建议选择 15～30 秒视频；摄像头录制上限设为 30 秒，相册视频长度提示为建议，不改变公共上传接口。
- 总时长还包括上传和 `getVideoUrl` 地址转换；FC 120 秒不等于前端能等待 120 秒。

## 测试完整链路

先在 `dance` 目录运行无网络、无真实密钥的测试：

```bash
node --test tests/dance-analysis.test.js
```

部署后，可先单独调用 HTTP 接口（替换占位 URL；不要传 `cloud://`）：

```bash
curl --max-time 100 -X POST 'https://<你的FC域名>/api/dance/analyze' \
  -H 'Content-Type: application/json' \
  --data '{"videoUrl":"https://<有效的视频临时地址>","actionType":"摆臂与沉肩"}'
```

再用微信开发者工具和真机验收：

1. 配置 Endpoint、FC 环境变量和 request 合法域名，重新编译小程序。
2. 登录进入 AI 动作陪练，选择“摆臂与沉肩”，上传 15～30 秒全身练习视频。
3. 确认上传产生 `cloud://` fileID，点击“生成动作建议”。
4. Network 中应先出现 `getVideoUrl`，再出现 FC 的 POST 请求；POST 中 `videoUrl` 应为 HTTPS、`actionType` 应为所选动作，不应出现调用 CloudBase `analyzeDance`。
5. 检查返回 `success: true`，页面展示整体表现、需要调整、做得不错和练习建议；换另外两种动作各试一次。
6. 测试断网、未配置 Endpoint、失效视频地址，确认有错误提示且 loading 消失、可重新操作。
7. 回归课程视频播放和课程上传，确认它们仍走原有微信云存储/地址转换链路。

这些本地测试使用替身验证 FC、微信请求和页面逻辑，不代表已经通过真实云端调用。真实验收需可访问的 Endpoint、有效百炼 Key、微信云环境及视频。

## 官方文档

- [FC HTTP 请求与响应结构](https://www.alibabacloud.com/help/en/functioncompute/http-trigger-invoking-function)
- [Node.js 请求处理程序](https://help.aliyun.com/en/functioncompute/request-handlers)
- [百炼 OpenAI 兼容接口及 video_url 参数](https://help.aliyun.com/en/model-studio/qwen-api-via-openai-chat-completions)

当前同步版本不包含 taskId、Redis、队列、异步任务或评分系统。



curl -i \
  -X POST '' \
  -H 'Content-Type: application/json' \
  --data '{
    "videoUrl": "cloud://test",
    "actionType": "摆臂与沉肩"
  }'
