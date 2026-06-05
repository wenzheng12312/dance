# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个微信小程序舞蹈课程学习应用。用户通过学号登录，浏览课程列表，观看舞蹈教学视频。

## 开发方式

- 使用**微信开发者工具**导入 `dance/` 目录即可运行和调试
- 无需构建工具或包管理器；小程序原生 JS 开发
- 项目配置：`dance/app.json`（页面注册、窗口样式），`dance/project.config.json`（编译设置、基础库版本）

## 架构

### 页面导航流

```
login → course-list → video-player
```

- `app.js` 启动时调用 `auth.isLoggedIn()` 检查登录状态，未登录则 `reLaunch` 到登录页
- 登录成功后 `reLaunch` 到课程列表页（清空页面栈）
- 课程列表通过 `navigateTo` 跳转视频播放页（保留返回栈）

### 数据层：Mock 与真实数据库切换

- `utils/mock.js` — 模拟数据，800ms `setTimeout` 模拟网络延迟
- `utils/dbApi.js` — 真实数据库接口，通过 `wx.cloud.database()` 对接微信云开发数据库
- 两个模块暴露**相同的三个方法签名**：`login(studentId, password)`、`getCourseList()`、`getCourseDetail(courseId)`
- 返回数据结构也保持一致（字段名经适配，如数据库的 `_id` → 返回值的 `id`，`avatarUrl` → `avatar`）
- 页面通过 `require` 导入，切换只需改一行引用

### 云开发

- `app.js` 中初始化云开发环境：`env: 'cloud1-d9gqdwuj082ecda5d'`
- 云数据库集合：`user`（学号、密码、姓名、头像）、`course`（标题、封面、时长、视频链接、描述）

### 登录状态管理 (`utils/auth.js`)

- 基于 `wx.StorageSync` 的两个 key：`dance_student_token` 和 `dance_student_info`
- `setLoginInfo(userInfo)` / `isLoggedIn()` / `getUserInfo()` / `logout()`

### 全局样式

- 主色调：`#ff6b6b`（珊瑚红）
- 背景色：`#f8f9fa`
- 使用 rpx 单位，适配不同屏幕尺寸

## 一、数据库集合说明

### 1. courses 课程集合
用于存储舞蹈课程信息，字段如下：
- `_id`: 自动生成的唯一ID
- `title`: 课程名称（字符串）
- `description`: 课程描述（字符串）
- `duration`: 课程时长（字符串，格式如 "60min"）
- `coverUrl`: 课程封面图存储路径（字符串，指向云存储）
- `videoUrl`: 课程视频存储路径（字符串，指向云存储）

### 2. users 用户集合
用于存储用户信息，字段如下：
- `_id`: 自动生成的唯一ID
- `name`: 用户名（字符串）
- `studentId`: 学号（字符串）
- `password`: 登录密码（字符串）
- `avatarUrl`: 用户头像存储路径（字符串，指向云存储）
- `role`: 用户角色（字符串，如 "student" 或 "admin"）

---

## 二、云存储目录结构
云存储使用微信云开发，目录结构如下：
- `/avatar/`: 用户头像存储目录
- `/course/cover/`: 课程封面图存储目录
- `/course/video/`: 课程视频存储目录

---

## 三、开发规范要求
1.  数据库操作必须使用以上字段名，不得随意新增或修改字段名
2.  所有文件上传/引用必须使用上述存储路径，不要使用在线CDN或外部图片地址
3.  课程列表页面默认从 `courses` 集合读取数据，按课程名称排序
4.  用户登录逻辑使用 `users` 集合，以 `studentId` 和 `password` 作为校验字段
5.  所有新增代码必须符合微信小程序 + 云开发官方规范，数据库操作必须使用 Promise 语法处理异步逻辑。
