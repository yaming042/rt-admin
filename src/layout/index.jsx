import { useEffect, useState } from 'react';
import {useHistory} from 'react-router-dom';
import {baseRouter, moduleRouter} from "@/config/router";
import BaseLayout from '@/layout/BaseLayout';

export default (props) => {
    const [state, setState] = useState(null),
        history = useHistory();

    const getLayout = (url='', routers=[], layout='') => {

        for(let i=0;i<routers.length;i++) {
            let cur = routers[i],
                curLayout = cur.layout === null ? null : (cur.layout || layout || '');

            if(Array.isArray(cur.children) && cur.children.length) {
                let r = getLayout(url, cur.children, curLayout);
                if(r || r === null) return r;
            }

            if(cur.url === url) {
                return curLayout;
            }
        }

        return '';
    };
    const initLayout = (pathname='') => {
        let routers = baseRouter.concat(moduleRouter),
            layout = getLayout(pathname, routers);

        setState({layout: layout === null ? null : (layout || BaseLayout)});
    };

    useEffect(() => {
        initLayout(location.pathname);

        const unListen = history.listen(({pathname}) => {
            initLayout(pathname)
        });

        return () => {
            unListen();
        }
    }, []);



    return (
        state?.layout ?
            <state.layout {...props} />
            :
            (props.children || null)
    );
}