/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-len */
import React, { Dispatch, useEffect, useRef, useState } from 'react';

import EditInputModal from '@/pages/Index/components/editModal/editModal';
import * as api from '@/service/api';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { UserDispatchType, userInfo } from '@/store/reducer/userInfoReducer';
import { ACCOUNTTYPEDISPATCHTYPE } from '@/store/reducer/accountTypeReducer';
import './App.less';
import moment, { Moment } from 'moment';
import { message } from 'antd';

// 查看todo，一种是全部，一种是完成的
enum TODOMODE {
  AllTODO,
  COMPELETED
}

type Props = {
  dispatch: Dispatch<AnyAction>;
  userInfo: api.User;
  account: {
    accountType: ACCOUNTTYPEDISPATCHTYPE,
  };
}

type User = api.User;

type TodoItem = api.TodoItem;

enum ModifyType {
  ADD = '添加',
  DELETE = '删除',
  UPDATE = '更新',
  FINISH = '完成',
}

type ModifyInfo = {
  modifyIndex: number,
  modifyOldTime: Moment
}

const App: React.FC<Props> = ({
  dispatch,
  userInfo,
  account: { accountType },
}) => {
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
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [modifyModalVisible, setModifyModalVisible] = useState<boolean>(false);
  // 更改时间相关的信息
  const [modifyInfo, setModifyInfo] = useState<ModifyInfo>(
    {
      modifyIndex: -1,
      modifyOldTime: moment(),
    },
  );

  useEffect(() => {
    // 监听回车
    // @ts-ignore
    window.addEventListener('keydown', (event) => handleEnterClick(JSON.parse(localStorage.getItem("accountType")), event, contentInputRef.current ? contentInputRef.current.value : ''));
    // @ts-ignore
    return () => window.addEventListener('keydown', (event) => handleEnterClick(JSON.parse(localStorage.getItem("accountType")), event, contentInputRef.current ? contentInputRef.current.value : ''));
  }, []);

  function handleEnterClick(accountType: ACCOUNTTYPEDISPATCHTYPE, event: KeyboardEvent, content: string) {
    // 回车
    if (event.key && event.key.toString() === 'Enter') {
      if (content !== '' && content !== null) {
        setAddModalVisible(true);
      }
    }
  }

  // 监听账户类型的切换改变current todolist
  useEffect(() => {
    if (accountType === ACCOUNTTYPEDISPATCHTYPE.MEMBER && userInfo.nickname && userInfo.id !== -1) {
      setTodoList(userInfo.todo_list);
    } else {
      setTodoList(JSON.parse(localStorage.getItem("todoList") || '[]'));
    }
  }, [accountType]);

  async function handleAdd(accountType: ACCOUNTTYPEDISPATCHTYPE, todoInputMsg: string, oldTodoList: TodoItem[], targetCompleteTime: Moment | null) {
    const id = oldTodoList[oldTodoList.length - 1] ? oldTodoList[oldTodoList.length - 1].id + 1 : 1;
    const needAddItem: TodoItem = {
      id,
      content: todoInputMsg,
      isCompleted: false,
      completedTime: null,
      targetCompleteTime,
      createTime: moment(),
    };

    // @ts-ignore
    let newTodoList: TodoItem[] = oldTodoList ? [...oldTodoList, needAddItem] : [needAddItem];
    updateTodoList(accountType, newTodoList, ModifyType.ADD);
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
    setEditIndex(id);
  }

  function handleEditOnBlur(id: number, content: string) {
    let newTodoList = [...todoList.map((item, index) => {
      if (item.id === id) {
        item.content = content;
      }
      return item;
    })];
    updateTodoList(accountType, newTodoList, ModifyType.UPDATE);
    setEditIndex(-1);
  }

  function renderTodos(renderedTodoList: TodoItem[]) {
    if (mode === TODOMODE.AllTODO) {
      return renderedTodoList.map((todoItem, index) => renderTodoItem(todoItem, mode, index));
    }
    return renderedTodoList.filter((todoItem, index) => todoItem.isCompleted === true).map((todoItem, index) => renderTodoItem(todoItem, mode, index));
  }

  function renderTodoItem(todoItem: TodoItem, mode: TODOMODE, index: number) {
    let timestamp = '';
    let processedTime = '';
    if (todoItem.isCompleted) {
      // @ts-ignore
      timestamp = Date.parse(todoItem.completedTime);
      processedTime = (timestamp && moment(timestamp).format('MM-DD HH:mm:ss')) || "暂无设置时间";
    } else {
      // @ts-ignore
      timestamp = Date.parse(todoItem.targetCompleteTime);
      processedTime = (timestamp && moment(timestamp).format('MM-DD HH:mm:ss')) || "暂无设置时间";
    }

    return <li className='todoitem-li' key={todoItem.id}>
      <span className='todoitem-container'>
        <input checked={selectedIndex.includes(todoItem.id)} onChange={(e) => handleCheckBoxChange(todoItem.id, e.currentTarget.checked)} type="checkbox" />
        {todoItem.id === editIndex ? <div className='input-container'>
          <input maxLength={30}
            onChange={(e) => setEditVal(e.currentTarget.value)}
            defaultValue={todoItem.content}
            onBlur={(e) => handleEditOnBlur(todoItem.id, e.currentTarget.value)}
            className='todoitem-input todoitem-edit-input' />
          <i onClick={() => { handleEditOnBlur(todoItem.id, editVal); }}>✓</i>
        </div>
          : <span className='todoitem-container todoitem-unselected-container'>
            <label className='todoitem-label' htmlFor='todoitem' onClick={() => handleEditStatusToggel(todoItem.id)}>
              {mode === TODOMODE.COMPELETED || todoItem.isCompleted === true ? <del>{todoItem.content}</del> : todoItem.content || "无内容"}
            </label>
            <i className={`todoitem-modifydate ${todoItem.isCompleted ? 'todoitem-compeleted-item' : ''}`}>
              {mode === TODOMODE.COMPELETED || todoItem.isCompleted === true ? <span>完成时间:</span> : <span>目标时间:</span>}
              <a onClick={() => { !todoItem.isCompleted && handleModifyComelteTodo(todoItem.id, timestamp ? moment(timestamp) : moment()); }}>
                {processedTime}
              </a>
            </i>
          </span>
        }
      </span>
    </li>;
  }

  const selectedStyle = selectedIndex.length > 0 ? 'selected' : '';

  useEffect(() => {
    // 如果是有账户的话，每次todolist变化都需要将新的user存入localstorage
    if (accountType === ACCOUNTTYPEDISPATCHTYPE.MEMBER && userInfo.nickname && userInfo.id !== -1) {
      let newUser = { ...userInfo, todo_list: todoList };
      dispatch({
        type: UserDispatchType.MODIFYUSER,
        payload: newUser,
      });
      localStorage.setItem("userInfo", JSON.stringify(newUser));
    }
    localStorage.setItem('todoList', JSON.stringify(todoList));
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

  async function updateTodoList(accountType: ACCOUNTTYPEDISPATCHTYPE, newTodoList: TodoItem[], type: ModifyType) {
    let wrong = true;
    if (accountType === ACCOUNTTYPEDISPATCHTYPE.MEMBER) {
      await api.updateTodoListById(userInfo.id, newTodoList);
      let res = await api.getTodoListById(userInfo.id);
      if (res.data) {
        newTodoList = res.data;
      } else {
        wrong = false;
      }
    }
    localStorage.setItem('todoList', JSON.stringify(newTodoList));
    setTodoList(newTodoList);
    if (wrong) {
      type !== ModifyType.FINISH && message.success(`${type}成功`);
      return;
    }
    message.success(`${type}失败`);
  }
  function deleteTodo(ids: number[]) {
    updateTodoList(accountType, [...todoList.filter((item, index) => !ids.includes(item.id))], ModifyType.DELETE);
    setSelectedIndex([...selectedIndex.filter((item, index) => !ids.includes(item))]);
  }

  function finishTodo(ids: number[]) {
    // 完成todo
    let processedTodoList = todoList.map((item, index) => {
      if (ids.includes(item.id)) {
        item.isCompleted = true;
        // @ts-ignore
        item.completedTime = moment().format('YYYY-MM-DD HH:mm:ss');
      }
      return item;
    });
    updateTodoList(accountType, [...processedTodoList], ModifyType.FINISH);
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

  function handleAddModalOk(targetCompletedTime: Moment | null) {
    handleAdd(accountType, (contentInputRef.current && contentInputRef.current.value) || '', JSON.parse(localStorage.getItem("todoList") || "[]") || [], targetCompletedTime);
    if (contentInputRef.current != null) {
      contentInputRef.current.value = '';
    }
    setAddModalVisible(false);
  }
  function handleAddModalCancel() {
    setAddModalVisible(false);
  }

  function handleModifyComelteTodo(id: number, targetCompleteTime: Moment) {
    setModifyInfo(
      {
        modifyIndex: id, modifyOldTime: targetCompleteTime,
      },
    );
    setModifyModalVisible(true);
  }

  function handleModifyModalOk(targetCompleteTime: Moment | null) {
    let newTodoList = [...todoList.map((item, index) => {
      if (item.id === modifyInfo.modifyIndex) {
        item.targetCompleteTime = targetCompleteTime;
      }
      return item;
    })];
    updateTodoList(accountType, newTodoList, ModifyType.UPDATE);
    setModifyModalVisible(false);
    setEditIndex(-1);
  }

  function handleModifyModalCancel() {
    setModifyModalVisible(false);
  }
  return (
    <div className='container'>
      <EditInputModal
        onOk={handleAddModalOk}
        onCancel={handleAddModalCancel}
        title='预计完成时间'
        content=""
        editStatus='add'
        visible={addModalVisible}
        cancleButtonExit={false}
      />
      <EditInputModal
        onOk={handleModifyModalOk}
        onCancel={handleModifyModalCancel}
        title='修改完成时间'
        content=""
        editStatus='modify'
        defaultValue={modifyInfo.modifyOldTime || moment()}
        visible={modifyModalVisible}
        cancleButtonExit={false}
      />
      <div className='content'>
        <header className='header'>
          <h1>todos</h1>
          <div className='input-container'>
            <input maxLength={25} ref={contentInputRef} className='todoitem-input green-input' type="text" placeholder='请输入' />
            <i>回车/Enter</i>
          </div>
        </header>
        <ul>
          {renderTodos(todoList)}
        </ul>
        <footer>
          <span className='select-all-container'>
            <input checked={ifSelectAll} onChange={(e) => selectedAll(e.currentTarget.checked)} type="checkbox" />
            <label className='hover-button-style select-all-label' htmlFor='selectAll'>
              选中全部
            </label>
          </span>
          <span onClick={() => seeFinishedTodo()} className='seeCompleted hover-button-style'>
            {mode === TODOMODE.AllTODO ? '查看完成的todo' : '查看所有的todo'}
          </span>
          <span onClick={() => deleteTodo(selectedIndex)} className={`delete ${selectedStyle} hover-button-style`}>删除</span>
          <span onClick={() => finishTodo(selectedIndex)} className={`complete ${selectedStyle} hover-button-style`}>完成</span>
        </footer>
      </div>
    </div>
  );
};

export default connect(
  (state) => ({ ...state }),
)(React.memo(App));