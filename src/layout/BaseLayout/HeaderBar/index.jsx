import React, { useState, useEffect } from 'react';
import {connect} from 'react-redux';
import { Dropdown, Badge, message} from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { LOGOUT, HOME } from '@/config/url';
import request from '@/utils/request';
import styles from './index.module.scss';


const HeaderBar = (props) => {
    const [userInfo, setUserInfo] = useState({});

    const accountDropdownItems = () => {
        let name = userInfo?.name || userInfo?.login || '',
            char = name.charAt().toUpperCase();

        return [
            {
                key: '1',
                className: styles['text'],
                label: (<div className={styles['user-name']}>
                    <span>
                        {
                            userInfo?.avatar_url ? <img src={userInfo?.avatar_url || ''} /> : char
                        }
                    </span>
                    <div>{name}</div>
                </div>)
            },
            {
                type: 'divider'
            },
            {
                key: 'logout',
                label: (<div className={styles['menu-item-content']}>
                    <LogoutOutlined />
                    退出登录
                </div>),
            }
        ]
    }

    const logout = () => {
        request(LOGOUT).then(response => {
            if(response?.code === 0) {
                location.href = BASEDIR || '/';
            }else{
                message.error(response?.message || '退出失败')
            }
        });
    }

    const accountMenuClick = ({key}) => {
        if('logout' === key){
            logout();
        }
    };

    useEffect(() => {
        setUserInfo(props.userInfo || {});
    }, [props.userInfo]);

    return (
        <div className={styles['header']}>
            <div className={styles['logo']}>
                <a href={BASEDIR}>RT-Admin</a>
            </div>
            <div className={styles['operation']}>
                <div className={styles['account']}>
                    <Dropdown
                        menu={{
                            items: accountDropdownItems(),
                            onClick: accountMenuClick
                        }}
                        placement="bottomRight"
                        arrow
                    >
                        <Badge>
                            <div className={styles['avatar']}>
                                {
                                    userInfo?.avatar_url ?
                                        <img src={userInfo?.avatar_url || ''} />
                                        :
                                        (userInfo?.name || userInfo?.login || '').charAt().toUpperCase()
                                }
                            </div>
                        </Badge>
                    </Dropdown>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = ({main}) => main;
const mapDispatchToProp = (dispatch) => {
    return {dispatch}
};

export default connect(mapStateToProps, mapDispatchToProp)(HeaderBar);