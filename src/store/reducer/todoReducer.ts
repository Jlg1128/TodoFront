/* eslint-disable no-case-declarations */
/* eslint-disable max-len */
import { TodoItem } from "@/service/api";
import moment, { Moment } from 'moment';

export enum TodoDispatchType {
  INIT = "INIT",
  ADD = "ADD",
  DELETE = "DELETE",
  UPDATE = "UPDATE",
  FINISH = "FINISH",
}

const initialTodo: TodoItem[] = [];

export const todo = (state = initialTodo, action: { type: TodoDispatchType, payload: any }) => {
  switch (action.type) {
    case TodoDispatchType.INIT:
      return [...action.payload];
    case TodoDispatchType.ADD:
      const id = state.length ? state[state.length - 1].id + 1 : 1;
      action.payload.id = id;
      return [...state, action.payload];
    case TodoDispatchType.DELETE:
      const deleteIds: number[] = action.payload;
      return [...state.filter((item, index) => !deleteIds.includes(item.id))];
    case TodoDispatchType.UPDATE:
      const updateId = action.payload.id;
      const { updateTime } = action.payload;
      const updateContent = action.payload.content;
      let changeFlag = false;
      let newTodoList = [...state.map((item, index) => {
        if (item.id === updateId) {
          if (updateContent && item.content !== updateContent) {
            changeFlag = true;
            item.content = updateContent;
          }
          if (updateTime && item.targetCompleteTime !== updateTime) {
            changeFlag = true;
            item.targetCompleteTime = updateTime;
          }
        }
        return item;
      })];
      if (changeFlag) return [...newTodoList];
      return state;
    case TodoDispatchType.FINISH:
      const finishedIds: number[] = action.payload;
      let overedTodoList = state.map((item, index) => {
        if (finishedIds.includes(item.id)) {
          item.isCompleted = true;
          // @ts-ignore
          item.completedTime = moment().format('YYYY-MM-DD HH:mm:ss');
        }
        return item;
      });
      return [...overedTodoList];
    default:
      return state;
  }
};