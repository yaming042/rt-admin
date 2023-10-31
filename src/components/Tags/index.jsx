import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Input, Space, Tag, theme, Tooltip } from 'antd';

const Tags = (props) => {
    const onChange = props.onChange;
    const { token } = theme.useToken();
    const [tags, setTags] = useState([]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [editInputIndex, setEditInputIndex] = useState(-1);
    const [editInputValue, setEditInputValue] = useState('');
    const inputRef = useRef(null);
    const editInputRef = useRef(null);

    useEffect(() => {
        if (inputVisible) {
            inputRef.current?.focus();
        }
    }, [inputVisible]);
    useEffect(() => {
        editInputRef.current?.focus();
    }, [editInputValue]);
    useEffect(() => {
        if(typeof props.value === 'string') {
            setTags((props.value || '').split(',').filter(Boolean));
        }else if(Object.prototype.toString.call(props.value) === '[object Array]') {
            setTags(props.value);
        }else{
            setTags([]);
        }
    }, [props.value]);

    const handleClose = (removedTag) => {
        const newTags = tags.filter((tag) => tag !== removedTag);
        setTags(newTags);
        onChange && onChange(newTags);
    };
    const showInput = () => {
        setInputVisible(true);
    };
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };
    const handleInputConfirm = () => {
        if (inputValue && !tags.includes(inputValue)) {
            setTags([...tags, inputValue]);
            onChange && onChange([...tags, inputValue]);
        }
        setInputVisible(false);
        setInputValue('');
    };
    const handleEditInputChange = (e) => {
        setEditInputValue(e.target.value);
    };
    const handleEditInputConfirm = () => {
        const newTags = [...tags];
        newTags[editInputIndex] = editInputValue;
        setTags(newTags);
        onChange && onChange(newTags);
        setEditInputIndex(-1);
        setEditInputValue('');
    };
    const tagInputStyle = {
        width: 64,
        height: 28,
        marginInlineEnd: 8,
        verticalAlign: 'center',
    };
    const tagPlusStyle = {
        height: 28,
        background: token.colorBgContainer,
        borderStyle: 'dashed',
        lineHeight: '26px',
    };
    return (
        <Space size={[0, 8]} wrap>
            {tags.map((tag, index) => {
                if (editInputIndex === index) {
                    return (
                        <Input
                            ref={editInputRef}
                            key={tag}
                            style={tagInputStyle}
                            value={editInputValue}
                            onChange={handleEditInputChange}
                            onBlur={handleEditInputConfirm}
                            onPressEnter={handleEditInputConfirm}
                        />
                    );
                }
                const isLongTag = tag.length > 20;
                const tagElem = (
                    <Tag
                        key={tag}
                        closable={true || index !== 0}
                        style={{
                            userSelect: 'none',
                            lineHeight: '28px',
                        }}
                        onClose={() => handleClose(tag)}
                        color="#87d068"
                    >
                        <span
                            onDoubleClick={(e) => {
                                if (true || index !== 0) {
                                    setEditInputIndex(index);
                                    setEditInputValue(tag);
                                    e.preventDefault();
                                }
                            }}
                        >
                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                        </span>
                    </Tag>
                );
                return isLongTag ? (
                    <Tooltip title={tag} key={tag}>
                        {tagElem}
                    </Tooltip>
                ) : (
                    tagElem
                );
            })}
            {inputVisible ? (
                <Input
                    ref={inputRef}
                    type="text"
                    style={tagInputStyle}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                />
            ) : (
                <Tag style={tagPlusStyle} icon={<PlusOutlined />} onClick={showInput}>
                    新增标签
                </Tag>
            )}
        </Space>
    );
};
export default Tags;