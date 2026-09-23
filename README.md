# 舞蹈课堂微信小程序

这是一个原生微信小程序演示项目，定位为师生共用的舞蹈课堂“数字助教”。登录使用同一个入口，系统会根据账号自动识别教师或学生角色。

当前课程、资源、编创和社区基础数据主要来自本地 Mock，尚未接业务数据库。资源调用记录、编创作品和本地发布的社区内容会暂存在微信本地缓存中。AI 动作陪练已经接入微信云存储、云函数和 Qwen3-VL-Flash，用于生成视频动作文字建议，但不属于人体关键点级别的实时姿态识别。

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
├── assets/
│   ├── docs/
│   └── videos/
├── cloudfunctions/
│   ├── courseAdmin/
│   └── getVideoUrl/
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
    ├── video.js
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
- AI 动作陪练：录制或上传练习视频，生成动作建议
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
- 已加入龙胜小学/龙胜二小苗族舞蹈课程大纲和分年级教案资源
- 支持下拉刷新

### 资源详情页

位置：`pages/resource-detail/`

功能：

- 展示教案、课件等非视频资源详情
- 展示资源标签、使用说明和演示预览
- 展示教案资源的结构化章节，包括课堂目标、训练重点、教学口令和评价关注点
- 支持加入备课记录或学习记录
- 记录保存在本机微信缓存中

## 已加入的教学资料

原始 Word 文件已复制到：

```text
assets/docs/
```

当前已加入资源库的资料：

- `longsheng-miao-dance-syllabus-2.0.docx`：龙胜小学苗族舞蹈技术技巧课程大纲 2.0
- `grade-1-2-lesson-2-hand-shake-knee.docx`：一、二年级第二节课，小摆手与颤膝配合
- `grade-3-4-lesson-1-miao-dance.docx`：三、四年级第一节课，颤膝与松弛发力
- `grade-3-4-lesson-2-flexion-arm-swing.docx`：三、四年级第二节课，屈伸律动与上肢摆动
- `grade-5-6-lesson-1-miao-dance.docx`：五、六年级第一节课，复合动律与微短句
- `grade-5-6-lesson-2-steps-turn.docx`：五、六年级第二节课，复合步伐与转身技巧

小程序页面不会直接打开这些 Word 文件，而是把核心内容整理进 `utils/mock.js` 的本地资源数据，在资源详情页中直接展示。正式版建议把 Word/PDF 上传到云存储，再由数据库保存文件地址、年级、课次、标签和权限信息。

### 视频播放页

位置：`pages/video-player/`

功能：

- 根据资源 id 加载课程详情
- 使用微信原生 `<video>` 组件播放视频
- 本地 Mock 课程统一使用远程测试视频：`https://media.w3.org/2010/05/sintel/trailer.mp4`
- 如果数据库返回 `cloud://` 云存储 fileID，页面会通过 `utils/video.js` 转换成临时 HTTPS 地址再播放
- 展示课程标题、时长和简介
- 已处理 id 字符串和数字类型不一致导致查不到课程的问题

### AI 动作陪练

位置：`pages/ai-coach/`

功能：

- 展示动作列表
- 选择参考动作
- 支持手机录制视频
- 支持从相册/文件选择视频
- 视频上传到微信云存储后，点击按钮生成动作建议
- 不再显示分数，只展示观察重点、主要建议和下一步练习

说明：AI 页面会把 `cloud://` fileID 经 `getVideoUrl` 转换为临时 HTTPS 地址，再通过 `wx.request` 调用阿里云 FC 的 `/api/dance/analyze`，由 FC 调 Qwen3-VL-Flash 返回文字建议。建议视频为 15～30 秒。当前不做分数评价，也不做人体骨骼点追踪、关节角度测量或实时纠错。

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

- `login(account, password, role)`
- `getCourseList()`
- `getCourseDetail(courseId)`
- `getResourceList(type, keyword)`
- `getResourceDetail(resourceId)`
- `getCoachActions()`
- `getCoachResult(actionId)`
- `getCoachSuggestions(actionId, videoInfo)`（旧版模拟建议兼容方法，当前 AI 页面不再调用）
- `getCreativeUnits()`
- `getCommunityPosts(type)`
- `useResource(resource)`
- `saveCreativePiece(piece)`
- `publishCommunityPost(post)`

