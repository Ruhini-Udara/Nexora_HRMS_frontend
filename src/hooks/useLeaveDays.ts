import { useWatch, Control, FieldValues, Path } from "react-hook-form";

export function useLeaveDays<TFieldValues extends FieldValues>(
    control: Control<TFieldValues>,
    startName: Path<TFieldValues> = "startDate" as Path<TFieldValues>,
    endName: Path<TFieldValues> = "endDate" as Path<TFieldValues>
) {
    const startDate = useWatch({
        control,
        name: startName,
    });

    const endDate = useWatch({
        control,
        name: endName,
    });

    let totalDays = 0;
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end >= start) {
            const diffTime = Math.abs(end.getTime() - start.getTime());
            totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }
    }

    return totalDays;
}
