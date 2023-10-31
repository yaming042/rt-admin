import React, {Component} from 'react';
import styles from './index.module.scss';

class Forbidden extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div className={styles['wrapper']}>
                <div className={styles['text']}>
                    403
                </div>
                <div>
                    <p>温馨提示：您无该资源访问权限！</p>
                </div>
            </div>
        );
    }
}

export default NotFound;