/**
 * 数据适配层 — 前端页面调用 mock.js 的接口不变
 * 课程相关方法（login / getCourseList / getCourseDetail / getResourceList）内部走 dbApi 真实数据库
 * AI 陪练、编创、社区等功能暂保留模拟数据
 */

var dbApi = require('./dbApi.js');

function delay(data, time) {
  return new Promise(function (resolve) {
    setTimeout(function () { resolve(data); }, time);
  });
}

// ========== 真实数据（对接云数据库） ==========

function login(account, password, role) {
  return dbApi.login(account, password, role);
}

function getCourseList() {
  return dbApi.getCourseList();
}

function getCourseDetail(courseId) {
  return dbApi.getCourseDetail(courseId);
}

function getResourceList(type, keyword) {
  return dbApi.getCourseList().then(function (res) {
    if (!res || !res.success) return res;
    var list = res.data;
    if (type && type !== 'all') {
      list = list.filter(function (item) { return item.type === type; });
    }
    if (keyword) {
      var kw = keyword.trim().toLowerCase();
      list = list.filter(function (item) {
        var text = (item.title + ' ' + (item.description || '')).toLowerCase();
        return text.indexOf(kw) > -1;
      });
    }
    return { success: true, data: list };
  });
}

// ========== 以下为模拟数据（AI 陪练 / 编创 / 社区） ==========

var coachActions = [
  { id: 1, name: '云手转身', level: '基础', focus: '手眼协调', reference: '掌心带动视线', score: 86, advice: ['右肩略高，注意沉肩', '转身时核心收紧'], comparison: '整体节奏稳定' },
  { id: 2, name: '提沉组合', level: '进阶', focus: '呼吸与身韵', reference: '提时胸腔向上延展', score: 91, advice: ['提的幅度较好', '沉可以再慢半拍'], comparison: '呼吸节奏匹配度较高' },
  { id: 3, name: '爵士律动', level: '基础', focus: '节奏卡点', reference: '膝盖保持弹性', score: 78, advice: ['第二拍重心落点偏早', '肩部律动可以更清晰'], comparison: '下肢节奏比参考快约0.3秒' }
];

var creativeUnits = [
  { id: 1, name: '摆臂', tempo: '2拍', mood: '舒展', color: 'unit-green' },
  { id: 2, name: '踏步', tempo: '4拍', mood: '稳定', color: 'unit-blue' },
  { id: 3, name: '转身', tempo: '4拍', mood: '流动', color: 'unit-coral' },
  { id: 4, name: '亮相', tempo: '2拍', mood: '定格', color: 'unit-yellow' },
  { id: 5, name: '拍手', tempo: '2拍', mood: '互动', color: 'unit-mint' },
  { id: 6, name: '俯仰', tempo: '4拍', mood: '层次', color: 'unit-purple' }
];

var communityPosts = [
  { id: 1, type: 'share', title: '非专业教师如何快速组织一节民族舞课', author: '赵老师', summary: '从动作素材、节奏口令、队形变化三个角度拆解课堂流程。', comments: 18 },
  { id: 2, type: 'remote', title: '远程指导：学生动作重心不稳怎么纠正', author: '陈老师', summary: '通过分拍练习和镜面对比。', comments: 9 },
  { id: 3, type: 'research', title: '乡土舞蹈进入常态化教研的记录表', author: '教研组', summary: '提供一份可复用的听评课记录模板。', comments: 24 }
];

module.exports = {
  login: login,
  getCourseList: getCourseList,
  getCourseDetail: getCourseDetail,
  getResourceList: getResourceList,

  getResourceDetail: function (resourceId) {
    return delay(null, 300).then(function () {
      return { success: false, message: '资源不存在' };
    });
  },

  getCoachActions: function () {
    return delay({ success: true, data: coachActions }, 300);
  },

  getCoachResult: function (actionId) {
    return delay(null, 700).then(function () {
      var action = coachActions.find(function (item) { return String(item.id) === String(actionId); }) || coachActions[0];
      return { success: true, data: action };
    });
  },

  getCreativeUnits: function () {
    return delay({ success: true, data: creativeUnits }, 300);
  },

  getCommunityPosts: function (type) {
    return delay(null, 300).then(function () {
      var localPosts = wx.getStorageSync('dance_local_posts') || [];
      var allPosts = localPosts.concat(communityPosts);
      var data = !type || type === 'all' ? allPosts : allPosts.filter(function (item) { return item.type === type; });
      return { success: true, data: data };
    });
  },

  useResource: function (resource) {
    return delay(null, 200).then(function () {
      var records = wx.getStorageSync('dance_used_resources') || [];
      records.unshift({ id: resource.id, title: resource.title, label: resource.label, usedAt: Date.now() });
      wx.setStorageSync('dance_used_resources', records.slice(0, 20));
      return { success: true, data: records };
    });
  },

  saveCreativePiece: function (piece) {
    return delay(null, 250).then(function () {
      var pieces = wx.getStorageSync('dance_creative_pieces') || [];
      pieces.unshift(Object.assign({}, piece, { id: 'piece-' + Date.now(), savedAt: Date.now() }));
      wx.setStorageSync('dance_creative_pieces', pieces);
      return { success: true, data: pieces[0] };
    });
  },

  publishCommunityPost: function (post) {
    return delay(null, 250).then(function () {
      var posts = wx.getStorageSync('dance_local_posts') || [];
      posts.unshift(Object.assign({}, post, { id: 'local-' + Date.now(), comments: 0 }));
      wx.setStorageSync('dance_local_posts', posts);
      return { success: true, data: posts[0] };
    });
  }
};