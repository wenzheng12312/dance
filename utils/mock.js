/**
 * 数据适配层 — 前端页面调用 mock.js 的接口不变
 * 课程相关方法（login / getCourseList / getCourseDetail / getResourceList）内部走 dbApi 真实数据库
 * AI 陪练、编创、社区等功能暂保留模拟数据
 */

var dbApi = null;
var REMOTE_TEST_VIDEO = 'https://media.w3.org/2010/05/sintel/trailer.mp4';

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
    id: 'video-unit-1',
    type: 'video',
    label: '分解视频',
    title: '苗族舞微律动 01：摆臂与沉肩',
    coverClass: 'cover-green',
    duration: '1分钟',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    description: '从沉肩、立背和小幅摆臂开始，建立苗族舞上肢松弛而有控制的动作质感。',
    tags: ['苗族舞', '摆臂', '沉肩', '基础']
  },
  {
    id: 'video-unit-2',
    type: 'video',
    label: '分解视频',
    title: '苗族舞微律动 02：踏步与重心',
    coverClass: 'cover-coral',
    duration: '1分钟',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    description: '通过轻踏步训练脚下节奏和重心切换，帮助学生做到脚步轻、身体稳。',
    tags: ['苗族舞', '踏步', '重心', '低年级']
  },
  {
    id: 'video-unit-3',
    type: 'video',
    label: '分解视频',
    title: '苗族舞微律动 03：转身与视线',
    coverClass: 'cover-blue',
    duration: '1分钟',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    description: '结合留头、甩头和脚下控制，训练学生转身时的方向感和稳定性。',
    tags: ['苗族舞', '转身', '视线', '高年级']
  },
  {
    id: 'video-unit-4',
    type: 'video',
    label: '分解视频',
    title: '苗族舞微律动 04：亮相定格',
    coverClass: 'cover-yellow',
    duration: '1分钟',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    description: '训练短句结束时的定格姿态，让学生在亮相中保持沉肩、立腰和眼神方向。',
    tags: ['苗族舞', '亮相', '定格', '表现力']
  },
  {
    id: 'video-unit-5',
    type: 'video',
    label: '分解视频',
    title: '苗族舞微律动 05：拍手互动',
    coverClass: 'cover-mint',
    duration: '1分钟',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    description: '加入拍手和对向交流，适合课堂小组练习和师生共创展示。',
    tags: ['苗族舞', '拍手', '互动', '小组']
  },
  {
    id: 'video-unit-6',
    type: 'video',
    label: '分解视频',
    title: '苗族舞微律动 06：俯仰层次',
    coverClass: 'cover-green',
    duration: '1分钟',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    description: '通过俯仰变化建立身体层次，帮助学生理解“沉、稳、松”的复合动律。',
    tags: ['苗族舞', '俯仰', '层次', '复合动律']
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

var teachingResources = [
  {
    id: 'doc-syllabus-longsheng-miao-2',
    type: 'courseware',
    label: '课程大纲',
    title: '龙胜小学苗族舞蹈技术技巧课程大纲 2.0',
    coverClass: 'cover-mint',
    duration: '1-6年级',
    description: '面向龙胜小学全学段的苗族舞蹈技术技巧课程大纲，包含学情分析、分段目标、学习难点和课程实施方向。',
    docFile: '/assets/docs/longsheng-miao-dance-syllabus-2.0.docx',
    sourceName: '《龙胜小学苗族舞蹈技术技巧》课程大纲2.0.docx',
    tags: ['课程大纲', '苗族舞蹈', '1-6年级', '龙胜小学'],
    sections: [
      {
        title: '总体学情',
        lines: [
          '学生长期生活在龙胜苗族聚居地域，对本土民俗节庆和苗族歌舞有天然亲近感。',
          '多数学生没有系统舞蹈训练基础，肢体控制、发力规范和动作协调性仍需从基础建立。'
        ]
      },
      {
        title: '低年级重点',
        lines: [
          '适合用趣味化、游戏化方式建立基础站姿、脚下发力和平衡控制。',
          '重点解决注意力短、体态松散、含胸耸肩和锁膝等问题。'
        ]
      },
      {
        title: '中高年级重点',
        lines: [
          '中年级强化动作指令理解、连续基础动作和松弛连贯的发力逻辑。',
          '高年级进一步训练动作衔接、空间路线、风格韵味和短句表达能力。'
        ]
      }
    ]
  },
  {
    id: 'doc-grade-1-2-lesson-2',
    type: 'lesson',
    label: '标准教案',
    title: '一、二年级第二节课：小摆手与颤膝配合',
    coverClass: 'cover-yellow',
    duration: '40分钟',
    description: '面向低年级，承接基础站姿、沉肩立背和轻踏步，训练“小摆手”与“颤膝”的初步配合。',
    docFile: '/assets/docs/grade-1-2-lesson-2-hand-shake-knee.docx',
    sourceName: '龙胜二小一、二年级第二节课教案：苗族舞蹈“小摆手”与“颤膝”配合.docx',
    tags: ['教案', '一二年级', '小摆手', '颤膝'],
    sections: [
      {
        title: '课堂目标',
        lines: [
          '将上肢“摆手”与下肢“颤膝”进行初步配合。',
          '建立苗族舞蹈“同边顺拐”的雏形意识，体验身体协调性。'
        ]
      },
      {
        title: '基本功训练',
        lines: [
          '复习“轻踏步”和“点步”，从原地练习过渡到音乐圆场。',
          '进行原地颤膝训练，双脚小八字步，双膝做小幅度、高频上下颤动。'
        ]
      },
      {
        title: '教学口令',
        lines: [
          '“小脚丫，轻轻踩，像踩在云朵里。”',
          '“一拍一步站站稳，苗家娃娃真神气。”'
        ]
      }
    ]
  },
  {
    id: 'doc-grade-3-4-lesson-1',
    type: 'lesson',
    label: '标准教案',
    title: '三、四年级第一节课：颤膝与松弛发力',
    coverClass: 'cover-blue',
    duration: '40分钟',
    description: '面向中年级，强化膝部颤动的连贯性和身体松弛感，建立“颤而不僵”的发力逻辑。',
    docFile: '/assets/docs/grade-3-4-lesson-1-miao-dance.docx',
    sourceName: '龙胜二小三、四年级苗族舞蹈课上学期第一节课教案.docx',
    tags: ['教案', '三四年级', '颤膝', '松弛'],
    sections: [
      {
        title: '课堂目标',
        lines: [
          '强化膝部颤动的连贯性与身体松弛感。',
          '建立苗族舞蹈“颤而不僵”的发力逻辑。'
        ]
      },
      {
        title: '训练重点',
        lines: [
          '保持立腰、沉肩、收腹，强化松弛与下沉的质感。',
          '提升膝关节弹性、踝关节灵活性和同边顺拐的手脚协调。'
        ]
      },
      {
        title: '热身口令',
        lines: [
          '“肩膀松松像挂水，膝盖软软像弹簧。”',
          '“腰背软软像柳枝，全身放松来跳舞。”'
        ]
      }
    ]
  },
  {
    id: 'doc-grade-3-4-lesson-2',
    type: 'lesson',
    label: '标准教案',
    title: '三、四年级第二节课：屈伸律动与上肢摆动',
    coverClass: 'cover-green',
    duration: '40分钟',
    description: '面向中年级，训练苗族舞蹈中“屈伸”带来的身体流动感，强化顺拐配合和动作连贯性。',
    docFile: '/assets/docs/grade-3-4-lesson-2-flexion-arm-swing.docx',
    sourceName: '龙胜二小三、四年级第二节课教案：苗族舞蹈“屈伸律动”与“上肢摆动”综合训练.docx',
    tags: ['教案', '三四年级', '屈伸律动', '上肢摆动'],
    sections: [
      {
        title: '课堂目标',
        lines: [
          '掌握苗族舞蹈中“屈伸”带来的身体重心移动与流动感。',
          '强化“左脚左手、右脚右手”的顺拐配合模式。'
        ]
      },
      {
        title: '课堂训练',
        lines: [
          '专项热身从脚踝、膝盖、腰腹、胸腰到颈部做波浪式逐节运动。',
          '核心律动采用双脚小八字，双膝有控制地屈和伸，带动重心转换。'
        ]
      },
      {
        title: '评价关注',
        lines: [
          '动作是否松弛、连贯、富有弹性。',
          '大幅度动作中是否保持含胸拔背、沉肩垂肘的苗族舞蹈体态。'
        ]
      }
    ]
  },
  {
    id: 'doc-grade-5-6-lesson-1',
    type: 'lesson',
    label: '标准教案',
    title: '五、六年级第一节课：复合动律与微短句',
    coverClass: 'cover-coral',
    duration: '40分钟',
    description: '面向高年级，训练“颤、稳、沉”的复合动律，在移动中保持稳定并完成短句组合。',
    docFile: '/assets/docs/grade-5-6-lesson-1-miao-dance.docx',
    sourceName: '龙胜二小五、六年级苗族舞蹈课上学期第一节课教案.docx',
    tags: ['教案', '五六年级', '复合动律', '微短句'],
    sections: [
      {
        title: '课堂目标',
        lines: [
          '掌握苗族舞蹈“颤、稳、沉”的复合动律。',
          '在移动中保持身体稳定与姿态优美，初步完成短句流畅组合。'
        ]
      },
      {
        title: '训练重点',
        lines: [
          '在动态移动和转身中保持立腰、沉肩、微颤体态。',
          '训练步伐与上肢配合、动作过渡和风格韵味表达。'
        ]
      },
      {
        title: '编创意识',
        lines: [
          '结合“微短句”理念，引导学生尝试简单动作重组。',
          '为后续节目编排和创意编创台功能做素材准备。'
        ]
      }
    ]
  },
  {
    id: 'doc-grade-5-6-lesson-2',
    type: 'lesson',
    label: '标准教案',
    title: '五、六年级第二节课：复合步伐与转身技巧',
    coverClass: 'cover-mint',
    duration: '40分钟',
    description: '面向高年级，学习带有转身的复合步伐，强化“颤、稳、沉”的风格统一。',
    docFile: '/assets/docs/grade-5-6-lesson-2-steps-turn.docx',
    sourceName: '龙胜二小五、六年级第二节课教案：苗族舞蹈“复合步伐”与“转身”技巧.docx',
    tags: ['教案', '五六年级', '复合步伐', '转身'],
    sections: [
      {
        title: '课堂目标',
        lines: [
          '学习苗族舞蹈中带有“转身”的复合步伐。',
          '提升技巧性与表现力，保持颤而不乱、稳而不僵、沉而不浮。'
        ]
      },
      {
        title: '专项训练',
        lines: [
          '半脚尖控制配合双手侧平举，建立旋转前的平衡能力。',
          '留头甩头练习配合半脚尖，训练转身时的视线和方向控制。'
        ]
      },
      {
        title: '教学口令',
        lines: [
          '“脚底像钉子，钉在地上不晃动。”',
          '“头要最后留，眼要盯一点。”'
        ]
      }
    ]
  }
];

function getLocalResources() {
  return localCourses.concat(localResourceExtras).concat(teachingResources);
}

function localLogin(account, password) {
  return delay(null, 300).then(function () {
    var user = localUsers.find(function (item) {
      return item.account === account && item.password === password;
    });
    if (user) {
      return { success: true, data: user, message: '登录成功' };
    }
    return { success: false, message: '账号或密码错误' };
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
    var resources = getLocalResources();
    var resource = resources.find(function (item) {
      return String(item.id) === String(resourceId);
    });
    return { success: !!resource, data: resource, message: resource ? '获取成功' : '资源不存在' };
  });
}

function filterResources(list, type, keyword) {
  var data = list || [];
  data = data.map(function (item) {
    if (item.type === 'video' && !item.videoUrl) {
      return Object.assign({}, item, { videoUrl: REMOTE_TEST_VIDEO });
    }
    return item;
  });
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
    return { success: true, data: filterResources(getLocalResources(), type, keyword) };
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

function login(account, password) {
  return withDb(function () {
    return dbApi.login(account, password);
  }, function () {
    return localLogin(account, password);
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
      return { success: true, data: filterResources(res.data.concat(localResourceExtras).concat(teachingResources), type, keyword) };
    });
  }, function () {
    return localGetResourceList(type, keyword);
  });
}

