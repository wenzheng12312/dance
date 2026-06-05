# 舞蹈课程学习小程序

## 项目简介

这是一个基于微信小程序框架开发的舞蹈课程学习应用，旨在为学生提供便捷的舞蹈课程学习体验。用户可以通过学号登录，浏览课程列表，并观看舞蹈教学视频。

## 项目结构

```
dance/
├── pages/
│   ├── course-list/     # 课程列表页
│   ├── login/           # 登录页面
│   └── video-player/    # 视频播放页
├── utils/
│   ├── auth.js          # 登录状态管理工具
│   ├── mock.js          # 模拟接口数据
│   └── util.js          # 通用工具函数
├── app.js               # 小程序入口文件
├── app.json             # 小程序配置文件
├── app.wxss             # 全局样式文件
└── project.config.json  # 项目配置文件
```

## 核心功能

1. **用户登录**：支持学号和密码登录，登录状态持久化
2. **课程列表**：展示所有可学习的舞蹈课程
3. **视频播放**：支持舞蹈教学视频的在线播放
4. **退出登录**：安全退出当前账号

## 接口说明

目前项目使用 `mock.js` 模拟后端接口，后续可无缝替换为真实后端接口。

### 1. 登录接口

**调用方式**：
```javascript
const mock = require('../../utils/mock.js');
const res = await mock.login(studentId, password);
```

**参数**：
- `studentId`：学号（字符串）
- `password`：密码（字符串）

**返回值**：
```javascript
{
  success: true,           // 是否登录成功
  data: {                  // 用户信息
    id: 1,                 // 用户ID
    studentId: '2024001',  // 学号
    password: '123456',    // 密码
    name: '李同学',        // 姓名
    avatar: 'https://example.com/avatar1.jpg' // 头像
  },
  message: '登录成功'       // 提示信息
}
```

### 2. 获取课程列表接口

**调用方式**：
```javascript
const mock = require('../../utils/mock.js');
const res = await mock.getCourseList();
```

**返回值**：
```javascript
{
  success: true,           // 是否获取成功
  data: [                  // 课程列表
    {
      id: 101,             // 课程ID
      title: '古典舞基础入门', // 课程标题
      cover: 'https://example.com/dance1.jpg', // 课程封面
      duration: '45分钟',   // 课程时长
      videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4', // 视频链接
      description: '从基本功开始，学习古典舞的神韵与姿态' // 课程描述
    },
    // 更多课程...
  ]
}
```

### 3. 获取课程详情接口

**调用方式**：
```javascript
const mock = require('../../utils/mock.js');
const res = await mock.getCourseDetail(courseId);
```

**参数**：
- `courseId`：课程ID（数字）

**返回值**：
```javascript
{
  success: true,           // 是否获取成功
  data: {                  // 课程详情
    id: 101,               // 课程ID
    title: '古典舞基础入门', // 课程标题
    cover: 'https://example.com/dance1.jpg', // 课程封面
    duration: '45分钟',     // 课程时长
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4', // 视频链接
    description: '从基本功开始，学习古典舞的神韵与姿态' // 课程描述
  }
}
```

## 如何使用

### 1. 开发环境准备

1. 安装微信开发者工具
2. 克隆本项目到本地
3. 在微信开发者工具中导入项目

### 2. 登录测试

使用以下测试账号登录：
- 学号：2024001，密码：123456
- 学号：2024002，密码：123456

### 3. 功能使用

1. **登录**：在登录页输入学号和密码，点击登录按钮
2. **浏览课程**：登录后进入课程列表页，查看所有课程
3. **观看视频**：点击课程卡片进入视频播放页，观看舞蹈教学视频
4. **退出登录**：在课程列表页点击退出登录按钮

## 如何拓展

### 1. 替换为真实后端接口

1. 修改 `utils/mock.js` 文件，将模拟接口替换为真实后端接口调用
2. 保持接口返回格式与现有格式一致，确保前端代码无需修改

### 2. 添加新功能

1. **添加新页面**：在 `pages` 目录下创建新的页面文件夹，包含 `.js`、`.json`、`.wxml`、`.wxss` 文件
2. **注册页面**：在 `app.json` 文件的 `pages` 数组中添加新页面路径
3. **添加新接口**：在 `utils/mock.js` 中添加新的模拟接口，或在替换为真实后端后添加对应接口调用

### 3. 样式定制

1. 修改 `app.wxss` 文件定制全局样式
2. 修改各页面的 `.wxss` 文件定制页面样式

### 4. 性能优化

1. 图片资源使用适当尺寸，避免过大图片影响加载速度
2. 接口请求添加错误处理和加载状态
3. 使用小程序的缓存机制减少重复请求

## 注意事项

1. 本项目使用的是模拟数据，实际部署时需要替换为真实后端接口
2. 视频播放功能需要确保网络连接稳定
3. 登录状态使用本地存储，实际项目中建议使用更安全的登录状态管理方式
4. 开发过程中需注意微信小程序的代码规范和限制

## 技术栈

- 微信小程序框架
- JavaScript
- 微信小程序API

## 许可证

MIT
