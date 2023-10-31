import React, { useState, useEffect } from 'react';
import AccountLogin from './AccountLogin';
import styles from './index.module.scss';


export default (props) => {
    const initState = () => ({
            loading: false,
        }),
        [state, setState] = useState(initState);

    useEffect(() => {}, []);

    return (
        <div className={styles['container']}>
            <div className={styles['login-form']}>
                <AccountLogin/>
            </div>
        </div>
    );
};