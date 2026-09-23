const config = require('../config/api.js');

function getEndpoint() {
  const endpoint = config.DANCE_ANALYZE_API_URL;
  if (typeof endpoint !== 'string' || !/^https:\/\/[^\s/?#]+\/api\/dance\/analyze$/.test(endpoint)) {
    throw new Error('请先在 config/api.js 配置 FC 的 HTTPS 地址（含 /api/dance/analyze）');
  }
  return endpoint;
}

function isAnalysisResult(data) {
  return data && typeof data.summary === 'string' &&
    Array.isArray(data.problems) && data.problems.every(item => item &&
      typeof item.time === 'string' && typeof item.problem === 'string' &&
      typeof item.suggestion === 'string') &&
    Array.isArray(data.goodPoints) && data.goodPoints.every(item => typeof item === 'string') &&
    Array.isArray(data.practiceAdvice) && data.practiceAdvice.every(item => typeof item === 'string');
}

function analyzeDance(videoUrl, actionType) {
  return new Promise((resolve, reject) => {
    const url = getEndpoint();
    if (typeof videoUrl !== 'string' || !/^https:\/\/\S+$/i.test(videoUrl)) {
      throw new Error('请先获取有效的 HTTPS 视频地址');
    }
    if (typeof actionType !== 'string' || !actionType.trim()) {
      throw new Error('请先选择动作');
    }

    wx.request({
      url,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: { videoUrl, actionType: actionType.trim() },
      timeout: 100000,
      success: response => {
        let result = response.data;
        if (typeof result === 'string') {
          try { result = JSON.parse(result); } catch (error) { result = null; }
        }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(result && result.message || `动作分析服务异常（HTTP ${response.statusCode}）`));
          return;
        }
        if (!result || result.success !== true || !isAnalysisResult(result.data)) {
          reject(new Error(result && result.message || '动作分析服务返回了无效结果'));
          return;
        }
        resolve(result);
      },
      fail: error => {
        const detail = error && error.errMsg || '';
        const message = /timeout/i.test(detail)
          ? '分析请求超时，请使用 15～30 秒视频重试'
          : (/domain|url not in/i.test(detail)
            ? '请在微信后台将 FC 域名加入 request 合法域名'
            : '无法连接动作分析服务，请检查网络与 FC 地址');
        reject(new Error(message));
      }
    });
  });
}

module.exports = { analyzeDance, getEndpoint };
