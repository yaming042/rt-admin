import {
    SET_USER_INFO,
    SET_COLLAPSED,
} from '@/utils/constant';

const initState = {
    userInfo: {},
    collapsed: false,
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
            default:
                return state;
    }
}

export default main;