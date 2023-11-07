import { Button, Form, Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import styles from './index.module.scss';


/*
    {
        name: 'phone',
        type: 'input', // input, datePicker, rangePicker, select
        label: '手机号码',
        placeholder: '请输入手机号码'
        mode: '', // multiple, tags
        options: [],
        showSearch: false,
        filterOption: () => {},
        format: '',
    }
*/
export default (props) => {
    const {formItems=[]} = props,
        [form] = Form.useForm();


    const handleValues = (values) => {
        let newValues = {};
        for(let key in values) {
            let o = formItems.find(i => i.name === key),
                type = o?.type || '',
                c = values[key];

            if(type === 'datePicker' && c) {
                newValues[o.name] = dayjs(values[o.name]).format(o.format);
            }else if(type === 'rangePicker' && c?.length) {
                let formField = (o.formField || []).filter(Boolean),
                    value_1 = dayjs(values[o.name][0]).format(o.format),
                    value_2 = dayjs(values[o.name][1]).format(o.format);

                if(formField.length === 2) {
                    newValues[formField[0]] = value_1;
                    newValues[formField[1]] = value_2;
                }else{
                    // 公用一个值
                    newValues[o.name] = [];
                    newValues[o.name][0] = value_1;
                    newValues[o.name][1] = value_2;
                }
            }else{
                newValues[o.name] = values[key];
            }
        }

        return newValues;
    }
    const onReset = (e) => {
        form.resetFields();

        props.onReset && props.onReset();
    }
    const onConfirm = (e) => {
        form.validateFields().then(values => {
            let v = handleValues(values);

            props.onConfirm && props.onConfirm(v);
        });
    }


    return (
        <div className={styles['container']}>
            <div className={styles['form']}>
                <Form
                    form={form}
                    initialValues={{}}
                    layout="inline"
                >
                    {
                        (formItems || []).map((item, index) => {

                            return (
                                <Form.Item
                                    key={index}
                                    name={item.name}
                                    label={item.label}
                                >
                                    {
                                        'input' === item.type ?
                                            <Input
                                                placeholder={item.placeholder || '请输入'}
                                            />
                                            :
                                            null
                                    }
                                    {

                                        'select' === item.type ?
                                            <Select
                                                placeholder={item.placeholder}
                                                mode={item.mode}
                                                options={item.options}
                                                showSearch={item.showSearch}
                                                filterOption={item.filterOption}
                                            />
                                            :
                                            null
                                    }
                                    {
                                        'datePicker' === item.type ?
                                            <DatePicker
                                                showTime={item.showTime}
                                                format={item.format}
                                                // onChange={onChange}
                                                // onOk={onOk}
                                            />
                                            :
                                            null
                                    }
                                    {
                                        'rangePicker' === item.type ?
                                            <DatePicker.RangePicker
                                                showTime={{
                                                    hideDisabledOptions: true,
                                                    defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('11:59:59', 'HH:mm:ss')],
                                                }}
                                                format={item.format}
                                            />
                                            :
                                            null
                                    }
                                </Form.Item>
                            );
                        })
                    }
                </Form>
            </div>
            <div className={styles['submit']}>
                <Button onClick={onReset}>重置</Button>
                <Button onClick={onConfirm} type="primary">查询</Button>
            </div>
        </div>
    );
}