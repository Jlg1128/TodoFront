import { User } from '@/pages/Index/App';

const user: User = {
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
}

export const userInfo = (state = user, action: { type: UserDispatchType, payload: User }) => {
    switch (action.type) {
        case UserDispatchType.LOGIN:
            return { ...state, ...action.payload };
        default:
            return state;
    }
};