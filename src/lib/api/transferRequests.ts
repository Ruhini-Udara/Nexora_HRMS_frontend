import api from '../axiosInstance';

export interface TransferDocument {
    key: string;
    label: string;
    filename: string;
}

export type TransferStatus = "SUBMITTED" | "VERIFIED_BY_HR" | "PENDING_ADMIN" | "REJECTED" | "NEW";

export interface TransferRequest {
    id: string;
    epfNumber: string;
    employeeName: string;
    designation: string;
    branch: string;
    currentBranch: string;
    targetBranch: string;
    transferType: string;
    reason: string;
    requestDate: string;
    expectedDate: string;
    status: TransferStatus;
    documents: TransferDocument[];
    submittedAt?: string;
    createdAt?: string;
    hrRemark?: string;
}

// Internal mapping function to map DTO from backend to frontend interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDtoToFrontend = (dto: any): TransferRequest => {
    const docs: TransferDocument[] = [];
    if (dto.justificationDocumentPath) {
        docs.push({ key: 'justification', label: 'Transfer Justification Letter', filename: dto.justificationDocumentPath });
    }
    if (dto.proofDocumentPath) {
        docs.push({ key: 'proof', label: 'Supporting Document', filename: dto.proofDocumentPath });
    }

    return {
        id: `TRF-${dto.id}`,
        epfNumber: dto.epfNumber || '',
        employeeName: dto.employeeName || '',
        designation: dto.designation || '',
        branch: dto.branch || '',
        currentBranch: dto.currentBranch || '',
        targetBranch: dto.targetBranch || '',
        transferType: dto.transferType || '',
        reason: dto.reason || '',
        requestDate: dto.requestDate || '',
        expectedDate: dto.expectedDate || '',
        status: dto.status || 'NEW',
        documents: docs,
        submittedAt: dto.createdAt || '',
        createdAt: dto.createdAt || '',
        hrRemark: dto.remarks || '',
    };
};

export const getAllTransferRequests = async (): Promise<TransferRequest[]> => {
    const response = await api.get('/transfer-requests');
    return response.data.map(mapDtoToFrontend);
};

export const getTransferRequestsByEmployee = async (employeeId: number): Promise<TransferRequest[]> => {
    const response = await api.get(`/transfer-requests/employee/${employeeId}`);
    return response.data.map(mapDtoToFrontend);
};

export const createTransferRequest = async (request: Partial<TransferRequest>): Promise<TransferRequest> => {
    const payload = {
        employeeId: 1, // Placeholder until auth is available
        employeeName: request.employeeName,
        epfNumber: request.epfNumber,
        designation: request.designation,
        branch: request.branch,
        currentBranch: request.currentBranch,
        targetBranch: request.targetBranch,
        transferType: request.transferType,
        reason: request.reason,
        requestDate: request.requestDate,
        expectedDate: request.expectedDate,
        status: request.status,
        justificationDocumentPath: request.documents?.find(d => d.key === 'justification')?.filename,
        proofDocumentPath: request.documents?.find(d => d.key === 'proof')?.filename,
    };
    
    const response = await api.post('/transfer-requests', payload);
    return mapDtoToFrontend(response.data);
};

export const updateTransferStatus = async (idStr: string, status: string, remarks?: string): Promise<TransferRequest> => {
    const numericId = parseInt(idStr.replace('TRF-', ''), 10);
    const response = await api.put(`/transfer-requests/${numericId}/status`, null, {
        params: { status, remarks }
    });
    return mapDtoToFrontend(response.data);
};

export const updateTransferRequest = async (idStr: string, request: Partial<TransferRequest>): Promise<TransferRequest> => {
    const numericId = parseInt(idStr.replace('TRF-', ''), 10);
    const payload = {
        currentBranch: request.currentBranch,
        targetBranch: request.targetBranch,
        transferType: request.transferType,
        reason: request.reason,
        expectedDate: request.expectedDate,
        status: request.status,
        justificationDocumentPath: request.documents?.find(d => d.key === 'justification')?.filename,
        proofDocumentPath: request.documents?.find(d => d.key === 'proof')?.filename,
    };
    const response = await api.put(`/transfer-requests/${numericId}`, payload);
    return mapDtoToFrontend(response.data);
};
