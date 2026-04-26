import api from '../axiosInstance';

export type RequestStatus = 'New' | 'Submitted for Certification' | 'Approved' | 'Rejected';

export interface WelfareRequest {
    id: string;
    status: RequestStatus;
    welfareType: string;
    employeeType: string;
    amount: string;
    specialRemark: string;
    dateOfRequest: string;
    documents: {
        supporting_document?: string;
    };
    submittedAt?: string;
    createdAt?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDtoToFrontend = (dto: any): WelfareRequest => {
    return {
        id: `WLF-${dto.id}`,
        status: dto.status || 'New',
        welfareType: dto.welfareType || '',
        employeeType: dto.role || 'Permanent', // Fallback, mapping role to employeeType for now
        amount: dto.amount?.toString() || '',
        specialRemark: dto.remarks || '',
        dateOfRequest: dto.requestDate || '',
        documents: {
            supporting_document: dto.supportingDocument || undefined
        },
        createdAt: dto.createdAt || '',
        submittedAt: dto.createdAt || '',
    };
};

export const getAllWelfareRequests = async (): Promise<WelfareRequest[]> => {
    const response = await api.get('/welfare-requests');
    return response.data.map(mapDtoToFrontend);
};

export const createWelfareRequest = async (request: Partial<WelfareRequest>): Promise<WelfareRequest> => {
    const payload = {
        employeeId: 1, // Placeholder
        employeeName: "Current User", // Placeholder
        email: "user@hexaco.com", // Placeholder
        role: request.employeeType,
        initials: "CU", // Placeholder
        welfareType: request.welfareType,
        amount: parseFloat(request.amount || '0'),
        remarks: request.specialRemark,
        status: request.status,
        supportingDocument: request.documents?.supporting_document,
    };
    
    const response = await api.post('/welfare-requests', payload);
    return mapDtoToFrontend(response.data);
};

export const updateWelfareStatus = async (idStr: string, status: string, remarks?: string): Promise<WelfareRequest> => {
    const numericId = parseInt(idStr.replace('WLF-', ''), 10);
    const response = await api.put(`/welfare-requests/${numericId}/status`, null, {
        params: { status, remarks }
    });
    return mapDtoToFrontend(response.data);
};

export const updateWelfareRequest = async (idStr: string, request: Partial<WelfareRequest>): Promise<WelfareRequest> => {
    const numericId = parseInt(idStr.replace('WLF-', ''), 10);
    const payload = {
        welfareType: request.welfareType,
        amount: parseFloat(request.amount || '0'),
        remarks: request.specialRemark,
        status: request.status,
        supportingDocument: request.documents?.supporting_document,
    };
    const response = await api.put(`/welfare-requests/${numericId}`, payload);
    return mapDtoToFrontend(response.data);
};
