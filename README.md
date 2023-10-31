##### 本地启动
npm run dev

##### 构建生产版本
npm run build


##### 需要一个环境配置文件，格式如下
```json
NODE_ENV='development'
VITE_BASEDIR=''
VITE_PROXY='{"port":"3333","proxy":[{"src":"/api","target":"http://localhost:3333"}]}'


VITE_WEB_TITLE=''
VITE_WEB_DESCRIPTION=''
VITE_WEB_KEYWORDS=''
```
##### api
```json
{
    code: number, // 200成功，201未登录
    data: object, // null, {}, []
    message: string
}
```

##### 动态路由(动态菜单)
路由分为两类：（方便快捷开发）
- 基础路由 - 不需要登录就可以访问的页面，比如登录页，404这些
- 功能路由 - 有具体业务逻辑的页面，需要登录且有权限才能访问







# RT-Admin 前端基础框架

RT-Admin 是一个基于 React 的前端基础框架，旨在帮助开发者快速构建现代化的管理后台和应用程序界面，它提供了基础布局和工具，以简化开发过程。

## 特性

- 现代的 React 架构
- 管理后台布局模板
- 集成路由管理
- 支持主题定制

## 快速开始
克隆代码即可本地运行






