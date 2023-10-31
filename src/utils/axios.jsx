import axios from 'axios';
import qs from 'qs';

/*
    请求格式
    request(url, options);
    options: {
        method: '',
        data: {},

        timeout: '',
        baseUrl: '',

        contentType: '',
        responseType: '',
    }
*/

axios.defaults.timeout = 1000 * 60; // 1分钟
axios.defaults.baseURL = '';
axios.defaults.responseType = 'json'; // 默认响应json格式

// http请求拦截器
axios.interceptors.request.use(
    (config) => {
        config.headers = {
            'Content-Type': config.contentType || 'application/json',
        };

        // 去除传递参数空格操作
        if (config.data && Object.keys(config.data).length > 0) {
            Object.keys(config.data).forEach((item) => {
                if (typeof config?.data[item] === "string") config.data[item] = config.data[item].trim();
            });
        }

        if(config.data && Object.keys(config.data).length) {
            if (!config.method || config.method?.toUpperCase === 'GET') { // GET请求就将 data 参数追加到url上
                config.url += `?${qs.stringify(config.data || {})}`;
            }else{  // 非 GET 请求时body的参数
                let isUrlEncoded = config.contentType === 'application/x-www-form-urlencoded',
                isFormData = config.contentType === 'multipart/form-data';

                config.data = isUrlEncoded ? qs.stringify(config.data || {}) : (isFormData ? config.data : JSON.stringify(config.data || {}));
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// http响应拦截器
axios.interceptors.response.use(
    (response) => {
        // 响应成功
        return response;
    },
    (error) => {
        return Promise.reject({code: error.response.status, data: null, message: error.response.statusText});
    }
);
