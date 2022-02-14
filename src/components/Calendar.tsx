import React, {useCallback, useRef, useState} from 'react';
import styled from 'styled-components/native';
import {color, Theme} from '../theme/color';
import DateUtil from '../utils/DateUtil';
import {View, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import {useUser} from '../providers/UserProvider';
import {useFocusEffect} from '@react-navigation/native';
import {StyledText} from './shared/StyledText';

const CalendarView = styled.View`
  background-color: ${({theme}: {theme: Theme}) => theme.background};
  border-radius: 12px;
  width: 100%;
  padding: 24px 15px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.12);
  margin-bottom: 24px;
`;

const RowBox = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
`;

const TextBox = styled.Pressable`
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
`;

const Mark = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${color.primary};
  position: absolute;
  top: 1px;
`;

const Days = styled.Text`
  color: ${({theme}: {theme: Theme}) => theme.subText};
`;

const Date = styled.Text`
  color: ${({
    index,
    firstDay,
    length,
    theme,
  }: {
    index: number;
    firstDay: number;
    length: number;
    theme: Theme;
  }) => (index >= firstDay && index < length ? color.gray : theme.box)};
`;

const days = ['일', '월', '화', '수', '목', '금', '토'];

type Props = {
  today: number;
  selectedDate: number;
  selectDate: (date: number) => void;
};

const Calendar = ({today, selectedDate, selectDate}: Props) => {
  const {user} = useUser();
  const [lastDate, setLastDate] = useState<number>(today);
  const firstDay = useRef(0);
  const [displayedDates, setDisplayedDates] = useState<number[]>([]);
  const [studiedDates, setStudiedDates] = useState<number[]>([]);

  const getStudyInfosByMonth = useCallback(
    async (date: number) => {
      if (!user) {
        return;
      }

      let dates: number[] = [];
      for (let i = Math.floor(date / 100) * 100 + 1; i <= date; i++) {
        const studyInfo = await firestore()
          .collection('StudyInfo')
          .doc(user.username)
          .collection(i.toString())
          .get();
        if (studyInfo.size > 0) {
          dates.push(i);
        }
      }
      setStudiedDates(dates);
    },
    [user],
  );

  const getCalendarInfo = useCallback((date: number) => {
    const lastDate = DateUtil.getLastDate(date);
    const lastDateOfPrevMonth = DateUtil.getLastDateOfPrevMonth(date);

    let dates: number[] = [];
    for (let i = firstDay.current - 1; i >= 0; i--) {
      dates.push(lastDateOfPrevMonth - i);
    }
    for (let i = Math.floor(lastDate / 100) * 100 + 1; i <= lastDate; i++) {
      dates.push(i);
    }
    setDisplayedDates(dates);
  }, []);

  useFocusEffect(
    useCallback(() => {
      firstDay.current = DateUtil.getFirstDay(lastDate);
      getCalendarInfo(lastDate);
      getStudyInfosByMonth(lastDate);
    }, [getCalendarInfo, getStudyInfosByMonth, lastDate]),
  );

  const changeToPrevMonth = () => {
    const changedDate = DateUtil.getLastDateOfPrevMonth(lastDate);
    setLastDate(changedDate);
  };

  const changeToNextMonth = () => {
    const changedDate = DateUtil.getLastDateOfNextMonth(lastDate);
    DateUtil.getMonth(changedDate) === DateUtil.getMonth(today)
      ? setLastDate(today)
      : setLastDate(changedDate);
  };

  return (
    <CalendarView style={{shadowColor: 'rgba(0, 0, 0, 0.12)', elevation: 12}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 30,
        }}>
        <Icon
          name={'arrow-left'}
          size={25}
          color={color.primary}
          onPress={changeToPrevMonth}
        />
        <StyledText
          style={{
            fontSize: 18,
            fontWeight: '700',
            marginHorizontal: 12,
          }}>
          {DateUtil.yearMonth(lastDate)}
        </StyledText>
        <Icon
          name={'arrow-right'}
          size={25}
          color={lastDate !== today ? color.primary : color.gray}
          onPress={lastDate !== today ? changeToNextMonth : undefined}
        />
      </View>
      <RowBox>
        {days.map(day => (
          <TextBox key={day}>
            <Days>{day}</Days>
          </TextBox>
        ))}
      </RowBox>

      {[...new Array(Math.ceil(displayedDates.length / 7) + 1).keys()].map(
        i => {
          return (
            <RowBox key={i}>
              {[...new Array(7).keys()].map(j => {
                const index = i * 7 + j;
                return (
                  <TextBox
                    key={index + 7}
                    style={
                      displayedDates[index] === selectedDate && {
                        borderRadius: 20,
                        borderWidth: 2,
                        borderColor: color.subPrimary,
                      }
                    }
                    onPress={
                      index >= firstDay.current && index < displayedDates.length
                        ? () => selectDate(displayedDates[index])
                        : undefined
                    }>
                    {studiedDates.includes(displayedDates[index]) && <Mark />}
                    <Date
                      index={index}
                      firstDay={firstDay.current}
                      length={displayedDates.length}>
                      {index < displayedDates.length
                        ? displayedDates[index] % 100
                        : index - displayedDates.length + 1}
                    </Date>
                  </TextBox>
                );
              })}
            </RowBox>
          );
        },
      )}
    </CalendarView>
  );
};

export default Calendar;