// ========== 以下为模拟数据（AI 陪练 / 编创 / 社区） ==========

var coachActions = [
  {
    id: 1,
    name: '摆臂与沉肩',
    level: '基础',
    focus: '肩颈放松、手臂轨迹、上身稳定',
    reference: '上传视频后重点观察是否耸肩、摆臂是否过大、手腕是否僵硬。',
    advice: [
      '先确认肩膀是否自然下沉，避免为了摆臂把肩膀带起来。',
      '摆臂幅度控制在身体两侧附近，不要甩到身体后方太远。',
      '练习时可以先放慢音乐，用 4 拍完成一次摆臂，再逐步回到原速。'
    ],
    summary: '适合低年级和零基础学生建立上肢松弛感。'
  },
  {
    id: 2,
    name: '踏步与颤膝',
    level: '基础',
    focus: '膝盖弹性、脚下节奏、重心稳定',
    reference: '上传视频后重点观察膝盖是否锁死、踏步是否过重、重心是否左右晃动。',
    advice: [
      '踏步时脚掌轻落地，声音不要过重。',
      '颤膝要小幅高频，保持膝盖有弹性但不要上下跳。',
      '身体重心放在脚掌中部，避免左右摆动过大。'
    ],
    summary: '适合建立苗族舞“颤而不僵”的脚下基础。'
  },
  {
    id: 3,
    name: '转身与亮相',
    level: '进阶',
    focus: '留头甩头、转身稳定、结束定格',
    reference: '上传视频后重点观察转身方向、视线控制和亮相姿态是否稳定。',
    advice: [
      '转身前先找到正前方的视线点，头部最后离开、最快回到目标点。',
      '脚下转动时不要抢拍，先稳住重心再完成上身动作。',
      '亮相时保持 2 拍定格，让观众看清楚手位和眼神方向。'
    ],
    summary: '适合高年级学生进行短句表现力训练。'
  }
];

