import { maternitySchema, overseasSchema } from "../lib/validations";

describe("Leave Request Validations", () => {
    describe("Maternity Leave Schema", () => {
        const validMaternityData = {
            epfNumber: "12345",
            branch: "Colombo",
            dateOfRequest: "2026-04-24",
            employeeName: "Jane Doe",
            employeeType: "PERMANENT",
            designation: "Software Engineer",
            leaveReason: "Maternity",
            startDate: "2026-05-01",
            endDate: "2026-08-01",
            childNumber: "1",
            contactNumber: "0771234567",
            email: "jane@example.com",
            acknowledgement: true
        };

        it("should validate correct maternity data", () => {
            const result = maternitySchema.safeParse(validMaternityData);
            if (!result.success) {
                console.log("Maternity Validation Error:", JSON.stringify(result.error.format(), null, 2));
            }
            expect(result.success).toBe(true);
        });

        it("should fail if EPF number is invalid", () => {
            const result = maternitySchema.safeParse({ ...validMaternityData, epfNumber: "abc" });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("EPF must be 4-6 digits");
            }
        });

        it("should fail if Start Date is in the past", () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split("T")[0];
            
            const result = maternitySchema.safeParse({ ...validMaternityData, startDate: dateStr });
            expect(result.success).toBe(false);
        });

        it("should fail if End Date is before Start Date", () => {
            const result = maternitySchema.safeParse({ 
                ...validMaternityData, 
                startDate: "2024-05-10", 
                endDate: "2024-05-05" 
            });
            expect(result.success).toBe(false);
        });
    });

    describe("Overseas Leave Schema", () => {
        const validOverseasData = {
            epfNumber: "12345",
            branch: "Galle",
            dateOfRequest: "2026-04-24",
            employeeName: "John Doe",
            designation: "Manager",
            leaveReason: "Vacation",
            startDate: "2026-06-01",
            endDate: "2026-06-15",
            passportNumber: "N1234567",
            passportExpDate: "2027-01-01",
            contactNumber: "0711234567",
            email: "john@example.com",
            acknowledgement: true
        };

        it("should validate correct overseas data", () => {
            const result = overseasSchema.safeParse(validOverseasData);
            expect(result.success).toBe(true);
        });

        it("should fail if passport expiry is less than 6 months from travel end date", () => {
            // End Date: 2026-06-15
            // 6 months from then: 2026-12-15
            // Exp Date: 2026-11-01 (Only 4.5 months)
            const result = overseasSchema.safeParse({ 
                ...validOverseasData, 
                endDate: "2026-06-15",
                passportExpDate: "2026-11-01"
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("Passport must be valid for at least 6 months beyond travel end date.");
            }
        });

        it("should pass if passport expiry is exactly 6 months from travel end date", () => {
            const result = overseasSchema.safeParse({ 
                ...validOverseasData, 
                endDate: "2026-06-15",
                passportExpDate: "2026-12-15"
            });
            expect(result.success).toBe(true);
        });
    });
});
