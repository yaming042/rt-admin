import { useState, useEffect } from 'react';
import { Tag, Button, Checkbox, Modal, Select, Dropdown, Input } from 'antd';
import { EditOutlined, CloseOutlined, CheckOutlined, ExclamationCircleOutlined, PlusCircleOutlined, DeleteOutlined, MoreOutlined, PoweroffOutlined, FontSizeOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

export default (props) => {
    const initState = () => ({
            roleList: props.roleList || [],
            ids: props.value || [],
        }),
        [state, setState] = useState(initState);

    useEffect(() => {
        setState(o => ({...o, ids: props.value, roleList: props.roleList}));
    }, [props.value, props.roleList]);

    return (
        <div className={styles['container']}>
            <div className={styles['role-container']}>
                <div className={styles['title']}>
                    已配置角色（{(state.roleIds || []).length}个）
                    {
                        state.isEdit||true ?
                            <Button
                                icon={<PlusCircleOutlined />}
                                type="primary"
                                onClick={() => setState(o => ({...o, checkedUserIds: (state.tempUserIds || []).slice(0), addUserOpen: true}))}
                            >
                                配置角色
                            </Button>
                            :
                            null
                    }
                </div>
                <div className={styles['role-list']}>
                    {
                        ((state.isEdit ? state.tempUserIds : state.roleIds) || []).length ?
                            (state.roleList || []).filter(i => ((state.isEdit ? state.tempUserIds : state.roleIds) || []).includes(i.id)).map((item, index) => {
                                return <Tag key={item.id} closable={state.isEdit} onClose={removeUser.bind(null, item)}>{item.name}</Tag>
                            })
                            :
                            <div className={styles['empty']}>暂未配置角色</div>
                    }
                </div>
            </div>
        </div>
    );
};