import { Spin } from 'antd';
import styles from './index.module.scss';

export default (props) => {
    let tip = props.tip || '努力加载中...',
        position = props.position || 'fixed';

    return (
        <div className={`${styles['container']} ${styles[position]}`}>
            <div className="rt-loader-1"></div>
        </div>
    );
}