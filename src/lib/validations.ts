import * as z from "zod";

export const maternitySchema = z.object({
    epfNumber: z.string().min(4, "EPF number must be at least 4 characters"),
    branch: z.string().min(1, "Branch is required"),
    dateOfRequest: z.string().min(1),
    employeeName: z.string().min(1, "Employee Name is required"),
    employeeType: z.string().min(1, "Employee Type is required"),
    designation: z.string().min(1, "Designation is required"),
    leaveReason: z.string().min(1, "Leave Request Reason is required"),
    startDate: z.string().min(1, "Start Date is required").refine((val) => {
        const today = new Date().toISOString().split("T")[0];
        return val >= today;
    }, "Start Date cannot be in the past"),
    endDate: z.string().min(1, "End Date is required"),
    childNumber: z.string().min(1, "Child Number is required"),
    contactNumber: z.string().regex(/^\+?[0-9\s\-]{9,15}$/, "Invalid phone format"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    specialRemark: z.string().optional(),
    acknowledgement: z.boolean().refine(val => val === true, "You must acknowledge the terms to proceed.")
}).refine((data) => {
    if (!data.startDate || !data.endDate) return true;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
}, {
    message: "End Date must be the same as or after Start Date.",
    path: ["endDate"]
});

export const overseasSchema = z.object({
    epfNumber: z.string().min(4, "EPF number must be at least 4 characters"),
    branch: z.string().min(1, "Branch is required"),
    dateOfRequest: z.string().min(1),
    employeeName: z.string().min(1, "Employee Name is required"),
    designation: z.string().min(1, "Designation is required"),
    leaveReason: z.string().min(1, "Leave Request Reason is required"),
    startDate: z.string().min(1, "Start Date is required").refine((val) => {
        const today = new Date().toISOString().split("T")[0];
        return val >= today;
    }, "Start Date cannot be in the past"),
    endDate: z.string().min(1, "End Date is required"),
    passportNumber: z.string().min(1, "Passport Number is required"),
    passportExpDate: z.string().min(1, "Passport Expiry Date is required"),
    contactNumber: z.string().regex(/^\+?[0-9\s\-]{9,15}$/, "Invalid phone format"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    specialRemark: z.string().optional(),
    acknowledgement: z.boolean().refine(val => val === true, "You must acknowledge the terms to proceed.")
}).refine((data) => {
    if (!data.startDate || !data.endDate) return true;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
}, {
    message: "End Date must be the same as or after Start Date.",
    path: ["endDate"]
}).refine((data) => {
    if (!data.endDate || !data.passportExpDate) return true;
    const end = new Date(data.endDate);
    const exp = new Date(data.passportExpDate);
    // Create a copy of the date to avoid mutating the original 'end'
    const sixMonthsFromEnd = new Date(end);
    sixMonthsFromEnd.setMonth(sixMonthsFromEnd.getMonth() + 6);
    sixMonthsFromEnd.setHours(0,0,0,0);
    exp.setHours(0,0,0,0);
    return exp >= sixMonthsFromEnd;
}, {
    message: "Passport must be valid for at least 6 months beyond travel end date.",
    path: ["passportExpDate"]
});
