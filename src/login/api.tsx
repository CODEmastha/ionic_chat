import axios from 'axios';
import {authConfig, baseUrl, config, withLogs} from '../core';

const authUrl = `http://${baseUrl}/login`;

export interface LoginProps {
    token: string;
}

export interface UserProps{
    latitude: number;
    longitude: number;
    username?: string;
}

export const login: (username?: string, password?: string) => Promise<LoginProps> = (username, password) => {
    return withLogs(axios.post(authUrl, { username, password }, config), 'login');
}

export const getUsers: (token: string) => Promise<UserProps[]> = (token) => {
    return withLogs(axios.get("http://localhost:8080/users", authConfig(token)), 'getUsers');
}

export const getOnMapUsers: (token: string) => Promise<UserProps[]> = (token ) => {
    return withLogs(axios.get("http://localhost:8080/users/onmapusers", authConfig(token)), 'getOnMapUsers');
}

export const updateUser: (token: string, user: UserProps) => Promise<UserProps> = (token, user) => {
    return withLogs(axios.put("http://localhost:8080/users", user, authConfig(token)), 'updateUser');
}