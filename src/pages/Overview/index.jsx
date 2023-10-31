
import { Card } from 'antd';
import styles from './index.module.scss';

export default (props) => {
    const time = new Date();

    return (
        <div className={styles['container']}>
            <div className={styles['header']}>
                <div className={styles['hello']}>
                    你好，{'汤姆'}
                </div>
                <div className={styles['time']}>
                    今天是{time.getFullYear()},<span>{time.getMonth()+1}</span>月<span>{time.getDate()}</span>日
                </div>
            </div>

            <Card style={{margin:'24px 0'}}>
                <div className={styles['content']}>
                    <h2>欢迎使用 RT-Admin</h2>
                    <p>RT-Admin 是一个React基础框架，主旨就是减少项目前期的配置成本，满足基本的项目开发需求。</p>
                    <p>技术栈：React、Vite、Redux、Antd、Axios</p>
                </div>
            </Card>
        </div>
    );
}

