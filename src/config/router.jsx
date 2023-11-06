// 这里没用React.lazy，是因为它没法配合vite的热加载动态更新组件，所以替换成 '@loadable/component'，它可以
// import {lazy} from 'react';
import loadable from '@loadable/component';
import Loading from '@/components/Loading';
import * as URL from './url';
import { mapMenuAddKey } from '@/utils';

import TinyLayout from '@/layout/TinyLayout';

const Login = loadable(() => import('@/pages/Login'), { fallback: <Loading/> });
const NotFound = loadable(() => import('@/pages/NotFound'), { fallback: <Loading/> });
const Forbidden = loadable(() => import('@/pages/Forbidden'), { fallback: <Loading/> });

const Overview = loadable(() => import('@/pages/Overview'), { fallback: <Loading/> });

const RoleList = loadable(() => import('@/pages/RoleList'), { fallback: <Loading/> });
const UserList = loadable(() => import('@/pages/UserList'), { fallback: <Loading/> });
const ModuleList = loadable(() => import('@/pages/ModuleList'), { fallback: <Loading/> });
const Account = loadable(() => import('@/pages/Account'), { fallback: <Loading/> });


/*
    1. url 必须，没有url的话那key就得必须
    2. auth 不是必须，只有 array 才是有效的值，非数组都等效于不需要权限，空数组会永远没有权限，针对数组值，可以是url也可以是约定好的key
    3. menuHidden 不是必须，true - 不需要在菜单展示
    4. layout 不是必须，null === layout时不应用任何布局，其余应用默认布局


    {
        url: URL.ACCOUNT,
        icon: '',
        label: '个人中心',
        component: UserList,
        showInMenu: false, // 是否展示在菜单中
        auth: [], // 权限标识，可以是url也可以是约定好的key [key1, key2]
        layout: null, // 布局
    }
*/
// 这些路由都是不需要登录就可以访问的
const baseRouters = [
    {
        url: URL.LOGIN,
        icon: '',
        label: '欢迎登录',
        component: Login,
        layout: null,
        showInMenu: false,
    },
    {
        url: URL.NOTFOUND,
        icon: '',
        label: '404',
        component: NotFound,
        showInMenu: false,
    },
    {
        url: URL.FORBIDDEN,
        icon: '',
        label: '403',
        component: Forbidden,
        showInMenu: false,
    },
    {
        url: URL.OVERVIEW,
        icon: '',
        label: '欢迎页',
        component: Overview,
        showInMenu: true,
    },
];

// 这些路由需要登录 且 有权限才能访问
const moduleRouters = [
    {
        url: URL.USER_LIST,
        icon: '',
        label: '用户列表',
        component: UserList,
    },
    {
        url: URL.ROLE_LIST,
        icon: '',
        label: '角色列表',
        component: RoleList,
    },
    {
        url: URL.AUTH_LIST,
        icon: '',
        label: '权限列表',
        component: ModuleList,
    },
    {
        key: 'sys',
        icon: '',
        label: '系统设置',
        children: [
            {
                url: URL.ACCOUNT,
                icon: '',
                label: '账户中心',
                component: Account,
            },
        ]
    },
];

export const baseRouter = mapMenuAddKey(baseRouters);
export const moduleRouter = mapMenuAddKey(moduleRouters);
export const routers = baseRouter.concat(moduleRouter);