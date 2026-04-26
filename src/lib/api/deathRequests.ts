import api from '../axiosInstance';

export interface DeathRequest {
    id: string;
    employeeName: string;
    epfNumber: string;
    dateOfDeath: string;
    natureOfDeath: string;
    requesterName: string;
    requesterBranch: string;
    requesterDesignation: string;
    requesterEmpId: string;
    address: string;
    contactNumber: string;
    specialRemark: string;
    status: string;
    nomineeName?: string;
    nomineeBank?: string;
    nomineeBranch?: string;
    nomineeAccount?: string;
    documents: {
        deathCertificate?: string;
        nomineeId?: string;
        requestLetter?: string;
    };
    hrRemark?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDtoToFrontend = (dto: any): DeathRequest => {
    return {
        id: `DTH-${dto.id}`,
        employeeName: dto.employeeName || '',
        epfNumber: dto.epfNumber || '',
        dateOfDeath: dto.dateOfDeath || '',
        natureOfDeath: dto.natureOfDeath || '',
        requesterName: dto.requesterName || '',
        requesterBranch: dto.requesterBranch || '',
        requesterDesignation: dto.requesterDesignation || '',
        requesterEmpId: dto.requesterEmpId || '',
        address: dto.address || '',
        contactNumber: dto.contactNumber || '',
        specialRemark: dto.specialRemark || '',
        status: dto.status || 'NEW',
        nomineeName: dto.nomineeName,
        nomineeBank: dto.nomineeBank,
        nomineeBranch: dto.nomineeBranch,
        nomineeAccount: dto.nomineeAccount,
        documents: {
            deathCertificate: dto.deathCertificateDoc,
            nomineeId: dto.nomineeIdDoc,
            requestLetter: dto.requestLetterDoc,
        },
        hrRemark: dto.hrRemark || '',
    };
};

export const getAllDeathRequests = async (): Promise<DeathRequest[]> => {
    const response = await api.get('/death-requests');
    return response.data.map(mapDtoToFrontend);
};

export const createDeathRequest = async (request: Partial<DeathRequest>): Promise<DeathRequest> => {
    const payload = {
        employeeId: 1, // Placeholder
        employeeName: request.employeeName,
        epfNumber: request.epfNumber,
        dateOfDeath: request.dateOfDeath,
        natureOfDeath: request.natureOfDeath,
        requesterName: request.requesterName,
        requesterBranch: request.requesterBranch,
        requesterDesignation: request.requesterDesignation,
        requesterEmpId: request.requesterEmpId,
        address: request.address,
        contactNumber: request.contactNumber,
        specialRemark: request.specialRemark,
        status: request.status,
        nomineeName: request.nomineeName,
        nomineeBank: request.nomineeBank,
        nomineeBranch: request.nomineeBranch,
        nomineeAccount: request.nomineeAccount,
        deathCertificateDoc: request.documents?.deathCertificate,
        nomineeIdDoc: request.documents?.nomineeId,
        requestLetterDoc: request.documents?.requestLetter,
    };
    
    const response = await api.post('/death-requests', payload);
    return mapDtoToFrontend(response.data);
};

export const updateDeathRequest = async (idStr: string, request: Partial<DeathRequest>): Promise<DeathRequest> => {
    const numericId = parseInt(idStr.replace('DTH-', ''), 10);
    const payload = {
        employeeId: 1, // Placeholder
        employeeName: request.employeeName,
        epfNumber: request.epfNumber,
        dateOfDeath: request.dateOfDeath,
        natureOfDeath: request.natureOfDeath,
        requesterName: request.requesterName,
        requesterBranch: request.requesterBranch,
        requesterDesignation: request.requesterDesignation,
        requesterEmpId: request.requesterEmpId,
        address: request.address,
        contactNumber: request.contactNumber,
        specialRemark: request.specialRemark,
        status: request.status,
        nomineeName: request.nomineeName,
        nomineeBank: request.nomineeBank,
        nomineeBranch: request.nomineeBranch,
        nomineeAccount: request.nomineeAccount,
        deathCertificateDoc: request.documents?.deathCertificate,
        nomineeIdDoc: request.documents?.nomineeId,
        requestLetterDoc: request.documents?.requestLetter,
        hrRemark: request.hrRemark,
    };
    
    const response = await api.put(`/death-requests/${numericId}`, payload);
    return mapDtoToFrontend(response.data);
};

export const verifyDeathRequest = async (idStr: string): Promise<DeathRequest> => {
    const numericId = parseInt(idStr.replace('DTH-', ''), 10);
    const response = await api.post(`/death-requests/${numericId}/verify`);
    return mapDtoToFrontend(response.data);
};

export const rejectDeathRequest = async (idStr: string, reason: string): Promise<DeathRequest> => {
    const numericId = parseInt(idStr.replace('DTH-', ''), 10);
    const response = await api.post(`/death-requests/${numericId}/reject`, reason, {
        headers: { 'Content-Type': 'text/plain' }
    });
    return mapDtoToFrontend(response.data);
};

export const deleteDeathRequest = async (idStr: string): Promise<void> => {
    const numericId = parseInt(idStr.replace('DTH-', ''), 10);
    await api.delete(`/death-requests/${numericId}`);
};
