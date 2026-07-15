# pet-rescue-adoption-wechat-app
# 天津小动保TAPA微信小程序

这是一个原生微信小程序项目，用于天津小动保TAPA的猫狗领养信息发布、浏览，以及小狗遛狗预约。

当前版本已接入微信云开发环境：

```text
cloud1-d0gq6eabrd8d306a5
```

领养信息和预约记录优先通过云函数写入云数据库；如果云函数尚未部署或调用失败，前端会回退到本地缓存，方便开发阶段继续演示。

## 运行方式

1. 打开微信开发者工具。
2. 选择“导入项目”。
3. 项目目录选择：

```text
/Users/jenniferzhao/WeChatProjects/pet-rescue-adoption
```

4. 使用当前项目 AppID：

```text
wx89f7717dc346f009
```

## 技术栈

- 原生微信小程序
- 微信云开发
- 云数据库
- 云存储
- 云函数
- 自定义 tabBar
- 本地缓存兜底

项目没有使用 npm 构建、第三方 UI 库或前端框架。

## 目录结构

```text
.
├── app.js                  # 小程序入口，初始化云开发
├── app.json                # 页面路由、窗口配置、自定义 tabBar 配置
├── app.wxss                # 全局样式
├── cloudfunctions/         # 云函数
│   ├── login/              # 获取 openid
│   ├── adoptions/          # 领养创建、列表、删除
│   ├── bookings/           # 预约创建、列表、冲突校验
│   └── dogs/               # 可预约小狗列表
├── custom-tab-bar/         # 自定义底部导航栏
├── pages/
│   ├── home/               # 首页
│   ├── adopt/              # 领养浏览页
│   ├── adopt-detail/       # 领养详情页
│   ├── publish/            # 发布领养信息页
│   ├── walk/               # 遛狗预约页
│   ├── profile/            # 我的页面
│   └── login/              # 注册登录页
├── utils/
│   └── store.js            # 前端数据层，封装云函数、云存储和本地兜底
├── project.config.json     # 微信开发者工具项目配置
└── sitemap.json
```

## 云开发配置

### 初始化位置

`app.js`：

```js
wx.cloud.init({
  env: store.CLOUD_ENV,
  traceUser: true
})
```

云环境 ID 定义在 `utils/store.js`：

```js
const CLOUD_ENV = 'cloud1-d0gq6eabrd8d306a5'
```

### 云函数根目录

`project.config.json`：

```json
"cloudfunctionRoot": "cloudfunctions/"
```

### 云函数

| 云函数 | 作用 |
| --- | --- |
| `login` | 获取当前微信用户 `openid` |
| `adoptions` | 领养列表、我的发布、创建领养、删除领养 |
| `bookings` | 预约列表、我的预约、创建预约、预约冲突校验 |
| `dogs` | 读取可预约小狗列表 |

部署方式：

1. 在微信开发者工具中展开 `cloudfunctions/`。
2. 分别右键 `login`、`adoptions`、`bookings`、`dogs`。
3. 选择“上传并部署：云端安装依赖”。

### 云数据库集合

需要在云开发控制台创建：

```text
adoptions
bookings
dogs
```

后续如果要把用户资料也交给后台维护，可以再创建 `users` 集合。

### 云存储

发布领养时，用户选择的猫狗照片会通过：

```js
wx.cloud.uploadFile()
```

上传到云存储路径：

```text
adoption-images/
```

上传成功后，云存储 `fileID` 会保存到领养记录的 `images` 数组。`cover` 字段保存第一张照片，用于首页和卡片封面兼容展示。

当前开发版保留了上传失败回退临时路径的逻辑，方便调试。正式上线建议去掉回退，强制图片上传成功后才允许发布。

## 页面说明

### 首页 `pages/home/`

展示：

- 待领养数量
- 可预约小狗数量
- 预约数量
- 领养卡片预览
- 发布领养入口
- 遛狗预约入口

数据来自 `store.getAdoptions()`、`store.getBookings()`、`store.getShelterDogs()`。

### 领养页 `pages/adopt/`

公开浏览待领养猫狗，支持筛选：

- 全部
- 猫咪
- 狗狗

列表只显示：

- 动物照片
- 动物名称

点击动物卡片进入领养详情页。公开领养页只浏览，不提供删除。删除在“我的”页面。

### 领养详情页 `pages/adopt-detail/`

