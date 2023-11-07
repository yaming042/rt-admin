import { useEffect, useState } from "react";
import { Form, Input, Select, Radio, Popconfirm, Button, Tree, message } from "antd";
import { deepCopy } from "@/utils";
import TagSelect from '@/components/Tags/Select';
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
        return new Promise((resolve, reject) => {
            let t = setTimeout(() => {
                clearTimeout(t);

                rtDb.addModule(values).then(v => {
                    resolve({code: 0, data: v, message: '成功'});
                }).catch(e => {
                    reject({code: -1, data: null, message: e?.message || `新增权限失败`})
                })
            }, 1000);
        });
    };
    const updateModule = (values, moduleId) => {
        return new Promise((resolve, reject) => {
            let t = setTimeout(() => {
                clearTimeout(t);

                rtDb.updateModule(values, moduleId).then(v => {
                    resolve({code: 0, data: moduleId, message: '成功'});
                }).catch(e => {
                    reject({code: -1, data: null, message: e?.message || `更新权限失败`})
                })
            }, 1000);
        });
    };
    const onReset = () => {
        form.resetFields();
        setState(o => ({ ...o, isEdit: false }));
        if(state.isNew) {
            props.onCancel && props.onCancel();
        }
    };

    /*
        保存权限，成功后取消编辑状态，并显示保存的数据
    */
    const onConfirm = () => {
        let {onOk} = props,
            {id} = state?.form;

        form.validateFields().then((values) => {
            setState(o => ({...o, submitting: true}));

            let postData = deepCopy(values);
            (id ? updateModule(postData, id) : newModule(postData)).then(response => {
                setState(o => ({...o, submitting: false}));

                if(response?.code === 0) {
                    message.success(`${id ? '更新' : '新建'}权限成功`);
                    setState(o => ({...o, isEdit: false, isNew: false}));
                    // 新建、更新成功后回调
                    onOk && onOk(id || response?.data || '');
                }else{
                    message.success(response?.message || `${id ? '更新' : '新建'}权限失败`);
                }
            }).catch(e => {
                message.error(e?.message || `${id ? '更新' : '新建'}权限失败`);
                setState(o => ({...o, submitting: false}));
            })
        }).catch(e => {
            setState(o => ({...o, submitting: false}));
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
                    <TagSelect
                        options={state.roleList || []}
                        isReadOnly={!state.isEdit}
                    />
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