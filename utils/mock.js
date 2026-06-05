/**
 * Mock数据模块 - 模拟后端返回的用户、资源、AI陪练、编创和社区数据
 * 后续替换为真实后端接口时优先改造此文件，页面调用方式尽量保持稳定。
 */

// 模拟用户数据
const mockUsers = [
  { id: 1, account: '2024001', password: '123456', name: '李同学', role: 'student', roleName: '学生', avatar: '' },
  { id: 2, account: '2024002', password: '123456', name: '王同学', role: 'student', roleName: '学生', avatar: '' },
  { id: 101, account: 'T1001', password: '123456', name: '赵老师', role: 'teacher', roleName: '教师', avatar: '' },
  { id: 102, account: 'T1002', password: '123456', name: '陈老师', role: 'teacher', roleName: '教师', avatar: '' }
];

// 模拟舞蹈课程数据
const mockCourses = [
  {
    id: 101,
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
    id: 102,
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

const mockResources = [
  ...mockCourses,
  {
    id: 201,
    type: 'lesson',
    label: '标准教案',
    title: '民族舞课堂导入教案',
    coverClass: 'cover-blue',
    duration: '15页',
    description: '包含课堂目标、热身流程、动作拆解和课后评价表',
    tags: ['教案', '民族舞', '课堂导入']
  },
  {
    id: 202,
    type: 'courseware',
    label: '课件模板',
    title: '乡土舞蹈文化课件模板',
    coverClass: 'cover-yellow',
    duration: '24页',
    description: '适合教师快速生成地域文化导赏、动作背景和课堂任务',
    tags: ['课件', '乡土文化', '模板']
  },
  {
    id: 203,
    type: 'lesson',
    label: '标准教案',
    title: '微律动单元共创课',
    coverClass: 'cover-mint',
    duration: '35分钟',
    description: '面向师生共创的小组编创流程，包含观察、组合、展示和评价',
    tags: ['编创', '小组课', '评价']
  }
];

const coachActions = [
  {
    id: 1,
    name: '云手转身',
    level: '基础',
    focus: '手眼协调',
    reference: '掌心带动视线，重心从右脚平稳过渡到左脚',
    score: 86,
    advice: ['右肩略高，注意沉肩', '转身时核心收紧，脚步不要抢拍'],
    comparison: '整体节奏稳定，手臂轨迹比参考动作偏外约 12%。'
  },
  {
    id: 2,
    name: '提沉组合',
    level: '进阶',
    focus: '呼吸与身韵',
    reference: '提时胸腔向上延展，沉时松胯落气',
    score: 91,
    advice: ['提的幅度较好', '沉的结束点可以再慢半拍'],
    comparison: '动作幅度接近参考，呼吸节奏匹配度较高。'
  },
  {
    id: 3,
    name: '爵士律动',
    level: '基础',
    focus: '节奏卡点',
    reference: '膝盖保持弹性，胸肩分离，重拍落在第二拍',
    score: 78,
    advice: ['第二拍重心落点偏早', '肩部律动可以更清晰'],
    comparison: '下肢节奏比参考动作快约 0.3 秒，需要放慢进入重拍。'
  }
];

const creativeUnits = [
  { id: 1, name: '摆臂', tempo: '2拍', mood: '舒展', color: 'unit-green' },
  { id: 2, name: '踏步', tempo: '4拍', mood: '稳定', color: 'unit-blue' },
  { id: 3, name: '转身', tempo: '4拍', mood: '流动', color: 'unit-coral' },
  { id: 4, name: '亮相', tempo: '2拍', mood: '定格', color: 'unit-yellow' },
  { id: 5, name: '拍手', tempo: '2拍', mood: '互动', color: 'unit-mint' },
  { id: 6, name: '俯仰', tempo: '4拍', mood: '层次', color: 'unit-purple' }
];

const communityPosts = [
  {
    id: 1,
    type: 'share',
    title: '非专业教师如何快速组织一节民族舞课',
    author: '赵老师',
    summary: '从动作素材、节奏口令、队形变化三个角度拆解课堂流程。',
    comments: 18
  },
  {
    id: 2,
    type: 'remote',
    title: '远程指导：学生动作重心不稳怎么纠正',
    author: '陈老师',
    summary: '通过分拍练习和镜面对比，让学生先稳定脚下再加入上肢动作。',
    comments: 9
  },
  {
    id: 3,
    type: 'research',
    title: '乡土舞蹈进入常态化教研的记录表',
    author: '教研组',
    summary: '提供一份可复用的听评课记录模板，方便沉淀课堂改进点。',
    comments: 24
  }
];

function delay(data, time) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), time);
  });
}

