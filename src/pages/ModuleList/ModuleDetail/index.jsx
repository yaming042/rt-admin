import { useEffect, useState } from "react";
import { Form, Input, Select, Radio, Button, Tree, message } from "antd";
import { deepCopy } from "@/utils";
import RoleList from "./../RoleList";
import styles from './index.module.scss';

import rtDb from '@/../DB';

const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 18,
    },
};
const flatterTree = (tree) => {
    let result = [];

    tree.map((item) => {
        result.push({ ...item });

        if (item.children && item.children.length) {
            let re = flatterTree(item.children);

            result = result.concat(re);
        }
    });

    return result;
};
// 处理menuList成Tree组件需要的数据结构
const handleMenuForTree = (data = [], level=1) => {
    return (data || []).map((item) => {
        let { children, ...one } = item;
        one['key'] = item.id;
        one['title'] = item.name;
        one['checkable'] = level <= 2;

        if (children && children.length) {
            let res = handleMenuForTree(children, level+1);

            one['children'] = res;
        }

        return one;
    });
};
const arrayToTree = (list = []) => {
    let result = [],
        itemMap = {};

    for (const item of list) {
        let id = item.id,
            pid = item.parentId;

        if (!itemMap[id]) {
            itemMap[id] = { children: [] }
        }
        itemMap[id] = {
            ...item,
            children: itemMap[id]['children']
        }
        const treeItem = itemMap[id];
        if (pid === '0') {
            result.push(treeItem);
        } else {
            if (!itemMap[pid]) {
                itemMap[pid] = { children: [] }
            }
            itemMap[pid].children.push(treeItem)
        }
    }

    return result;
};
const menuOptions = (tree = []) => {
    let menuList = flatterTree(tree || []),
        allMenuList = [{ id: '0', name: '根节点' }].concat(menuList);

    return allMenuList.map((item) => {
        return {
            ...item,
            value: item.id,
            label: item.name,
        };
    });
};

const getFormValue = (moduleData = {}) => {
    return {
        id: moduleData.id || undefined,
        pid: moduleData.pid || '0',
        name: moduleData.name || undefined,
        desc: moduleData.desc || undefined,
        code: moduleData.code || undefined,
        type: moduleData.type || '0',
        roles: moduleData.roles || [],
    }
};

export default (props) => {
    const initState = () => {
        let formData = getFormValue(props.moduleData || {});

            return {
                form: formData,
                isEdit: false,
                isNew: false,
                moduleTreeData: handleMenuForTree(props.moduleTreeData || []),
                submitting: false,
                roleList: props.roleList || [],
            }
        },
        [state, setState] = useState(initState),
        [form] = Form.useForm();

    const newModule = (values) => {
        rtDb.addModule(values).then(() => {
            setState(o => ({...o, submitting: false}));
            props.onOk && props.onOk();
        });
    };
    const updateModule = (values, moduleId) => {
        rtDb.updateModule(values, moduleId).then(() => {
            setState(o => ({...o, submitting: false}));
            props.onOk && props.onOk();
        });
    };
    const onReset = () => {
        form.resetFields();
        setState(o => ({ ...o, isEdit: false }));
        if(state.isNew) {
            props.onCancel && props.onCancel();
        }
    };
    const onConfirm = () => {
        // ++id,pid,order,code,name,desc,type,created_at,updated_at,deleted_at
        form.validateFields().then(values => {
            console.log(1, values);

            setState(o => ({...o, submitting: true}));

            let postData = deepCopy(values);

            if(state.form?.id) {
                updateModule(postData, state.form?.id);
            }else{
                newModule(postData);
            }

        }).catch(e => {
            console.log(e);
        })
    };
    const toEdit = () => {
        setState(o => ({ ...o, isEdit: true }));
    };

    const onFieldsChange = () => {};

    useEffect(() => {
        let formData = getFormValue(props.moduleData || {}),
            isNew = props.moduleData?.isNew || false, // 默认都是非编辑状态，只有新建时是编辑状态
            isEdit = isNew ? true : state.isEdit;

        setState(o => ({
            ...o,
            form: formData,
            isEdit,
            isNew,
            moduleTreeData: handleMenuForTree(props.moduleTreeData || []),
            roleList: props.roleList || [],
        }));

        form.setFieldsValue(formData);
    }, [props]);

    return (
        <div className={styles['container']}>
            {state.isNew ? <div className={styles['title']}>新建权限</div> : null}
            <Form
                form={form}
                initialValues={state.form}
                {...layout}
                disabled={!state.isEdit}
                onFieldsChange={onFieldsChange}
            >
                <Form.Item
                    name="pid"
                    label="父级权限"
                    rules={[
                        {required:true, message: '请选择父级权限'}
                    ]}
                >
                    <Select
                        style={{ width: '100%' }}
                        placeholder={state.isEdit ? "选择父级权限" : ''}
                        options={menuOptions(state.moduleTreeData || [])}
                        getPopupContainer={(e) => e.parentNode}
                        dropdownRender={(menu) => {
                            let treeData = [{ key: '0', title: '根节点', children: (state.moduleTreeData || []) }];
                            return (
                                <Tree
                                    rootClassName={styles['tree-container']}
                                    checkable
                                    selectable={false}
                                    defaultExpandAll={true}
                                    checkedKeys={[form.getFieldValue('pid')].filter(Boolean).slice(0, 1)}
                                    onCheck={(checkedKeys, target) => {
                                        let id = target?.node?.id || '0';
                                        form.setFieldValue('pid', id);
                                    }}
                                    treeData={treeData}
                                    checkStrictly={true}
                                />
                            );
                        }}
                    />
                </Form.Item>
                <Form.Item
                    name="code"
                    label="权限代码"
                    rules={[
                        {required:true, message: '请填写权限代码'}
                    ]}
                >
                    <Input placeholder="请填写权限代码" />
                </Form.Item>
                <Form.Item
                    name="name"
                    label="权限名称"
                    rules={[
                        {required:true, message: '请填写权限名称'}
                    ]}
                >
                    <Input placeholder="请填写权限名称" />
                </Form.Item>
                <Form.Item
                    name="type"
                    label="资源类型"
                    rules={[
                        {required:true, message: '请选择资源类型'}
                    ]}
                >
                    <Select
                        style={{width:'100%'}}
                        placeholder="请选择资源类型"
                        options={[
                            {key: '0', value: '0', label: '菜单'},
                            {key: '1', value: '1', label: '接口'},
                        ]}
                    />
                </Form.Item>
                <Form.Item
                    name="desc"
                    label="权限描述"
                >
                    <Input.TextArea rows={2} placeholder={state.isEdit?"请填权限描述":''} />
                </Form.Item>
                <Form.Item
                    name="roles"
                    label="角色"
                >
                    <RoleList roleList={state.roleList || []} />
                </Form.Item>
            </Form>
            <div className={styles['submit']}>
                {
                    state.isEdit ?
                        <>
                            <Button onClick={onReset}>取消</Button>
                            <Button loading={state.submitting} onClick={onConfirm} type="primary">保存</Button>
                        </>
                        :
                        <Button onClick={toEdit} type="primary">编辑</Button>
                }
            </div>
        </div>
    );
}