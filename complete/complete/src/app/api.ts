export const API_BASE_URL = ''; // Relative to proxy

/**
 * Returns an object containing the Authorization header if a token is present.
 */
function getAuthHeader(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

export interface UserLoginCredentials {
    email: string;
    password: string;
}

export async function login(credentials: UserLoginCredentials) {
    const body = new URLSearchParams();
    body.append('username', credentials.email);
    body.append('password', credentials.password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');

    if (!response.ok) {
        if (isJson) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        } else {
            const text = await response.text();
            throw new Error(`Login failed (${response.status}): ${text.substring(0, 100)}`);
        }
    }

    if (!isJson) {
        throw new Error("Received non-JSON response from server");
    }

    const data = await response.json();
    if (data.access_token) {
        localStorage.setItem('token', data.access_token);
    }
    return data;
}

export function logout() {
    localStorage.removeItem('token');
}

export async function register(formData: any) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            full_name: formData.fullName,
            email: formData.email,
            password: formData.password,
            confirm_password: formData.confirmPassword,
            role: 'patient',
            allergies: formData.allergies || []
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
    }

    return await response.json();
}

export async function uploadPrescription(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/prescriptions/upload`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Upload failed');
    }

    return await response.json();
}

export async function processOCR(prescriptionId: string) {
    const response = await fetch(`${API_BASE_URL}/prescriptions/${prescriptionId}/process-ocr`, {
        method: 'POST',
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        throw new Error('OCR completion failed');
    }

    return await response.json();
}

export async function getMyPrescriptions() {
    const response = await fetch(`${API_BASE_URL}/prescriptions/my`, {
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch prescriptions');
    }

    return await response.json();
}

export async function getMe() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user profile');
    }

    return await response.json();
}

export async function checkInteractions(drugs: string[]) {
    const params = new URLSearchParams();
    drugs.forEach(d => params.append('drugs', d));

    const response = await fetch(`${API_BASE_URL}/interactions/check?${params.toString()}`, {
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        throw new Error('Failed to check interactions');
    }

    return await response.json();
}

export async function getAllergyRisks() {
    const response = await fetch(`${API_BASE_URL}/safety/my-allergy-risks`, {
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch allergy risks');
    }

    return await response.json();
}

export async function updateAllergies(allergies: any[]) {
    const response = await fetch(`${API_BASE_URL}/users/allergies`, {
        method: 'PUT',
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ allergies }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update allergies');
    }

    return await response.json();
}

export async function deletePrescription(prescriptionId: string) {
    const response = await fetch(`${API_BASE_URL}/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Delete failed');
    }

    return await response.json();
}

export async function updatePrescription(prescriptionId: string, updates: any) {
    const response = await fetch(`${API_BASE_URL}/prescriptions/${prescriptionId}`, {
        method: 'PUT',
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Update failed');
    }

    return await response.json();
}

export async function saveManualPrescription(data: any) {
    const response = await fetch(`${API_BASE_URL}/prescriptions/manual`, {
        method: 'POST',
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to save manual prescription');
    }

    return await response.json();
}

export async function changePassword(data: any) {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'PUT',
        headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            current_password: data.currentPassword,
            new_password: data.newPassword
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to change password');
    }

    return await response.json();
}

export async function deleteAccount() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete account');
    }

    return await response.json();
}
