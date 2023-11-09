import { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import CommonTree from '@/components/Tree';
import request from '@/utils/request';
// import { ADD_ROLE } from '@/config/url';
import styles from './index.module.scss';

const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 20,
    },
}
const getFormData = (input={}) => {
    return {
        name: input.name || undefined,
        desc: input.desc || undefined,
        users: (input.users || []),
        modules: (input.modules || []),
    };
}

// 公共树组件
const ModuleTree = (props) => {
    const {value, onChange} = props;

    return (
        <CommonTree
            {...props}
            draggable={false}
            checkable={true}
            onCheck={v => onChange(v.map(i => i.id))}
        />
    );
};

export default (props) => {
    const initState = () => {
            let roleInfo = props.roleInfo || {},
                formValue = getFormData(roleInfo);

            return ({
                userList: [],
                roleInfo,
                moduleList: props.moduleList || [],
                form: formValue,
                open: props.open || false,
                submitting: false,
            })
        },
        [state, setState] = useState(initState),
        [form] = Form.useForm();

    const getUserList = async () => {
        let response = {code:0,data: [],message:'成功'};

        if(response?.code === 0) {
            let userList = response?.data || [];

            setState(o => ({...o, userList}))
        }
    };

    const onCancel = () => {
        form.resetFields();
        props.onCancel && props.onCancel();
    }
    const onConfirm = () => {
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
        })
    };

    useEffect(() => {
        let roleInfo = props.roleInfo || {},
            formValue = getFormData(roleInfo);

        setState(o => ({
            ...o,
            moduleList: props.moduleList || [],
            open: props.open,
            roleInfo,
            form: formValue,
        }))
    }, [props]);
    useEffect(() => {
        getUserList();
    }, []);

    return (
        <Modal
            title={`${state?.roleInfo?.id ? '编辑' : '新建'}角色`}
            open={state.open}
            onCancel={onCancel}
            className={styles['dialog']}
            footer={null}
        >
            <Form
                form={form}
                initialValues={state.form}
                {...layout}
            >
                <Form.Item
                    name="name"
                    label="角色名称"
                    rules={[
                        { required: true, },
                    ]}
                >
                    <Input placeholder="请输入角色名称" />
                </Form.Item>
                <Form.Item
                    name="desc"
                    label="描述"
                >
                    <Input placeholder="请输入描述" />
                </Form.Item>
                <Form.Item
                    name="users"
                    label="用户"
                >
                    <Select
                        placeholder="请选择用户"
                        mode="multiple"
                        allowClear={true}
                        style={{ width: '100%' }}
                        options={(state.userList || []).map(item => ({ value: item.id, label: item.username }))}
                    />
                </Form.Item>
                <Form.Item
                    name="modules"
                    label="权限"
                >
                    <ModuleTree
                        dataSource={state.moduleList || []}
                    />
                </Form.Item>

                <div className={styles['submit']}>
                    <Button onClick={onCancel}>取消</Button>
                    <Button loading={state.submitting} onClick={onConfirm} type="primary">确定</Button>
                </div>
            </Form>
        </Modal>
    );
}