用于展示其他用户发布的待领养动物详情。

显示字段：

- 多张照片
- 名字
- 类型
- 品种
- 年龄
- 公母
- 发布者
- 疾病历史
- 是否痊愈
- 疫苗接种情况
- 情况简介
- 联系方式

### 发布页 `pages/publish/`

登录用户可以发布领养信息。

表单字段：

- 照片，最多9张
- 名字
- 品种
- 类型
- 公母
- 年龄
- 疾病历史
- 是否痊愈
- 接种疫苗
- 情况简介
- 领养联系方式

提交流程：

1. 校验登录状态。
2. 校验必填字段。
3. 上传最多9张照片到云存储。
4. 如果用户裁剪了封面，上传裁剪后的封面图。
5. 调用 `adoptions` 云函数创建领养记录。
6. 成功后跳转到领养页。

发布者可以点击照片上的“裁剪封面”，进入 `pages/cover-crop/` 选择领养列表中想展示的照片区域。裁剪结果只作为 `cover` 保存；原始多张照片仍保存在 `images` 中，详情页可以查看原图。

### 遛狗预约页 `pages/walk/`

用于预约天津小动保基地小狗遛狗。

包含：

- 预约说明
- 小狗选择
- 月份选择
- 日期选择
- 预约时间：`13点`、`14点`、`15点`、`16点`、`17点`
- 遛狗地点：`导航天津小动保基地`
- 遛狗联系：`15022278701`
- 预约人
- 手机号
- 我的预约记录

预约规则在 `bookings` 云函数中校验：

- 必须登录后才能预约
- 每个用户每天最多预约一次
- 同一只小狗同一天只能被一个用户预约

### 我的页面 `pages/profile/`

显示当前用户：

- 用户信息
- 我的预约
- 我发布的领养
- 删除自己发布的领养信息

删除领养调用 `adoptions` 云函数，云端会校验 `ownerId` 是否等于当前用户 `openid`。

### 登录页 `pages/login/`

支持：

- 手机号登录/注册
- 微信头像昵称登录

登录时调用 `login` 云函数获取 `openid`，并把用户信息保存到本地缓存，后续发布、预约和删除都会依赖该用户信息。

## 数据层 `utils/store.js`

`utils/store.js` 是前端统一数据入口，页面不直接调用云函数。

主要职责：

- 初始化云环境 ID
- 调用云函数
- 上传领养图片到云存储
- 查询领养信息
- 查询预约记录
- 查询可预约小狗列表
- 创建领养信息
- 创建预约记录
- 删除领养信息
- 保存和读取当前登录用户
- 云调用失败时回退本地缓存

主要导出方法：

```js
getAdoptions()
getAdoptionsForUser(userId)
addAdoption(payload)
deleteAdoption(id, ownerId)

getBookings()
getBookingsForUser(userId)
addBooking(payload)

uploadAdoptionImage(filePath)
uploadAdoptionImages(filePaths)

getUser()
saveUser(user)
logout()

getShelterDogs()
getWalkDates()
getTimeSlots()
getWalkLocation()
getShelterPhone()
```

## 数据模型

### 领养信息 `adoptions`

```js
{
  _id: '云数据库ID',
  ownerId: '用户openid',
  ownerName: '发布者昵称',
  name: '糯米',
  type: '猫咪',
  breed: '中华田园猫',
  age: '8个月',
  gender: '母',
  diseaseHistory: '曾有轻微猫鼻支',
  recovered: '已痊愈',
  vaccinated: '已接种',
  contact: '微信 rescue-cat-01',
  status: '待领养',
  cover: 'cloud://第一张照片...',
  images: ['cloud://照片1...', 'cloud://照片2...'],
  intro: '亲人安静...',
  createTime: Date,
  updateTime: Date
}
```

### 预约记录 `bookings`

```js
{
  _id: '云数据库ID',
  userId: '用户openid',
  userName: '预约用户昵称',
  dogId: 'd1',
  dogName: '阿福',
  dogCover: 'https://...',
  date: '2026-07-08',
  dateLabel: '7月8日',
  time: '13点',
  visitorName: '张三',
  phone: '15000000000',
  location: '导航天津小动保基地',
  shelterPhone: '15022278701',
  status: '已预约',
  createTime: Date,
  updateTime: Date
}
```

### 可预约小狗 `dogs`

