import ReactDOM from 'react-dom/client';

import {Provider} from 'react-redux';
import store from '@/store';

import {ConfigProvider} from 'antd';
import zhCN from 'antd/es/locale/zh_CN';

import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn'); // 全局使用简体中文

import App from './App';
import './index.css';
import './loading.css';



ReactDOM.createRoot(document.getElementById('root')).render(
    <ConfigProvider
        locale={zhCN}
        theme={{
            token: {
                colorPrimary: '#14A361',
            },
        }}
    >
        <Provider store={store}>
            <App />
        </Provider>
    </ConfigProvider>
)
