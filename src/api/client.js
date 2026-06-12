import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
});


export const apiFetcher = async (url) => {
   const response = await apiClient.get(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`}
   });

   return response.data;
}
