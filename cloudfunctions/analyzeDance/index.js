const https = require('https');

const DASHSCOPE_HOST = 'dashscope.aliyuncs.com';
const DASHSCOPE_PATH = '/compatible-mode/v1/chat/completions';
const MODEL_NAME = 'qwen3-vl-flash';

const ACTION_FOCUS = {
  '摆臂与沉肩': [
    '肩部是否自然下沉',
    '是否有明显耸肩',
    '摆臂幅度',
    '手臂轨迹',
    '手腕轨迹',
    '左右协调性',
    '上身稳定性'
  ],
  '踏步与颤膝': [
    '脚步是否稳定',
    '落脚是否清晰',
    '膝盖屈伸是否自然',
    '颤膝动作是否连续',
    '重心是否稳定',
    '左右腿协调性',
    '上下肢配合'
  ],
  '转身与亮相': [
    '转身轴是否稳定',
    '重心是否晃动',
    '转身是否流畅',
    '头部与身体配合',
    '转身后的定点',
    '亮相姿态',
    '手臂与身体线条'
  ]
};

function buildPrompt(actionType) {
  const focusText = ACTION_FOCUS[actionType]
    .map((item, index) => `${index + 1}. ${item}`)
    .join('\n');

  return `你是一名专业舞蹈动作指导老师。

请观察视频中舞者的动作，并针对用户选择的练习动作“${actionType}”进行评价。

重点观察：
${focusText}

必须遵循：
1. 只评价视频里能够明确观察到的内容。
2. 如果看不清、被遮挡或无法判断，明确写“无法判断”。
3. 禁止凭空编造动作问题。
4. 不进行外貌、身材评价。
5. 不进行分数、等级、完成度评价。
6. 不要泛泛而谈，要指出具体动作问题。
7. 尽量指出问题发生的大致时间，例如 00:04-00:07。
8. 每个问题都提供一个简单、可执行的改进方法。
9. 评价语气专业、友好、简洁。
10. 输出必须严格遵循指定 JSON 格式，只输出 JSON，不要输出 Markdown code fence 或额外说明。

{
  "summary": "对本次动作的整体评价",
  "problems": [
    {
      "time": "00:04-00:07",
      "problem": "具体存在的问题",
      "suggestion": "针对这个问题的训练建议"
    }
  ],
  "goodPoints": ["做得比较好的地方"],
  "practiceAdvice": ["建议进行的专项练习"]
}

如果视频中没有明显问题，problems 返回空数组。如果某个动作细节看不清，可将 problem 写为“当前视频角度无法判断该动作细节”。`;
}

function requestDashScope(apiKey, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const request = https.request({
      hostname: DASHSCOPE_HOST,
      path: DASHSCOPE_PATH,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 110000
    }, response => {
      let raw = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        raw += chunk;
      });
      response.on('end', () => {
        let data;
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch (error) {
          reject(new Error('百炼接口返回了无法解析的响应'));
          return;
        }

        if (response.statusCode < 200 || response.statusCode >= 300) {
          const apiMessage = data.error && data.error.message;
          reject(new Error(apiMessage || `百炼接口请求失败（HTTP ${response.statusCode}）`));
          return;
        }

        resolve(data);
      });
    });

    request.on('timeout', () => {
      request.destroy(new Error('百炼视频分析请求超时'));
    });
    request.on('error', reject);
    request.write(payload);
    request.end();
  });
}

function getMessageContent(content) {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item.text === 'string') return item.text;
      return '';
    }).join('').trim();
  }

  return '';
}

function cleanJsonContent(content) {
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  return cleaned.trim();
}

function normalizeResult(parsed) {
  const problems = Array.isArray(parsed.problems) ? parsed.problems : [];

  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    problems: problems.map(item => ({
      time: item && typeof item.time === 'string' ? item.time : '无法判断',
      problem: item && typeof item.problem === 'string' ? item.problem : '无法判断',
      suggestion: item && typeof item.suggestion === 'string'
        ? item.suggestion
        : '请重新录制清晰的全身视频'
    })),
    goodPoints: Array.isArray(parsed.goodPoints)
      ? parsed.goodPoints.filter(item => typeof item === 'string')
      : [],
    practiceAdvice: Array.isArray(parsed.practiceAdvice)
      ? parsed.practiceAdvice.filter(item => typeof item === 'string')
      : []
  };
}

exports.main = async function(event) {
  const videoUrl = event && event.videoUrl;
  const actionType = event && event.actionType;

  if (!videoUrl || !/^https:\/\//i.test(videoUrl)) {
    return {
      success: false,
      message: 'videoUrl 必须是可访问的 HTTPS 地址'
    };
  }

  if (!ACTION_FOCUS[actionType]) {
    return {
      success: false,
      message: '不支持的动作类型'
    };
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      message: '未配置 DASHSCOPE_API_KEY'
    };
  }

  const requestBody = {
    model: MODEL_NAME,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'video_url',
          video_url: {
            url: videoUrl,
            fps: 4
          }
        },
        {
          type: 'text',
          text: buildPrompt(actionType)
        }
      ]
    }],
    temperature: 0.2,
    max_tokens: 1600
  };

  try {
    const response = await requestDashScope(apiKey, requestBody);
    const rawContent = response.choices && response.choices[0] &&
      response.choices[0].message && response.choices[0].message.content;
    const content = getMessageContent(rawContent);

    if (!content) {
      return {
        success: false,
        message: '模型未返回动作评价'
      };
    }

    let result;
    try {
      result = normalizeResult(JSON.parse(cleanJsonContent(content)));
    } catch (error) {
      console.error('Qwen JSON 解析失败：', error);
      result = {
        summary: content,
        problems: [],
        goodPoints: [],
        practiceAdvice: []
      };
    }

    return {
      success: true,
      message: 'AI动作分析完成',
      data: result,
      usage: response.usage || {}
    };
  } catch (error) {
    console.error('analyzeDance 调用失败：', error);
    return {
      success: false,
      message: error.message || '动作分析失败'
    };
  }
};
