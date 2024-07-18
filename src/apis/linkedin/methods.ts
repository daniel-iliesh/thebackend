// src/apis/linkedin/methods.ts
import linkedinApi from ".";

export const getProfile = async () => {
    const response = await linkedinApi.get("/me");
    return response.data;
};
