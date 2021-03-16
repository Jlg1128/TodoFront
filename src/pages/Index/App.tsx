/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-len */
import React, { Dispatch, useEffect, useRef, useState } from 'react';

import EditInputModal from '@/pages/Index/components/editModal/editModal';
import * as api from '@/service/api';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { UserDispatchType } from '@/store/reducer/userInfoReducer';
import { ACCOUNTTYPEDISPATCHTYPE } from '@/store/reducer/accountTypeReducer';
import './App.less';
import moment, { Moment } from 'moment';
import { message, Tooltip } from 'antd';
import { TodoDispatchType } from '@/store/reducer/todoReducer';

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
  todo: TodoItem[],
}

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
  todo,
}) => {
  // 查看todo的模式
  const [mode, setLookMode] = useState<TODOMODE>(TODOMODE.AllTODO);
  const contentInputRef = useRef<HTMLInputElement>(null);
  const [isInputStatus, setInputStatus] = useState<boolean>(false);
  // 处于编辑状态的todo索引
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [editVal, setEditVal] = useState<string>('');
  // 所有选中的索引
  const [selectedIndex, setSelectedIndex] = useState<number[]>([]);
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
    window.addEventListener('keydown', (event) => handleEnterClick(JSON.parse(localStorage.getItem("accountType") || JSON.stringify("member")), event, contentInputRef.current ? contentInputRef.current.value : ''));
    return () => window.addEventListener('keydown', (event) => handleEnterClick(JSON.parse(localStorage.getItem("accountType") || JSON.stringify("member")), event, contentInputRef.current ? contentInputRef.current.value : ''));
  }, []);

  function handleEnterClick(accountType: ACCOUNTTYPEDISPATCHTYPE, event: KeyboardEvent, content: string) {
    // 回车
    if (event.key && event.key.toString() === 'Enter') {
      if (content !== '' && content !== null) {
        setAddModalVisible(true);
      }
    }
  }

  async function handleAdd(accountType: ACCOUNTTYPEDISPATCHTYPE, todoInputMsg: string, oldTodoList: TodoItem[], targetCompleteTime: Moment | null) {
    const needAddItem: TodoItem = {
      id: -1,
      content: todoInputMsg,
      isCompleted: false,
      completedTime: null,
      targetCompleteTime,
      createTime: moment(),
    };
    if (accountType === ACCOUNTTYPEDISPATCHTYPE.MEMBER) {
      const id = todo.length ? todo[todo.length - 1].id + 1 : 1;
      needAddItem.id = id;
      updateTodoList(accountType, [...todo, needAddItem], ModifyType.ADD);
    } else {
      dispatch({
        type: TodoDispatchType.ADD,
        payload: needAddItem,
      });
      message.success("添加成功");
    }
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
    if (accountType === ACCOUNTTYPEDISPATCHTYPE.MEMBER) {
      let newTodoList = [...todo.map((item, index) => {
        if (item.id === id) {
          if (content && item.content !== content) {
            item.content = content;
          }
        }
        return item;
      })];
      updateTodoList(accountType, [...newTodoList], ModifyType.UPDATE);
    } else {
      dispatch({
        type: TodoDispatchType.UPDATE,
        payload: {
          id,
          content,
        },
      });
      message.success("修改成功");
    }
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
            <Tooltip color='white' title={todoItem.content.length > 15 ? todoItem.content : ''}>
              <label className='todoitem-label' htmlFor='todoitem' onClick={() => handleEditStatusToggel(todoItem.id)}>
                {mode === TODOMODE.COMPELETED || todoItem.isCompleted === true ? <del>{todoItem.content}</del> : todoItem.content || "无内容"}
              </label>
            </Tooltip>
            <i className={`todoitem-modifydate ${todoItem.isCompleted ? 'todoitem-compeleted-item' : ''}`}>
              {mode === TODOMODE.COMPELETED || todoItem.isCompleted === true ? <span>完成时间:</span> : <span>目标时间:</span>}
              <a onClick={() => { !todoItem.isCompleted && handleModifyCompelteTodo(todoItem.id, timestamp ? moment(timestamp) : moment()); }}>
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
      let newUser = { ...userInfo, todo_list: todo };
      dispatch({
        type: UserDispatchType.MODIFYUSER,
        payload: newUser,
      });
      localStorage.setItem("userInfo", JSON.stringify(newUser));
    }
    todo.length && localStorage.setItem('todoList', JSON.stringify(todo));
  }, [todo]);

  // 是否选中全部
  useEffect(() => {
    let myTodoList = todo;
    if (mode === TODOMODE.COMPELETED) {
      myTodoList = todo.filter((todoItem, index) => todoItem.isCompleted !== true);
    }
    if (selectedIndex.length && selectedIndex.length === myTodoList.length) {
      setIfSelectedAll(true);
    } else {
      setIfSelectedAll(false);
    }
  }, [selectedIndex]);

  async function updateTodoList(accountType: ACCOUNTTYPEDISPATCHTYPE, newTodoList: TodoItem[], type: ModifyType) {
    let hasError = false;
    if (accountType === ACCOUNTTYPEDISPATCHTYPE.MEMBER) {
      try {
        let updateRes = await api.updateTodoListById(newTodoList);
        if (updateRes.success) {
          let res = await api.getTodoList();
          if (res.success && res.data) {
            newTodoList = res.data;
            dispatch({
              type: TodoDispatchType.INIT,
              payload: newTodoList,
            });
          } else {
            hasError = true;
          }
        } else {
          hasError = true;
        }
      } catch (error) {
        hasError = true;
        message.error(`异常错误，${type}失败`);
      }
    }
    if (!hasError) {
      localStorage.setItem('todoList', JSON.stringify(newTodoList));
      setInputStatus(false);
      type !== ModifyType.FINISH && message.success(`${type}成功`);
    }
  }

  function deleteTodo(ids: number[]) {
    if (accountType === ACCOUNTTYPEDISPATCHTYPE.MEMBER) {
      let newTodoList = [...todo.filter((item, index) => !ids.includes(item.id))];
      updateTodoList(accountType, newTodoList, ModifyType.DELETE);
    } else {
      dispatch({
        type: TodoDispatchType.DELETE,
        payload: ids,
      });
      message.success('删除成功');
    }

    setSelectedIndex([...selectedIndex.filter((item, index) => !ids.includes(item))]);
  }

  function finishTodo(ids: number[]) {
    if (accountType === ACCOUNTTYPEDISPATCHTYPE.MEMBER) {
      let newTodoList = todo.map((item, index) => {
        if (ids.includes(item.id)) {
          item.isCompleted = true;
          // @ts-ignore
          item.completedTime = moment().format('YYYY-MM-DD HH:mm:ss');
        }
        return item;
      });
      updateTodoList(accountType, newTodoList, ModifyType.FINISH);
    } else {
      dispatch({
        type: TodoDispatchType.FINISH,
        payload: ids,
      });
      message.success("更新成功");
    }
  }

  function selectedAll(ifSelectedAll: boolean) {
    if (ifSelectedAll === true) {
      let allId = todo.map((todoItem) => todoItem.id);
      setIfSelectedAll(true);
      if (mode === TODOMODE.COMPELETED) {
        allId = todo.filter((todoItem) => todoItem.isCompleted === true).map((item, index) => item.id);
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

  function handleModifyCompelteTodo(id: number, targetCompleteTime: Moment) {
    setModifyInfo(
      {
        modifyIndex: id, modifyOldTime: targetCompleteTime,
      },
    );
    setModifyModalVisible(true);
  }

  function handleModifyModalOk(targetCompleteTime: Moment | null) {
    if (accountType === ACCOUNTTYPEDISPATCHTYPE.MEMBER) {
      let newTodoList = [...todo.map((item, index) => {
        if (item.id === modifyInfo.modifyIndex) {
          if (targetCompleteTime && item.targetCompleteTime !== targetCompleteTime) {
            item.targetCompleteTime = targetCompleteTime;
          }
        }
        return item;
      })];
      updateTodoList(accountType, [...newTodoList], ModifyType.UPDATE);
    } else {
      dispatch({
        type: TodoDispatchType.UPDATE,
        payload: {
          id: modifyInfo.modifyIndex,
          updateTime: targetCompleteTime,
        },
      });
      message.success("修改成功");
    }

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
            <input
              onChange={() => !isInputStatus && setInputStatus(true)}
              ref={contentInputRef}
              className='todoitem-input green-input'
              type="text"
              placeholder='请输入' />
            <i className='todoitem-input-item-enter pc' style={{ display: contentInputRef.current?.value ? 'none' : 'inline' }}>回车/Enter</i>
          </div>
        </header>
        <ul>
          {renderTodos(todo)}
        </ul>
        <footer>
          <span className='select-all-container'>
            <input checked={ifSelectAll} onChange={(e) => selectedAll(e.currentTarget.checked)} type="checkbox" />
            <label onClick={() => selectedAll(!ifSelectAll)} className='hover-button-style select-all-label' htmlFor='selectAll'>
              选中全部
            </label>
          </span>
          <span onClick={() => seeFinishedTodo()} className='seeCompleted hover-button-style'>
            {mode === TODOMODE.AllTODO ? '查看完成的todo' : '查看所有的todo'}
          </span>
          <span onClick={() => selectedIndex.length && deleteTodo(selectedIndex)} className={`delete ${selectedStyle} hover-button-style`}>删除</span>
          <span onClick={() => selectedIndex.length && finishTodo(selectedIndex)} className={`complete ${selectedStyle} hover-button-style`}>完成</span>
        </footer>
      </div>
    </div>
  );
};

export default connect(
  (state) => ({ ...state }),
)(React.memo(App));