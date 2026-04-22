import CreateTrainingPlanForm from "@/components/CreateTrainingPlanForm";
import { Suspense } from "react";

export default function NewTrainingPlanPage() {
    return (
        <Suspense fallback={<div className="p-8">Loading form...</div>}>
            <CreateTrainingPlanForm />
        </Suspense>
    );
}
