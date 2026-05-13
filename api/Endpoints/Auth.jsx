import axios from "axios";
import { baseUrl } from "../baseUrl.jsx";
export const login = (data) => axios.post(`${baseUrl}/auth/login`, data)
export const register = (data) => axios.post(`${baseUrl}/users/register`, data);