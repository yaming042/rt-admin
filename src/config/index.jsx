import { deepCopy } from "@/utils";
// import routers from './router';

// 辅助函数 ===== begin
// 为菜单数据增加key字段
const mapMenuWithKey = (data=[]) => {
    return (data || []).map(item => {
        let o = {...item};
        o.key = o.url || o.key;

        if(Array.isArray(o.children) && o.children.length) {
            o.children = mapMenuWithKey(o.children);
        }else if(o.hasOwnProperty('children')) {
            delete o.children;
        }

        return o;
    })
};
// 获取侧边菜单渲染需要的数据，其实就是处理 menuHidden 字段，只要需要展示出来的菜单；并不是所有菜单都需要展示在左侧菜单，所以额外处理一次
const getSideMenuData = (data=[]) => {
    return data.map(item => {
        let o = deepCopy(item);

        if(!o.menuHidden) {
            if(Array.isArray(o.children) && o.children.length) {
                let res = getSideMenuData(o.children);

                if(res.length) {
                    o.children = res;
                }else{
                    delete o.children;
                }
            }

            return o;
        }
        return undefined;
    }).filter(Boolean);
};
// 获取需要渲染的路由
const getRenderRouterData = (treeArray = [], parentId = null) => {
    const flatArray = [];

    for (const node of treeArray) {
        const flatNode = {
            pid: parentId, // 父节点的 id
            ...node,// 其他节点属性...
        };

        flatArray.push(flatNode);

        if (node.children && node.children.length > 0) {
            flatArray.push(...getRenderRouterData(node.children, node.key)); // 传递当前节点的 id 作为父节点的 pid
        }
    }

    return flatArray;
};
// 辅助函数 ===== end

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
