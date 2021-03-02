import React from 'react';

let color = {
    light: '#ffffff',
    black: '#000000',
};

export enum ThemeType{
    light = 'black',
    red = 'red'
}

export const ThemeContext = React.createContext<ThemeType>(ThemeType.red);
