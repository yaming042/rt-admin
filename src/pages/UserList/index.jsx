import { useEffect, useState } from "react";
import { Table, Modal, Button, Tag, Tooltip } from "antd";
import FilterForm from "@/components/FilterForm";
// import UserDetail from "./UserDetail";
import { DeleteOutlined, EditOutlined, PlusCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { paginationConfig, COLORS } from "@/config";
import request from '@/utils/request';
// import { QUERY_USER_LIST_PAGE, QUERY_ROLE_LIST } from '@/config/url';
import styles from './index.module.scss';

export default () => {
    const initState = () => ({
            loading: false,
            userList: [],
            detailOpen: false,
            currentItem: {},
            roleList: [],

            pageNo: 1,
            pageSize: 10,
            total: 0,
        }),
        [state, setState] = useState(initState),
        [modal, contextHolder] = Modal.useModal();

    // 调用删除接口
    const confirmDelete = (row) => {
        return new Promise((resolve, reject) => {
            let t = setTimeout(() => {
                clearTimeout(t);

                resolve()
            }, 3000)
        });
    }
    // 删除二次确认
    const checkDelete = (record, e) => {
        e.stopPropagation();

        modal.confirm({
            title: `是否确认删除用户 - ${record.username}?`,
            icon: <ExclamationCircleOutlined />,
            content: '',
            okText: '是',
            cancelText: '否',
            onOk: () => confirmDelete(record),
            autoFocusButton: null,
        });
    }
    // 编辑用户
    const editItem = (record, e) => {
        e.stopPropagation();

        setState(o => ({...o, currentItem: record, detailOpen: true}));
    }
    // table字段
    const columns = () => {
        return ([
            {
                title: '用户名',
                dataIndex: 'username',
            },
            {
                title: '手机号码',
                dataIndex: 'phone',
            },
            {
                title: '角色',
                dataIndex: 'roles',
                render: (text, record) => {
                    return (text || []).map((item, index) => <Tag key={index} color={COLORS[index%20]} >{item.name}</Tag>);
                }
            },
            {
                title: '创建时间',
                dataIndex: 'createTime',
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
            },
            {
                title: '更新时间',
                dataIndex: 'updateTime',
                width: 180,
                sorter: (a, b) => {
                    return (
                        +new Date(b.updateTime.replace(/-/g, '/')) -
                        +new Date(a.updateTime.replace(/-/g, '/'))
                    );
                },
            },
            {
                title: '操作',
                dataIndex: 'opt',
                className: 'table-ope',
                width: 80,
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
    // 获取用户列表 - 分页
    const getUserPageList = (option={}) => {
        setState(o => ({...o, total: 0, userList: []}))
    };
    // 获取角色列表
    const getRoleList = () => {
        setState(o => ({...o, roleList: []}));
    };
    // 筛选回调
    const onConfirmSearch = (option={}) => {
        getUserPageList(option)
    };
    // 分页页面或pageSize改变后的回调
    const onPaginationChange = (page, pageSize) => {
        setState(o => ({...o, pageNo: page, pageSize}));

        getUserPageList({pageNo: page, pageSize});
    }
    // 暂无用
    const onShowSizeChange = (current, size) => {
        setState(o => ({...o, pageNo: 1, pageSize: size}));
        getUserPageList({pageNo: 1, pageSize: size});
    }
    // 取消新增、编辑用户
    const onCancel = () => {
        setState(o => ({ ...o, currentItem: {}, detailOpen: false }))
    };
    const onOk = () => {
        setState(o => ({...o, pageNo: 1, currentItem: {}, detailOpen: false}));
        getUserPageList({pageNo: 1});
    };


    // didMount生命周期
    useEffect(() => {
        getUserPageList();
        getRoleList();

        return () => {};
    }, []);

    return (
        <div className={styles['container']}>
            <div className={styles['search-form']}>
                <FilterForm
                    formItems={[
                        {name: 'username', label: '用户名', type: 'input', placeholder: '输入用户名搜索'},
                        {name: 'phone', label: '手机号码', placeholder: '输入手机号搜索', type: 'input'},
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
                    新增用户
                </Button>
            </div>
            <div className={styles['list']}>
                <div className={styles['list-content']}>
                    <div className={styles['table-content']}>
                        <div className={styles['table']}>
                            <Table
                                style={{ width: '100%' }}
                                columns={columns()}
                                dataSource={state.userList || []}
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

            {/* <UserDetail
                open={state.detailOpen}
                roleList={state.roleList || []}
                userInfo={state.currentItem || {}}
                onCancel={onCancel}
                onOk={onOk}
            /> */}

            {contextHolder}
        </div>
    );
}