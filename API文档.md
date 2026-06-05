# 舞蹈课程小程序 API 文档

## 一、项目概述

微信小程序舞蹈课程学习应用。用户通过学号登录，浏览课程列表，观看舞蹈教学视频。管理员可增删改课程（封面图 + 视频 + 描述）。

- **云环境 ID**: `cloud1-d9gqdwuj082ecda5d`
- **AppID**: `wx4ebf5643752b6739`
- **基础库**: 3.15.1+
- **云开发初始化**: `dance/app.js` 中 `wx.cloud.init({ env: 'cloud1-d9gqdwuj082ecda5d', traceUser: true })`

---

## 二、数据架构

### 2.1 数据库集合

#### `user` 集合

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | String | 自动生成 |
| `studentId` | String | 学号 |
| `password` | String | 登录密码 |
| `name` | String | 用户姓名 |
| `avatarUrl` | String | 头像 cloud:// fileID |
| `role` | String | `"student"` 或 `"admin"` |

#### `course` 集合

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | String | 自动生成 |
| `title` | String | 课程标题 |
| `description` | String | 课程描述 |
| `duration` | String | 时长（如 `"60min"`） |
| `coverUrl` | String | 封面图 cloud:// fileID |
| `videoUrl` | String | 视频 cloud:// fileID |

### 2.2 云存储目录

```
cloud://cloud1-d9gqdwuj082ecda5d/
├── avatar/          # 用户头像
├── course/
│   ├── cover/       # 课程封面图
│   └── video/       # 课程视频
```

---

## 三、API 接口

### 3.1 客户端接口 (`dance/utils/dbApi.js`)

所有方法返回 `Promise`，数据结构统一为 `{ success: boolean, data?, message: string }`。

#### `dbApi.login(studentId, password)`

用户登录验证（客户端直连 `user` 集合）。

```js
// 请求
dbApi.login('2024001', '123456')

// 成功响应
{ success: true, data: { id, studentId, name, avatar, role }, message: '登录成功' }
// 失败响应
{ success: false, message: '学号或密码错误' }
```

#### `dbApi.getCourseList()`

获取全部课程列表。返回数据中 `cover` 和 `videoUrl` 是 `cloud://` fileID，前端展示前需用 `uploadApi.getTempUrls()` 转为临时 HTTPS 链接。

```js
var res = await dbApi.getCourseList()
// res.data = [{
//   id, title, cover, duration, videoUrl, description
// }, ...]
```

#### `dbApi.getCourseDetail(courseId)`

获取单个课程详情。

```js
var res = await dbApi.getCourseDetail(courseId)
// res.data = { id, title, cover, duration, videoUrl, description }
```

#### `dbApi.updateUserAvatar(userId, avatarUrl)`

更新用户头像。`avatarUrl` 是云存储 fileID（由 `uploadApi.uploadAvatar()` 返回）。

#### `dbApi.addCourse(courseData)`

新增课程。通过云函数 `courseAdmin` 执行（绕过客户端权限限制）。

```js
dbApi.addCourse({
  title: '古典舞基础',
  description: '从基本功开始……',
  duration: '45min',
  coverUrl: 'cloud://xxx/course/cover/xxx.png',
  videoUrl: 'cloud://xxx/course/video/xxx.mp4'
})
```

#### `dbApi.updateCourse(courseId, courseData)`

更新课程。参数同 `addCourse`。

#### `dbApi.deleteCourse(courseId)`

删除课程。会自动清理关联的云存储文件（封面 + 视频）。

---

### 3.2 云存储接口 (`dance/utils/uploadApi.js`)

#### `uploadApi.uploadAvatar(filePath)` → `Promise<fileID>`

上传头像图片到 `avatar/` 目录。

#### `uploadApi.uploadCourseCover(filePath)` → `Promise<fileID>`

上传课程封面图到 `course/cover/` 目录。

#### `uploadApi.uploadCourseVideo(filePath)` → `Promise<fileID>`

上传课程视频到 `course/video/` 目录。

#### `uploadApi.deleteFile(fileID)` → `Promise`

删除云存储文件（不抛异常，尽力清理）。

#### `uploadApi.getTempUrls(fileIDs)` → `Promise<{ fileID: tempUrl }>`

将 `cloud://` fileID 转为临时 HTTPS 链接。**视频播放和图片展示前必须调用此方法转换。**

```js
var urlMap = await uploadApi.getTempUrls(['cloud://xxx/video.mp4'])
// urlMap = { 'cloud://xxx/video.mp4': 'https://xxx.tcb.qcloud.la/xxx' }
```

