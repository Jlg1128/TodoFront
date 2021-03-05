/* eslint-disable no-plusplus */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import moment, { Moment } from 'moment';
import { Modal, DatePicker, ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import './editModal.less';

type Props = {
  visible?: boolean,
  onOk: (targetCompletedTime: Moment | null) => void;
  onCancel?: () => void;
  // editStatus: 'new' | 'modify';
  title?: string;
  defaultValue?: Moment;
  content: string;
  editStatus: 'add' | 'modify',
  loading?: boolean;
  cancleButtonExit: boolean;
}

const EditInputModal: React.FC<Props> = ({
  visible,
  onOk,
  onCancel,
  title,
  loading,
  defaultValue,
  editStatus,
  cancleButtonExit,
}) => {
  const [selectedTime, setSelectedTime] = useState<Moment | null>(null);
  function handleOk(selectedTime: Moment | null) {
    onOk && onOk(selectedTime);
  }
  function handleCancel() {
    selectedTime && setSelectedTime(selectedTime);
    onCancel && onCancel();
  }

  function handleDatePickChange(date: Moment | null, dateString: string) {
    setSelectedTime(date);
    setTimeout(() => {
      onOk(date);
    }, 300);
  }

  function handleDatePickOk(date: Moment | null) {
    setSelectedTime(date);
  }

  function range(start: any, end: any) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  // 设置禁用到当前日期
  function disabledDate(current: any) {
    return current && current < moment().subtract(1, 'day');
  }

  // 设置禁用到当前的时分秒
  function disabledDateTime(current: any) {
    return {
      disabledHours: () => range(0, 24).splice(0, moment().hours()),
      disabledMinutes: () => range(0, 24).splice(0, moment().minutes()),
    };
  }

  return (
    <Modal
      title={title && title}
      className={`add-modal ${!cancleButtonExit ? 'cancle-button-exit' : ''}`}
      onCancel={() => handleCancel()}
      onOk={() => handleOk(selectedTime)}
      okText='确定'
      width='196px'
      confirmLoading={loading}
      visible={visible}>
      <ConfigProvider locale={zhCN}>
        <DatePicker
          disabledDate={disabledDate}
          showTime
          format='MM/DD HH:mm'
          defaultValue={editStatus === 'modify' ? (defaultValue || undefined) : undefined}
          // onChange={handleDatePickChange}
          onOk={(date) => { handleDatePickOk(date); }}
        />
      </ConfigProvider>
    </Modal>
  );
};

export default EditInputModal;