云数据库 `dogs` 集合用于维护遛狗预约页的小狗列表。后续删减和修改小狗，不需要改代码，直接在云开发控制台编辑这个集合即可。

建议字段：

```js
{
  name: '阿福',
  size: '中型犬',
  temperament: '温顺亲人',
  note: '适合第一次参加遛狗的志愿者',
  cover: 'cloud://... 或 https://...',
  available: true,
  sort: 1,
  createTime: Date
}
```

字段说明：

- `name`：小狗名字。
- `size`：体型，例如 `小型犬`、`中型犬`、`大型犬`。
- `temperament`：性格标签。
- `note`：预约提示。
- `cover`：小狗照片，建议使用云存储 fileID。
- `available`：是否显示在预约页。设置为 `false` 后前端不会显示。
- `sort`：排序数字，越小越靠前。

云函数会把每条记录的 `_id` 转成前端使用的 `id`，预约记录保存的也是这个 `id`。如果只是临时不开放预约，建议把 `available` 改为 `false`，不要删除后重建同一只小狗。

### 本地用户缓存

```js
{
  id: 'openid',
  openid: 'openid',
  avatar: '',
  nickname: 'TAPA用户',
  phone: '15000000000',
  loginType: 'phone'
}
```

## 自定义底部导航栏

底部导航在 `custom-tab-bar/` 中实现，而不是使用微信原生 tabBar。

原因：

- 需要更大的导航文字
- 需要导航栏整体稍微上移
- 需要和孟菲斯自然风格保持一致

各 tab 页面在 `onShow` 中调用：

```js
getTabBar().setData({ selected })
```

选中关系：

```text
0 -> 首页 pages/home/home
1 -> 领养 pages/adopt/adopt
2 -> 遛狗 pages/walk/walk
3 -> 我的 pages/profile/profile
```

## 常见修改点

### 修改云环境

改 `utils/store.js`：

```js
const CLOUD_ENV = '新的环境ID'
```

### 修改联系电话

改 `utils/store.js`：

```js
const SHELTER_PHONE = '15022278701'
```

### 修改遛狗地点

改 `utils/store.js`：

```js
const WALK_LOCATION = '导航天津小动保基地'
```

### 修改预约时间

改 `utils/store.js`：

```js
const timeSlots = ['13点', '14点', '15点', '16点', '17点']
```

### 修改可预约小狗

进入云开发控制台，打开数据库集合：

```text
dogs
```

可以直接新增、编辑、删除小狗记录。

建议操作方式：

- 新增小狗：新增一条记录，填写 `name`、`size`、`temperament`、`note`、`cover`、`available`、`sort`。
- 修改小狗：直接编辑对应记录。
- 暂停预约：把 `available` 设置为 `false`。
- 恢复预约：把 `available` 设置为 `true`。
- 删除小狗：确认没有历史预约依赖后再删除。

### 修改预约规则

改 `cloudfunctions/bookings/index.js` 的 `createBooking()`。

当前规则：

- 同一用户同一天只能预约一次
- 同一只狗同一天只能被预约一次

### 修改领养字段

通常需要同时改：

- `pages/publish/publish.wxml`
- `pages/publish/publish.js`
- `pages/adopt/adopt.wxml`
- `pages/profile/profile.wxml`
- `cloudfunctions/adoptions/index.js`
- `utils/store.js` 中默认演示数据

## 上线前检查

上线前建议确认：

1. 云函数 `login`、`adoptions`、`bookings`、`dogs` 已部署。
2. 云数据库集合 `adoptions`、`bookings`、`dogs` 已创建。
3. 数据库权限配置合理，写入和删除主要通过云函数完成。
4. 云存储上传可用。
5. 图片内容安全审核已接入。
6. 隐私保护指引已配置。
7. 本地缓存兜底逻辑已按正式上线策略处理。
8. 小程序备案、审核、发布流程已完成。

## 开发注意事项

- 不要在公开领养页提供删除按钮，删除应在“我的”页面操作。
- 预约限制必须在云函数里校验，不能只依赖前端。
- 正式上线时用户上传图片必须保存到云存储，不能依赖临时路径。
- 当前前端仍保留默认小狗列表作为云函数调用失败时的兜底。云函数可用时，小狗列表完全以 `dogs` 集合为准。
- `project.private.config.json` 是开发者工具生成的个人配置，通常不需要提交给多人协作仓库。
