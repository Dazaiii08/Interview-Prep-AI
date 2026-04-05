import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
    timeout: 80000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

//Request Interceptor
axiosInstance.interceptors.request.use(
    (config)=>{
        const accessToken = localStorage.getItem("token");
        if(accessToken){
            config.headers.Authorization=`Bearer ${accessToken}`;
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
);

//Response Interceptor
axiosInstance.interceptors.response.use(
    (response)=>{
        return response;
    },
    (error)=>{
        //Handles common errors globally
        if(error.response){
            if(error.response.status === 401){
                //Redirect to lgoin page
                window.location.href="/";
            } else if(error.response.status === 500){
                console.error("Server Error. Please try again later.");
            }
        }
         else if(error.code === "ECONNABORTED"){
                console.error("Request timout. Please try again.");
            }
            return Promise.reject(error);
    }
);

export default axiosInstance;