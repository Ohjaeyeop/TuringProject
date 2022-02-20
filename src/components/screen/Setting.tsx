import React from 'react';
import ScreenHeader from '../shared/ScreenHeader';
import styled from 'styled-components/native';
import {color, Theme} from '../../theme/color';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useUser} from '../../providers/UserProvider';

const SettingContainer = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}: {theme: Theme}) => theme.background};
`;

const Setting = () => {
  const {setUser} = useUser();

  return (
    <SettingContainer>
      <ScreenHeader title={'설정'} />
      <TouchableOpacity
        style={{flex: 1, paddingHorizontal: 28}}
        onPress={() => setUser(undefined)}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text style={{color: color.gray, fontWeight: '700', fontSize: 12}}>
            로그아웃
          </Text>
          <View style={{padding: 2}}>
            <Icon name={'md-arrow-forward'} size={20} color={color.gray} />
          </View>
        </View>
      </TouchableOpacity>
    </SettingContainer>
  );
};

export default Setting;
