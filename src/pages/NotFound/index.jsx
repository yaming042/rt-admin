import React, {Component} from 'react';
import styles from './index.module.scss';

class NotFound extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div className={styles['wrapper']}>
                <div className={styles['text']}>
                    404
                </div>
                <div>
                    <p>温馨提示：您访问的地址不存在！</p>
                </div>
            </div>
        );
    }
}

export default NotFound;