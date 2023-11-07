import { useState, useEffect } from "react";
import { Modal, Tabs, Button, message } from "antd";
import UserForm from "../UserForm";
import styles from './index.module.scss';


export default (props) => {
    const initState = () => ({
            roleList: props.roleList || [],
            userInfo: props.userInfo || {},
            open: props.open || false,
            tabIndex: 'tab1',
        }),
        [state, setState] = useState(initState);

    useEffect(() => {
        setState(o => ({ ...o, roleList: props.roleList || [], userInfo: props.userInfo || {}, open: props.open }))
    }, [props]);

    return (
        <Modal
            title={`${state.userInfo?.id ? '编辑' : '新增'}用户`}
            open={state.open}
            onCancel={props.onCancel}
            className={styles['dialog']}
            footer={null}
        >
            {
                state.userInfo?.id ?
                    <UserForm
                        userInfo={state.userInfo}
                        roleList={state.roleList}
                        onCancel={props.onCancel}
                        onOk={props.onOk}
                    />
                    :
                    <Tabs
                        activeKey={state.tabIndex}
                        onChange={key => setState(o => ({ ...o, tabIndex: key }))}
                        items={
                            [
                                {
                                    key: 'tab1',
                                    label: '手动添加',
                                    children: <UserForm
                                        form={state.userInfo}
                                        roleList={state.roleList}
                                        onCancel={props.onCancel}
                                        onOk={props.onOk}
                                    />
                                },
                                {
                                    key: 'tab2',
                                    label: '批量导入',
                                    children: <div className={styles['batch-import']}>
                                        <Button type="primary">导入</Button>
                                        <a href="#">下载批量导入模板</a>
                                    </div>
                                },
                            ]
                        }
                    />
            }
        </Modal>
    );
}