module.exports = {
  /**
   * 模拟用户登录接口
   * @param {string} account 学号或教师工号
   * @param {string} password 密码
   * @param {string} role 登录角色
   * @returns {Promise<object>} 登录结果
   */
  login: function(account, password, role) {
    return delay(null, 800).then(() => {
      const user = mockUsers.find(item => {
        return item.account === account && item.password === password && item.role === role;
      });
      if (user) {
        return { success: true, data: user, message: '登录成功' };
      }
      return { success: false, message: role === 'teacher' ? '工号或密码错误' : '学号或密码错误' };
    });
  },

  /**
   * 模拟获取课程列表接口
   * @returns {Promise<object>} 课程列表
   */
  getCourseList: function() {
    return delay({ success: true, data: mockCourses }, 500);
  },

  /**
   * 模拟根据ID获取课程详情接口
   * @param {number|string} courseId 课程ID
   * @returns {Promise<object>} 课程详情
   */
  getCourseDetail: function(courseId) {
    return delay(null, 300).then(() => {
      const course = mockCourses.find(c => String(c.id) === String(courseId));
      return { success: !!course, data: course, message: course ? '获取成功' : '课程不存在' };
    });
  },

  /**
   * 模拟根据ID获取资源详情接口
   * @param {number|string} resourceId 资源ID
   * @returns {Promise<object>} 资源详情
   */
  getResourceDetail: function(resourceId) {
    return delay(null, 300).then(() => {
      const resource = mockResources.find(item => String(item.id) === String(resourceId));
      return { success: !!resource, data: resource, message: resource ? '获取成功' : '资源不存在' };
    });
  },

  /**
   * 模拟获取备课资源接口
   * @param {string} type 资源类型
   * @param {string} keyword 搜索关键词
   * @returns {Promise<object>} 资源列表
   */
  getResourceList: function(type, keyword) {
    return delay(null, 400).then(() => {
      const query = (keyword || '').trim().toLowerCase();
      const data = mockResources.filter(item => {
        const matchType = !type || type === 'all' || item.type === type;
        const text = `${item.title} ${item.description} ${(item.tags || []).join(' ')}`.toLowerCase();
        const matchKeyword = !query || text.indexOf(query) > -1;
        return matchType && matchKeyword;
      });
      return { success: true, data };
    });
  },

  /**
   * 模拟获取AI陪练动作接口
   * @returns {Promise<object>} 动作列表
   */
  getCoachActions: function() {
    return delay({ success: true, data: coachActions }, 300);
  },

  /**
   * 模拟获取AI陪练检测结果接口
   * @param {number|string} actionId 动作ID
   * @returns {Promise<object>} 检测结果
   */
  getCoachResult: function(actionId) {
    return delay(null, 700).then(() => {
      const action = coachActions.find(item => String(item.id) === String(actionId)) || coachActions[0];
      return { success: true, data: action };
    });
  },

  /**
   * 模拟获取编创单元接口
   * @returns {Promise<object>} 编创单元列表
   */
  getCreativeUnits: function() {
    return delay({ success: true, data: creativeUnits }, 300);
  },

  /**
   * 模拟获取教师社区帖子接口
   * @param {string} type 帖子类型
   * @returns {Promise<object>} 帖子列表
   */
  getCommunityPosts: function(type) {
    return delay(null, 300).then(() => {
      const localPosts = wx.getStorageSync('dance_local_posts') || [];
      const allPosts = localPosts.concat(communityPosts);
      const data = !type || type === 'all'
        ? allPosts
        : allPosts.filter(item => item.type === type);
      return { success: true, data };
    });
  },

  /**
   * 用本地缓存模拟资源调用记录
   * @param {object} resource 资源信息
   * @returns {Promise<object>} 保存结果
   */
  useResource: function(resource) {
    return delay(null, 200).then(() => {
      const records = wx.getStorageSync('dance_used_resources') || [];
      const nextRecords = [{
        id: resource.id,
        title: resource.title,
        label: resource.label,
        usedAt: Date.now()
      }].concat(records).slice(0, 20);
      wx.setStorageSync('dance_used_resources', nextRecords);
      return { success: true, data: nextRecords };
    });
  },

  /**
   * 用本地缓存模拟保存编创作品
   * @param {object} piece 作品信息
   * @returns {Promise<object>} 保存结果
   */
  saveCreativePiece: function(piece) {
    return delay(null, 250).then(() => {
      const pieces = wx.getStorageSync('dance_creative_pieces') || [];
      const savedPiece = Object.assign({}, piece, {
        id: `piece-${Date.now()}`,
        savedAt: Date.now()
      });
      wx.setStorageSync('dance_creative_pieces', [savedPiece].concat(pieces));
      return { success: true, data: savedPiece };
    });
  },

  /**
   * 用本地缓存模拟发布社区动态
   * @param {object} post 帖子信息
   * @returns {Promise<object>} 发布结果
   */
  publishCommunityPost: function(post) {
    return delay(null, 250).then(() => {
      const posts = wx.getStorageSync('dance_local_posts') || [];
      const savedPost = Object.assign({}, post, {
        id: `local-${Date.now()}`,
        comments: 0
      });
      wx.setStorageSync('dance_local_posts', [savedPost].concat(posts));
      return { success: true, data: savedPost };
    });
  }
};
