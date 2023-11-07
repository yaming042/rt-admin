import React, { useEffect, useState } from 'react';
import { Select, Space, Tag, Tooltip } from 'antd';


const getValue = (value) => {
    let v = undefined;
    if(typeof value === 'string') {
        v = (value || '').split(',').filter(Boolean);
    }else if(Object.prototype.toString.call(value) === '[object Array]') {
        v = value;
    }

    return v;
};

const Tags = (props) => {
    const initState = () => ({
            options: [],
            disabled: true,
            tags: [],
        }),
        [state, setState] = useState(initState),
        onChange = props.onChange;

    // 获取options，已经选中的就删除掉
    const getOptions = () => {
        let {options, tags} = state;

        return options.filter(i => !tags.includes(i.id)).map(i => {
            return {
                key: i.id,
                value: i.id,
                label: i.name,
            }
        })
    };
    // 移除一个角色
    const onRemove = (removedTag) => {
        const newTags = (state.tags || []).filter(id => id !== removedTag);

        onChange && onChange(newTags);
    };
    // 选中一个角色
    const onSelect = (v) => {
        let {tags=[]} = state;
        tags = Array.from(new Set(tags.concat(v)));

        onChange && onChange(tags);
    };

    useEffect(() => {
        setState(o => ({
            ...o,
            options: props.options || [],
            disabled: props.isReadOnly || false,
            tags: getValue(props.value),
        }));
    }, [props]);

    return (
        <Space size={[0, 8]} wrap>
            {(state.tags || []).map((id, index) => {
                let name = (state.options || []).find(i => i.id === id)?.name || '',
                    isLongTag = name.length > 20,
                    tagElem = (
                        <Tag
                            key={id}
                            closable={!state.disabled}
                            onClose={() => onRemove(id)}
                            style={{lineHeight:'30px'}}
                        >
                            <span>
                                {isLongTag ? `${name.slice(0, 20)}...` : name}
                            </span>
                        </Tag>
                    );

                return isLongTag ? (
                    <Tooltip title={name} key={id}>
                        {tagElem}
                    </Tooltip>
                ) : (
                    tagElem
                );
            })}

            {!state.disabled ?
                <Select
                    style={{width:160}}
                    placeholder="配置角色"
                    onChange={onSelect}
                    options={getOptions()}
                    getPopupContainer={e => e.parentNode}
                />
                :
                (
                    (state.tags || []).length ? null : <span style={{color:'#ccc',paddingLeft:11}}>暂未配置角色</span>
                )
            }
        </Space>
    );
};
export default Tags;