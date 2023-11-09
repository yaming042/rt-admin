import { useEffect, useState } from "react";
import { Modal, Button, Card, Skeleton, Empty, Row, Col } from "antd";
import ModuleDetail from "./ModuleDetail";
import { DeleteOutlined, EditOutlined, PlusCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { deepCopy } from '@/utils';
import CommonTree from '@/components/Tree';
import styles from './index.module.scss';

export default () => {
    const initState = () => ({
        moduleLoading: false,
        detailOpen: false,
        currentItem: null,
        currentItemBak: null,
        moduleList: [],
        roleList: [],
    }),
    [state, setState] = useState(initState),
    [modal, contextHolder] = Modal.useModal();

    // 根据权限ID，获取权限数据
    const getModuleInfo = (id, data=[]) => {
        for(let i=0;i<data.length;i++) {
            let o = data[i];

            if(o.id+'' === id+'') {
                return o;
            }else{
                if(Array.isArray(o.children) && o.children.length) {
                    let r = getModuleInfo(id, o.children);

                    if(r) return r;
                }
            }
        }

        return null; // currentItem默认就是 null，所以这里最好就返回null
    };
    // 获取权限列表
    const queryModuleList = async (currentId='') => {
        let currentObj = {};
        let response = {code:0,data: [],message:'成功'};

        if(response?.code === 0) {
            let moduleList = response?.data || [];

            if(currentId) {
                let o = getModuleInfo(currentId, moduleList);
                currentObj = {
                    currentItem: o,
                    currentItemBak: deepCopy(o),
                }
            }

            setState(o => ({...o, moduleList, ...currentObj}));
        }
    };
    // 获取角色列表
    const queryRoleList = async () => {
        let response = {code:0,data: [],message:'成功'};

        setState(o => ({...o, roleList: response?.data || []}));
    };
    // 新建权限
    const addModule = () => {
        let {currentItem} = state;

        setState((o) => ({ ...o, currentItemBak: deepCopy(currentItem), currentItem: {isNew: true} }));
    };
    // 选中一个权限，进行详情的展示
    const onSelectModule = (item) => {
        let {currentItem} = state;
        setState(o => ({...o, currentItemBak: deepCopy(currentItem), currentItem: deepCopy(item)}));
    }
    // 重置当前选中项
    const resetCurrentItem = () => {
        setState(o => ({...o, currentItem: null, currentItemBak: null}));
    };
    // 调用删除接口
    const confirmDelete = (row) => {
        let {currentItem} = state;

        return new Promise((resolve, reject) => {
            let t = setTimeout(() => {
                clearTimeout(t);

                Promise.resolve().then(() => {
                    // 删除了选中的那项，那么就重置当前选中项
                    if(row.id === currentItem?.id) resetCurrentItem();
                    // 请求权限
                    queryModuleList();

                    resolve();
                }).catch(e => {
                    reject();
                });
            }, 1000);
        });
    }
    // 删除二次确认
    const checkDelete = (record, e) => {
        modal.confirm({
            title: `是否删除权限 - ${record.name}?`,
            icon: <ExclamationCircleOutlined />,
            content: record?.children?.length ? '删除此权限会同时删除其子权限' : '',
            okText: '是',
            cancelText: '否',
            onOk: () => confirmDelete(record),
            autoFocusButton: null,
        });
    }
    // tree 组件通用的回调函数
    const treeHandle = (item, type) => {
        if('delete' === type) {
            checkDelete(item.data);
        }
    };
    // 取消编辑、新建
    const onCancel = () => {
        let {currentItemBak} = state;

        setState((o) => ({ ...o, currentItem: deepCopy(currentItemBak), currentItemBak: null }));
    };
    // 确定编辑、新建
    const onOk = (currentId='') => {
        queryModuleList(currentId);
    };

    useEffect(() => {
        queryRoleList();
        queryModuleList();
    }, []);

    return (
        <div className={styles['container']}>
            <div className={styles['left']}>
                <Card>
                    <div className={styles['left-header']}>
                        <div className={styles['title']}>权限列表</div>
                        <Button type="primary" icon={<PlusCircleOutlined />} onClick={addModule}>新建权限</Button>
                    </div>
                    <div className={styles['category-tree']}>
                        {state?.moduleLoading ? <Skeleton className={styles['tree-skeleton']}></Skeleton> : null}

                        <CommonTree
                            dataSource={state.moduleList || []}
                            checkable={false}
                            draggable={true}
                            selectable={true}
                            onSelect={onSelectModule}
                            callback={treeHandle}
                        />
                    </div>
                </Card>
            </div>
            <div className={styles['right']}>
                <Card>
                    {
                        !state?.currentItem ?
                            <Empty
                                description={
                                    <div className={styles['empty-tips']}>
                                        暂无权限详情信息
                                        <br />
                                        请先从左侧选取权限进行详情查看或点击下方按钮进行快速新建
                                    </div>
                                }
                            >
                                <Button type="primary" icon={<PlusCircleOutlined />} onClick={addModule}>新建权限</Button>
                            </Empty>
                            :
                            <div className={styles['form']}>
                                <ModuleDetail
                                    moduleData={state.currentItem}
                                    moduleTreeData={state.moduleList || []}
                                    roleList={state.roleList || []}
                                    onCancel={onCancel}
                                    onOk={onOk}
                                />
                            </div>
                    }
                </Card>
            </div>

            {contextHolder}
        </div>
    );
}