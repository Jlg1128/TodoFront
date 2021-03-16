/* eslint-disable @typescript-eslint/ban-types */
import axios from '@/utils/request';
import { AxiosResponse, Method } from 'axios';
import { Moment } from 'moment';

export type ResponseDataType<T extends object = object> = {
  msg: string,
  code: number,
  data: T;
  success: boolean,
}

type ApiMapType = {
  [k: string]: {
    url: string,
    method: Method,
  }
}

export enum RepeatType {
  USERNAME = 'nickname',
  EMAIL = 'email',
  PHONE = 'phone',
  ID = 'id',
}

const api: ApiMapType = {
  login: {
    url: '/api/user/login',
    method: 'post',
  },
  quit: {
    url: '/api/user/quit',
    method: 'post',
  },
  register: {
    url: '/api/user/register',
    method: 'post',
  },
  getUserById: {
    url: '/api/user/getUserById',
    method: 'get',
  },
  getUserByNickname: {
    url: '/api/user/getUserByNickname',
    method: 'get',
  },
  getTodoListById: {
    url: '/api/todo/getTodoListById',
    method: 'get',
  },
  getTodoListNickname: {
    url: '/api/todo/getTodoListNickname',
    method: 'get',
  },
  updateTodoList: {
    url: '/api/todo/updateTodoList',
    method: 'post',
  },
  ifRepeat: {
    url: '/api/user/userInfoIfRepeat',
    method: 'get',
  },
  modifyUser: {
    url: '/api/user/modifyUser',
    method: 'post',
  },
  modifyAvatar: {
    url: '/api/todo/modifyAvatar',
    method: 'post',
  },
};
export type TodoItem = {
  id: number,
  content: string,
  isCompleted: boolean,
  createTime: Moment | null,
  targetCompleteTime: Moment | null,
  completedTime: Moment | null,
}

export type User = {
  id: number,
  create_time: string,
  nickname: string,
  password?: string,
  avatar: string,
  phone_number: string,
  email: string,
  todo_list: TodoItem[],
}

export function login(nickname: string, password: string): Promise<ResponseDataType<User>> {
  return new Promise((resolve, reject) => {
    axios(api.login.url, {
      method: api.login.method,
      data: {
        nickname,
        password,
      },
    }).then((res) => {
      resolve(res.data);
    })
      .catch((err) => reject(err));
  });
}

export function quit(): Promise<ResponseDataType> {
  return new Promise((resolve, reject) => {
    axios(api.quit.url, {
      method: api.login.method,
    }).then((res) => {
      resolve(res.data);
    })
      .catch((err) => reject(err));
  });
}

export function register(user?: User): Promise<ResponseDataType<User>> {
  return new Promise((resolve, reject) => {
    axios(api.register.url, {
      data: {
        ...user,
      },
      method: api.register.method,
    }).then((res: AxiosResponse<ResponseDataType<User>>) => {
      resolve(res.data);
    })
      .catch((err) => reject(err));
  });
}

export function getUserById(): Promise<ResponseDataType<User>> {
  return new Promise((resolve, reject) => {
    axios(api.getUserById.url, {
      method: api.getUserById.method,
    })
      .then((res: AxiosResponse<ResponseDataType<User>>) => resolve(res.data))
      .catch((err) => reject(err));
  });
}
export function getUserByNickname(nickname: string): Promise<ResponseDataType<User>> {
  return new Promise((resolve, reject) => {
    axios(api.getUserByNickname.url, {
      params: {
        nickname: nickname || '',
      },
      method: api.getUserByNickname.method,
    })
      .then((res: AxiosResponse<ResponseDataType<User>>) => resolve(res.data))
      .catch((err) => reject(err));
  });
}

export function getTodoList(): Promise<ResponseDataType<TodoItem[]>> {
  return new Promise((resolve, reject) => {
    axios(api.getTodoListById.url, {
      method: api.getTodoListById.method,
    })
      .then((res: AxiosResponse<ResponseDataType<TodoItem[]>>) => {
        resolve(res.data);
      })
      .catch((err) => reject(err));
  });
}

export function getTodoListNickname(nickname: string): Promise<ResponseDataType<TodoItem[]>> {
  return new Promise((resolve, reject) => {
    axios(api.getTodoListNickname.url, {
      method: api.getTodoListNickname.method,
      params: {
        nickname,
      },
    }).then((res: AxiosResponse<ResponseDataType<TodoItem[]>>) => {
      resolve(res.data);
    })
      .catch((err) => reject(err));
  });
}

export function updateTodoListById(todoList: TodoItem[]): Promise<ResponseDataType> {
  return new Promise((resolve, reject) => {
    axios(api.updateTodoList.url, {
      data: {
        todoList,
      },
      method: api.updateTodoList.method,
    }).then((res: AxiosResponse<ResponseDataType>) => {
      resolve(res.data);
    }).catch((err) => {
      reject(err);
    });
  });
}

export function ifRepeat(value: string, type: RepeatType): Promise<ResponseDataType> {
  return new Promise((resolve, reject) => {
    axios(api.ifRepeat.url, {
      params: {
        value,
        type,
      },
      method: api.ifRepeat.method,
    }).then((res: AxiosResponse<ResponseDataType>) => resolve(res.data)).catch((err) => reject(err));
  });
}

export function modifyUser(user: User): Promise<ResponseDataType> {
  return new Promise((resolve, reject) => {
    axios(api.modifyUser.url, {
      data: {
        ...user,
      },
      method: api.modifyUser.method,
    }).then((res: AxiosResponse<ResponseDataType>) => resolve(res.data)).catch((err) => reject(err));
  });
}

export function modifyAvatar(avatar: string): Promise<ResponseDataType> {
  return new Promise((resolve, reject) => {
    axios(api.modifyAvatar.url, {
      data: {
        avatar,
      },
      method: api.modifyAvatar.method,
    }).then((res: AxiosResponse<ResponseDataType>) => resolve(res.data)).catch((err) => reject(err));
  });
}