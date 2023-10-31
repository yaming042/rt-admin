import styles from './index.module.scss';

const Layout = (props) => {
    return (
        <div className={styles['layout-container']}>
            <div className={styles['header-bar']}>TinyLayout 头部</div>
            <div className={styles['content']}>
                <div className={styles['side-bar']}>
                    TinyLayout 菜单
                </div>
                <div className={styles['page-content']}>{props?.children || null}</div>
            </div>
        </div>
    );
};

export default Layout;

