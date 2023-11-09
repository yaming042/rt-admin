import React, {useEffect, useState} from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Redirect } from 'react-router-dom';
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import { baseRouter, moduleRouter } from "@/config/router";
import LayoutLoader from '@/layout';
import Loading from '@/components/Loading';
import { HOME, LOGIN, FORBIDDEN, ACCOUNT, VALIDATE } from '@/config/url';
import { getGrid } from '@/utils';
import { mapMenuAddKey, getRouterData } from '@/config';
import { SET_USER_INFO, SET_INDEX_PAGE, SET_GRID } from '@/utils/constant';
import request from '@/utils/request';
import Cookies from 'js-cookie';

// 防抖
const debounce = (callback, delay) => {
    let timer;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback.apply(this, arguments);
        }, delay);
    };
};

const ROUTE_CLASS_NAME = `route-container`;
const getRouteClass = (className='') => {
    let pathname = location.pathname.replace(/\//g, '').replace(/-/g, '');

    return `${className} ${pathname}`;
};

// 路由拦截
const PrivateRoute = (props) => {
    const className = getRouteClass(props.className || ROUTE_CLASS_NAME),
        hasLogin = Cookies.get('rt-admin'),
        purview = props.purview, // 权限列表
        routeAuth = props.auth || [],
        hasAuth = DEBUG === 'true' ? true : (routeAuth || []).find(i => purview.includes(i)); // 权限有交叉，说明有权限

    return (
        <>
            {
                hasLogin ?
                    (
                        hasAuth ?
                            <CacheRoute {...props} className={className} />
                            :
                            <Redirect to={FORBIDDEN} />
                    )
                    :
                    <Redirect key={props.key} to={LOGIN} />
            }
        </>
    );
};

function App(props) {
    const initState = () => ({
            loading: true,
            purview: [], // 权限列表
            baseRouters: getRouterData(mapMenuAddKey(baseRouter)),
            moduleRouters: getRouterData(mapMenuAddKey(moduleRouter)),

            errorMsg: '',

            indexPage: '',
        }),
        [state, setState] = useState(initState),
        dispatch = props.dispatch;


    /*
        获取用户信息，也可以充当判断用户是否登录
    */
    const validate = () => {
        Promise.resolve().then(response => {
            let userInfo = response?.data || {},
                purview = userInfo?.modules || [],
                indexPage = purview[0] || ACCOUNT;

            setState(o => ({
                ...o,
                loading: false,
                purview,
                userInfo,
                indexPage,
            }));

            // 记录用户信息
            dispatch({
                type: SET_USER_INFO,
                value: userInfo,
            });
            dispatch({
                type: SET_INDEX_PAGE,
                value: indexPage,
            });
        }).catch(e => {
            setState(o => ({
                ...o,
                loading: false,
                purview: [],
                userInfo: {},
                indexPage: LOGIN,
            }));
        });
    };
    // 这是入口文件，页面间切换不会触发，只有应用首次加载时才会触发
    useEffect(() => {
        // 判断是否登录
        validate();

        // 监听页面宽度变化
        const resizeListen = (e) => {
            dispatch && dispatch({
                type: SET_GRID,
                value: getGrid(),
            })
        };
        window.addEventListener('resize', debounce(resizeListen, 200), false);

        return () => {
            window.removeEventListener('resize', debounce(resizeListen, 200), false);
        }
    }, []);
    useEffect(() => {
        setState(o => ({...o, indexPage: props.indexPage}));
    }, [props.indexPage]);

    return (
        !state.loading ?
            <Router>
                <LayoutLoader>
                    <CacheSwitch>
                        {
                            (state.baseRouters || []).map(item => {
                                return <CacheRoute
                                    key={item.key}
                                    exact
                                    path={item.url}
                                    when={p => false}
                                    cacheKey={item.cacheKey || ''}
                                    className={getRouteClass(item.routeClass || ROUTE_CLASS_NAME)}
                                    component={item.component}
                                />
                            })
                        }
                        {
                            (state.moduleRouters || []).map(item => {
                                return <PrivateRoute
                                    key={item.key}
                                    exact
                                    path={item.url}
                                    purview={state.purview || []}
                                    auth={item.auth || []}
                                    when={p => false} // 不用缓存路由
                                    cacheKey={item.cacheKey || ''}
                                    className={item.routeClass || ''}
                                    component={item.component}
                                />
                            })
                        }

                        <Redirect from={HOME} to={state.indexPage} />
                    </CacheSwitch>
                </LayoutLoader>
            </Router>
            :
            <Loading tip={state.errorMsg || '初始化中...'} />
    );
}

function mapStateToProps({main}) {
    return {
        indexPage: main.indexPage,
    }
}
function mapDispatchToProp(dispatch) {
    return {
        dispatch
    }
}
export default connect(mapStateToProps, mapDispatchToProp)(App);


