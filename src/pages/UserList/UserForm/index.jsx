import { useState, useEffect } from "react";
import { Form, Input, Select, Button, Radio, message } from "antd";
import { isEmail } from '@/utils';
import styles from './index.module.scss';


const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 20,
    },
};

// "++id,username,name,email,status,roles,created_at,updated_at,deleted_at"
const getFormData = (input={}) => {
    return {
        username: input.username || undefined,
        name: input.name || undefined,
        email: input.email || undefined,
        status: input.status === 0 ? 0 : 1,
        roles: (input.roles || []),
    };
}
const UserForm = (props) => {
    const initState = () => ({
            form: getFormData(props.userInfo || {}),
            roleList: props?.roleList || [],
            submitting: false,
        }),
        [state, setState] = useState(initState),
        [form] = Form.useForm();

    const onCancel = (e) => {
        form.resetFields();

        props.onCancel && props.onCancel();
    }
    const onOk = (e) => {
        form.validateFields().then(values => {
            setState(o => ({...o, submitting: true}));

            Promise.resolve().then(response => {
                setState(o => ({...o, submitting: false}));

                if(0 === response?.code) {
                    props.onOk && props.onOk();
                }
            }).catch(e => {
                setState(o => ({...o, submitting: false}));
            });
        }).catch(e => {
            setState(o => ({...o, submitting: false}));
        });
    }

    useEffect(() => {
        setState(o => ({
            ...o,
            form: getFormData(props.userInfo || {}),
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
                <Input placeholder="请输入用户名(登录时使用)" />
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
                name="roles"
                label="用户角色"
            >
                <Select
                    placeholder="请选择用户角色"
                    mode="multiple"
                    allowClear={true}
                    style={{ width: '100%' }}
                    options={(state.roleList || []).map(item => ({ value: item.id, label: item.name }))}
                />
            </Form.Item>
            <Form.Item
                name="status"
                label="状态"
            >
                <Radio.Group>
                    <Radio value={1}>启用</Radio>
                    <Radio value={0}>禁用</Radio>
                </Radio.Group>
            </Form.Item>

            <div className={styles['submit']}>
                <Button onClick={onCancel}>取消</Button>
                <Button loading={state.submitting} onClick={onOk} type="primary">确定</Button>
            </div>
        </Form>
    );
};

export default UserForm;