import { Layout } from 'antd';
import Menu from './../Menu';
import styles from './index.module.scss';

/*
    Menu 组件必须给个theme，否则自定义的token是无效的
*/
const SideBar = (props) => {
    return (
        <>
            <Layout.Sider
                collapsible
                collapsed={props.collapsed}
                className={styles['menu-list']}
                style={{height:'100%'}}
                trigger={null}
            >
                <Menu />
            </Layout.Sider>
        </>
    );
};

export default SideBar;