---

### 3.3 云函数 `courseAdmin`

课程增删改的后端接口，在云开发控制台部署。拥有管理员权限，绕过客户端安全规则。

**调用方式**（客户端）:
```js
wx.cloud.callFunction({
  name: 'courseAdmin',
  data: { action: 'add', data: { title, description, duration, coverUrl, videoUrl } }
})
```

**action 类型**:

| action | 说明 | data 参数 |
|--------|------|-----------|
| `add` | 新增课程 | `{ title, description, duration, coverUrl?, videoUrl? }` |
| `update` | 更新课程 | `{ courseId, title, description, duration, coverUrl?, videoUrl? }` |
| `delete` | 删除课程 | `{ courseId }` |

**响应格式**: `{ success: boolean, data?, message: string }`

---

## 四、AI 交互接口

以下接口供 AI 模块调用，实现视频动作提取、动作拼接编舞等能力。

### 4.1 获取课程视频素材

```js
// 1. 获取课程列表
var list = await dbApi.getCourseList()

// 2. 获取单个课程的完整信息（含视频 fileID）
var course = await dbApi.getCourseDetail(courseId)

// 3. 将 cloud:// fileID 转为可下载的 HTTPS 链接
var urlMap = await uploadApi.getTempUrls([course.videoUrl])
var downloadUrl = urlMap[course.videoUrl]  // 可直接用于视频下载/分析
```

### 4.2 上传 AI 处理后的编舞视频

```js
// 1. AI 处理完成后的本地视频文件路径: tempFilePath
// 2. 上传为新课程视频
var newVideoFileID = await uploadApi.uploadCourseVideo(tempFilePath)

// 3. 也可以上传封面图
var newCoverFileID = await uploadApi.uploadCourseCover(coverTempPath)

// 4. 创建新课程记录（可以是 AI 生成的编舞课程）
await dbApi.addCourse({
  title: 'AI 编舞 - 古典舞组合',
  description: '由 XXX 动作模块拼接生成',
  duration: '3min',
  coverUrl: newCoverFileID,
  videoUrl: newVideoFileID
})
```

### 4.3 自定义动作模块存储方案（AI 开发人员扩展）

如果需要存储视频中提取的动作元数据（如关键帧时间戳、关节点坐标、动作标签），建议**新建一个 `movements` 集合**：

```js
// 客户端调用云函数写入动作数据
wx.cloud.callFunction({
  name: 'courseAdmin',
  data: {
    action: 'addMovement',
    data: {
      courseId: 'xxx',           // 关联的课程 ID
      timestamp: 12.5,           // 视频时间点（秒）
      label: '旋转',             // 动作标签
      keypoints: [[x1,y1], ...]  // 关节点坐标
    }
  }
})
```

如需此扩展，在 `courseAdmin` 云函数中增加对应的 `action` 分支即可。

### 4.4 完整的 AI 编舞工作流

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ 1.拉取素材    │ →  │ 2.AI 分析    │ →  │ 3.生成编舞   │
│ getCourseDetail│   │ 动作提取/标注 │   │ 拼接/合成    │
│ → videoUrl    │   │ → 关键帧/骨骼 │   │ → 新视频     │
└──────────────┘    └──────────────┘    └──────┬───────┘
                                               │
┌──────────────┐    ┌──────────────┐           │
│ 5.前端展示    │ ←  │ 4.入库       │ ←────────┘
│ getCourseList │    │ addCourse    │
│ 视频播放      │    │ (封面+视频)   │
└──────────────┘    └──────────────┘
```

---

## 五、系统特性

| 特性 | 说明 |
|------|------|
| **事务原子性** | 上传 + 数据库写入绑定为一个事务。中途失败自动回滚删除已上传文件，云存储不残留孤儿文件 |
| **文件清理** | 删除课程/替换封面视频时，旧文件自动从云存储删除 |
| **云函数管理** | 课程增删改走云函数 `courseAdmin`，拥有管理员权限 |
| **URL 转换** | `cloud://` fileID 需通过 `getTempUrls()` 转为临时 HTTPS 链接后使用 |

---

## 六、部署说明

1. 微信开发者工具导入 `dance/` 目录
2. 在云开发控制台创建云函数 `courseAdmin`（复制 `dance/cloudfunctions/courseAdmin/index.js` 内容）
3. 确保云环境 ID 为 `cloud1-d9gqdwuj082ecda5d`
4. `course` 集合确保删除多余的 `courseId` 唯一索引（如有）
