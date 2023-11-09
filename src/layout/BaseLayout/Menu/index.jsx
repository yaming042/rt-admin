import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Menu } from 'antd';
import { useHistory } from 'react-router-dom';
import { baseRouter, moduleRouter } from '@/config/router';
import { getAuthMenu, mapMenuAddKey, getPagePath } from '@/config';
import styles from './index.module.scss';

// 给路由增加key
const moduleRouters = mapMenuAddKey(baseRouter.concat(moduleRouter));

/*
    Menu 组件必须给个theme，否则自定义的token是无效的
*/
const SiteMenu = (props) => {
    const [selectedKeys, setSelectedKeys] = useState([]),
        [openKeys, setOpenKeys] = useState([]),
        [menuItem, setMenuItem] = useState([]),
        history = useHistory();

    // 点击菜单条目
    const onMenuClick = ({ key }) => history.push(key);

    // 子菜单展开、折叠
    const onMenuOpenChange = (openKeys) => setOpenKeys(openKeys);

    // 设置菜单的选中项和展开项
    const setMenuConfig = (pathname) => {
        let pathArray = getPagePath(pathname, moduleRouters),
            selectedKey = [],
            openedKeys = openKeys.slice(0);

        // 当前选中的路由可能是二级菜单且二级菜单还不展示在菜单中，此时就选中最近的父级菜单(展示在菜单中的)
        for(let i=0;i<pathArray.length;i++) {
            let item = pathArray[i];

            if(item.showInMenu || item.showInMenu === undefined) {
                if(!selectedKey.length) {
                    selectedKey = [item.key];
                }else{
                    openedKeys.push(item.key);
                }
            }
        }

        if(selectedKey?.length) setSelectedKeys(selectedKey);

        openedKeys = Array.from(new Set(openedKeys));
        if(openedKeys?.length) setOpenKeys(openedKeys);
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
        let menus = getAuthMenu(moduleRouters, props.modules || []);

        setMenuItem(menus);
    }, [props.modules]);

    return (
        <>
            { menuItem.length ?
                <Menu
                    className={`${styles['menu']} ${props.mode === 'horizontal' ? styles['menu-horizontal'] : ''}`}
                    onClick={onMenuClick}
                    onOpenChange={onMenuOpenChange}
                    style={{ width: '100%' }}
                    selectedKeys={selectedKeys}
                    openKeys={openKeys}
                    mode={props.mode || 'inline'}
                    theme="light"
                    items={menuItem}
                />
                :
                null
            }
        </>
    );
};

function mapStateToProps({main}) {
    return {
        modules: main.userInfo?.modules || [],
    }
}
function mapDispatchToProp(dispatch) {
    return {
        dispatch
    }
}
export default connect(mapStateToProps, mapDispatchToProp)(SiteMenu);