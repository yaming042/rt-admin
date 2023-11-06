import { useState, useEffect } from "react";
import { Modal, Tabs, Form, Input, Select, Button, message } from "antd";
import request from '@/utils/request';
// import {ADD_USER} from '@/config/url';
import {isMobile} from '@/utils';
import styles from './index.module.scss';

const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 20,
    },
}

const UserForm = (props) => {
    const initState = () => ({
        form: {
            username: props?.userInfo?.username || '',
            phone: props?.userInfo?.phone || '',
            roles: props?.userInfo?.roles || [],
        },
        roleList: props?.roleList || [],
    }),
        [state, setState] = useState(initState),
        [form] = Form.useForm();

    const onReset = (e) => {
        form.resetFields();

        props.onReset && props.onReset();
    }
    const onConfirm = (e) => {
        form.validateFields().then(values => {
            props.onConfirm && props.onConfirm(values);
        }).catch(e => {
            console.log(e);
        });
    }

    useEffect(() => {
        setState(o => ({
            ...o,
            form: {
                username: props?.userInfo?.username || '',
                phone: props?.userInfo?.phone || '',
                roles: props?.userInfo?.roles || [],
            },
            roleList: props?.roleList || [],
        }));
    }, [props]);

    return (
        <Form
            form={form}
            initialValues={state.form}
            {...layout}
        >
            <Form.Item
                name="username"
                label="用户名"
                rules={[
                    { required: true, message: '请输入用户名'},
                ]}
            >
                <Input placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item
                name="phone"
                label="手机号码"
                rules={[
                    { required: true, message: '请输入手机号码'},
                    { validator: (_, value) => {
                        if(value && !isMobile(value)) {
                            return Promise.reject(`请填写正确的手机号`);
                        }
                        return Promise.resolve();
                    }},
                ]}
            >
                <Input placeholder="请输入手机号码" />
            </Form.Item>
            <Form.Item
                name="roles"
                label="用户角色"
            >
                <Select
                    placeholder="请选择用户角色"
                    mode="multiple"
                    allowClear={true}
                    style={{ width: '100%' }}
                    options={(state.roleList || []).map(item => ({ value: item.id, label: item.username }))}
                />
            </Form.Item>

            <div className={styles['submit']}>
                <Button onClick={onReset}>取消</Button>
                <Button onClick={onConfirm} type="primary">确定</Button>
            </div>
        </Form>
    );
};

export default (props) => {
    const initState = () => ({
        roleList: props.roleList || [],
        userInfo: props.userInfo || {},
        open: props.open || false,
        tabIndex: 'tab1',
    }),
        [state, setState] = useState(initState);

    const onConfirm = (values = {}) => {
        let postData = {phone: values.phone, username: values.username};

        props.onOk && props.onOk();
        message.success(`成功`);

        // request(ADD_USER, {method: 'post', data: postData}).then(response => {
        //     if(response?.code === '0') {
        //         props.onOk && props.onOk();
        //         message.success(`成功`);
        //     }else{
        //         console.log(response?.message);
        //     }
        // })
    };

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
                        onReset={props.onCancel}
                        onConfirm={onConfirm}
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
                                        onReset={props.onCancel}
                                        onConfirm={onConfirm}
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