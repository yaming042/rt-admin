
import { Card } from 'antd';
import { connect } from 'react-redux';
import styles from './index.module.scss';

const Overview =  (props) => {
    const time = new Date(),
        userInfo = props?.userInfo || {};

    return (
        <div className={styles['container']}>
            <div className={styles['header']}>
                <div className={styles['hello']}>
                    你好，{userInfo?.name || '--'}
                </div>
                <div className={styles['time']}>
                    今天是{time.getFullYear()},<span>{time.getMonth()+1}</span>月<span>{time.getDate()}</span>日
                </div>
            </div>

            <Card style={{margin:'24px 0'}}>
                <div className={styles['content']}>
                    <h2>欢迎使用 RT-Admin</h2>
                    <p>RT-Admin 是一个React基础框架，主旨就是减少项目前期的配置成本，满足基本的项目开发需求。</p>
                    <p>技术栈：React、Vite、Redux、Antd、Axios、react-router-dom</p>
                </div>
            </Card>
        </div>
    );
}

function mapStateToProps({main}) {
    return {
        userInfo: main.userInfo,
    }
}
export default connect(mapStateToProps, null)(Overview);