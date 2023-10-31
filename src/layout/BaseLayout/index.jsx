import { connect } from 'react-redux';
import { Button, theme } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import SideBar from './SideBar';
import HeaderBar from './HeaderBar';
import { SET_COLLAPSED } from '@/utils/constant';
import styles from './index.module.scss';

const Layout = (props) => {
    let {token} = theme.useToken();

    const switchCollapsed = () => {
        props.dispatch && props.dispatch({
            type: SET_COLLAPSED,
            value: !props.collapsed
        });
    }

    return (
        <div className={styles['layout-container']}>
            <div className={styles['header-bar']} style={{backgroundColor: token?.colorPrimary || '#14A361'}}><HeaderBar/></div>
            <div className={styles['content']}>
                <div className={styles['side-bar']}>
                    <div className={styles['menu']}>
                        <SideBar/>
                    </div>

                    <div className={styles['fold']}>
                        <Button size="small" type="primary" onClick={switchCollapsed}>
                            {
                                props.collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                            }
                        </Button>
                    </div>
                </div>
                <div className={styles['page-content']}>
                    {props?.children || null}
                </div>
            </div>
        </div>
    );
};

function mapDispatchToProp(dispatch) {
    return {
        dispatch
    }
}
function mapStateToProp({main}) {
    return {
        collapsed: main.collapsed,
    }
}
export default connect(mapStateToProp, mapDispatchToProp)(Layout);

