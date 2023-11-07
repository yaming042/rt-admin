import { useEffect, useState } from "react";
import { Table, Modal, Button, Tag, Tooltip } from "antd";
import FilterForm from "@/components/FilterForm";
import RoleDetail from "./RoleDetail";
import { DeleteOutlined, EditOutlined, PlusCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { paginationConfig, COLORS } from "@/config";
import dayjs from "dayjs";
import request from '@/utils/request';
// import { QUERY_USER_LIST_PAGE, QUERY_ROLE_LIST } from '@/config/url';
import styles from './index.module.scss';

import rtDb from '@/../DB';

export default () => {
    const initState = () => ({
            loading: false,
            roleList: [],
            detailOpen: false,
            currentItem: {},
            moduleList: [],

            pageNo: 1,
            pageSize: 10,
            total: 0,
        }),
        [state, setState] = useState(initState),
        [modal, contextHolder] = Modal.useModal();

    // 调用删除接口
    const confirmDelete = (row) => {
        return new Promise((resolve, reject) => {

            rtDb.deleteRole(row.id).then(response => {
                if(0 === response?.code) {
                    getRoleList();
                    return resolve();
                }

                reject();
            }).catch(e => reject());
        });
    }
    // 删除二次确认
    const checkDelete = (record, e) => {
        e.stopPropagation();

        modal.confirm({
            title: `是否删除角色 - ${record.name}?`,
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: '是',
            cancelText: '否',
            onOk: () => confirmDelete(record),
            autoFocusButton: null,
        });
    }
    // 编辑角色
    const editItem = (record, e) => {
        e.stopPropagation();

        setState(o => ({...o, currentItem: record, detailOpen: true}));
    }
    // table字段
    const columns = () => {
        return ([
            {
                title: '角色名称',
                dataIndex: 'name',
            },
            {
                title: '角色描述',
                dataIndex: 'desc',
            },
            {
                title: '创建时间',
                dataIndex: 'created_at',
                width: 180,
                /*
                    Safari 下 new Date('2020-11-16 12:12:12').getTime()会返回NaN
                    原因：Safari不支持 YYYY-MM-DD HH:MM:SS 这个时间格式，需要将此转换成 YYYY/MM/DD HH:MM:SS格式然后在进行转换
                */
                sorter: (a, b) => {
                    return (
                        +new Date(b.createTime.replace(/-/g, '/')) -
                        +new Date(a.createTime.replace(/-/g, '/'))
                    );
                },
                render: (text) => {
                    return dayjs(text).format('YYYY-MM-DD HH:mm:ss')
                }
            },
            {
                title: '更新时间',
                dataIndex: 'updated_at',
                width: 180,
                sorter: (a, b) => {
                    return (
                        +new Date(b.updateTime.replace(/-/g, '/')) -
                        +new Date(a.updateTime.replace(/-/g, '/'))
                    );
                },
                render: (text) => {
                    return dayjs(text).format('YYYY-MM-DD HH:mm:ss')
                }
            },
            {
                title: '操作',
                dataIndex: 'opt',
                className: 'table-ope',
                width: 120,
                fixed: 'right',
                render: (text, record, index) => {
                    return (
                        <div className={styles['opt-td-btn']}>
                            <Button size="small" shape="circle" danger onClick={checkDelete.bind(null, record)}>
                                <DeleteOutlined />
                            </Button>
                            <Tooltip title="编辑"><Button size="small" shape="circle" type="primary" onClick={editItem.bind(null, record)}>
                                <EditOutlined />
                            </Button></Tooltip>
                        </div>
                    );
                },
            },
        ])
    }
    // 获取角色列表
    const getRoleList = async (option={}) => {
        let response = await rtDb.getRoleList();

        if(response?.code === 0) {
            let roleList = response?.data || [];

            setState(o => ({...o, total: 0, roleList}))
        }
    };
    // 获取权限列表
    const getModuleList = async () => {
        let response = await rtDb.getModuleList();
        if(response?.code === 0) {
            let moduleList = response?.data || [];

            setState(o => ({...o, moduleList}));
        }
    };
    // 筛选回调
    const onConfirmSearch = (option={}) => {
        getRoleList(option)
    };
    // 分页页面或pageSize改变后的回调
    const onPaginationChange = (page, pageSize) => {
        setState(o => ({...o, pageNo: page, pageSize}));

        getRoleList({pageNo: page, pageSize});
    }
    // 暂无用
    const onShowSizeChange = (current, size) => {
        setState(o => ({...o, pageNo: 1, pageSize: size}));
        getRoleList({pageNo: 1, pageSize: size});
    }
    // 取消新增、编辑角色
    const onCancel = () => {
        setState(o => ({ ...o, currentItem: {}, detailOpen: false }))
    };
    const onOk = () => {
        setState(o => ({...o, pageNo: 1, currentItem: {}, detailOpen: false}));
        getRoleList({pageNo: 1});
    };


    // didMount生命周期
    useEffect(() => {
        getModuleList();
        getRoleList();

        return () => {};
    }, []);

    return (
        <div className={styles['container']}>
            <div className={styles['search-form']}>
                <FilterForm
                    formItems={[
                        {name: 'name', label: '角色名称', type: 'input', placeholder: '输入角色名称搜索'},
                        {name: 'desc', label: '描述', placeholder: '输入描述搜索', type: 'input'},
                    ]}
                    onReset={onConfirmSearch}
                    onConfirm={onConfirmSearch}
                />
            </div>
            <div className={styles['operate']}>
                <Button
                    type="primary"
                    onClick={() => setState(o => ({ ...o, currentItem: {}, detailOpen: true }))}
                    icon={<PlusCircleOutlined />}
                >
                    新增角色
                </Button>
            </div>
            <div className={styles['list']}>
                <div className={styles['list-content']}>
                    <div className={styles['table-content']}>
                        <div className={styles['table']}>
                            <Table
                                style={{ width: '100%' }}
                                columns={columns()}
                                dataSource={state.roleList || []}
                                rowKey={i => i.id}
                                pagination={{
                                    ...paginationConfig,
                                    total: state?.total || 0,
                                    current: state.pageNo,
                                    pageSize: state.pageSize,
                                    onChange: onPaginationChange,
                                }}
                                loading={state.loading}
                                scroll={{x:1080}}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <RoleDetail
                open={state.detailOpen}
                moduleList={state.moduleList || []}
                roleInfo={state.currentItem || {}}
                onCancel={onCancel}
                onOk={onOk}
            />

            {contextHolder}
        </div>
    );
}