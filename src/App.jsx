import React, {useEffect, useState} from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Redirect, useHistory } from 'react-router-dom';
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import { baseRouter, moduleRouter, routers } from "@/config/router";
import LayoutLoader from '@/layout';
import Loading from '@/components/Loading';
import { HOME, LOGIN, FORBIDDEN, ACCOUNT } from '@/config/url';
import { mapMenuAddKey } from '@/utils';
import { SET_USER_INFO, SET_INDEX_PAGE } from '@/utils/constant';
import request from '@/utils/request';
import Cookies from 'js-cookie';

import rtDb from '@/../DB';

// 打平路由
const flatterRouter = (data=[]) => {
    let routers = [];
    (data || []).map(item => {
        if(item.key || item.url) {
            if(Array.isArray(item.children) && item.children.length) {
                let r = flatterRouter(item.children);

                routers = routers.concat(r);
            }else{
                if(item.url) {
                    routers.push(item);
                }
            }
        }
    });

    return routers;
};
// 随机毫秒数
const randomTime = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}
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
            baseRouters: flatterRouter(mapMenuAddKey(baseRouter)),
            moduleRouters: flatterRouter(mapMenuAddKey(moduleRouter)),

            errorMsg: '',

            indexPage: '',

        }),
        [state, setState] = useState(initState),
        dispatch = props.dispatch,
        history = useHistory();

    /*
        获取用户信息，也可以充当判断用户是否登录
    */
    const validate = () => {
        let t = setTimeout(() => {
            clearTimeout(t);

            rtDb.getUserInfo().then(response => {
                let userInfo = response?.data || {},
                    purview = userInfo?.modules || [],
                    indexPage = purview[0] || ACCOUNT;

                setState(o => ({
                    ...o,
                    loading: false,
                    purview,
                    userInfo: {
                        ...userInfo,
                        avatar:'/images/logo_150.png',
                    },
                    indexPage,
                }));

                console.log(`userInfo: `, userInfo);
                // 记录用户信息
                dispatch({
                    type: SET_USER_INFO,
                    value: {
                        ...userInfo,
                        avatar:'/images/logo_150.png',
                    }
                });
                dispatch({
                    type: SET_INDEX_PAGE,
                    value: indexPage,
                });
            }).catch(e => {
                console.log(1111, e.message);
                setState(o => ({
                    ...o,
                    loading: false,
                    purview: [],
                    userInfo: {
                        avatar:'/images/logo_150.png',
                    },
                    indexPage: LOGIN,
                }));
            });
        }, randomTime(200, 1200));
    };
    // 这是入口文件，页面间切换不会触发，只有应用首次加载时才会触发
    useEffect(() => {
        validate();
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


