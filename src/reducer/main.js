import {
    SET_USER_INFO,
    SET_COLLAPSED,
    SET_INDEX_PAGE,
} from '@/utils/constant';

const initState = {
    userInfo: {},
    collapsed: false,
    indexPage: '',
};

function main(state = initState, action) {
    switch (action.type) {
            case SET_USER_INFO:
                return Object.assign({}, state, {
                    userInfo: action.value
                });
            case SET_COLLAPSED:
                return Object.assign({}, state, {
                    collapsed: action.value
                });
            case SET_INDEX_PAGE:
                return Object.assign({}, state, {
                    indexPage: action.value
                });
            default:
                return state;
    }
}

export default main;