视频播放相关工具：

- `utils/video.js`
- `convertVideoUrl(videoUrl)`：`cloud://` 转临时 HTTPS；`http/https` 直接返回
- `cloudfunctions/getVideoUrl`：服务端管理员权限转换云存储视频 fileID，解决仅创建者可读时客户端 `STORAGE_EXCEED_AUTHORITY` 问题
- `cloudfunctions/analyzeDance`：原 CloudBase 分析实现，暂时保留，AI 页面不再调用
- `serverless/fc-analyze-dance`：新的阿里云 FC 分析服务，调用 `qwen3-vl-flash`
- `config/api.js`：配置公开的 FC HTTPS Endpoint，不放 API Key
- `utils/danceAnalyzeApi.js`：100 秒超时的 `wx.request` 封装

新增或修改云函数后，需要在微信开发者工具中右键云函数目录并上传部署。

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

当前项目没有业务数据库和完整业务后端，所以课程、作品和社区内容不能做到多设备同步。微信云存储和云函数已经用于视频上传与 AI 视频分析。现在的处理方式是：

- 登录账号写在 `utils/mock.js`
- 资源、动作、编创素材、社区基础帖子写在 `utils/mock.js`
- 用户产生的数据暂存在本机微信缓存
- AI 陪练会把练习视频上传到微信云存储，通过 `getVideoUrl` 获取临时 HTTPS 地址，再调用百炼 Qwen3-VL-Flash 生成文字动作建议

AI 陪练当前属于多模态视频理解和文字建议，不是人体关键点级别的姿态识别或运动学评分。如果后续需要角度测量、骨骼点追踪或实时纠错，还需要单独接入姿态识别能力。

## AI 动作陪练部署

部署步骤和完整验收见 [FC 部署文档](serverless/fc-analyze-dance/README.md)。

1. 在阿里云 FC 3.0 创建 Node.js 20 函数，上传 `serverless/fc-analyze-dance/` 中的 `index.js`、`package.json`，入口设为 `index.handler`，执行超时设为 120 秒。
2. 在 **FC 函数环境变量** 中配置 `DASHSCOPE_API_KEY`，不写入前端或 Git。
3. 创建同步 POST HTTP 触发器，获得 HTTPS Endpoint。
4. 在 `config/api.js` 的 `DANCE_ANALYZE_API_URL` 填完整 URL（包含 `/api/dance/analyze`），把该 HTTPS 域名加入微信小程序 `request` 合法域名。
5. 微信云存储、数据库、`getVideoUrl` 和旧 `analyzeDance` 均保留。本轮只迁移分析计算，不变更课程上传和播放。

FC 模型请求总超时为 90 秒，微信请求为 100 秒。未配置 Endpoint 时明确报错，不回退旧云函数。JSON 解析失败时显示模型原文，不把空列表误显示为“没有问题”。本地可运行 `node --test tests/dance-analysis.test.js` 检查模拟链路，真实云端调用需部署后另行验收。

完整调用流程：

```text
选择动作
→ 手机录制或文件上传
→ 上传微信云存储
→ 获得 cloud:// fileID
→ 点击“生成动作建议”
→ getVideoUrl 转换 HTTPS
→ wx.request POST /api/dance/analyze
→ 阿里云 FC
→ Qwen3-VL-Flash
→ 返回 JSON
→ 页面展示动作建议
```

## 后续接真实后端

建议优先替换 `utils/mock.js` 中的方法实现，页面层尽量不改。

需要后端接口：

- 统一登录接口，后端根据账号识别学生或教师
- 用户角色和权限接口
- 资源列表接口
- 资源详情和调用记录接口
- 课程详情接口
- AI 分析任务记录、历史建议和任务状态接口
- 编创单元和作品保存接口
- 社区帖子列表和发布接口

上线前还需要配置微信小程序合法请求域名、视频资源域名和资源存储策略。
