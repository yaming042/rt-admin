import { useState, useEffect } from "react";
import { connect } from 'react-redux';
import { Form, Input, Button, Tooltip, message } from 'antd';
import { useHistory } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { HOME, ACCOUNT } from '@/config/url';
import { SET_USER_INFO, SET_INDEX_PAGE } from '@/utils/constant';
import Cookies from "js-cookie";
import styles from './index.module.scss';

import rtDb from '@/../DB';

const Login = (props) => {
    const initState = () => ({
            submitting: false,
            success: false,
        }),
        [state, setState] = useState(initState),
        history = useHistory();

    // 临时注册
    const tempReg = () => {
        rtDb.addUser({username:'tom', name: '汤姆', email: 'tom@test.com', status: 1}).then(r => {
            message.success(`添加成功，立即登录`);
        });
    };
    /*
        获取用户信息，也可以充当判断用户是否登录
    */
    const getUserInfo = () => {
        return new Promise((resolve, reject) => {
            let t = setTimeout(() => {
                clearTimeout(t);

                resolve({code: 0, data: null, message: '成功'});
            }, 500);
        });
    };
    /*
        登录
    */
    const toLogin = (values={}) => {
        return new Promise((resolve, reject) => {
            let t = setTimeout(() => {
                clearTimeout(t);

                resolve(rtDb.login(values));
            }, 1200);
        });
    };
    const onFinish = async (values) => {
        let dispatch = props.dispatch;

        setState(o => ({...o, submitting: true, success: false}));

        try{
            let loginResponse = await toLogin(values);

            if(loginResponse?.code ===0) {
                // 设置cookie
                Cookies.set('rt-admin', loginResponse.data, {expires: 7});
                let userResponse = await getUserInfo();

                if(userResponse?.code === 0) {
                    let userInfo = userResponse?.data || {},
                        purview = userInfo?.modules || [],
                        indexPage = purview[0] || ACCOUNT; // TODO，默认第一个页面

                    setState(o => ({...o, submitting: false, success: true}));
                    message.success(`登录成功，即将跳转`);

                    // 记录用户信息
                    dispatch && dispatch({
                        type: SET_USER_INFO,
                        value: {...userInfo, avatar:'/images/logo_150.png'}
                    });
                    dispatch && dispatch({
                        type: SET_INDEX_PAGE,
                        value: indexPage,
                    });

                    // 跳转页面
                    let t = setTimeout(() => {
                        clearTimeout(t);

                        history.push(HOME);
                    }, 1200);
                }
            }
        }catch(e){
            setState(o => ({...o, submitting: false, success: false}));
            message.error(e?.message || `登录失败`);
        }
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
                    placeholder="请输入密码（默认密码: 123456）"
                />
            </Form.Item>
            <Form.Item>
                <Button loading={state.submitting} disabled={state.submitting || state.success} type="primary" htmlType="submit" className="login-form-button" block>登录</Button>
            </Form.Item>

            <div className={styles['temp-div']}>
                <Tooltip title="首次使用本地没有用户数据，可点击插入一条后继续登录【用户名: tom，密码: 123456】，这里是临时代码！">
                    <span onClick={tempReg}>注册</span>
                </Tooltip>
            </div>
        </Form>
    );
}

function mapDispatchToProp(dispatch) {
    return {
        dispatch
    }
}
export default connect(null, mapDispatchToProp)(Login);