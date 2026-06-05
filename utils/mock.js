/**
 * 数据适配层 — 前端页面调用 mock.js 的接口不变
 * 课程相关方法（login / getCourseList / getCourseDetail / getResourceList）内部走 dbApi 真实数据库
 * AI 陪练、编创、社区等功能暂保留模拟数据
 */

var dbApi = null;

try {
  dbApi = require('./dbApi.js');
} catch (err) {
  console.warn('dbApi 加载失败，已切换到本地 Mock 数据：', err);
}

function delay(data, time) {
  return new Promise(function (resolve) {
    setTimeout(function () { resolve(data); }, time);
  });
}

var localUsers = [
  { id: 1, account: '2024001', password: '123456', name: '李同学', role: 'student', roleName: '学生', avatar: '' },
  { id: 2, account: '2024002', password: '123456', name: '王同学', role: 'student', roleName: '学生', avatar: '' },
  { id: 101, account: 'T1001', password: '123456', name: '赵老师', role: 'teacher', roleName: '教师', avatar: '' },
  { id: 102, account: 'T1002', password: '123456', name: '陈老师', role: 'teacher', roleName: '教师', avatar: '' }
];

var localCourses = [
  {
    id: 'local-101',
    type: 'video',
    label: '分解视频',
    title: '古典舞基础入门',
    coverClass: 'cover-green',
    duration: '45分钟',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    description: '从基本功开始，学习古典舞的神韵与姿态',
    tags: ['身韵', '基础', '七年级']
  },
  {
    id: 'local-102',
    type: 'video',
    label: '分解视频',
    title: '爵士舞成品舞教学',
    coverClass: 'cover-coral',
    duration: '60分钟',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    description: '学习热门爵士舞片段，提升节奏感与表现力',
    tags: ['节奏', '成品舞', '社团']
  }
];

var localResourceExtras = [
  {
    id: 'local-201',
    type: 'lesson',
    label: '标准教案',
    title: '民族舞课堂导入教案',
    coverClass: 'cover-blue',
    duration: '15页',
    description: '包含课堂目标、热身流程、动作拆解和课后评价表',
    tags: ['教案', '民族舞', '课堂导入']
  },
  {
    id: 'local-202',
    type: 'courseware',
    label: '课件模板',
    title: '乡土舞蹈文化课件模板',
    coverClass: 'cover-yellow',
    duration: '24页',
    description: '适合教师快速生成地域文化导赏、动作背景和课堂任务',
    tags: ['课件', '乡土文化', '模板']
  }
];

function localLogin(account, password, role) {
  return delay(null, 300).then(function () {
    var user = localUsers.find(function (item) {
      return item.account === account && item.password === password && item.role === role;
    });
    if (user) {
      return { success: true, data: user, message: '登录成功' };
    }
    return { success: false, message: role === 'teacher' ? '工号或密码错误' : '学号或密码错误' };
  });
}

function localGetCourseList() {
  return delay({ success: true, data: localCourses }, 300);
}

function localGetCourseDetail(courseId) {
  return delay(null, 300).then(function () {
    var course = localCourses.find(function (item) {
      return String(item.id) === String(courseId);
    });
    return { success: !!course, data: course, message: course ? '获取成功' : '课程不存在' };
  });
}

function localGetResourceDetail(resourceId) {
  return delay(null, 300).then(function () {
    var resources = localCourses.concat(localResourceExtras);
    var resource = resources.find(function (item) {
      return String(item.id) === String(resourceId);
    });
    return { success: !!resource, data: resource, message: resource ? '获取成功' : '资源不存在' };
  });
}

function filterResources(list, type, keyword) {
  var data = list || [];
  if (type && type !== 'all') {
    data = data.filter(function (item) { return item.type === type; });
  }
  if (keyword) {
    var kw = keyword.trim().toLowerCase();
    data = data.filter(function (item) {
      var text = (item.title + ' ' + (item.description || '') + ' ' + ((item.tags || []).join(' '))).toLowerCase();
      return text.indexOf(kw) > -1;
    });
  }
  return data;
}

function localGetResourceList(type, keyword) {
  return delay(null, 300).then(function () {
    return { success: true, data: filterResources(localCourses.concat(localResourceExtras), type, keyword) };
  });
}

function withDb(apiCall, fallback) {
  if (!dbApi) return fallback();
  try {
    return apiCall().catch(function (err) {
      console.warn('数据库接口失败，已回退本地 Mock：', err);
      return fallback();
    });
  } catch (err) {
    console.warn('数据库接口异常，已回退本地 Mock：', err);
    return fallback();
  }
}

// ========== 真实数据（对接云数据库） ==========

function login(account, password, role) {
  return withDb(function () {
    return dbApi.login(account, password, role);
  }, function () {
    return localLogin(account, password, role);
  });
}

function getCourseList() {
  return withDb(function () {
    return dbApi.getCourseList();
  }, localGetCourseList);
}

function getCourseDetail(courseId) {
  return withDb(function () {
    return dbApi.getCourseDetail(courseId);
  }, function () {
    return localGetCourseDetail(courseId);
  });
}

function getResourceList(type, keyword) {
  return withDb(function () {
    return dbApi.getCourseList().then(function (res) {
      if (!res || !res.success) return res;
      return { success: true, data: filterResources(res.data.concat(localResourceExtras), type, keyword) };
    });
  }, function () {
    return localGetResourceList(type, keyword);
  });
}

// ========== 以下为模拟数据（AI 陪练 / 编创 / 社区） ==========

var coachActions = [
  { id: 1, name: '云手转身', level: '基础', focus: '手眼协调', reference: '掌心带动视线', score: 86, advice: ['右肩略高，注意沉肩', '转身时核心收紧'], comparison: '整体节奏稳定' },
  { id: 2, name: '提沉组合', level: '进阶', focus: '呼吸与身韵', reference: '提时胸腔向上延展', score: 91, advice: ['提的幅度较好', '沉可以再慢半拍'], comparison: '呼吸节奏匹配度较高' },
  { id: 3, name: '爵士律动', level: '基础', focus: '节奏卡点', reference: '膝盖保持弹性', score: 78, advice: ['第二拍重心落点偏早', '肩部律动可以更清晰'], comparison: '下肢节奏比参考快约0.3秒' }
];

var creativeUnits = [
  { id: 1, name: '摆臂', tempo: '2拍', mood: '舒展', color: 'unit-green', frameDir: '/pages/creative-studio/frames/unit-1' },
  { id: 2, name: '踏步', tempo: '4拍', mood: '稳定', color: 'unit-blue', frameDir: '/pages/creative-studio/frames/unit-2' },
  { id: 3, name: '转身', tempo: '4拍', mood: '流动', color: 'unit-coral', frameDir: '/pages/creative-studio/frames/unit-3' },
  { id: 4, name: '亮相', tempo: '2拍', mood: '定格', color: 'unit-yellow', frameDir: '/pages/creative-studio/frames/unit-4' },
  { id: 5, name: '拍手', tempo: '2拍', mood: '互动', color: 'unit-mint', frameDir: '/pages/creative-studio/frames/unit-5' },
  { id: 6, name: '俯仰', tempo: '4拍', mood: '层次', color: 'unit-purple', frameDir: '/pages/creative-studio/frames/unit-6' }
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
    return withDb(function () {
      return getResourceList('all', '').then(function (res) {
        var resource = (res.data || []).find(function (item) {
          return String(item.id) === String(resourceId);
        });
        return { success: !!resource, data: resource, message: resource ? '获取成功' : '资源不存在' };
      });
    }, function () {
      return localGetResourceDetail(resourceId);
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
