import React, { useEffect, useMemo, useState } from 'react';
import { Input, Tree } from 'antd';
import { tree2array, deepCopy } from '@/utils';
import { FontSizeOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

const { Search } = Input;

const getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
            if (node.children.some((item) => item.key === key)) {
                parentKey = node.key;
            } else if (getParentKey(key, node.children)) {
                parentKey = getParentKey(key, node.children);
            }
        }
    }
    return parentKey;
};
const map2Tree = (array = [], level = 1) => {
    return array.map(item => {
        item.data = deepCopy(item);
        item.key = item.id;
        item.title = item.name;
        item.level = level;
        item.selectable = false;

        if (item.children) item.children = map2Tree(item.children, level + 1);

        return item;
    })
};
const getDataForm = (data=[]) => {
    let result = [];
    (data || []).map((item, index) => {
        let one = {pid: item.pid, id: item.id, sort: index};
        result.push(one);

        if(item.children && item.children.length) {
            let r = getDataForm(item.children);

            result = result.concat(r);
        }
    })

    return result;
};


export default (props) => {
    const initState = () => ({
            expandedKeys: [],
            expandedKeysBak: [],
            selectedKeys: [],
            checkedKeys: [],
            searchValue: '',
            autoExpandParent: '',

            categoryTree: [],
            dataList: [],
        }),
        [state, setState] = useState(initState);

    const onExpand = (newExpandedKeys) => setState(o => ({...o, expandedKeys: newExpandedKeys, autoExpandParent: false}));

    const onChange = (e) => {
        const { value } = e.target,
            newExpandedKeys = (state?.dataList || []).map((item) => {
                if (value && (item.title.indexOf(value) > -1 || (item.alias||'').indexOf(value) > -1)) {
                    return getParentKey(item.key, state?.categoryTree);
                }
                return null;
            })
            .filter((item, i, self) => item && self.indexOf(item) === i);

        setState(o => ({...o, expandedKeys: newExpandedKeys, searchValue: value, autoExpandParent: true}));
    };

    // 选中一个节点
    const onSelect = (selectedKeys) => {
        setState(o => ({...o, selectedKeys}));

        let id = selectedKeys[0] || '',
            categoryData = (state?.dataList || []).find((i) => i.key === id);

        props?.onSelect && props?.onSelect(categoryData?.data);
    };
    const onCheck = (checkedKeys) => {
        setState(o => ({...o, checkedKeys}));
        let data = (state?.dataList || []).filter((i) => checkedKeys.includes(i.key));

        props?.onCheck && props?.onCheck(data);
    };
    const callback = (item, type, e) => {
        e.stopPropagation();

        props.callback && props.callback(item, type);
    }

    const onDragEnter = (info) => {};
    const onDrop = (info) => {
        const dropKey = info.node.key,
            dragKey = info.dragNode.key,
            dropPos = info.node.pos.split('-'),
            dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

        const loop = (data, key, callback) => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].key === key) {
                    return callback(data[i], i, data);
                }
                if (data[i].children) {
                    loop(data[i].children, key, callback);
                }
            }
        };
        const data = [...state?.categoryTree];

        let dragObj;
        loop(data, dragKey, (item, index, arr) => {
            arr.splice(index, 1);
            dragObj = item;
        });
        if (!info.dropToGap) {
            loop(data, dropKey, (item) => {
                item.children = item.children || [];
                item.children.unshift(dragObj);
            });
        } else if (
            (info?.node?.props?.children || []).length > 0 &&
            info?.node?.props?.expanded &&
            dropPosition === 1
        ) {
            loop(data, dropKey, (item) => {
                item.children = item.children || [];
                item.children.unshift(dragObj);
            });
        } else {
            let ar = [];
            let i;
            loop(data, dropKey, (_item, index, arr) => {
                ar = arr;
                i = index;
            });
            if (dropPosition === -1) {
                ar.splice(i, 0, dragObj);
            } else {
                ar.splice(i + 1, 0, dragObj);
            }
        }

        let o = getDataForm(deepCopy(data));
        // 更新排序
        // updateOrder(o).then(() => {
        //     setCategoryTree(data);
        // }).catch(e => {})
    };

    const treeData = useMemo(() => {
        const loop = (data) => {
            return data.map((item) => {
                const strTitle = item.title,
                    index = strTitle.indexOf(state?.searchValue),
                    beforeStr = strTitle.substring(0, index),
                    afterStr = strTitle.slice(index + state?.searchValue.length),
                    title = index > -1 ?
                        <span>
                            {beforeStr}
                            <span className="site-tree-search-value">{state?.searchValue || ''}</span>
                            {afterStr}
                        </span>
                        :
                        <span>{strTitle}</span>;

                if (item.children) {
                    return {
                        data: item.data,
                        title,
                        key: item.key,
                        children: loop(item.children),
                        level: item.level,
                    };
                }

                return {
                    data: item.data,
                    title,
                    key: item.key,
                    level: item.level,
                };
            });
        };

        return loop((state?.categoryTree || []).slice(0));
    }, [state.searchValue, state?.categoryTree]);

    useEffect(() => {
        let categoryTree = map2Tree(props.dataSource || []),
            dataList = tree2array(categoryTree);

        setState(o => ({...o, categoryTree, dataList}));
    }, [props.dataSource]);
    useEffect(() => {
        setState(o => ({...o, checkedKeys: props.value}));
    }, [props.value]);

    return (
        <div className={styles['container']}>
            <Search
                style={{ marginBottom: 8 }}
                placeholder="输入关键字进行搜索"
                onChange={onChange}
            />
            <Tree.DirectoryTree
                className={styles['tree']}
                onExpand={onExpand}
                expandedKeys={state.expandedKeys}
                autoExpandParent={state.autoExpandParent}
                selectedKeys={state.selectedKeys}
                checkedKeys={state.checkedKeys}
                treeData={treeData}
                showIcon={false}
                onSelect={onSelect}
                onCheck={onCheck}
                blockNode={true}
                draggable={props.draggable || false}
                checkable={props.checkable || false}
                selectable={props.selectable || false}
                onDragEnter={onDragEnter}
                onDrop={onDrop}
                titleRender={(o) => {
                    return (
                        <div className={styles['custom-tree-wrap']}>
                            <div className={styles['label']}>{o.title}</div>
                            {
                                typeof(props.callback) === 'function' ?
                                    <div className={styles['opt']}>
                                        <span onClick={callback.bind(null, o, 'delete')}><DeleteOutlined /></span>
                                    </div>
                                    :
                                    null
                            }
                        </div>
                    );
                }}
            />
        </div>
    );
};
