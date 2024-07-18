// src/apis/linkedin/index.ts
import { configDotenv } from "dotenv";
import { createAxiosInstance } from "../axiosConfig";

configDotenv();

const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

const linkedinApi = createAxiosInstance("https://api.linkedin.com/v2");

linkedinApi.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

export default linkedinApi;
