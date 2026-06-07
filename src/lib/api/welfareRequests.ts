import api from '../axiosInstance';

export type RequestStatus = 'NEW' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface WelfareRequest {
    id: string;
    employeeName: string;
    epfNumber: string;
    designation: string;
    branch: string;
    status: RequestStatus;
    welfareType: string;
    employeeType: string;
    amount: number;
    employeeRemarks: string;
    hrRemarks: string;
    email: string;
    dateOfRequest: string;
    documents: { key: string; label: string; filename: string }[];
    createdAt?: string;
    submittedAt?: string;
}

const normalizeStatus = (status: string): RequestStatus => {
    if (!status) return 'NEW';
    const s = status.toUpperCase();
    if (s.includes('SUBMITTED') || s.includes('PENDING')) return 'SUBMITTED';
    if (s.includes('APPROVE')) return 'APPROVED';
    if (s.includes('REJECT')) return 'REJECTED';
    return 'NEW';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDtoToFrontend = (dto: any): WelfareRequest => {
    return {
        id: `WLF-${dto.id}`,
        employeeName: dto.employeeName || '',
        epfNumber: dto.epfNumber || '',
        designation: dto.designation || '',
        branch: dto.branch || '',
        status: normalizeStatus(dto.status),
        welfareType: dto.welfareType || '',
        employeeType: dto.role || 'Permanent', 
        amount: parseFloat(dto.amount) || 0,
        employeeRemarks: dto.employeeRemarks || '',
        hrRemarks: dto.hrRemarks || '',
        email: dto.email || '',
        dateOfRequest: dto.requestDate || '',
        documents: dto.supportingDocument ? [{ key: 'support', label: 'Supporting Document', filename: dto.supportingDocument }] : [],
        createdAt: dto.createdAt || '',
        submittedAt: dto.createdAt || '',
    };
};

export const getAllWelfareRequests = async (): Promise<WelfareRequest[]> => {
    const response = await api.get('/api/welfare-requests');
    return response.data.map(mapDtoToFrontend);
};

export const getWelfareRequestsByEmployee = async (employeeId: number): Promise<WelfareRequest[]> => {
    const response = await api.get(`/api/welfare-requests/employee/${employeeId}`);
    return response.data.map(mapDtoToFrontend);
};

export const createWelfareRequest = async (request: Partial<WelfareRequest>, userDetails?: { id: number; name: string; email: string }): Promise<WelfareRequest> => {
    const payload = {
        employeeId: userDetails?.id || 1, 
        employeeName: userDetails?.name || "Current User",
        email: userDetails?.email || "user@hexaco.com",
        role: request.employeeType,
        initials: userDetails?.name ? userDetails.name.split(' ').map(n => n[0]).join('') : "CU",
        welfareType: request.welfareType,
        amount: request.amount || 0,
        employeeRemarks: request.employeeRemarks,
        status: request.status,
        supportingDocument: request.documents && request.documents.length > 0 ? request.documents[0].filename : undefined,
    };
    
    const response = await api.post('/api/welfare-requests', payload);
    return mapDtoToFrontend(response.data);
};

export const updateWelfareStatus = async (idStr: string, status: string, remarks?: string): Promise<WelfareRequest> => {
    const numericId = parseInt(idStr.replace('WLF-', ''), 10);
    const response = await api.put(`/api/welfare-requests/${numericId}/status`, null, {
        params: { status, remarks }
    });
    return mapDtoToFrontend(response.data);
};

export const updateWelfareRequest = async (idStr: string, request: Partial<WelfareRequest>): Promise<WelfareRequest> => {
    const numericId = parseInt(idStr.replace('WLF-', ''), 10);
    const payload = {
        welfareType: request.welfareType,
        amount: request.amount || 0,
        employeeRemarks: request.employeeRemarks,
        status: request.status,
        supportingDocument: request.documents && request.documents.length > 0 ? request.documents[0].filename : undefined,
    };
    const response = await api.put(`/api/welfare-requests/${numericId}`, payload);
    return mapDtoToFrontend(response.data);
};
