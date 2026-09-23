exports.main = async (event) => {
  const {
    videoUrl,
    actionType = '摆臂与沉肩'
  } = event;

  if (!videoUrl) {
    return {
      success: false,
      message: 'videoUrl 不能为空'
    };
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      message: '未配置 DASHSCOPE_API_KEY'
    };
  }

  const prompt = `
你是一名舞蹈动作指导老师。

请观察视频中的舞者，并针对“${actionType}”进行动作评价。

重点观察：
1. 肩部是否自然下沉，是否存在明显耸肩
2. 摆臂幅度是否合适
3. 手臂和手腕轨迹是否自然、连贯
4. 上半身是否稳定
5. 左右动作是否协调

要求：
- 只评价视频中能够明确看到的动作
- 看不清或无法判断的内容必须写“无法判断”
- 不要虚构动作细节
- 给出具体、易执行的训练建议
- 尽可能指出问题出现的大致时间段

请只返回 JSON，不要返回 Markdown：

{
  "summary": "整体评价",
  "problems": [
    {
      "time": "00:00-00:00",
      "problem": "问题描述",
      "suggestion": "改进建议"
    }
  ],
  "goodPoints": [
    "做得好的地方"
  ],
  "practiceAdvice": [
    "训练建议"
  ]
}
`;

  try {
    const response = await fetch(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen3-vl-flash',
          messages: [
            {
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
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log('Qwen 返回：', JSON.stringify(data));

    if (!response.ok) {
      return {
        success: false,
        message: '调用 Qwen 失败',
        detail: data
      };
    }

    const content =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content;

    if (!content) {
      return {
        success: false,
        message: '模型未返回评价',
        detail: data
      };
    }

    let result;

    try {
      result = JSON.parse(content);
    } catch (e) {
      result = {
        summary: content,
        problems: [],
        goodPoints: [],
        practiceAdvice: []
      };
    }

    return {
      success: true,
      data: result,
      usage: data.usage || null
    };

  } catch (err) {
    console.error('analyzeDance 错误：', err);

    return {
      success: false,
      message: err.message || '分析失败'
    };
  }
};