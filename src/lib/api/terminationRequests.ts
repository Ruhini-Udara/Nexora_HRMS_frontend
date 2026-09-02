import api from '../axiosInstance';

export interface TerminationRequest {
    id: string;
    employeeId: number;
    employeeName: string;
    epfNumber: string;
    branch: string;
    type: string;
    initiationDate: string;
    effectiveDate: string;
    reason: string;
    specialRemark?: string;
    status: string;
    documents: {
        request_for_termination?: string;
        loan_clearance_letter?: string;
        other_document?: string;
    };
    hrRemark?: string;
    directorRemark?: string;
    boardMeetingDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

const mapDtoToFrontend = (dto: any): TerminationRequest => ({
    id: dto.id ? dto.id.toString() : "",
    employeeId: dto.employeeId,
    employeeName: dto.employeeName,
    epfNumber: dto.epfNumber,
    branch: dto.branch,
    type: dto.type,
    initiationDate: dto.initiationDate,
    effectiveDate: dto.effectiveDate,
    reason: dto.reason,
    specialRemark: dto.specialRemark,
    status: dto.status,
    documents: {
        request_for_termination: dto.requestForTerminationDoc,
        loan_clearance_letter: dto.loanClearanceLetterDoc,
        other_document: dto.otherDocumentDoc,
    },
    hrRemark: dto.hrRemark,
    directorRemark: dto.directorRemark,
    boardMeetingDate: dto.boardMeetingDate,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
});

export const createTerminationRequest = async (data: Omit<TerminationRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<TerminationRequest> => {
    const payload = {
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        epfNumber: data.epfNumber,
        branch: data.branch,
        type: data.type,
        initiationDate: data.initiationDate,
        effectiveDate: data.effectiveDate,
        reason: data.reason,
        status: data.status,
        specialRemark: data.specialRemark,
        requestForTerminationDoc: data.documents.request_for_termination,
        loanClearanceLetterDoc: data.documents.loan_clearance_letter,
        otherDocumentDoc: data.documents.other_document,
    };
    const response = await api.post('/api/terminations', payload);
    return mapDtoToFrontend(response.data);
};

export const getAllTerminationRequests = async (): Promise<TerminationRequest[]> => {
    const response = await api.get('/api/terminations');
    return response.data.map(mapDtoToFrontend);
};

export const getTerminationRequestsByEmployee = async (employeeId: number): Promise<TerminationRequest[]> => {
    const response = await api.get(`/api/terminations/employee/${employeeId}`);
    return response.data.map(mapDtoToFrontend);
};

export const updateTerminationStatus = async (idStr: string, status: string, remarks?: string, boardMeetingDate?: string): Promise<TerminationRequest> => {
    const payload: any = { status };
    if (remarks) payload.remarks = remarks;
    if (boardMeetingDate) payload.boardMeetingDate = boardMeetingDate;
    
    const response = await api.put(`/api/terminations/${idStr}/status`, payload);
    return mapDtoToFrontend(response.data);
};

export const updateTerminationRequest = async (idStr: string, data: Partial<TerminationRequest>): Promise<TerminationRequest> => {
    const payload: any = {
        initiationDate: data.initiationDate,
        effectiveDate: data.effectiveDate,
        type: data.type,
        reason: data.reason,
        specialRemark: data.specialRemark,
        status: data.status,
    };
    if (data.documents) {
        if (data.documents.request_for_termination !== undefined) payload.requestForTerminationDoc = data.documents.request_for_termination;
        if (data.documents.loan_clearance_letter !== undefined) payload.loanClearanceLetterDoc = data.documents.loan_clearance_letter;
        if (data.documents.other_document !== undefined) payload.otherDocumentDoc = data.documents.other_document;
    }
    
    const response = await api.put(`/api/terminations/${idStr}`, payload);
    return mapDtoToFrontend(response.data);
};

export const executeTermination = async (idStr: string): Promise<void> => {
    await api.post(`/api/terminations/${idStr}/execute`);
};
