import api from '../axiosInstance';

export interface DeathRequest {
    id: string;
    employeeId: string;
    employeeDbId?: number;
    employeeName: string;
    employeePhone?: string;
    epfNumber: string;
    dateOfDeath: string;
    natureOfDeath: string;
    requesterName: string;
    requesterNic?: string;
    requesterEmail?: string;
    requesterBranch: string;
    requesterDesignation: string;
    requesterEmpId: string;
    address: string;
    contactNumber: string;
    specialRemark: string;
    status: string;
    nomineeName?: string;
    nomineeRelationship?: string;
    nomineeNic?: string;
    nomineePhone?: string;
    nomineeAddress?: string;
    nomineeBank?: string;
    nomineeBranch?: string;
    nomineeAccount?: string;
    documents: {
        deathCertificate?: string;
        nomineeId?: string;
        requestLetter?: string;
    };
    hrRemark?: string;
    directorRemark?: string;
    boardMeetingDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

 
const mapDtoToFrontend = (dto: any): DeathRequest => {
    return {
        id: `DTH-${dto.id}`,
        employeeId: dto.employeeIdString || '',
        employeeDbId: dto.employeeId,
        employeeName: dto.employeeName || '',
        employeePhone: dto.employeePhone || '',
        epfNumber: dto.epfNumber || '',
        dateOfDeath: dto.dateOfDeath ? String(dto.dateOfDeath).split('T')[0] : '',
        natureOfDeath: dto.natureOfDeath || '',
        requesterName: dto.requesterName || '',
        requesterNic: dto.requesterNic || '',
        requesterEmail: dto.requesterEmail || '',
        requesterBranch: dto.requesterBranch || '',
        requesterDesignation: dto.requesterDesignation || '',
        requesterEmpId: dto.requesterEmpId || '',
        address: dto.address || '',
        contactNumber: dto.contactNumber || '',
        specialRemark: dto.specialRemark || '',
        status: dto.status || 'NEW',
        nomineeName: dto.nomineeName,
        nomineeRelationship: dto.nomineeRelationship,
        nomineeNic: dto.nomineeNic,
        nomineePhone: dto.nomineePhone,
        nomineeAddress: dto.nomineeAddress,
        nomineeBank: dto.nomineeBank,
        nomineeBranch: dto.nomineeBranch,
        nomineeAccount: dto.nomineeAccount,
        documents: {
            deathCertificate: dto.deathCertificateDoc,
            nomineeId: dto.nomineeIdDoc,
            requestLetter: dto.requestLetterDoc,
        },
        hrRemark: dto.hrRemark || '',
        directorRemark: dto.directorRemark || '',
        boardMeetingDate: dto.boardMeetingDate || '',
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt || dto.createdAt || '',
    };
};

export const getAllDeathRequests = async (): Promise<DeathRequest[]> => {
    const response = await api.get('/api/death-requests');
    return response.data.map(mapDtoToFrontend);
};

export const createDeathRequest = async (request: Partial<DeathRequest> & { employeeDbId?: number }, userDetails?: { id: number }): Promise<DeathRequest> => {
    const payload = {
        employeeId: request.employeeDbId || (typeof request.employeeId === 'number' ? request.employeeId : undefined), 
        employeeIdString: typeof request.employeeId === 'string' ? request.employeeId : (request.employeeId ? String(request.employeeId) : undefined),
        employeeName: request.employeeName,
        employeePhone: request.employeePhone,
        epfNumber: request.epfNumber,
        dateOfDeath: request.dateOfDeath,
        natureOfDeath: request.natureOfDeath,
        requesterName: request.requesterName,
        requesterNic: request.requesterNic,
        requesterEmail: request.requesterEmail,
        requesterBranch: request.requesterBranch,
        requesterDesignation: request.requesterDesignation,
        requesterEmpId: request.requesterEmpId,
        address: request.address,
        contactNumber: request.contactNumber,
        specialRemark: request.specialRemark,
        status: request.status,
        nomineeName: request.nomineeName,
        nomineeRelationship: request.nomineeRelationship,
        nomineeNic: request.nomineeNic,
        nomineePhone: request.nomineePhone,
        nomineeAddress: request.nomineeAddress,
        nomineeBank: request.nomineeBank,
        nomineeBranch: request.nomineeBranch,
        nomineeAccount: request.nomineeAccount,
        deathCertificateDoc: request.documents?.deathCertificate,
        nomineeIdDoc: request.documents?.nomineeId,
        requestLetterDoc: request.documents?.requestLetter,
    };
    
    const response = await api.post('/api/death-requests', payload);
    return mapDtoToFrontend(response.data);
};

export const updateDeathRequest = async (idStr: string, request: Partial<DeathRequest> & { employeeDbId?: number }, userDetails?: { id: number }): Promise<DeathRequest> => {
    const numericId = parseInt(idStr.replace('DTH-', ''), 10);
    if (isNaN(numericId)) {
        throw new Error(`Invalid Death Request ID: "${idStr}". Please select an existing application.`);
    }
    const payload = {
        employeeId: request.employeeDbId || (typeof request.employeeId === 'number' ? request.employeeId : undefined), 
        employeeIdString: typeof request.employeeId === 'string' ? request.employeeId : (request.employeeId ? String(request.employeeId) : undefined),
        employeeName: request.employeeName,
        employeePhone: request.employeePhone,
        epfNumber: request.epfNumber,
        dateOfDeath: request.dateOfDeath ? String(request.dateOfDeath).split('T')[0] : undefined,
        natureOfDeath: request.natureOfDeath,
        requesterName: request.requesterName,
        requesterNic: request.requesterNic,
        requesterEmail: request.requesterEmail,
        requesterBranch: request.requesterBranch,
        requesterDesignation: request.requesterDesignation,
        requesterEmpId: request.requesterEmpId,
        address: request.address,
        contactNumber: request.contactNumber,
        specialRemark: request.specialRemark,
        status: request.status,
        nomineeName: request.nomineeName,
        nomineeRelationship: request.nomineeRelationship,
        nomineeNic: request.nomineeNic,
        nomineePhone: request.nomineePhone,
        nomineeAddress: request.nomineeAddress,
        nomineeBank: request.nomineeBank,
        nomineeBranch: request.nomineeBranch,
        nomineeAccount: request.nomineeAccount,
        deathCertificateDoc: request.documents?.deathCertificate,
        nomineeIdDoc: request.documents?.nomineeId,
        requestLetterDoc: request.documents?.requestLetter,
        hrRemark: request.hrRemark,
        directorRemark: request.directorRemark,
    };
    
    const response = await api.put(`/api/death-requests/${numericId}`, payload);
    return mapDtoToFrontend(response.data);
};

export const verifyDeathRequest = async (idStr: string): Promise<DeathRequest> => {
    const numericId = parseInt(idStr.replace('DTH-', ''), 10);
    const response = await api.post(`/api/death-requests/${numericId}/verify`, {});
    return mapDtoToFrontend(response.data);
};

export const rejectDeathRequest = async (idStr: string, reason: string): Promise<DeathRequest> => {
    const numericId = parseInt(idStr.replace('DTH-', ''), 10);
    const response = await api.post(`/api/death-requests/${numericId}/reject`, reason, {
        headers: { 'Content-Type': 'text/plain' }
    });
    return mapDtoToFrontend(response.data);
};

export const deleteDeathRequest = async (idStr: string): Promise<void> => {
    const numericId = parseInt(idStr.replace('DTH-', ''), 10);
    await api.delete(`/api/death-requests/${numericId}`);
};

export const submitDeathRequestToAdmin = async (idStr: string): Promise<DeathRequest> => {
    const numericId = parseInt(idStr.replace('DTH-', ''), 10);
    const response = await api.post(`/api/death-requests/${numericId}/submit-admin`, {});
    return mapDtoToFrontend(response.data);
};

export const updateDeathStatus = async (idStr: string, status: string, remarks?: string, boardMeetingDate?: string): Promise<DeathRequest> => {
    const numericId = parseInt(idStr.replace('DTH-', ''), 10);
    const payload: any = { status };
    if (remarks !== undefined) payload.remarks = remarks;
    if (boardMeetingDate) payload.boardMeetingDate = boardMeetingDate;
    const response = await api.put(`/api/death-requests/${numericId}/status`, payload);
    return mapDtoToFrontend(response.data);
};

export const executeDeathRequest = async (idStr: string): Promise<void> => {
    const numericId = parseInt(idStr.replace('DTH-', ''), 10);
    await api.post(`/api/death-requests/${numericId}/execute`);
};
