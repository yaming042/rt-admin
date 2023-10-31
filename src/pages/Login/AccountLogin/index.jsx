import { useState, useEffect } from "react";
import { Form, Input, Button, message } from 'antd';
import { useHistory } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { HOME } from '@/config/url';
import Cookies from "js-cookie";
import styles from './index.module.scss';

export default (props) => {
    const initState = () => ({
            submitting: false,
            success: false,
        }),
        [state, setState] = useState(initState),
        history = useHistory();

    const onFinish = (values) => {
        setState(o => ({...o, submitting: true, success: false}));

        let t = setTimeout(() => {
            clearTimeout(t);

            setState(o => ({...o, submitting: false, success: true}));

            Cookies.set('rt-admin', true);
            message.success(`登录成功，即将跳转`);

            let tt = setTimeout(() => {
                clearTimeout(tt);

                history.push(HOME);
            }, 500);
        }, 1000);
    };

    return (
        <Form
            name="account_login_form"
            className={styles['account-login-form']}
            onFinish={onFinish}
        >
            <div className={styles['title']}>欢迎登录</div>
            <Form.Item
                name="username"
                rules={[
                    {
                        required: true,
                        message: '请输入用户名',
                    },
                ]}
            >
                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item
                name="password"
                rules={[
                    {
                        required: true,
                        message: '请输入密码',
                    },
                ]}
            >
                <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="请输入密码"
                />
            </Form.Item>
            <Form.Item>
                <Button loading={state.submitting} disabled={state.submitting || state.success} type="primary" htmlType="submit" className="login-form-button" block>登录</Button>
            </Form.Item>
        </Form>
    );
}