function getCoachSuggestions(actionId, videoInfo) {
  return delay(null, 800).then(function () {
    var action = coachActions.find(function (item) {
      return String(item.id) === String(actionId);
    }) || coachActions[0];
    var duration = videoInfo && videoInfo.duration ? Math.round(videoInfo.duration) : 0;
    var sizeMb = videoInfo && videoInfo.size ? Math.max(1, Math.round(videoInfo.size / 1024 / 1024)) : 0;
    var sizeText = sizeMb ? sizeMb + 'MB' : '本地视频';
    var source = videoInfo && videoInfo.source ? videoInfo.source : '';
    var videoBasedAdvice = [];

    // 这里没有真实姿态识别模型，建议基于上传视频的时长、大小、来源和所选动作生成。
    if (duration > 0 && duration < 10) {
      videoBasedAdvice.push('这段视频时长偏短，建议录制 15-30 秒，包含准备、动作过程和结束定格，便于观察完整问题。');
    } else if (duration > 45) {
      videoBasedAdvice.push('这段视频时长较长，建议截取最能代表问题的 15-30 秒片段，方便教师快速定位动作细节。');
    } else if (duration > 0) {
      videoBasedAdvice.push('这段视频时长适合做动作诊断，建议保持同样机位连续录制两次，比较稳定性变化。');
    } else {
      videoBasedAdvice.push('当前没有读取到明确时长，建议上传 15-30 秒、全身入镜的视频。');
    }

    if (sizeMb >= 80) {
      videoBasedAdvice.push('视频文件较大，建议压缩后上传，避免网络较弱时分析等待过久。');
    } else if (sizeMb > 0) {
      videoBasedAdvice.push('视频文件大小适中，可以继续保持当前清晰度，注意画面中脚步和手位都要完整入镜。');
    }

    if (source === 'camera') {
      videoBasedAdvice.push('手机录制时建议把手机固定在正前方，不要边走边拍，减少画面晃动。');
    } else if (source === 'album') {
      videoBasedAdvice.push('从文件上传的视频建议优先选择正面全身机位，避免只截到上半身。');
    }

    return {
      success: true,
      data: {
        actionName: action.name,
        videoName: videoInfo && videoInfo.name ? videoInfo.name : '已上传视频',
        videoMeta: duration ? duration + '秒 · ' + sizeText : sizeText,
        summary: action.summary,
        advice: videoBasedAdvice.concat(action.advice),
        focus: action.focus,
        nextPractice: [
          '先单独练习脚下节奏，再加入上肢动作。',
          '每次录制 15-30 秒即可，便于教师快速查看问题。',
          '同一动作建议连续上传两次，对比前后稳定性变化。'
        ]
      }
    };
  });
}

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
    return getCoachSuggestions(actionId, {});
  },

  getCoachSuggestions: getCoachSuggestions,

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
