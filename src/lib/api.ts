const API_BASE = "http://localhost:3001/api";

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}

function removeToken() {
  localStorage.removeItem("auth_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser will set multipart with boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "حدث خطأ غير متوقع" }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
}

export interface SignInResponse {
  token: string;
  user: AuthUser;
  role: "patient" | "doctor" | "lab" | null;
}

export interface MeResponse {
  user: AuthUser;
  role: "patient" | "doctor" | "lab" | null;
}

export const api = {
  auth: {
    signUp: (email: string, password: string, fullName: string, role: string) =>
      request<{ message: string }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, fullName, role }),
      }),

    signIn: async (email: string, password: string): Promise<SignInResponse> => {
      const data = await request<SignInResponse>("/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      return data;
    },

    signOut: () => {
      removeToken();
      return Promise.resolve();
    },

    getMe: () => request<MeResponse>("/auth/me"),

    getToken,
    hasToken: () => !!getToken(),
  },

  // Profiles
  profiles: {
    getByIds: (userIds: string[]) =>
      request<Array<{ user_id: string; full_name: string; phone?: string; avatar_url?: string }>>(
        `/profiles?user_ids=${userIds.join(",")}`
      ),
    getLabs: () =>
      request<Array<{ user_id: string; full_name: string }>>("/profiles/labs"),
    getPatients: () =>
      request<Array<{ user_id: string; full_name: string }>>("/profiles/patients"),
  },

  // Appointments
  appointments: {
    list: () => request<any[]>("/appointments"),
    create: (data: { lab_id: string; appointment_date: string; test_type: string; notes?: string }) =>
      request<any>("/appointments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },

  // Medical tests
  tests: {
    list: () => request<any[]>("/tests"),
    create: (formData: FormData) =>
      request<any>("/tests", {
        method: "POST",
        body: formData,
      }),
  },

  // Test notes
  notes: {
    list: (testIds?: string[]) => {
      const query = testIds && testIds.length > 0 ? `?test_ids=${testIds.join(",")}` : "";
      return request<any[]>(`/notes${query}`);
    },
    create: (testId: string, note: string) =>
      request<any>("/notes", {
        method: "POST",
        body: JSON.stringify({ test_id: testId, note }),
      }),
  },
};
