import { useEffect, useState } from "react";
import { Modal, Button, Card, Skeleton, Empty, Row, Col } from "antd";
import ModuleDetail from "./ModuleDetail";
import { DeleteOutlined, EditOutlined, PlusCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { deepCopy } from '@/utils';
import CommonTree from '@/components/Tree';
import styles from './index.module.scss';

import rtDb from '@/../DB';

export default () => {
    const initState = () => ({
        moduleLoading: false,
        detailOpen: false,
        currentItem: null,
        currentItemBak: null,
        moduleList: [],
        roleList: [],

        pageNo: 1,
        pageSize: 10,
        total: 0,
    }),
    [state, setState] = useState(initState),
    [modal, contextHolder] = Modal.useModal();

    // 获取权限列表
    const queryModuleList = async () => {
        let moduleList = await rtDb.getModuleList();

        setState(o => ({...o, moduleList}));
    };
    // 获取角色列表
    const queryRoleList = async () => {
        let roleList = await rtDb.getRoleList();

        setState(o => ({...o, roleList}));
    };
    // 新建权限
    const addModule = () => {
        let {currentItem} = state;

        setState((o) => ({ ...o, currentItemBak: deepCopy(currentItem), currentItem: {isNew: true} }));
    };

    const onSelectModule = (item) => {
        let {currentItem} = state;
        setState(o => ({...o, currentItemBak: deepCopy(currentItem), currentItem: deepCopy(item)}));
    }

    // 调用删除接口
    const confirmDelete = (row) => {
        return new Promise((resolve, reject) => {
            rtDb.deleteModule(row.id).then(() => {
                // 请求权限
                queryModuleList();
                resolve();
            });
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
    const treeHandle = (item, type) => {
        if('delete' === type) {
            checkDelete(item.data);
        }
    };

    const onCancel = () => {
        let {currentItemBak} = state;

        setState((o) => ({ ...o, currentItem: deepCopy(currentItemBak), currentItemBak: null }));
    };
    const onOk = () => {
        queryModuleList();
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