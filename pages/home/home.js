const auth = require('../../utils/auth.js');

const teacherFeatures = [
  {
    id: 'resource',
    index: '01',
    icon: '备',
    title: '备课资源库',
    desc: '标准教案、分解视频、课件模板',
    route: '/pages/course-list/course-list',
    tone: 'feature-green'
  },
  {
    id: 'coach',
    index: '02',
    icon: 'AI',
    title: 'AI动作陪练',
    desc: '模拟姿态评分、纠错建议、动作对比',
    route: '/pages/ai-coach/ai-coach',
    tone: 'feature-blue'
  },
  {
    id: 'studio',
    index: '03',
    icon: '创',
    title: '创意编创台',
    desc: '组织微律动素材，生成课堂共创片段',
    route: '/pages/creative-studio/creative-studio',
    tone: 'feature-coral'
  },
  {
    id: 'community',
    index: '04',
    icon: '研',
    title: '教师社区',
    desc: '经验分享、远程指导、常态化教研',
    route: '/pages/community/community',
    tone: 'feature-yellow'
  },
  {
    id: 'manage',
    index: '05',
    icon: '管',
    title: '课程管理',
    desc: '新增、编辑、删除舞蹈课程',
    route: '/pages/course-manage/course-manage',
    tone: 'feature-green'
  },
  {
    id: 'profile',
    index: '06',
    icon: '我',
    title: '个人中心',
    desc: '查看信息、更换头像',
    route: '/pages/profile/profile',
    tone: 'feature-blue'
  }
];

const studentFeatures = [
  {
    id: 'resource',
    index: '01',
    icon: '学',
    title: '课程学习',
    desc: '观看分解视频，查看课堂素材',
    route: '/pages/course-list/course-list',
    tone: 'feature-green'
  },
  {
    id: 'coach',
    index: '02',
    icon: '练',
    title: 'AI动作陪练',
    desc: '模拟跟练评分，获得纠错建议',
    route: '/pages/ai-coach/ai-coach',
    tone: 'feature-blue'
  },
  {
    id: 'studio',
    index: '03',
    icon: '创',
    title: '创意编创台',
    desc: '自由组合微律动单元，保存作品',
    route: '/pages/creative-studio/creative-studio',
    tone: 'feature-coral'
  },
  {
    id: 'community',
    index: '04',
    icon: '看',
    title: '教师社区',
    desc: '可浏览教研经验，学生账号暂不能发言',
    route: '/pages/community/community',
    tone: 'feature-yellow'
  },
  {
    id: 'profile',
    index: '05',
    icon: '我',
    title: '个人中心',
    desc: '查看个人信息、更换头像',
    route: '/pages/profile/profile',
    tone: 'feature-green'
  }
];

Page({
  data: {
    userName: '',
    role: 'student',
    roleName: '学生',
    heroMain: '',
    heroSub: '',
    features: []
  },

  onShow: function() {
    const userInfo = auth.getUserInfo() || {};
    const role = userInfo.role || 'student';
    const isTeacher = role === 'teacher';

    this.setData({
      userName: userInfo.name || (isTeacher ? '老师' : '同学'),
      role,
      roleName: userInfo.roleName || (isTeacher ? '教师' : '学生'),
      heroMain: isTeacher ? '备课、指导、教研，一站式组织课堂' : '学习、跟练、创作，完成自己的舞蹈片段',
      heroSub: isTeacher ? '教师数字助教' : '学生创作课堂',
      features: isTeacher ? teacherFeatures : studentFeatures
    });
  },

  goFeature: function(e) {
    const featureId = e.currentTarget.dataset.id;
    const feature = this.data.features.find(item => item.id === featureId);

    if (!feature) {
      return;
    }

    wx.navigateTo({ url: feature.route });
  },

  handleLogout: function() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          auth.logout();
          wx.reLaunch({ url: '/pages/login/login' });
        }
      }
    });
  }
});
