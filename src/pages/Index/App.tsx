/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-len */
import React, { Dispatch, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LoginModal from '@/components/loginModal/loginModal';
import RegisterModal from '@/components/registerModal/registerModal';
import * as api from '@/service/api';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { UserDispatchType } from '@/store/reducer/userInfoReducer';
import { ACCOUNTTYPEDISPATCHTYPE } from '@/store/reducer/accountTypeReducer';
import { useHistory } from 'react-router-dom';
import './App.less';
import { message } from 'antd';

// 查看todo，一种是全部，一种是完成的
enum TODOMODE {
  AllTODO,
  COMPELETED
}

let a = 1;
export type TodoItem = {
  id: number,
  content: string,
  isCompleted: boolean,
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

type Props = {
  dispatch: Dispatch<AnyAction>;
  userInfo: User;
  accountType: ACCOUNTTYPEDISPATCHTYPE;
}

const App: React.FC<Props> = ({
  dispatch,
  userInfo,
  accountType,
  ...other
}) => {
  const history = useHistory();
  // 查看todo的模式
  const [mode, setLookMode] = useState<TODOMODE>(TODOMODE.AllTODO);
  const contentInputRef = useRef<HTMLInputElement>(null);
  // 处于编辑状态的todo索引
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [editVal, setEditVal] = useState<string>('');
  // 所有选中的索引
  const [selectedIndex, setSelectedIndex] = useState<number[]>([]);
  const [todoList, setTodoList] = useState<TodoItem[]>([]);
  // 是否全选
  const [ifSelectAll, setIfSelectedAll] = useState<boolean>(false);
  const [userInfoShow, setrUserInfoShow] = useState<boolean>(false);
  const [modalState, setModalsStates] = useState({
    loginModalVisible: false,
    registerModalVisible: false,
    loginModalLoading: false,
    registerModalLoading: false,
  });

  useEffect(() => {
    if (localStorage.getItem('userInfo') !== null
    ) {
      let user: User = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (!(userInfo.nickname || userInfo.id) && user.nickname && user.id) {
        dispatch({
          type: UserDispatchType.LOGIN,
          payload: user,
        });
        dispatch({
          type: ACCOUNTTYPEDISPATCHTYPE.MEMBER,
        });
      }
      localStorage.setItem("accountType", JSON.stringify(ACCOUNTTYPEDISPATCHTYPE.MEMBER));
    } else {
      localStorage.setItem("accountType", JSON.stringify(ACCOUNTTYPEDISPATCHTYPE.TOURIST));
    }
    if (localStorage.getItem('todoList')
      && JSON.parse(localStorage.getItem('todoList') || '[]')
      && JSON.parse(localStorage.getItem('todoList') || '[]').length !== 0
    ) {
      setTodoList(JSON.parse(localStorage.getItem('todoList') || '[]'));
    }
    // @ts-ignore
    window.addEventListener('keydown', (event) => handleEnterClick(JSON.parse(localStorage.getItem("accountType")), event, contentInputRef.current ? contentInputRef.current.value : ''));
    // @ts-ignore
    return () => window.addEventListener('keydown', (event) => handleEnterClick(JSON.parse(localStorage.getItem("accountType")), event, contentInputRef.current ? contentInputRef.current.value : ''));
  }, []);

  function handleEnterClick(accountType: ACCOUNTTYPEDISPATCHTYPE, event: KeyboardEvent, content: string) {
    // 回车
    if (event.key && event.key.toString() === 'Enter') {
      if (content !== '' && content !== null) {
        handleAdd(accountType, content, JSON.parse(localStorage.getItem("todoList") || "[]") || []);
        if (contentInputRef.current != null) {
          contentInputRef.current.value = '';
        }
      }
    }
  }

  async function handleAdd(accountType: ACCOUNTTYPEDISPATCHTYPE, todoInputMsg: string, oldTodoList: TodoItem[]) {
    const id = oldTodoList[oldTodoList.length - 1] ? oldTodoList[oldTodoList.length - 1].id + 1 : 1;
    let newTodoList: TodoItem[] = oldTodoList ? [...oldTodoList, { id, content: todoInputMsg, isCompleted: false }] : [{ id, content: todoInputMsg, isCompleted: false }];
    updateTodoList(accountType, newTodoList);
  }

  function handleCheckBoxChange(idx: number, ifSelected: boolean) {
    if (ifSelected === false && selectedIndex.includes(idx)) {
      let newSelected = [...selectedIndex.filter((item, index) => item !== idx)];
      setSelectedIndex(newSelected);
    } else {
      let newSelected = [...selectedIndex, idx];
      setSelectedIndex(newSelected);
    }
  }

  function handleEditStatusToggel(id: number) {
    console.log('双击了');
    setEditIndex(id);
  }
  function handleEditOnBlur(id: number, content: string) {
    let newTodoList = [...todoList.map((item, index) => {
      if (item.id === id) {
        item.content = content;
      }
      return item;
    })];
    updateTodoList(accountType, newTodoList);
    setEditIndex(-1);
  }
  function renderTodos(renderedTodoList: TodoItem[]) {
    if (mode === TODOMODE.AllTODO) {
      return renderedTodoList.map((todoItem, index) => renderTodoItem(todoItem, mode));
    }
    return renderedTodoList.filter((todoItem, index) => todoItem.isCompleted === true).map((todoItem, index) => renderTodoItem(todoItem, mode));
  }

  function renderTodoItem(todoItem: TodoItem, mode: TODOMODE) {
    return <li className='todoitem-li' key={todoItem.id}>
      <span className='todoitem-checkbox-item'>
        <input checked={selectedIndex.includes(todoItem.id)} onChange={(e) => handleCheckBoxChange(todoItem.id, e.currentTarget.checked)} type="checkbox" />
        {todoItem.id === editIndex ? <div className='input-container'>
          <input onChange={(e) => setEditVal(e.currentTarget.value)} defaultValue={todoItem.content} onBlur={(e) => handleEditOnBlur(todoItem.id, e.currentTarget.value)} className='myInput height50' />
          <i onClick={() => { handleEditOnBlur(todoItem.id, editVal); }}>✓</i>
        </div>
          : <label className='todoitem-label' htmlFor='todoitem' onClick={() => handleEditStatusToggel(todoItem.id)}>
            {mode === TODOMODE.COMPELETED || todoItem.isCompleted === true ? <del>{todoItem.content}</del> : todoItem.content || "无内容"}
          </label>
        }
      </span>
    </li>;
  }

  const selectedStyle = selectedIndex.length > 0 ? 'selected' : '';

  useEffect(() => {
    if (localStorage.getItem("userInfo") === null) {
      localStorage.setItem('todoList', JSON.stringify(todoList));
    } else {
      console.log('api操作');
    }
  }, [todoList]);

  useEffect(() => {
    let myTodoList = todoList;
    if (mode === TODOMODE.COMPELETED) {
      myTodoList = todoList.filter((todoItem, index) => todoItem.isCompleted !== true);
    }
    if (selectedIndex.length && selectedIndex.length === myTodoList.length) {
      setIfSelectedAll(true);
    } else {
      setIfSelectedAll(false);
    }
  }, [selectedIndex]);

  async function updateTodoList(accountType: ACCOUNTTYPEDISPATCHTYPE, newTodoList: TodoItem[]) {
    console.log(accountType);
    if (accountType === ACCOUNTTYPEDISPATCHTYPE.MEMBER) {
      // @ts-ignore
      const userInfo = localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo'));
      await api.updateTodoListById(userInfo.id, newTodoList);
      let res = await api.getTodoListById(userInfo.id);
      if (res.data) {
        newTodoList = res.data;
      }
    }
    localStorage.setItem('todoList', JSON.stringify(newTodoList));
    setTodoList(newTodoList);
  }
  function deleteTodo(ids: number[]) {
    updateTodoList(accountType, [...todoList.filter((item, index) => !ids.includes(item.id))]);
    setSelectedIndex([...selectedIndex.filter((item, index) => !ids.includes(item))]);
  }

  function finishTodo(ids: number[]) {
    // 完成todo
    let processedTodoList = todoList.map((item, index) => {
      if (ids.includes(item.id)) {
        item.isCompleted = true;
      }
      return item;
    });
    updateTodoList(accountType, [...processedTodoList]);
  }

  function selectedAll(ifSelectedAll: boolean) {
    if (ifSelectedAll === true) {
      let allId = todoList.map((todoItem) => todoItem.id);
      setIfSelectedAll(true);
      if (mode === TODOMODE.COMPELETED) {
        allId = todoList.filter((todoItem) => todoItem.isCompleted === true).map((item, index) => item.id);
      }
      setSelectedIndex(allId);
    } else {
      setIfSelectedAll(false);
      setSelectedIndex([]);
    }
  }

  function seeFinishedTodo() {
    if (mode === TODOMODE.AllTODO) {
      setLookMode(TODOMODE.COMPELETED);
    } else {
      setLookMode(TODOMODE.AllTODO);
    }
  }

  function handleJump(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.stopPropagation();
    setModalsStates({
      ...modalState, loginModalVisible: true,
    });
  }

  function login(nickname: string, password: string) {
    let flag = false;
    setModalsStates(
      {
        ...modalState, loginModalLoading: true, loginModalVisible: true,
      },
    );
    api.login(nickname, password).then((res) => {
      if (res && res.success === true && res.data != null && !!res.data.nickname) {
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        localStorage.setItem('accountType', JSON.stringify(ACCOUNTTYPEDISPATCHTYPE.MEMBER));
        localStorage.setItem('todoList', JSON.stringify(res.data.todo_list || []));
        setTodoList(res.data.todo_list);
        dispatch({
          type: UserDispatchType.LOGIN,
          payload: res.data,
        });
        dispatch({
          type: ACCOUNTTYPEDISPATCHTYPE.MEMBER,
        });
        message.success("登录成功");
        setModalsStates(
          {
            ...modalState, loginModalLoading: false, loginModalVisible: false,
          },
        );
        flag = true;
      } else {
        message.error(res && res.msg);
        setModalsStates(
          {
            ...modalState, loginModalLoading: false,
          },
        );
        flag = false;
      }
    });
    return flag;
  }

  function register(nickname: string, password: string): boolean {
    let flag = false;
    setModalsStates(
      {
        ...modalState, registerModalLoading: true, registerModalVisible: true,
      },
    );
    api.register({ ...userInfo, password, nickname }).then((res) => {
      if (res && res.success === true && res.data != null && !!res.data.nickname) {
        message.success("注册成功，直接为您登录！");
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        localStorage.setItem('accountType', JSON.stringify(ACCOUNTTYPEDISPATCHTYPE.MEMBER));
        localStorage.setItem('todoList', JSON.stringify(res.data.todo_list || []));
        setTodoList(res.data.todo_list);
        dispatch({
          type: UserDispatchType.LOGIN,
          payload: res.data,
        });
        dispatch({
          type: ACCOUNTTYPEDISPATCHTYPE.MEMBER,
        });
        setModalsStates(
          {
            ...modalState, registerModalLoading: false, registerModalVisible: false, loginModalVisible: false,
          },
        );
        flag = true;
      } else {
        message.error(res && res.msg);
        setModalsStates(
          {
            ...modalState, registerModalLoading: false,
          },
        );
        flag = true;
      }
    });
    return flag;
  }
  function handleLoginCancel() {
    setModalsStates({
      ...modalState, loginModalVisible: false,
    });
  }
  function handleRegisterCancel() {
    setModalsStates({
      ...modalState, registerModalVisible: false,
    });
  }
  function jumpToSettings() {
    history.push('/user/settings');
  }
  function quit() {
    localStorage.clear();
    dispatch({
      type: UserDispatchType.LOGIN,
      payload: null,
    });
    dispatch({
      type: ACCOUNTTYPEDISPATCHTYPE.TOURIST,
    });
    setTodoList([]);
    message.success("退出成功");
  }

  return (
    <div className='container'>
      <LoginModal
        cancleButtonExit={false}
        gotoRegister={() => setModalsStates({ ...modalState, registerModalVisible: true })}
        title="登录"
        loading={modalState.loginModalLoading}
        visible={modalState.loginModalVisible}
        content=''
        onOk={login}
        onCancel={() => handleLoginCancel()} />
      <RegisterModal
        cancleButtonExit={false}
        goback={() => setModalsStates({ ...modalState, registerModalVisible: false })}
        title="注册"
        loading={modalState.registerModalLoading}
        visible={modalState.registerModalVisible}
        content=''
        onOk={register}
        onCancel={() => handleRegisterCancel()} />
      {
        accountType === ACCOUNTTYPEDISPATCHTYPE.TOURIST
          ? <a onClick={(e) => handleJump(e)} className='user-jump jump-to-login'>还在用临时账号？点击这里注册账号数据不丢失！</a>
          : <span onMouseLeave={() => setrUserInfoShow(false)} onMouseOver={() => setrUserInfoShow(true)} className='user-jump see-all'>
            欢迎您,
            {userInfo.nickname}
            <ul className={`settings ${userInfoShow ? 'settings-dropdown' : ''}`}>
              <li>
                <a onClick={() => jumpToSettings()}>我的</a>
              </li>
              <li>
                <a onClick={() => quit()}>退出</a>
              </li>
            </ul>
          </span>
      }
      <div className='content'>
        <header className='header'>
          <h1>todos</h1>
          <div className='input-container'>
            <input ref={contentInputRef} className='myInput greenInput' type="text" placeholder='请输入' />
            <i>回车/Enter</i>
          </div>

        </header>
        <ul>
          {renderTodos(todoList)}
        </ul>
        <footer>
          <span className='selectAll'>
            <input checked={ifSelectAll} onChange={(e) => selectedAll(e.currentTarget.checked)} type="checkbox" />
            <label htmlFor='selectAll'>
              选中全部
            </label>
          </span>
          <span onClick={() => seeFinishedTodo()} className='seeCompleted'>
            {mode === TODOMODE.AllTODO ? '查看完成的todo' : '查看所有的todo'}
          </span>
          <span onClick={() => deleteTodo(selectedIndex)} className={`delete ${selectedStyle}`}>删除</span>
          <span onClick={() => finishTodo(selectedIndex)} className={`complete ${selectedStyle}`}>完成</span>
        </footer>
      </div>
    </div>
  );
};

export default connect(
  (state) => ({ ...state }),
)(React.memo(App));