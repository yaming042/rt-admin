import { useState, useEffect, memo } from 'react';
import { Menu, Layout, Skeleton } from 'antd';
import { Link, useHistory } from 'react-router-dom';
import { baseRouter, moduleRouter } from '@/config/router';
import { mapMenuAddKey } from '@/utils';
import styles from './index.module.scss';

// 给路由增加key
const moduleRouters = mapMenuAddKey(baseRouter.concat(moduleRouter));

// 获取当前页面的 路由路径
const getPagePath = (pathname='', routers=[]) => {
    let result = [];
    for(let i=0;i<routers.length;i++) {
        let cur = routers[i];

        if(Array.isArray(cur.children) && cur.children.length) {
            let r = getPagePath(pathname, cur.children);
            result = result.concat(r);
            if(r.length) {
                result.unshift(cur.key);
            }
        }else{
            if(cur.key === pathname) {
                result.push(cur.key);
            }
        }
    }

    return result;
};

/*
    Menu 组件必须给个theme，否则自定义的token是无效的
*/
const SideBar = (props) => {
    const [selectedKeys, setSelectedKeys] = useState([]),
        [openKeys, setOpenKeys] = useState([]),
        [menuItem, setMenuItem] = useState([]),
        history = useHistory();

    const handleAuthMenu = (data=[], modules=[]) => {
        return data.map(item => {
            let {component, layout, showInMenu, ...o} = item;

            if(showInMenu === false) {
                return undefined;
            }

            if(o.url && (DEBUG === 'true' || modules.includes(o.url))) {
                if(Array.isArray(o.children) && o.children.length) {
                    let res = handleAuthMenu(o.children, modules);

                    if(res.length) {
                        o.children = res;
                    }else{
                        delete o.children;
                    }
                }

                return o;
            }else if(!o.url && Array.isArray(o.children) && o.children.length) {
                let res = handleAuthMenu(o.children, modules);

                if(res.length) {
                    o.children = res;
                }else{
                    return undefined;
                }

                return o;
            }

            return undefined;
        }).filter(Boolean);
    };
    // 点击菜单条目
    const onMenuClick = ({ key }) => history.push(key);

    // 子菜单展开、折叠
    const onMenuOpenChange = (openKeys) => setOpenKeys(openKeys);

    // 设置菜单的选中项和展开项
    const setMenuConfig = (pathname) => {
        let pathArray = getPagePath(pathname, moduleRouters),
            length = pathArray.length,
            currentOpenKeys = pathArray.slice(0, length - 1),
            selectedKey = pathArray.slice(length - 1),
            totalOpenKeys = Array.from(new Set(openKeys.concat(currentOpenKeys)));

        setSelectedKeys(selectedKey);
        if(totalOpenKeys?.length) setOpenKeys(totalOpenKeys);
    }

    // 生命周期
    useEffect(() => {
        setMenuConfig(location.pathname);

        // 监听路由变化，重新设置菜单的选中项及展开项
        const unListen = history.listen((params) => {
            setMenuConfig(params.pathname);
        });

        return () => {
            // 组件卸载
            unListen();
            setOpenKeys([]);
            setSelectedKeys([])
        }
    }, []);

    useEffect(() => {
        let menus = handleAuthMenu(moduleRouters, props.modules || []);

        setMenuItem(menus);
    }, [props.modules]);

    return (
        <>
            <Layout.Sider
                collapsible
                collapsed={props.collapsed}
                className={styles['menu-list']}
                style={{height:'100%'}}
                trigger={null}
            >
                { menuItem.length ?
                    <Menu
                        onClick={onMenuClick}
                        onOpenChange={onMenuOpenChange}
                        style={{
                            width: '100%',
                        }}
                        selectedKeys={selectedKeys}
                        openKeys={openKeys}
                        mode="inline"
                        theme="light"
                        items={menuItem}
                    />
                    :
                    null
                }
            </Layout.Sider>
        </>
    );
};

export default memo(SideBar);