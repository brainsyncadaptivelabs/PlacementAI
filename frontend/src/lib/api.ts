const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const getHeaders = (url?: string) => {
  const isAdmin = url && url.startsWith("/admin");
  const tokenKey = isAdmin ? "admin_token" : "token";
  const token = typeof window !== "undefined" ? localStorage.getItem(tokenKey) : null;
  const csrfToken = typeof window !== "undefined" ? localStorage.getItem("admin_csrf") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(isAdmin && csrfToken ? { "X-CSRF-Token": csrfToken } : {})
  };
};

const handleResponseError = async (response: Response, url?: string) => {
  if (response.status === 401 || response.status === 403) {
    if (typeof window !== "undefined") {
      const isAdmin = url && url.startsWith("/admin");
      if (isAdmin) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_csrf");
        window.location.href = "/admin";
      } else {
        localStorage.removeItem("token");
        const currentPath = window.location.pathname;
        if (currentPath.startsWith("/recruiter")) {
          window.location.href = "/auth/recruiter";
        } else if (currentPath.startsWith("/placement-officer")) {
          window.location.href = "/auth/placement-officer";
        } else {
          window.location.href = "/auth";
        }
      }
    }
  }
  const errorText = await response.text();
  let errorData;
  try {
    errorData = errorText ? JSON.parse(errorText) : {};
  } catch (e) {
    errorData = errorText;
  }
  const error = new Error(`HTTP error! status: ${response.status}`);
  (error as any).response = {
    status: response.status,
    data: errorData
  };
  throw error;
};

const api = {
  get: async (url: string, config?: any) => {
    let response;
    try {
      response = await fetch(`${BASE_URL}${url}`, {
        method: "GET",
        headers: getHeaders(url),
        ...config
      });
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        throw new Error("Backend unavailable");
      }
      throw err;
    }
    if (!response.ok) await handleResponseError(response, url);
    if (config?.responseType === "blob") {
      const blob = await response.blob();
      return { data: blob };
    }
    const resText = await response.text();
    let resData;
    try {
      resData = resText ? JSON.parse(resText) : {};
    } catch (e) {
      resData = resText;
    }
    return { data: resData };
  },
  post: async (url: string, data?: any, config?: any) => {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const headers: any = { ...getHeaders(url), ...(config?.headers || {}) };
    
    if (isFormData || headers["Content-Type"] === "multipart/form-data") {
      delete headers["Content-Type"];
    }

    let response;
    try {
      response = await fetch(`${BASE_URL}${url}`, {
        method: "POST",
        ...config,
        headers,
        body: isFormData ? data : (data ? JSON.stringify(data) : undefined)
      });
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        throw new Error("Backend unavailable");
      }
      throw err;
    }
    if (!response.ok) await handleResponseError(response, url);
    if (config?.responseType === "blob") {
      const blob = await response.blob();
      return { data: blob };
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
    const headers: any = { ...getHeaders(url), ...(config?.headers || {}) };
    
    if (isFormData || headers["Content-Type"] === "multipart/form-data") {
      delete headers["Content-Type"];
    }

    let response;
    try {
      response = await fetch(`${BASE_URL}${url}`, {
        method: "PUT",
        ...config,
        headers,
        body: isFormData ? data : (data ? JSON.stringify(data) : undefined)
      });
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        throw new Error("Backend unavailable");
      }
      throw err;
    }
    if (!response.ok) await handleResponseError(response, url);
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
    let response;
    try {
      response = await fetch(`${BASE_URL}${url}`, {
        method: "DELETE",
        headers: getHeaders(url),
        ...config
      });
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        throw new Error("Backend unavailable");
      }
      throw err;
    }
    if (!response.ok) await handleResponseError(response, url);
    const resData = await response.json().catch(() => ({}));
    return { data: resData };
  }
};

export default api;
