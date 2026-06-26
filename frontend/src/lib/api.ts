const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

const api = {
  get: async (url: string, config?: any) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "GET",
      headers: getHeaders(),
      ...config
    });
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }
    const data = await response.json();
    return { data };
  },
  post: async (url: string, data?: any, config?: any) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const headers: any = { ...getHeaders(), ...(config?.headers || {}) };
    
    if (isFormData || headers["Content-Type"] === "multipart/form-data") {
      delete headers["Content-Type"];
    }

    const response = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      ...config,
      headers,
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined)
    });
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }
    // Only parse json if there's content
    const resText = await response.text();
    let resData;
    try {
      resData = resText ? JSON.parse(resText) : {};
    } catch (e) {
      resData = resText;
    }
    return { data: resData };
  },
  put: async (url: string, data?: any, config?: any) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const headers: any = { ...getHeaders(), ...(config?.headers || {}) };
    
    if (isFormData || headers["Content-Type"] === "multipart/form-data") {
      delete headers["Content-Type"];
    }

    const response = await fetch(`${BASE_URL}${url}`, {
      method: "PUT",
      ...config,
      headers,
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined)
    });
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }
    // Only parse json if there's content
    const resText = await response.text();
    let resData;
    try {
      resData = resText ? JSON.parse(resText) : {};
    } catch (e) {
      resData = resText;
    }
    return { data: resData };
  },
  delete: async (url: string, config?: any) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "DELETE",
      headers: getHeaders(),
      ...config
    });
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }
    const resData = await response.json().catch(() => ({}));
    return { data: resData };
  }
};

export default api;
