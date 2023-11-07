import { useState, useEffect } from "react";
import { connect } from 'react-redux';
import { Form, Card, Input, Select, Button, Radio, message } from "antd";
import { isEmail } from '@/utils';
import FileUpload from '@/components/FileUpload';
import styles from './index.module.scss';

import rtDb from '@/../DB';
import dayjs from "dayjs";

const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 20,
    },
};
const getFormData = (input={}) => {
    return {
        id: input.id || '',
        username: input.username || undefined,
        name: input.name || undefined,
        email: input.email || undefined,
        avatar: [],
    };
}

const Account = (props) => {
    const initState = () => ({
            userInfo: props.userInfo || {},
            form: getFormData(props.userInfo || {}),
            submitting: false,
            isEdit: false,
        }),
        [state, setState] = useState(initState),
        [form] = Form.useForm();

    const onCancel = (e) => {
        setState(o => ({...o, isEdit: false}));
        form.resetFields();
    }
    const onOk = () => {};

    useEffect(() => {
        setState(o => ({
            ...o,
            userInfo: props.userInfo || {},
            form: getFormData(props.userInfo || {}),
        }));
    }, [props.userInfo]);

    return (
        <div className={styles['container']}>
            <Card>
                <Form
                    form={form}
                    initialValues={state.form}
                    {...layout}
                    disabled={!state.isEdit}
                >
                    <Form.Item
                        name="id"
                        label="ID"
                    >
                        <div>{state.userInfo?.id}</div>
                    </Form.Item>
                    <Form.Item
                        name="username"
                        label="用户名"
                    >
                        <div>{state.userInfo?.username}</div>
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[
                            { required: true, message: '请输入邮箱地址'},
                            { validator: (_, value) => {
                                if(value && !isEmail(value)) {
                                    return Promise.reject(`请填写正确的邮箱地址`);
                                }
                                return Promise.resolve();
                            }},
                        ]}
                    >
                        <Input placeholder="请输入邮箱地址" />
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="姓名"
                    >
                        <Input placeholder="请输入用户姓名" />
                    </Form.Item>
                    <Form.Item
                        name="avatar"
                        label="头像"
                    >
                        <FileUpload
                            limit={1}
                            placeholder="上传头像"
                        />
                    </Form.Item>
                    <Form.Item
                        name="created_at"
                        label="创建时间"
                    >
                        <div>{dayjs(state.userInfo?.created_at).format('YYYY-MM-DD HH:mm:ss')}</div>
                    </Form.Item>
                </Form>
                <div className={styles['submit']}>
                    {
                        state.isEdit ?
                            <>
                                <Button onClick={onCancel}>取消</Button>
                                <Button loading={state.submitting} onClick={onOk} type="primary">确定</Button>
                            </>
                            :
                            <Button onClick={e => setState(o => ({...o, isEdit: true}))} type="primary">编辑</Button>
                    }
                </div>
            </Card>
        </div>
    );
}

function mapStateToProps({main}) {
    return {
        userInfo: main.userInfo,
    }
}
function mapDispatchToProp(dispatch) {
    return {
        dispatch
    }
}
export default connect(mapStateToProps, mapDispatchToProp)(Account);