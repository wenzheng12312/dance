# 舞蹈课堂微信小程序

这是一个原生微信小程序演示项目，定位为师生共用的舞蹈课堂“数字助教”。登录使用同一个入口，系统会根据账号自动识别教师或学生角色。

当前业务数据主要来自本地 Mock，不接真实后端、不接真实 AI 姿态识别。资源调用记录、编创作品和本地发布的社区内容会暂存在微信本地缓存中，用于演示“可保存”的交互效果。

## 项目类型

- 小程序类型：微信小程序
- 开发方式：原生微信小程序
- 主要技术：WXML、WXSS、JavaScript、JSON
- 构建工具：微信开发者工具
- 项目 AppID：`wx4ebf5643752b6739`

## 启动方式

1. 打开微信开发者工具。
2. 选择“导入项目”。
3. 项目目录选择：

```text
/Users/dengken/Desktop/dance-main/dance
```

4. 使用项目已有 AppID，或者选择测试号运行。
5. 编译后进入登录页。

## 测试账号和角色

学生账号：

```text
学号：2024001
密码：123456
```

```text
学号：2024002
密码：123456
```

教师账号：

```text
工号：T1001
密码：123456
```

```text
工号：T1002
密码：123456
```

登录页不需要手动选择角色，输入学生学号或教师工号后会自动识别身份。

## 目录结构

```text
dance/
├── app.js
├── app.json
├── app.wxss
├── pages/
│   ├── login/
│   ├── home/
│   ├── course-list/
│   ├── resource-detail/
│   ├── video-player/
│   ├── ai-coach/
│   ├── creative-studio/
│   └── community/
└── utils/
    ├── auth.js
    ├── mock.js
    └── util.js
```

## 页面功能

### 登录页

位置：`pages/login/`

功能：

- 输入学号和密码
- 输入学生学号或教师工号
- 调用 `utils/mock.js` 中的模拟登录接口
- 登录成功后自动识别学生或教师身份
- 登录成功后保存本地登录状态
- 登录成功后跳转到 `pages/home/home`

### 功能首页

位置：`pages/home/`

功能：

- 展示四大功能入口
- 教师端：首页文案偏向备课、指导、教研
- 学生端：首页文案偏向学习、跟练、创作
- 教师社区学生可以浏览，只有教师账号可以发布
- 资源库：进入资源筛选、资源详情和课程播放
- AI 动作陪练：进入模拟姿态评分
- 创意编创台：进入微律动组合
- 教师社区：进入教研帖子列表；教师可本地发布，学生仅可浏览
- 支持退出登录

### 备课资源库

位置：`pages/course-list/`

功能：

- 展示标准教案、分解视频、课件模板
- 支持分类筛选：全部、教案、分解视频、课件模板
- 支持关键词搜索
- 支持一键调用资源，调用记录暂存在微信本地缓存
- 视频类资源可以进入视频播放页
- 教案和课件类资源可以进入资源详情页
- 支持下拉刷新

### 资源详情页

位置：`pages/resource-detail/`

功能：

- 展示教案、课件等非视频资源详情
- 展示资源标签、使用说明和演示预览
- 支持加入备课记录或学习记录
- 记录保存在本机微信缓存中

### 视频播放页

位置：`pages/video-player/`

功能：

- 根据资源 id 加载课程详情
- 使用微信原生 `<video>` 组件播放视频
- 展示课程标题、时长和简介
- 已处理 id 字符串和数字类型不一致导致查不到课程的问题

### AI 动作陪练

位置：`pages/ai-coach/`

功能：

- 展示动作列表
- 选择参考动作
- 模拟开始检测
- 返回模拟实时评分
- 展示纠错建议和动作对比结果

说明：当前不调用摄像头，不做真实姿态识别。

### 创意编创台

位置：`pages/creative-studio/`

功能：

- 展示多个微律动单元
- 点击单元加入作品序列
- 自动生成作品名称
- 点击“生成片段”后按选择顺序连续播放动作帧预览
- 帧素材来自 `pages/creative-studio/frames/` 中从 MP4 抽取的动作图片序列
- 支持清空作品
- 支持保存作品，作品暂存在微信本地缓存

### 教师社区

位置：`pages/community/`

功能：

- 展示经验分享、远程指导、教研记录
- 支持分类切换
- 学生账号可以浏览帖子
- 教师账号可以发布教研动态，发布内容暂存在微信本地缓存

## 数据来源

所有演示数据集中在：

```text
utils/mock.js
```

当前 Mock 方法：

- `login(account, password)`
- `getCourseList()`
- `getCourseDetail(courseId)`
- `getResourceList(type, keyword)`
- `getResourceDetail(resourceId)`
- `getCoachActions()`
- `getCoachResult(actionId)`
- `getCreativeUnits()`
- `getCommunityPosts(type)`
- `useResource(resource)`
- `saveCreativePiece(piece)`
- `publishCommunityPost(post)`

## 登录状态

登录状态由 `utils/auth.js` 管理，使用微信本地缓存保存：

```text
dance_student_token
dance_student_info
```

演示功能还会使用这些本地缓存 key：

```text
dance_used_resources
dance_creative_pieces
dance_local_posts
```

## 为什么有些功能看起来不像真实系统

当前项目没有数据库，也没有后端接口，所以不能做到多设备同步、真实文件上传、真实社区发布、真实 AI 姿态识别。现在的处理方式是：

- 登录账号写在 `utils/mock.js`
- 资源、动作、编创素材、社区基础帖子写在 `utils/mock.js`
- 用户产生的数据暂存在本机微信缓存
- AI 陪练结果是模拟评分，不会调用摄像头

如果要变成正式可用版本，需要接入后端数据库、文件存储、用户权限系统和 AI 姿态识别服务。

## 后续接真实后端

建议优先替换 `utils/mock.js` 中的方法实现，页面层尽量不改。

需要后端接口：

- 统一登录接口，后端根据账号识别学生或教师
- 用户角色和权限接口
- 资源列表接口
- 资源详情和调用记录接口
- 课程详情接口
- AI 陪练动作和检测结果接口
- 编创单元和作品保存接口
- 社区帖子列表和发布接口

上线前还需要配置微信小程序合法请求域名、视频资源域名和资源存储策略。
