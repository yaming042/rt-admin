// 路由、菜单相关函数 ===== begin
// 给路由增加 key
export const mapMenuAddKey = (menus=[], parentKey='') => {
    return (menus || []).map((item, index) => {
        let {children, ...o} = item;

        if(typeof o.url === 'string') {
            o.key = o.url;
        }
        if(typeof o.key !== 'string' && o.url ) {
            o.key = `${parentKey ? parentKey+'/' : ''}${o.url || index}`.replace(/(\/\/)/g, '/');
        }

        if(Array.isArray(children) && children.length) {
            o.children = mapMenuAddKey(children, o.key);
        }

        return o;
    });
};

/*
    获取有权限的菜单
    data: 菜单数据
    modules: 权限数据
    return: 有权限的菜单数据
*/
export const getAuthMenu = (data=[], modules=[]) => {
    return data.map(item => {
        let {component, layout, showInMenu, ...o} = item;

        if(showInMenu === false) return undefined;

        if(o.url && (DEBUG === 'true' || modules.includes(o.url))) {
            if(Array.isArray(o.children) && o.children.length) {
                let res = getAuthMenu(o.children, modules);

                if(res.length) {
                    o.children = res;
                }else{
                    delete o.children;
                }
            }

            return o;
        }else if(!o.url && Array.isArray(o.children) && o.children.length) {
            let res = getAuthMenu(o.children, modules);

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


/*
    获取需要渲染的路由，将路由打平成数组来渲染
*/
export const getRouterData = (data=[]) => {
    let routers = [];
    (data || []).map(item => {
        if(item.key || item.url) {
            if(item.url) routers.push(item); // 只要有url就先记录路由

            if(Array.isArray(item.children) && item.children.length) {
                let r = getRouterData(item.children);

                routers = routers.concat(r);
            }
        }
    });

    return routers;
};

/*
    获取当前页面的 路由路径
*/
export const getPagePath = (pathname='', routers=[]) => {
    let result = [];
    for(let i=0;i<routers.length;i++) {
        let cur = routers[i];

        if(cur.key === pathname) result.push(cur);

        if(Array.isArray(cur.children) && cur.children.length) {
            let r = getPagePath(pathname, cur.children);
            result = r.concat(result);
            if(r.length) {
                result.push(cur);
            }
        }
    }

    return result;
};
// 路由、菜单相关函数 ===== end

// 分页基本配置
export const paginationConfig = {
    showSizeChanger: true,  // 展示快速切换
    showQuickJumper: true,  // 可以快速跳转至某页
    showTotal: (total) => `共 ${total} 条`,
};

// 颜色 色值集合
export const COLORS = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
    '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#1f77b4',
    '#dbdb8d', '#8c564b', '#7f7f7f', '#bcbd22', '#17becf',
    '#aec7e8', '#ff9896', '#c5b0d5', '#c49c94', '#f7b6d2',
];
