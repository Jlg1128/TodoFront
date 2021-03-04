import { User } from '@/service/api';

const initialUser: User = {
    'nickname': '',
    'id': -1,
    'email': '',
    'phone_number': '',
    'avatar': '',
    'create_time': '',
    'todo_list': [],
};

export enum UserDispatchType {
    LOGIN,
    QUIT,
    MODIFYUSER,
    MODIFYUSERTODO,
}

export const userInfo = (state = initialUser, action: { type: UserDispatchType, payload: User }) => {
    switch (action.type) {
        case UserDispatchType.LOGIN:
            return { ...state, ...action.payload };
        case UserDispatchType.QUIT:
            return { ...initialUser };
        case UserDispatchType.MODIFYUSER:
            return { ...state, ...action.payload };
        case UserDispatchType.MODIFYUSERTODO:
            return { ...initialUser, todo_list: action.payload };
        default:
            return state;
    }
};